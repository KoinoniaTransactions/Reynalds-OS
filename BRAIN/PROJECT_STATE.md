# Reynalds OS Project State

<!-- PERSONAL FINANCE PROJECT STATE 2026-08-07 -->
## Personal Finance Project State - 2026-08-07

J&M Reynalds Finances is currently a synthetic, local-first development application.

Current code baseline: `0f07a56678676c17727f10c23dd169a487da4a2e`.

Demo/Clean data modes are active, the January 2030 Demo workspace is synthetic, and the latest verified Personal Finance checkpoint passed 12 test files / 63 tests.

Approved destination: a securely hosted private household financial application with separate authenticated household members, server-side household authorization, managed relational persistence, and future provider-neutral financial-institution synchronization.

Plaid is a preferred provider candidate, not implemented or locked into the core domain.

Manual records remain first-class. Real household data remains outside ordinary development until the production security gate and final Clean reset.

Current next feature: synthetic mortgage/debt lifecycle verification using stable obligation-ID routing.

Canonical architecture: `BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md`

Production plan: `docs/PERSONAL_FINANCE_PRODUCTION_ARCHITECTURE_V1.md`
<!-- END PERSONAL FINANCE PROJECT STATE 2026-08-07 -->

---

## Project

**Product:** Reynalds OS

**Primary Workspace:** Koinonia ERP

**Repository:** KoinoniaTransactions/Reynalds-OS

**Primary Branch:** develop

**Current Working Branch:** feature/app-shell-foundation

---

# Current Version

Reynalds_OS_v11_3_1_Work

---

# Current Status

The local development environment is operational.

2026-07-29 portal-auth note:

- Portal login source work has advanced to Clerk provider wiring, invitation records, optional provider invite handoff, and first-login invitation acceptance.
- Local branch `feature/app-shell-foundation` is ahead of GitHub and must not be pushed without Jeremiah's explicit approval.
- Local Docker/Postgres was not available during the portal-auth work, so live database invite testing remains incomplete.

Completed:

- GitHub connected
- SSH configured
- Docker running
- PostgreSQL running
- Prisma connected
- Next.js running
- Production scaffold operational
- Object Engine implemented
- CRM MVP
- Transactions MVP
- Finance MVP
- Operations MVP
- Object Explorer MVP
- Notification Engine MVP
- Workflow Engine MVP
- Brain documentation established

---

# Current Milestone

Transition from prototype applications to a unified Operating System centered around the Brain and Object Engine.

---

# Active Objective

Build the foundational Brain architecture while preserving the existing application shell.

Immediately afterward, begin building the Koinonia website directly on top of the Reynalds OS platform.

---

# Current Architectural Priorities

1. Brain
2. Object Engine
3. Shared UI
4. Shared Navigation
5. Shared Services
6. Koinonia Workspace

---

# Documentation Status

The Brain folder is the authoritative documentation source for Reynalds OS.

All significant architectural changes should be reflected here before a development session is considered complete.

---

# Next Recommended Task

Build the Brain module and transform the Dashboard into the Reynalds OS Command Center.

Afterward, begin implementing the Koinonia website as the first production workspace within Reynalds OS.
---

# Website Architecture Progress

The Koinonia website has entered Phase 2 of the content architecture refactor.

Completed:

- Home
- About
- Services
- Contact
- CTA
- Footer
- Trust Pillars
- Contact Actions

All reusable website copy above is now driven from shared content rather than embedded directly inside components.

Current production build status:

PASSING
