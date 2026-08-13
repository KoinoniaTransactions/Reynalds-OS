# AI Context

## Purpose

This file provides immediate operating context for future AI sessions.

Repository state is authoritative. Conversation memory is useful only as a lead to verify against the repository.

---

# Current Phase

Current objective:

**Resume Koinonia Transactions production website work after the 2026-08 Reynalds Brothers recovery/closure and CI stabilization.**

The recent RB work was a recovery/continuity task, not a change in the primary product priority.

---

# Mandatory Startup Context

Before proposing architecture or implementation:

1. Read `START_HERE.md`.
2. Read `BRAIN/CANONICAL_REGISTRY.md`.
3. Read `BRAIN/PROJECT_STATE.md`.
4. Read `BRAIN/CURRENT_PRIORITIES.md`.
5. Read `BRAIN/SESSION_HANDOFF.md`.
6. Inspect the current repository and relevant implementation.
7. Read company-specific Brain material for the company domain being changed.

For Reynalds Brothers specifically, also read:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

---

# Current Repository Checkpoint

The verified Reynalds Brothers integration target after recovery closure is:

`reynalds-brothers-only` at `e84b4e610e6075f6f54907f277714a94b24dd7e6`

This includes:

- merged CI repair from PR #15,
- merged RB workspace closure from PR #14,
- successful GitHub Actions CI runs #41 and #42.

---

# Company Boundary Rule

Keep business domains separate.

- Reynalds OS is the shared platform/repository.
- Koinonia Transactions business logic is not Reynalds Brothers business logic.
- Koinonia Properties business logic is not Reynalds Brothers business logic.
- Reynalds Brothers business knowledge belongs under `02_Companies/Reynalds_Brothers/`.

Shared infrastructure does not erase company boundaries.

---

# Reynalds Brothers Recovery Rule

Preserved recovery branch:

`recovery/reynalds-brothers-main-workspace-20260731`

Recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

This branch is evidence, not current canonical state.

Do not:

- replay it wholesale,
- replace the current root page from recovery,
- assume recovery seed fields are already current,
- delete the branch before seed parity is intentionally completed.

Seed parity is unresolved and intentionally deferred.

---

# CI Rule

The current CI sequence is:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

Prisma Client generation must occur before repository tests/build because the schema is owned by the database workspace.

The web test script runs Vitest non-interactively. Intentionally testless packages may use `--passWithNoTests`.

---

# Development Philosophy

Before meaningful implementation:

- understand the request,
- inspect the current repository,
- identify the canonical owner,
- recover before reinventing,
- extend before creating,
- recommend improvements when appropriate,
- explain the exact scope,
- wait for approval,
- validate before claiming success,
- document durable state changes.

---

# Current Priority Boundary

Do not continue expanding Reynalds Brothers or Reynalds OS merely because recovery material exists.

After this continuity synchronization, return to the Koinonia Transactions website unless an explicitly approved task or verified blocker requires otherwise.

---

# Documentation Rule

Documentation is production continuity infrastructure.

Architectural changes, recovery conclusions, data-authority rules, and important branch/CI states are incomplete until the Brain accurately reflects them.
