# Reynalds OS Session Handoff

## Purpose

This document describes only the current repository state and immediate next work.

Historical engineering detail belongs in:

- `BRAIN/DEVELOPMENT_LOG.md`
- `BRAIN/VERSION_HISTORY.md`
- `BRAIN/DECISION_LOG.md`
- company changelogs

---

# Current Checkpoint — 2026-08-12/13

Repository:

`KoinoniaTransactions/Reynalds-OS`

Most recent verified Reynalds Brothers target:

`reynalds-brothers-only`

Target checkpoint after CI repair and RB recovery closure:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

Current documentation work is isolated on:

`docs/rb-brain-continuity-20260812`

The documentation branch must not be merged without fresh approval.

---

# What Just Completed

## CI repair — PR #15

PR:

`Fix pnpm setup in CI`

Merged commit:

`c2e512335685040f7479bec5e99d58a72a40ee73`

The repair:

- removed the duplicate pnpm version declaration from GitHub Actions,
- kept the root `packageManager` as the pnpm version source,
- changed the web test command to non-interactive `vitest run`,
- allowed intentionally testless database/design-system packages to pass with `--passWithNoTests`,
- added explicit `pnpm db:generate` after install and before test/build.

Local validation before merge:

- `pnpm db:generate` passed,
- full repository `pnpm test` passed,
- 83 actual tests passed across tested packages,
- full repository `pnpm build` passed.

GitHub Actions run #41 passed end-to-end.

## Reynalds Brothers workspace closure — PR #14

PR:

`Restore Reynalds Brothers workspace closure`

Merged commit:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

The closure intentionally restored/reconciled:

- dedicated `/reynalds-brothers` workspace route,
- workspace registry/navigation integration,
- robots exclusion,
- canonical Work Item documentation,
- active Communication object documentation,
- Reynalds Brothers company Brain/README/changelog continuity,
- shared workspace route/helper integration.

The PR intentionally excluded:

- root page replacement,
- Koinonia changes,
- seed parity changes,
- wholesale recovery replay.

Focused validation before merge included:

- Prisma generation,
- 34/34 focused Reynalds Brothers tests,
- web TypeScript validation,
- diff checks.

GitHub Actions run #42 passed after the target included the CI repair.

---

# Reynalds Brothers Canonical Data Map

Start here:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

Primary company overview:

`02_Companies/Reynalds_Brothers/README.md`

Canonical objects:

- `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000000_Object_Catalog.md`
- `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000001_Work_Item.md`
- `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000004_Communication.md`

WalMart Tanks communication workflow:

`02_Companies/Reynalds_Brothers/04_Communications/Walmart_Tanks_Gmail_Workflow.md`

Archived Gmail source snapshots:

`02_Companies/Reynalds_Brothers/04_Communications/walmart_tanks_gmail_batch_2026-07-29*.json`

Current seed:

`packages/database/prisma/seed.ts`

Current shared schema:

`packages/database/prisma/schema.prisma`

Workspace UI:

`apps/web/app/reynalds-brothers/page.tsx`

RB APIs and runtime helpers live under:

- `apps/web/app/api/reynalds-brothers/`
- `apps/web/lib/reynalds-brothers-*`
- `apps/web/lib/walmart-tanks-gmail-backfill.ts`

---

# Recovery Branch — Preserve

Recovery branch:

`recovery/reynalds-brothers-main-workspace-20260731`

Important recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

This branch contains historical recovery evidence, including a richer seed snapshot.

It is **not** the current canonical runtime state.

Seed parity remains unresolved. Do not delete this branch until seed parity is intentionally reviewed and documented.

Never replay the recovery root `apps/web/app/page.tsx`; it was intentionally excluded because it would overwrite current root behavior.

---

# Current CI Contract

The repository CI sequence is:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

Do not remove explicit Prisma generation without first proving the workspace build no longer requires it.

---

# Company Boundary

Koinonia and Reynalds Brothers are separate company domains.

Do not mix:

- business objects,
- business rules,
- seed records,
- workflow semantics,
- communications,
- public-site assumptions.

Shared Reynalds OS infrastructure does not change that separation.

---

# Immediate Next Work

Finish reviewing/integrating the current Brain synchronization.

Then return to the **Koinonia Transactions website**.

Do not continue Reynalds Brothers feature expansion or seed-parity work unless a new approved task explicitly reopens it or a verified blocker requires it.

---

# Mandatory Startup Rule for the Next AI

Before changing anything:

1. Read `START_HERE.md`.
2. Read `BRAIN/CANONICAL_REGISTRY.md`.
3. Read `BRAIN/PROJECT_STATE.md`.
4. Read `BRAIN/CURRENT_PRIORITIES.md`.
5. Read this file.
6. Inspect the current repository branch/state.
7. Read the relevant company Brain before modifying company-specific behavior.
8. Search for existing implementation before creating anything.

Recover before reinventing. Extend before creating. Current repository truth outranks conversation history.
