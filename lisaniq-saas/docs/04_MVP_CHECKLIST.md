# 04_MVP_CHECKLIST.md

# ✅ LisanIQ MVP Checklist

Version: 1.0

Status: Active

Last Updated: August 2026

---

# Objective

This checklist defines everything required before LisanIQ can be released to the first paying customers.

Nothing should be considered "finished" unless every required item is completed.

---

# Authentication

Status

🟡

Routes and files verified:

- app/(auth)/login/page.tsx ✅
- app/(auth)/register/page.tsx ✅
- app/(auth)/reset-password/page.tsx ✅
- app/auth/callback/route.ts ✅
- middleware.ts ✅
- lib/supabase/server.ts ✅
- lib/supabase/client.ts ✅
- lib/supabase/admin.ts ✅

Tasks

✅ User Registration

⬜ Email Verification

✅ Login

✅ Logout

✅ Password Reset (page exists)

✅ Session Persistence (middleware + SSR client)

✅ Protected Routes (middleware)

✅ User Profile Creation (BUG-004 resolved — trigger primary, services/user-profile.ts defensive fallback)

---

# User Dashboard

Status

🟡

Routes and files verified:

- app/(dashboard)/layout.tsx ✅
- app/(dashboard)/dashboard/page.tsx ✅
- components/dashboard/DashboardShell.tsx ✅
- components/dashboard/Header.tsx ✅
- components/dashboard/Sidebar.tsx ✅
- components/dashboard/PagePrimitives.tsx ✅

Tasks

✅ Dashboard Layout

✅ Navigation

⬜ User Information (profile display)

⬜ Subscription Status

⬜ Usage Statistics (app/api/usage/route.ts exists)

⬜ Loading States

⬜ Error States

---

# Projects

Status

🟡

Routes and files verified:

- app/(dashboard)/projects/page.tsx ✅
- app/(dashboard)/projects/new/page.tsx ✅
- app/(dashboard)/projects/[id]/page.tsx ✅
- app/api/projects/route.ts ✅
- app/api/projects/[id]/route.ts ✅
- supabase/migrations/003_projects.sql ✅

Tasks

✅ Projects API (GET, POST)

✅ Project detail API (GET, PATCH, DELETE)

⬜ Create Project (UI complete and working)

⬜ Rename Project

⬜ Delete Project

⬜ Project List

⬜ Open Project

⬜ Empty State

⬜ Project Validation

---

# Upload System

Status

🟡

Routes and files verified:

- app/api/upload/route.ts ✅
- components/dashboard/CSVUploadSystem.tsx ✅
- services/file-parser.ts ✅
- services/storage.ts ✅
- supabase/migrations/004_datasets.sql ✅
- supabase/migrations/008_storage.sql ✅
- supabase/migrations/010_prepare_dataset_aggregation.sql ✅
- app/api/datasets/route.ts ✅
- app/api/datasets/[id]/route.ts ✅

Tasks

⬜ Upload CSV

⬜ Upload XLSX

⬜ Upload Validation

⬜ Upload Progress

⬜ Upload Errors

⬜ Dataset Processing

⬜ Storage Cleanup

---

# Reports

Status

🟡

Routes and files verified:

- app/(dashboard)/reports/page.tsx ✅
- app/(dashboard)/reports/[id]/page.tsx ✅
- app/api/reports/route.ts ✅
- app/api/reports/[id]/route.ts ✅
- components/dashboard/GenerateReportButton.tsx ✅
- supabase/migrations/005_reports.sql ✅

Tasks

⬜ Generate Report

⬜ Report List

⬜ Report Detail

⬜ Star Report

⬜ Delete Report

⬜ PDF Export

---

# Payments

Status

🟡

Routes and files verified:

- app/api/stripe/checkout/route.ts ✅
- app/api/stripe/portal/route.ts ✅
- app/api/stripe/webhook/route.ts ✅
- app/api/checkout/route.ts ✅
- app/api/webhook/route.ts ✅
- app/(dashboard)/billing/page.tsx ✅
- components/dashboard/StripeButton.tsx ✅
- components/PricingPlans.tsx ✅
- services/stripe.ts ✅
- supabase/migrations/006_subscriptions.sql ✅

Tasks

⬜ Stripe Checkout

⬜ Successful Payment

⬜ Failed Payment

⬜ Subscription Sync

⬜ Webhook (role no longer overwritten — BUG-003 resolved)

⬜ Upgrade Plan

⬜ Cancel Subscription

⬜ Billing Status

---

# Settings

Status

🟡

Routes and files verified:

- app/(dashboard)/settings/page.tsx ✅
- app/api/settings/update/route.ts ✅
- app/(dashboard)/settings/components/ProfileOverview.tsx ✅
- app/(dashboard)/settings/components/BillingCard.tsx ✅
- app/(dashboard)/settings/components/SecurityScoreCard.tsx ✅
- app/(dashboard)/settings/components/SettingsHeader.tsx ✅
- app/(dashboard)/settings/components/SettingsSidebar.tsx ✅
- app/(dashboard)/settings/components/TeamMembers.tsx ✅
- components/settings/ProfileHero.tsx ✅
- components/settings/SecurityScore.tsx ✅
- components/settings/TeamCard.tsx ✅

Tasks

⬜ Profile Update (full_name, avatar_url — both exist in public.users)

⬜ Change Password

⬜ Billing Information

⬜ Team Members Display

---

# Activity Logging

Status

🟡

Routes and files verified:

- services/activity.ts ✅
- supabase/migrations/007_activity_logs.sql ✅

Tasks

⬜ Log project actions

⬜ Log dataset actions

⬜ Log report actions

---

# Plan Limits

Status

🟡

Routes and files verified:

- services/plan-limits.ts ✅

Tasks

⬜ Free plan limits enforced

⬜ Pro plan limits enforced

⬜ Upgrade prompt when limit reached

---

# Security

Status

🟡

Tasks

✅ RLS enabled on all tables (migrations 002–007)

✅ Authentication validation (lib/api-utils.ts requireAuth())

✅ API Protection (requireAuth() on all API routes)

⬜ Input Validation

⬜ File Validation

⬜ XSS Protection

⬜ Rate Limiting

---

# Error Handling

Status

🟡

Tasks

✅ API error responses (lib/api-utils.ts response factories)

✅ Auth errors (requireAuth discriminated union)

✅ DB errors separated from 0-row results (maybeSingle — BUG-004)

⬜ Friendly UI Errors

⬜ Retry Actions

⬜ Global Error Boundary

⬜ Upload Errors UI

⬜ Stripe Errors UI

---

# Production Readiness

Status

⬜

Tasks

⬜ Environment Variables (see docs/09_ENVIRONMENT.md)

⬜ Production Build passes

⬜ No TypeScript Errors

⬜ No ESLint Errors

⬜ Monitoring

⬜ Logging

⬜ Supabase migration 012 applied to production DB

---

# Release Criteria

The MVP is NOT complete until:

✅ Authentication works for all account types (BUG-004 resolved)

⬜ Projects work end to end

⬜ Uploads work end to end

⬜ Reports work end to end

⬜ Payments work end to end

⬜ No Critical Bugs remain

⬜ A real user can complete the entire journey without error

---

# Current Focus

BUG-004 resolved ✅ (August 2026)

Critical bugs remaining: 0

High bugs remaining: 0

Next action:

Complete this checklist top to bottom, section by section.

Start from the first incomplete task in each section.

Do not skip sections.

Do not add new features outside this checklist.

After every session, return to this file and mark completed items.
