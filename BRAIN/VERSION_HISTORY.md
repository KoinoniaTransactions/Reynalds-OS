# Version History

## Purpose

This document records the evolution of Reynalds OS.

Unlike RELEASE_NOTES, which describe user-facing changes, this file records architectural milestones and engineering progress.

---

# v11.3.1 — Foundation Stabilization

**Status:** In Progress

### Completed

- Established the BRAIN folder as the canonical engineering knowledge base.
- Added Product Vision.
- Added Architecture Principles.
- Added Architectural Decisions (ADR system).
- Added AI Context.
- Added Project State tracking.
- Added Session Handoff.
- Added Development Standards.
- Added Decision Log.
- Added Module Map.
- Added Current Priorities.

### Repository Status

- Next.js application scaffold
- Prisma data model
- Shared Object Engine
- CRM MVP
- Transactions MVP
- Operations MVP
- Finance MVP
- Knowledge MVP
- Workflow Engine MVP
- Notification system MVP

### Current Objective

Stabilize the application architecture, complete Brain documentation, connect the dashboard to live data, and prepare the first production-quality local build.

---

# Future Releases

## v11.4

Planned:

- Brain orchestration module
- Live dashboard metrics
- Object relationship visualization
- Shared navigation improvements

---

## Long-Term Vision

Reynalds OS will evolve into a universal operating system capable of managing businesses, ministries, projects, organizations, and personal workflows through a shared object model and AI-assisted orchestration.

---

# v11.3.1 — 2026-08-03 Portal Playbook and Billing Milestone

**Status:** Implemented in source; production verification remains incomplete.

### Architecture Added

- Persisted service playbooks now retain operational service intent.
- Persisted playbooks include deadline placeholders, expected documents, staff roles, queues, risk notes, billing model, and initial actions.
- Client and employee portal consumers prefer persisted playbooks over recalculating from current templates.
- Shared playbook utilities centralize service-cue construction.

### Portal Data Progress

- Client dashboards show playbook document expectations.
- Client document pages show live send packages.
- Client billing services derive from live records.
- Employee billing queues derive from live records.
- Employee billing includes pay-at-close monitoring.

### Payment Readiness Progress

- Portal verification checks the payment webhook URL.
- Production environment gates are documented.
- Stripe webhook utilities, tests, and API handling were added.

### Document Safety Progress

- Portal document readiness now requires Cloudflare R2 account, bucket, access-key, secret-key, and explicit upload enablement.
- New and replacement document uploads are scanned before R2 persistence.
- Scanner configuration remains required through an absolute private scan-temp directory and absolute scanner executable.
- Document send-package statuses now require delivery confirmation before `Sent`, `Signature Monitoring`, or `Completed`.

### Remaining Verification

- Production Clerk configuration
- Staff MFA
- Real invitation acceptance
- Reachable production database
- Cloudflare R2 account and bucket configuration
- Controlled document-storage verification
- Live Stripe secret configuration
- External webhook delivery
- Payment-event reconciliation
- End-to-end client and employee portal testing
