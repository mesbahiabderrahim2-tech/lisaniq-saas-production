# 06_CHANGELOG.md

# 📜 LisanIQ Official Changelog

Version: 1.0

Status: Active

Last Updated: August 2026

---

# Purpose

This document records every significant change made to LisanIQ.

It is the official engineering history of the project.

Unlike Git commits, this file explains:

- What changed
- Why it changed
- Impact
- Related bugs
- Related documents

Nothing important should happen in the project without being recorded here.

---

# Version Format

Major.Minor.Patch

Example:

1.0.0

Major → Breaking changes

Minor → New features

Patch → Bug fixes

---

# Version 0.1.0

Project Initialization

Status

✅ Completed

---

## Added

- Initial Next.js project
- TypeScript
- TailwindCSS
- Supabase integration
- Project structure
- Environment configuration

---

## Notes

First working development environment.

---

# Version 0.2.0

Authentication System

Status

✅ Completed

---

## Added

- User Registration
- Login
- Logout
- Session Management
- Protected Routes
- Supabase Authentication

---

## Improvements

Authentication flow simplified.

Middleware added.

---

# Version 0.3.0

Dashboard

Status

✅ Completed

---

## Added

- Dashboard Layout
- Navigation
- User Information
- Billing Page
- Settings Page

---

## Improvements

Responsive layout.

Improved loading states.

---

# Version 0.4.0

Projects Module

Status

🟡 In Progress

---

## Added

- Project Creation
- Project Listing
- Project Details

---

## Fixed

Projects API authentication issue.

Database schema mismatch.

---

## Related Bugs

BUG-001

BUG-004

---

# Version 0.5.0

Upload System

Status

🟡 In Progress

---

## Added

- Dataset Upload
- CSV Support
- XLSX Support
- Validation
- Storage Integration

---

## Fixed

Datasets queried using wrong column.

---

## Related Bugs

BUG-002

---

# Version 0.6.0

Stripe Billing

Status

🟡 In Progress

---

## Added

- Stripe Checkout
- Billing Portal
- Subscription Sync

---

## Fixed

Webhook role update removed.

---

## Related Bugs

BUG-003

---

# Version 0.7.0

Database Improvements

Status

✅ Completed

---

## Changes

Verified production schema.

Corrected users primary key.

Renamed incorrect UUID column to:

id

---

## Result

Protected API routes started working correctly.

Projects page became accessible.

---

# Version 0.8.0

Production Stability

Status

✅ Completed

---

## Changes

- Authentication stability improvements
- Upload reliability improvements
- API consistency improvements

---

# Version 0.8.1

BUG-004 — Friend Authentication (Production-Grade Fix)

Status

✅ Completed

Date

August 2026

---

## Root Cause

handle_new_user trigger did not fire for all account creation paths.

requireAuth() used .single() which conflated 0-rows with database errors.

Both produced identical 401 responses with no recovery path.

Dashboard layout used a silent fallback (profile?.email ?? authUser.email)
that hid the failure — dashboard appeared to work while every API route
returned 401.

---

## Architecture Decision

Trigger (handle_new_user) remains the PRIMARY mechanism.

New service (ensureUserProfile) provides the DEFENSIVE FALLBACK only.

Separation of concerns strictly enforced:

- requireAuth() → authentication only
- ensureUserProfile() → profile recovery only

---

## Changes

### services/user-profile.ts (NEW)

- Dedicated ensureUserProfile() service
- Accepts SupabaseUser from @supabase/supabase-js
- Uses createAdminClient() from lib/supabase/admin.ts (service role, bypasses RLS)
- UPSERT with ignoreDuplicates: true and onConflict: 'id' — race-condition safe
- Inserts id, email, full_name, avatar_url — columns confirmed in 002_users.sql
- role and plan omitted — DB defaults apply ('owner', 'free')
- Structured [DEFENSIVE] warning log with user ID and email
- Typed EnsureProfileResult discriminated union
- Never throws — always returns typed ok / error

### lib/api-utils.ts

- .single() replaced with .maybeSingle()
- Profile creation logic fully removed from requireAuth()
- requireAuth() delegates to ensureUserProfile() only when maybeSingle() returns null
- DB errors (profileError) return 500, not 401
- Uses User type from @/types

### app/(dashboard)/layout.tsx

- .single() replaced with .maybeSingle()
- Uses User type from @/types
- Comment updated to reflect that recovery happens on first API call

### supabase/migrations/012_backfill_missing_profiles.sql (NEW)

- Backfills all auth.users rows with no public.users row
- INSERT uses id, email, full_name, avatar_url — matches 002_users.sql exactly
- ON CONFLICT (id) DO NOTHING — idempotent, safe to run multiple times
- Hardens handle_new_user() with EXCEPTION WHEN OTHERS + RAISE WARNING
- Ensures trigger exists with DROP IF EXISTS + CREATE TRIGGER

---

## Impact

- All users (owner, friend, newly registered) can now access Projects
- No unrelated files modified
- No architectural changes outside BUG-004 scope

---

## Related Bugs

BUG-004

---

# Upcoming Version

Version 0.9.0

Goals

- Finish Projects module
- Finish Upload module
- Finish AI workflow
- Complete payment flow
- Remove remaining critical bugs

---

# Version 1.0.0

Target

🎯 First Public MVP

Release Conditions

✅ Authentication

✅ Projects

✅ Upload

✅ AI

✅ Billing

✅ Dashboard

✅ Responsive Design

✅ Error Handling

✅ Security

✅ Zero Critical Bugs

---

# Engineering Decisions

## Decision 001

Always prioritize stability over adding new features.

Reason

Reliable software creates trust.

---

## Decision 002

Document every important change.

Reason

Future AI assistants and developers must understand project history.

---

## Decision 003

Fix root causes.

Never apply temporary hacks.

---

## Decision 004

Production database is the source of truth.

Always verify schema before changing code.

---

# Current Focus

Current Sprint

MVP Checklist Completion

Priority

🟡 Medium

BUG-004 resolved ✅

Next action:

Return immediately to:

04_MVP_CHECKLIST.md

Continue until MVP reaches 100%.

---

# Release History

| Version | Status | Description |
|----------|--------|-------------|
| 0.1.0 | ✅ | Project Initialization |
| 0.2.0 | ✅ | Authentication |
| 0.3.0 | ✅ | Dashboard |
| 0.4.0 | 🟡 | Projects |
| 0.5.0 | 🟡 | Upload |
| 0.6.0 | 🟡 | Billing |
| 0.7.0 | ✅ | Database Stabilization |
| 0.8.0 | ✅ | Production Stability |
| 0.8.1 | ✅ | BUG-004 Friend Authentication Fix |
| 0.9.0 | ⏳ | Final MVP |
| 1.0.0 | 🚀 | Public Release |

---

# Mission

Every version of LisanIQ must be:

- More stable
- Faster
- Simpler
- More valuable to the customer

The objective is not to ship more features.

The objective is to create the best first experience possible for every customer.
