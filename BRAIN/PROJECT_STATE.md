# Reynalds OS Project State

## Project

**Product:** Reynalds OS

**Repository:** `KoinoniaTransactions/Reynalds-OS`

**Current RB integration target:** `reynalds-brothers-only`

**Verified target checkpoint after RB recovery closure:** `e84b4e610e6075f6f54907f277714a94b24dd7e6`

---

# Current Version

`Reynalds_OS_v11_3_1_Work`

No new OS version is being created for the 2026-08 Brain synchronization because this is documentation/continuity work rather than a product release.

---

# Current Status

Reynalds OS is an established multi-domain repository with production application code, shared platform packages, canonical Brain documentation, company-specific knowledge, and CI validation.

Recent stabilization completed:

- Reynalds Brothers recovery audit completed.
- Unsafe wholesale replay of the preserved RB recovery branch was rejected.
- Dedicated Reynalds Brothers workspace closure was reconciled and merged through PR #14.
- CI was repaired through PR #15.
- Prisma Client generation is now explicit in CI before tests/build.
- Recursive repository tests are CI-safe and non-interactive.
- GitHub Actions run #41 passed the CI repair end-to-end.
- GitHub Actions run #42 passed the RB closure against the repaired target.
- Reynalds Brothers and Koinonia remain separate business domains.
- The RB recovery branch remains preserved because seed parity is intentionally unresolved.

---

# Current Architecture Boundary

Reynalds OS is the shared platform and repository.

Business-specific rules live with their company domains.

Important boundaries:

- Koinonia Transactions business knowledge stays with Koinonia Transactions.
- Koinonia Properties business knowledge stays with Koinonia Properties.
- Reynalds Brothers business knowledge stays under `02_Companies/Reynalds_Brothers/`.
- Shared application/platform capabilities live under `apps/`, `packages/`, and global `BRAIN/` governance.
- Shared infrastructure does not make separate companies the same domain.

---

# Reynalds Brothers Recovery Closure

Current dedicated workspace:

`/reynalds-brothers`

Canonical company Brain/data map:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

Current target checkpoint:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

Preserved recovery branch:

`recovery/reynalds-brothers-main-workspace-20260731`

Recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

The recovery branch is reference evidence only. It must not be replayed wholesale and must not be deleted until the seed-parity review is intentionally completed.

The current merged seed is `packages/database/prisma/seed.ts`. Richer fields visible in the recovery seed are not automatically canonical current seed state.

---

# CI State

Current repository CI sequence:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

PR #15 corrected:

- duplicate pnpm version setup,
- web Vitest watch-mode behavior,
- empty-test-package failures,
- missing Prisma Client generation before production build.

The CI repair changed build/test infrastructure only; it did not change Koinonia or Reynalds Brothers runtime behavior.

---

# Current Production Priority

The Reynalds Brothers recovery/closure work is no longer the primary development stream.

The production priority returns to the **Koinonia Transactions website**.

Do not expand Reynalds Brothers or the broader OS speculatively unless:

- a verified issue blocks current production work,
- an intentional seed-parity review is started, or
- a future approved task explicitly reopens that company domain.

---

# Documentation Status

The Brain is the authoritative continuity layer for architecture, decisions, current state, and AI handoff.

The Reynalds Brothers company Brain maps company-specific data and implementation locations.

Historical recovery evidence must remain clearly labeled as historical/reference material and must not override current canonical files.

---

# Immediate Next Direction

After the current Brain synchronization is reviewed and integrated, return to Koinonia Transactions website work.

For any new session:

1. Read `START_HERE.md`.
2. Read `BRAIN/CANONICAL_REGISTRY.md`.
3. Read `BRAIN/CURRENT_PRIORITIES.md`.
4. Read `BRAIN/SESSION_HANDOFF.md`.
5. Inspect the current repository before recommending changes.
6. When working on Reynalds Brothers, also read `02_Companies/Reynalds_Brothers/06_Brain/README.md`.
