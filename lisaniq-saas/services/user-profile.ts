// ══════════════════════════════════════════════════════════════
// LisanIQ — User Profile Service
// Single responsibility: guarantee that every authenticated
// auth.users entry has a corresponding public.users row.
//
// Architecture notes:
//   • The database trigger (handle_new_user) is the PRIMARY source
//     of profile creation. It fires for every normal registration.
//   • This service is the DEFENSIVE FALLBACK only — it exists to
//     recover from cases where the trigger did not fire:
//       – accounts created via the Supabase dashboard
//       – accounts created before the trigger was installed
//       – any silent trigger failure (now logged by migration 012)
//   • Uses UPSERT (ON CONFLICT DO NOTHING) so concurrent requests
//     never produce duplicate-key errors.
//   • Uses the service-role admin client because the anon client
//     is blocked by RLS — public.users has no INSERT policy
//     (inserts are expected to come from the SECURITY DEFINER
//     trigger, or from this service on the server side).
//   • This helper NEVER belongs inside requireAuth() directly.
//     Separation of concerns: auth ≠ profile management.
// ══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// ── Result type ─────────────────────────────────────────────

export type EnsureProfileResult =
  | { ok: true;  profile: User }
  | { ok: false; reason: 'db_error'; message: string }

// ── Primary export ──────────────────────────────────────────

/**
 * Guarantees a public.users row exists for the given auth user.
 *
 * Behaviour:
 *   1. Tries to INSERT via UPSERT (ON CONFLICT DO NOTHING).
 *   2. Whether inserted or already existing, reads the row back.
 *   3. Returns the profile or a typed error — never throws.
 *
 * Race-condition safe: two concurrent requests will both attempt
 * the UPSERT; exactly one INSERT wins, the other is a no-op.
 * Both then read the same row back successfully.
 *
 * Called by: requireAuth() only when maybeSingle() returns null.
 */
export async function ensureUserProfile(
  authUser: SupabaseUser
): Promise<EnsureProfileResult> {
  // ── Structured warning — always emitted so ops can see it ──
  console.warn(
    '[DEFENSIVE] Profile missing. Auto-recovering profile.',
    `User: ${authUser.id}`,
    `Email: ${authUser.email ?? '(none)'}`,
  )

  const admin = createAdminClient()

  // ── UPSERT: safe for concurrent requests ──────────────────
  // ON CONFLICT (id) DO NOTHING means:
  //   • First writer  → inserts the row, no error.
  //   • Later writers → conflict is silently ignored, no error.
  // The subsequent SELECT always reads the winner's row.
  const { error: upsertError } = await admin
    .from('users')
    .upsert(
      {
        id:         authUser.id,
        email:      authUser.email ?? '',
        full_name:  (authUser.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        // role → DB default 'owner'
        // plan → DB default 'free'
        // stripe fields → DB default NULL
      },
      {
        // Only insert — never overwrite an existing row's role, plan,
        // or stripe data. ignoreDuplicates means ON CONFLICT DO NOTHING.
        ignoreDuplicates: true,
        onConflict: 'id',
      }
    )

  if (upsertError) {
    console.error(
      '[DEFENSIVE] UPSERT failed for user:', authUser.id,
      'Code:', upsertError.code,
      'Message:', upsertError.message,
    )
    return { ok: false, reason: 'db_error', message: upsertError.message }
  }

  // ── Read the row back (works whether just inserted or pre-existing) ──
  const { data: profile, error: selectError } = await admin
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (selectError || !profile) {
    const msg = selectError?.message ?? 'Row not found after upsert'
    console.error(
      '[DEFENSIVE] SELECT after upsert failed for user:', authUser.id,
      'Code:', selectError?.code,
      'Message:', msg,
    )
    return { ok: false, reason: 'db_error', message: msg }
  }

  console.info(
    '[DEFENSIVE] Profile recovered successfully.',
    `User: ${authUser.id}`,
  )

  return { ok: true, profile: profile as User }
    }
