# 05_KNOWN_BUGS.md

# 🐞 LisanIQ Engineering Bug Register

Version: 1.0

Status: Active

Last Updated: July 2026

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

🟡 Investigating

---

## Symptoms

Owner account works correctly.

Friend account receives an error when opening Projects.

---

## Current Findings

Authentication succeeds.

Issue appears after login when accessing Projects.

Possible causes under investigation:

- RLS policy
- Missing profile row
- Ownership checks
- Project permissions

---

## Next Actions

- Verify friend user exists in public.users
- Verify RLS policies
- Verify ownership validation
- Test with fresh invited account

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

Highest priority:

Finish resolving Friend Account access issue.

After that:

Resume MVP Checklist until every required item reaches completion.

---

# Quality Goal

Target before public launch:

Critical Bugs: 0

High Bugs: 0

Medium Bugs: ≤ 3

Known unresolved issues must never affect customer workflows.
