# LisanIQ — System Architecture

> Official Technical Architecture
> Version: 1.0
> Last Updated: July 2026

---

# 1. Architecture Overview

LisanIQ follows a modern full-stack SaaS architecture based on Next.js and Supabase.

The system is designed around:

- Simplicity
- Scalability
- Security
- Maintainability
- AI-first workflows

---

# 2. High-Level Architecture

```text
                 ┌─────────────────────────┐
                 │        Browser          │
                 └────────────┬────────────┘
                              │
                              ▼
                    Next.js App Router
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   React UI              API Routes          Middleware
                              │
                              ▼
                    Supabase Platform
        ┌──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼
   PostgreSQL       Authentication     Storage
                              │
                              ▼
                        Stripe Billing
                              │
                              ▼
                         AI Services
```

---

# 3. Frontend

Framework

- Next.js (App Router)

Language

- TypeScript

UI

- React

Styling

- TailwindCSS

Responsibilities

- Authentication UI
- Dashboard
- Projects
- Upload Interface
- Reports
- Billing
- Settings

Frontend should contain minimal business logic.

Business rules belong to the backend.

---

# 4. Backend

Implemented using:

Next.js Route Handlers

Responsibilities:

- Authentication validation
- Authorization
- CRUD operations
- Stripe communication
- Storage management
- AI orchestration

Backend is the single source of truth.

---

# 5. Database

Provider

Supabase PostgreSQL

Main Tables

auth.users

Managed by Supabase.

public.users

Application profile.

Contains:

- id
- full_name
- avatar_url
- role
- plan
- stripe_customer_id
- stripe_subscription_id
- created_at
- updated_at

projects

Stores user projects.

datasets

Stores uploaded datasets/files.

reports

Stores AI-generated reports.

Future tables:

- conversations
- prompts
- notifications
- usage
- invoices

---

# 6. Authentication

Provider

Supabase Auth

Flow

Register

↓

Email verification (optional)

↓

Login

↓

JWT Session

↓

Middleware

↓

Protected Pages

↓

Protected API Routes

Authentication is validated inside API routes using:

supabase.auth.getUser()

Never trust client-side authentication alone.

---

# 7. Authorization

Roles

owner

Platform owner.

user

Normal customer.

Future

admin

support

team_member

Authorization decisions always happen on the server.

---

# 8. Middleware

Responsibilities

- Refresh expired sessions
- Protect authenticated routes
- Redirect unauthenticated users
- Maintain secure cookies

Middleware should remain lightweight.

Business logic does not belong here.

---

# 9. API Layer

Location

app/api/

Examples

/api/projects

/api/upload

/api/reports

/api/settings

/api/webhook

Every API route should:

1. Validate session

2. Validate permissions

3. Validate input

4. Execute business logic

5. Return standardized JSON

---

# 10. Storage

Provider

Supabase Storage

Purpose

Store:

- Documents
- Audio
- Images
- Future media

Files are linked to database records.

Database remains the source of truth.

---

# 11. AI Layer

Current Role

Analyze uploaded content.

Future Responsibilities

- Speaking evaluation
- Grammar correction
- Vocabulary enhancement
- Personalized recommendations
- Learning plans
- Conversation coaching

AI should remain modular.

Switching providers should require minimal code changes.

---

# 12. Payments

Provider

Stripe

Flow

User selects plan

↓

Checkout Session

↓

Payment

↓

Stripe Webhook

↓

Update public.users

↓

Unlock features

Webhook is the only trusted source for subscription updates.

Never trust client-side payment state.

---

# 13. Security Principles

Always:

Validate authentication.

Validate authorization.

Validate ownership.

Validate inputs.

Never expose Service Role Key.

Never trust client data.

Never bypass Row Level Security without necessity.

---

# 14. Error Handling

Every API returns:

Success

```json
{
  "data": {},
  "error": null
}
```

Failure

```json
{
  "data": null,
  "error": "Human-readable message"
}
```

Errors should be:

- predictable
- logged
- actionable

---

# 15. Current Data Flow

User Login

↓

Middleware validates session

↓

Dashboard loads

↓

User creates project

↓

Project stored in PostgreSQL

↓

User uploads file

↓

Storage saves file

↓

Database stores metadata

↓

AI processes file

↓

Report generated

↓

User views report

---
