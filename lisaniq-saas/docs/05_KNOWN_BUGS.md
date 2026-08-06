# 05_KNOWN_BUGS.md

# 🐞 LisanIQ Engineering Bug Register

Version: 1.0

Status: Active

Last Updated: August 2026

---

# Purpose

This document records every important bug discovered during the development of LisanIQ.

It serves as:

- Engineering Memory
- AI Context
- Troubleshooting Reference
- Quality Assurance Log

Every resolved bug remains documented.

Never delete historical bugs.

---

# Bug Status Legend

🔴 Critical

🟠 High

🟡 Medium

🟢 Resolved

⚪ Archived

---

# BUG-001

Title

Projects API returns 401 Unauthorized

Priority

🔴 Critical

Status

🟢 Resolved

Date

July 2026

---

## Symptoms

User could log in successfully.

Dashboard loaded correctly.

Projects page returned:

401 Unauthorized

The following routes also failed:

- /api/projects
- /api/upload

---

## Investigation

The investigation initially focused on:

- Cookies
- Middleware
- Supabase Auth
- Server Components
- Route Handlers
- RLS Policies
- Vercel Deployment

All were verified to be working correctly.

---

## Root Cause

The primary key column inside public.users had an incorrect name.

Instead of:

id

The column name had become:

54f56304-d275-41b2-9e49-5dc6de018d87

Therefore:

requireAuth()

executed:

.eq('id', authUser.id)

The database had no column named "id".

This caused:

User profile not found

and all protected API routes returned 401.

---

## Resolution

Executed:

```sql
ALTER TABLE public.users
RENAME COLUMN
"54f56304-d275-41b2-9e49-5dc6de018d87"
TO id;
```

Verification:

```sql
SELECT id, role, plan
FROM public.users;
```

Projects page started working immediately.

---

## Lesson Learned

Always verify database schema against migrations.

Never assume production schema matches migration files.

---

# BUG-002

Title

Datasets table queried using non-existent client_id column

Priority

🟠 High

Status

🟢 Resolved

---

## Symptoms

Client history failed.

HTTP 400

Supabase returned:

column datasets.client_id does not exist

---

## Root Cause

Component:

ClientHistory.tsx

queried:

.eq("client_id", clientId)

However,

datasets table contains:

project_id

and has no client_id column.

---

## Resolution

Query updated to use:

project_id

instead of

client_id

---

## Lesson Learned

Always validate database schema before writing queries.

---

# BUG-003

Title

Webhook overwrote user role

Priority

🟠 High

Status

🟢 Resolved

---

## Symptoms

Stripe webhook updated user profile after checkout.

Role unexpectedly became:

user

instead of

owner

---

## Root Cause

Webhook contained:

```ts
role: "user"
```

inside the update statement.

---

## Resolution

Removed role updates completely.

Webhook now updates only:

- stripe_customer_id
- stripe_subscription_id
- plan

---

## Lesson Learned

Business roles should never be modified automatically by billing logic.

---

# BUG-004

Title

Friend account cannot access Projects page

Priority

🔴 Critical

Status

🟢 Resolved (Production-Grade)

Date Resolved

August 2026

---

## Symptoms

Any user whose public.users profile was missing received:

"User profile not found"

when accessing Projects or any API-protected route.

Authentication succeeded (valid session existed).

Dashboard shell rendered (silent fallback hid the failure).

All API routes returned 401.

---

## Root Cause

Three independent layers all failed simultaneously.

### Layer 1 — Missing public.users row

The on_auth_user_created trigger (handle_new_user) only fires on INSERT
into auth.users. Accounts created via the Supabase dashboard, accounts
created before the trigger existed, or accounts where the trigger failed
silently had a valid auth.users entry but NO public.users row.

### Layer 2 — .single() conflated 0-rows with DB errors

requireAuth() used .single() which throws PGRST116 for both:
- 0 rows matched (profile missing)
- Real database error

Both became identical 401 responses with no way to distinguish or recover.

### Layer 3 — Dashboard layout masked the failure

The layout used profile?.email ?? authUser.email as a silent fallback.
Dashboard appeared to work. Only API routes failed, making the bug harder to find.

---

## Evidence

- lib/api-utils.ts — .single() treats 0 rows as error (PGRST116)
- app/(dashboard)/layout.tsx — silent fallback masked the root cause
- supabase/migrations/001_bootstrap.sql — trigger fires only on auth.users INSERT
- supabase/migrations/002_users.sql — confirmed columns: id, email, full_name, avatar_url, role, plan
- Supabase SQL editor — confirmed some auth.users had no public.users row

---

## Final Architecture (Production-Grade)

### Principle

