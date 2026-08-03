# Reynalds OS Project State

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

---

# 2026-08-03 Portal Platform State

The Koinonia portal has advanced beyond template-only service presentation.

Current implemented architecture includes:

- persisted service playbook snapshots,
- persisted transaction deadline placeholders,
- centralized staff service-cue construction,
- persisted employee queues and risk notes,
- playbook-driven client service cues,
- playbook-driven document expectations,
- live client send-package visibility,
- live-record client billing service presentation,
- live-record employee billing queues,
- pay-at-close billing monitoring,
- payment webhook URL readiness checks,
- Stripe payment webhook handling,
- Cloudflare R2 document-storage readiness checks,
- scan-before-R2 document upload and replacement handling,
- delivery-confirmation gates for document send-package completion states.

The active portal remains pre-production until identity-provider configuration, staff MFA, database-backed testing, private document infrastructure, production payment secrets, real webhook delivery, and controlled end-to-end verification are complete.

The current implementation principle is:

Persist operational service intent when work is created, then let client and employee portal views consume that persisted intent consistently.

Document handling principle:

Live portal documents must use private Cloudflare R2 object storage, must pass malware scanning before R2 persistence, and must remain accessible only through protected portal routes.

Send-package principle:

Prepared document send packages may track delivery state, but sent/signature/completed statuses require safe delivery confirmation and do not by themselves prove external e-signature or brokerage-platform integration.
