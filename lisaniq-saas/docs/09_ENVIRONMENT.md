# 🔐 09_ENVIRONMENT.md

# LisanIQ Environment Configuration

Version: 1.0

Status: Official

---

# Purpose

This document describes every environment variable and external service required to run LisanIQ.

Never hardcode secrets.

Always use environment variables.

---

# Required Services

## Vercel

Production Hosting

---

## GitHub

Source Control

---

## Supabase

Authentication

Database

Storage

Realtime

---

## Stripe

Payments

Subscriptions

Billing Portal

Webhooks

---

# Environment Variables

## Supabase

NEXT_PUBLIC_SUPABASE_URL

Description:

Supabase Project URL

Example:

https://xxxxx.supabase.co

---

NEXT_PUBLIC_SUPABASE_ANON_KEY

Description:

Public Supabase Key

Used by Browser

---

SUPABASE_SERVICE_ROLE_KEY

Description:

Server-only key

Used for:

Webhooks

Admin operations

Background tasks

Never expose to client.

---

## Stripe

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Browser payment initialization.

---

STRIPE_SECRET_KEY

Server-side Stripe API.

Never expose.

---

STRIPE_WEBHOOK_SECRET

Used to verify webhook authenticity.

---

## Application

NEXT_PUBLIC_APP_URL

Production URL

Example:

https://lisaniq.com

---

NEXT_PUBLIC_APP_NAME

Default:

LisanIQ

---

NODE_ENV

development

production

---

# Secret Rules

Never commit .env files.

Never expose service keys.

Never send secrets to client components.

---

# Local Development

Create:

.env.local

Contains:

Supabase

Stripe

Application variables

---

# Production

Configured inside:

Vercel

Project Settings

Environment Variables

---

# Required Before First Deployment

Verify:

Supabase URL

Supabase Anon Key

Service Role Key

Stripe Secret

Stripe Publishable Key

Webhook Secret

App URL

---

# Services Dependency

Application

↓

Supabase

↓

Authentication

↓

Database

↓

Storage

↓

Stripe

↓

Payments

---

# Rotation Policy

Rotate immediately if:

Key leaked

Repository exposed

Service compromised

---

# Backup

Secrets must be stored securely outside GitHub.

Recommended:

Password Manager

Encrypted Vault

---

# Final Rule

No environment variable.

No deployment.

No exceptions.