The database trigger (handle_new_user) is the PRIMARY and official
mechanism for creating public.users rows. It must never be replaced.

The application provides a DEFENSIVE FALLBACK only — for cases where
the trigger legitimately did not fire.

### Separation of Concerns

```
requireAuth()        → authentication only
ensureUserProfile()  → profile recovery only (separate service)
```

These responsibilities are never mixed.

### Flow

```
requireAuth()
  ├── auth.getUser() → no user → 401
  ├── .maybeSingle() → profile exists → return (happy path)
  ├── .maybeSingle() → DB error → log + 500
  └── .maybeSingle() → null (profile missing)
        └── ensureUserProfile(authUser)
              ├── WARN: [DEFENSIVE] Profile missing. Auto-recovering. User: xxx
              ├── UPSERT ON CONFLICT (id) DO NOTHING (race-safe)
              ├── SELECT row back
              └── return profile
```

### Race Condition Safety

Two concurrent requests for the same missing profile both call UPSERT.
Exactly one INSERT wins. The other is a silent no-op (ON CONFLICT DO NOTHING).
Both then read the same row back and succeed.

---

## Files Changed

- lib/api-utils.ts
  - .single() replaced with .maybeSingle()
  - Profile creation logic removed from requireAuth()
  - Delegates to ensureUserProfile() when profile is missing

- services/user-profile.ts (NEW)
  - Dedicated ensureUserProfile() helper
  - UPSERT with ignoreDuplicates: true and onConflict: 'id' (race-condition safe)
  - Structured [DEFENSIVE] warning log with user ID and email
  - Typed result: EnsureProfileResult discriminated union
  - Uses createAdminClient() from lib/supabase/admin.ts (service role, bypasses RLS)
  - Never throws — always returns typed ok/error

- app/(dashboard)/layout.tsx
  - .single() replaced with .maybeSingle()
  - Comment updated to reflect recovery happens on first API call

- supabase/migrations/012_backfill_missing_profiles.sql (NEW)
  - Backfills all auth.users with no public.users row (ON CONFLICT DO NOTHING)
  - Hardens handle_new_user() with EXCEPTION WHEN OTHERS + RAISE WARNING
  - Ensures trigger exists (DROP IF EXISTS + CREATE TRIGGER)
  - Idempotent: safe to run multiple times
  - Inserts only: id, email, full_name, avatar_url — matches 002_users.sql exactly

---

## Edge Cases

| Case | Handled | How |
|---|---|---|
| Concurrent requests | Yes | UPSERT ON CONFLICT DO NOTHING |
| Missing metadata (full_name, avatar_url) | Yes | Nullable fields, COALESCE in trigger |
| Trigger failure | Yes | EXCEPTION WHEN OTHERS + WARNING log |
| Profile exists (happy path) | Yes | maybeSingle() returns row immediately |
| Backfilled profile | Yes | Same happy path after migration runs |
| Admin-created account | Yes | No trigger fires, ensureUserProfile() recovers |
| Future schema changes | Yes | Only id + email required; all others nullable or defaulted |

---

## Lessons Learned

1. Never use .single() when 0 rows is a legitimate outcome.
   Use .maybeSingle() and handle null explicitly.

2. UPSERT (ON CONFLICT DO NOTHING) is the correct tool for
   race-condition-safe recovery. Never use plain INSERT.

3. Authentication and profile management are different concerns.
   Keep them in separate functions with single responsibilities.

4. A silent fallback in the UI can mask a critical API failure.
   Audit all fallbacks regularly.

5. Always run a database backfill when fixing a trigger gap.
   Code fixes alone are insufficient for existing affected accounts.

6. The trigger is the primary mechanism. The application fallback
   is defensive only. Both layers must exist.

---

# BUG-005

Title

Google Translate CSP warning

Priority

🟡 Medium

Status

⚪ Deferred

---

## Symptoms

Console displays CSP warnings for Google Translate stylesheet.

---

## Impact

No functional impact.

Application continues to work normally.

---

## Decision

Ignored for MVP.

Will be revisited after public launch.

---

# Development Rules

Whenever a bug is discovered:

1. Reproduce it.
2. Document it.
3. Identify the root cause.
4. Implement a fix.
5. Verify the fix.
6. Record the lesson learned.

Never close a bug without documenting its root cause.

---

# Current Priority

BUG-004 resolved ✅

Next priority:

Resume MVP Checklist (04_MVP_CHECKLIST.md) until every required item reaches completion.

Critical Bugs remaining: 0

High Bugs remaining: 0

---

# Quality Goal

Target before public launch:

Critical Bugs: 0

High Bugs: 0

Medium Bugs: ≤ 3

Known unresolved issues must never affect customer workflows.
