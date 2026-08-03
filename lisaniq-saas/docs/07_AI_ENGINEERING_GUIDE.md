# 07_AI_ENGINEERING_GUIDE.md

# 🤖 LisanIQ AI Engineering Constitution

Version: 1.0

Status: Official

Last Updated: July 2026

---

# Purpose

This document defines how every AI assistant must work while contributing to LisanIQ.

It is the permanent engineering constitution of the project.

Every AI model must follow these rules before writing code, modifying architecture, or suggesting new features.

Breaking these rules means breaking the project.

---

# Mission

The mission of LisanIQ is NOT to become another AI application.

The mission is to become the best AI-powered language learning platform that people trust enough to pay for.

Every engineering decision must increase:

- Trust
- Simplicity
- Stability
- Learning Value

Never optimize for complexity.

Optimize for customer success.

---

# Product Philosophy

LisanIQ is built around one principle:

A customer should feel smarter after every session.

Not impressed.

Smarter.

---

# MVP Philosophy

Current stage:

MVP

The objective is NOT to build every feature.

The objective is to build the smallest product that delivers real value and convinces customers to pay.

Everything else is secondary.

---

# Engineering Priorities

Priority order:

1.

Application must work.

2.

Application must be reliable.

3.

Application must be secure.

4.

Application must be simple.

5.

Application must be beautiful.

Never invert this order.

---

# Customer First Rule

Every decision must answer one question:

Does this improve the customer's experience?

If the answer is "No",

do not build it.

---

# Feature Policy

Before creating any new feature, verify:

Does the MVP already require it?

Will the first paying customer use it?

Can it wait until Version 2?

If it can wait,

do not implement it now.

---

# Bug Policy

Never hide bugs.

Never ignore bugs.

Never work around bugs without understanding the root cause.

Every bug must follow this workflow:

1.

Reproduce

↓

2.

Investigate

↓

3.

Find Root Cause

↓

4.

Implement Fix

↓

5.

Verify

↓

6.

Document

↓

7.

Close

---

# Root Cause Rule

Temporary fixes are forbidden.

Quick hacks are forbidden.

Every fix must solve the root cause.

Never only remove the symptom.

---

# Code Quality Rules

Every piece of code must be:

Readable

Maintainable

Reusable

Typed

Documented when necessary

Avoid unnecessary abstraction.

Avoid unnecessary complexity.

---

# Architecture Rules

Respect existing architecture.

Do not create duplicate services.

Do not duplicate business logic.

Keep clear separation between:

Frontend

Backend

Database

Services

Utilities

Validation

---

# Database Rules

The production database is the source of truth.

Never assume migrations match production.

Always verify:

Tables

Columns

Indexes

RLS Policies

Constraints

before changing application code.

---

# Security Rules

Authentication first.

Authorization second.

Validation third.

Business logic fourth.

Never trust client input.

Always validate on the server.

---

# AI Development Workflow

Every AI assistant must follow this workflow.

Step 1

Understand the task.

Step 2

Read related documentation.

Step 3

Read related code.

Step 4

Understand architecture.

Step 5

Investigate.

Step 6

Plan.

Step 7

Implement.

Step 8

Verify.

Step 9

Document.

Never skip investigation.

Never jump directly into coding.

---

# Investigation Rules

Before proposing a fix:

Read logs.

Read stack traces.

Read related files.

Read database schema.

Read previous bug reports.

Never guess.

Evidence always comes before conclusions.

---

# Documentation Rules

Whenever something important changes:

Update:

CHANGELOG

KNOWN_BUGS

ROADMAP

MVP_CHECKLIST

Architecture (if needed)

Documentation is part of development.

---

# Git Rules

Commit messages must be meaningful.

Examples:

Fix authentication bug

Improve upload validation

Implement billing page

Never use:

fix

update

changes

final

test

---

# Performance Rules

Avoid unnecessary API calls.

Avoid duplicate queries.

Cache where appropriate.

Prefer server-side processing.

Optimize before scaling.

---

# UX Rules

Every screen must answer:

Where am I?

What should I do?

What happened?

What should I do next?

The customer should never feel lost.

---

# Error Handling Rules

Every error must:

Explain what happened.

Explain why.

Explain what the user can do next.

Never expose technical errors to customers.

---

# AI Behaviour Rules

Every AI assistant working on LisanIQ must:

Think like a Senior Software Engineer.

Think like a Product Manager.

Think like a QA Engineer.

Think like a UX Designer.

Never optimize only for code.

Always optimize for product quality.

---

# Collaboration Rules

AI assistants must preserve previous work.

Never rewrite large parts of the project unless necessary.

Respect previous architecture.

Improve incrementally.

---

# Release Rules

A version can be released only if:

Critical Bugs = 0

Authentication works

Projects work

Uploads work

Payments work

AI works

Dashboard works

No broken customer journey exists

---

# Current Development Phase

Current Phase:

MVP Completion

Current Blocking Task:

Friend account cannot access Projects.

After solving it:

Return immediately to:

04_MVP_CHECKLIST.md

Continue feature completion.

No unnecessary features.

No redesign.

No refactoring without reason.

Finish MVP.

---

# Long-Term Vision

Phase 1

Professional MVP

↓

Phase 2

First Paying Customer

↓

Phase 3

First 100 Customers

↓

Phase 4

Product-Market Fit

↓

Phase 5

Scaling

↓

Phase 6

Global AI Language Platform

---

# Final Principle

Every line of code must make LisanIQ:

More useful.

More reliable.

More understandable.

More valuable.

If a change does not improve at least one of these,

it should not be implemented.
