# Architect Handoff — Reynalds OS

## What This Project Is

Reynalds OS is a repository-first operating platform for building and managing business systems. Koinonia is the active public website and first production application focus.

## What Must Be Preserved

- `/` remains the internal Reynalds OS dashboard.
- Public Koinonia website lives under `/koinonia`.
- Component-first architecture.
- Repository-first execution standard.
- Continuity Package.
- Object registry and release history.

## Current Public Website Routes

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact` placeholder

## Current Component Location

`apps/web/components/site/`

## Current Priority

**Koinonia marketing materials are the active priority.**

Software development should pause unless a small implementation is directly required to support a marketing promise, intake path, screenshot, QR destination, client experience, or operational requirement.

Recommended collateral sequence:
1. Service Guide
2. Pricing Insert
3. Brokerage Intro Sheet
4. Tri-fold brochure
5. Referral Partner piece
6. Digital follow-up packet
7. Business cards / presentation support

## Koinonia CRM Development History

Before resuming CRM / relationship-learning development, read:

`05_Change_Log/KOINONIA_CRM_DEV_HANDOFF_2026-08-15.md`

That handoff documents:
- the client portal vs internal CRM boundary
- the existing-system-first development rule
- staff-only CRM protection
- Relationship Learning CRM structure
- Quick Capture and consultation write-through
- Quick Capture → existing staff Task integration
- deterministic follow-up date suggestions
- Relationship Follow-Up Queue
- My Follow-Ups / All Staff filtering
- inline rescheduling and clearing due dates
- follow-up owner visibility
- important commits and verified preview deployments
- the intentionally deferred CRM follow-up reassignment permission decision
- exact resume-development guidance

## Critical Warnings

1. Do not recreate systems that already exist. Search the CRM, employee/admin portal, APIs, models, and shared components before implementing new functionality.
2. Do not present conceptual work as repository work.
3. Do not overwrite internal dashboard route.
4. Do not remove source archives.
5. Do not delete historical files unless contents are preserved and the decision is documented.
6. Internal CRM actions must never automatically become client-visible portal actions.
7. Do not create a second CRM or task system; reuse canonical Relationship and Task infrastructure.
8. The current integration branch contains unrelated product routes and must not be promoted wholesale to Koinonia Transactions production.

## Launch-First Guidance

Only implement changes that help launch Koinonia, support the active marketing-material workflow, or preserve the project's integrity.
