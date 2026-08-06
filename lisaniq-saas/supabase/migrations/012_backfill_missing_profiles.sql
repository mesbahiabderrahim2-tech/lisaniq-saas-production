-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 012: Backfill Missing User Profiles
-- Version: 2 (production-grade rewrite, August 2026)
-- Idempotent: safe to run multiple times.
-- ══════════════════════════════════════════════════════════════
--
-- Context (BUG-004):
--
--   The on_auth_user_created trigger (handle_new_user) is the
--   PRIMARY mechanism for syncing auth.users → public.users.
--   However, it does not fire in these situations:
--
--     1. Accounts created directly in the Supabase dashboard.
--     2. Accounts created before the trigger was installed.
--     3. Any case where the trigger failed silently (now fixed).
--
--   Result: valid auth session + missing public.users row
--         = 401 on every API route (BUG-004).
--
-- This migration:
--   A. Backfills ALL auth.users accounts that have no public.users row.
--   B. Hardens handle_new_user() with structured logging.
--   C. Re-creates the trigger if it is somehow missing.
--
-- ══════════════════════════════════════════════════════════════


-- ── A. Backfill missing profiles ─────────────────────────────
--
-- Uses INSERT … ON CONFLICT DO NOTHING (idempotent).
-- Only touches rows that are genuinely absent from public.users.
-- Role and plan fall back to their DB defaults ('owner', 'free').
-- Safe to run multiple times — the ON CONFLICT clause means
-- existing rows are never touched.
--
-- Columns confirmed from migration 002_users.sql:
--   id, email, full_name, avatar_url, role (default 'owner'),
--   plan (default 'free'), stripe_customer_id, stripe_subscription_id,
--   created_at, updated_at

INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users AS au
WHERE NOT EXISTS (
  SELECT 1
  FROM   public.users pu
  WHERE  pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;


-- ── B. Harden handle_new_user() ──────────────────────────────
--
-- Re-creates the function with:
--   • EXCEPTION WHEN OTHERS block — trigger failures never block
--     the auth.users INSERT (which would break sign-up for everyone).
--   • RAISE WARNING — failure is visible in Supabase → Logs.
--   • ON CONFLICT (id) DO NOTHING — idempotent body, safe if the
--     trigger somehow fires twice for the same user.
--
-- Columns inserted match 002_users.sql exactly:
--   id, email, full_name, avatar_url
-- role and plan are omitted → DB defaults apply ('owner', 'free').

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;

EXCEPTION WHEN OTHERS THEN
  -- Never block the auth.users INSERT on our behalf.
  -- Emit a warning that will appear in Supabase database logs.
  RAISE WARNING
    '[handle_new_user] profile creation failed for auth user %: % (SQLSTATE %)',
    new.id, SQLERRM, SQLSTATE;
  RETURN new;
END;
$$;


-- ── C. Ensure the trigger exists ─────────────────────────────
--
-- If the trigger was accidentally dropped, re-create it.
-- DROP IF EXISTS + CREATE is the safest idempotent pattern
-- for triggers in PostgreSQL.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── Verification query (run manually after applying) ─────────
--
-- Run this after applying the migration to confirm 0 orphaned accounts:
--
-- SELECT COUNT(*) AS orphaned_auth_users
-- FROM   auth.users au
-- WHERE  NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);
--
-- Expected result: 0
