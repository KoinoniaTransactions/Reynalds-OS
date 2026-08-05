# Reynalds OS Project State

<!-- PERSONAL FINANCE PROJECT STATE 2026-08-05 -->
## Personal Finance Project State — 2026-08-05

The local-only Personal Finance workspace has reached a stable committed reconciliation and matching checkpoint.

- Branch: `feature/app-shell-foundation`
- Verified code HEAD: `fa878ea`
- Reconciliation foundation: committed and live-verified
- Matching intelligence: committed and live-verified
- Focused tests: 17 passing
- Existing local server: port `3003`
- Real database and budget CSV: unchanged during verification
- Push status: local only

The privacy-safe 40-transaction review shows that amount evidence dominates and that target separation is weak. Ten rows were ambiguous, with a median and average best-versus-second gap of 4%.

Current priority: add an ambiguity-margin guard and transparent evidence metadata without changing confidence thresholds or adding automatic writes.
<!-- END PERSONAL FINANCE PROJECT STATE 2026-08-05 -->

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
