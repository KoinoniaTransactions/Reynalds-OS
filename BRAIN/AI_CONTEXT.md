# AI Context

## Purpose

This file provides immediate context for future AI sessions.

Any AI working inside this repository should read this file before proposing architecture or writing code.

---

# Current Phase

Phase 1 — Foundation

Current objective:

Build Reynalds OS into a production-ready platform beginning with the Koinonia ERP workspace.

Priority order:

1. Documentation
2. Architecture
3. Shared Object Engine
4. Shared UI
5. Brain Module
6. Koinonia Workspace
7. Deployment

---

# Current Repository Status

Implemented:

- Next.js application
- TypeScript
- Prisma schema
- Object Engine
- CRM MVP
- Transactions MVP
- Operations MVP
- Finance MVP
- Knowledge MVP
- Notifications MVP
- Workflow Engine MVP
- Brain documentation

Current work:

Stabilize architecture before expanding functionality.

---

# Development Philosophy

Before major implementation:

- Read the Brain.
- Understand the architecture.
- Inspect existing code.
- Reuse existing modules.
- Explain proposed changes.
- Wait for user approval.

---

# Documentation Rule

Documentation is considered production code.

Architectural changes are incomplete until the Brain has been updated.

---

# Current Personal Finance Context - 2026-08-07

J&M Reynalds Finances is an active focused workstream with its own approved product and architecture boundary.

Current implementation state:

- route family: `/personal`;
- current development is local-first;
- persistence is local SQLite for development;
- Demo and Clean modes are available;
- development data is synthetic;
- current code baseline before this documentation work is `0f07a56678676c17727f10c23dd169a487da4a2e`;
- latest verified focused checkpoint passed 12 Personal Finance test files / 63 tests.

Approved destination:

A private authenticated J&M household financial application available securely anywhere, with manual control as the foundation and financial-institution synchronization layered on top.

Current next product milestone:

Verify the synthetic Demo Home Mortgage lifecycle, including obligation linkage, financed setup, linked asset/liability creation, and stable obligation-ID debt-ledger routing. Do not record a synthetic payment merely to prove navigation.

Architecture work that follows later includes household ownership, provider-neutral provenance, managed production persistence, production authentication and household authorization, provider sandbox evaluation, reliable synchronization, hosting/security, and final Clean-reset onboarding.

For this workstream, `BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md` is the canonical architecture source.
