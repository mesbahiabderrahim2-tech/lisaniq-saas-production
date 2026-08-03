# 🚀 08_DEPLOYMENT.md

# LisanIQ Deployment Guide

Version: 1.0

Status: Official

Last Updated: July 2026

---

# Purpose

This document describes how LisanIQ is deployed from development to production.

It is the official deployment reference.

---

# Production Stack

Hosting:
- Vercel

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

Storage:
- Supabase Storage

Payments:
- Stripe

Version Control:
- GitHub

Domain:
- (Production Domain)

---

# Git Workflow

Main Branch

main

Production is deployed from:

main

Development branches:

feature/*

bugfix/*

hotfix/*

---

# Deployment Flow

Developer

↓

Git Commit

↓

GitHub

↓

Push to main

↓

Vercel Build

↓

Deployment

↓

Production

---

# Before Every Deployment

Verify:

✅ Project builds successfully

✅ No TypeScript errors

✅ No critical console errors

✅ Authentication works

✅ Projects page works

✅ Upload works

✅ AI works

✅ Reports work

✅ Billing works

---

# Build Command

npm run build

---

# Install Command

npm install --legacy-peer-deps

---

# Output Framework

Next.js 15

---

# Production Runtime

Node.js Runtime

Never Edge Runtime for authenticated API routes unless explicitly required.

---

# API Runtime

All authenticated API routes must use:

export const runtime = "nodejs"

---

# Middleware

Authentication middleware:

middleware.ts

Responsible for:

- Session refresh
- Route protection
- Cookie synchronization

---

# Vercel Settings

Framework:

Next.js

Build Command:

npm run build

Install Command:

npm install --legacy-peer-deps

Output:

Automatic

---

# Build Verification

Every deployment must verify:

Dashboard

Projects

Upload

Reports

Settings

Billing

Authentication

Logout

---

# Rollback Strategy

If production fails:

1.

Rollback to previous deployment.

2.

Investigate.

3.

Fix.

4.

Deploy again.

Never debug directly on Production.

---

# Monitoring

Monitor:

Vercel Logs

Supabase Logs

Stripe Dashboard

Browser Console

Network Requests

---

# Production Rules

Never deploy untested code.

Never bypass authentication.

Never disable RLS.

Never ignore build warnings without investigation.

---

# Deployment Checklist

□ Build passes

□ Environment Variables configured

□ Database migrations applied

□ Storage buckets exist

□ Stripe configured

□ Authentication verified

□ Customer journey tested

□ Documentation updated

---

# Definition of Successful Deployment

A real customer can:

Register

↓

Login

↓

Create Project

↓

Upload Dataset

↓

Receive AI Analysis

↓

Generate Reports

↓

Upgrade Plan

Without encountering blocking issues.
