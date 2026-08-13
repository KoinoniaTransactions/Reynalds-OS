# Reynalds Brothers Brain

## Purpose

The Reynalds Brothers Brain preserves business-specific operating knowledge for Reynalds Brothers inside Reynalds OS and gives future AI sessions a reliable map to the current data, implementation, historical evidence, and unresolved recovery work.

Reynalds Brothers is a separate managed company domain. It is not Koinonia, and its business rules must not be mixed with Koinonia Transactions or Koinonia Properties business rules.

---

# Canonical Boundary

Reynalds Brothers business knowledge belongs under:

`02_Companies/Reynalds_Brothers/`

Shared application/platform implementation belongs under:

`apps/`

Shared database/platform schema belongs under:

`packages/`

Global Reynalds OS governance belongs under:

`BRAIN/`

The company domain may use shared Reynalds OS capabilities without becoming the same business domain as another company.

---

# Current Canonical State

As of the 2026-08-12/13 recovery-closure work:

- Reynalds Brothers is a first-class company workspace inside Reynalds OS.
- The dedicated workspace route is `/reynalds-brothers`.
- The primary operating object is the Work Item.
- The Communication object is active for email/call/text evidence.
- WalMart Tanks Gmail intake, parsing, filing, review, and backfill support are represented in the current repository.
- The recovered workspace closure was intentionally reconciled into the current target rather than replayed wholesale.
- CI was repaired and validated so Prisma Client generation occurs before tests and production build.
- PR #15 (`Fix pnpm setup in CI`) merged first at `c2e512335685040f7479bec5e99d58a72a40ee73`.
- PR #14 (`Restore Reynalds Brothers workspace closure`) then merged at `e84b4e610e6075f6f54907f277714a94b24dd7e6`.
- GitHub Actions run #41 passed the CI repair branch end-to-end.
- GitHub Actions run #42 passed the recovered RB closure against the repaired target.
- Seed parity with the preserved recovery branch is not complete and remains intentionally deferred.

Current canonical target checkpoint:

`reynalds-brothers-only` at `e84b4e610e6075f6f54907f277714a94b24dd7e6`

---

# Read These First

When working on Reynalds Brothers, read in this order:

1. `02_Companies/Reynalds_Brothers/06_Brain/README.md`
2. `02_Companies/Reynalds_Brothers/README.md`
3. `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000000_Object_Catalog.md`
4. `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000001_Work_Item.md`
5. `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000004_Communication.md`
6. `02_Companies/Reynalds_Brothers/04_Communications/Walmart_Tanks_Gmail_Workflow.md`
7. Relevant current implementation and tests under `apps/web/`
8. `packages/database/prisma/schema.prisma`
9. `packages/database/prisma/seed.ts` only when seed state is relevant
10. The preserved recovery branch only when an explicit recovery/parity question requires it

---

# Primary Operating Model

Reynalds Brothers organizes around Work Items, not spreadsheets, folders, or external systems.

The operating question for every view is:

**Is this work item ready, moving, completed, documented, and billable?**

For long-running email-driven work, also ask:

**Has every important communication been filed to the correct Work Item, and is the next action current?**

---

# Canonical Object Map

| Object / Area | Canonical Source |
|---|---|
| Object catalog | `00_Master_Objects/OBJ-RB-000000_Object_Catalog.md` |
| Work Item | `00_Master_Objects/OBJ-RB-000001_Work_Item.md` |
| Communication | `00_Master_Objects/OBJ-RB-000004_Communication.md` |
| Company operating model | `../README.md` |
| Company history | `../CHANGELOG.md` |

The Work Item remains the central operational record. Communications are evidence attached to Work Items or held for review until a safe match exists.

---

# WalMart Tanks Communications Data Map

## Canonical workflow

`02_Companies/Reynalds_Brothers/04_Communications/Walmart_Tanks_Gmail_Workflow.md`

This is the human-readable source for:

- Gmail intake scope,
- identifier extraction,
- filing precedence,
- review-queue behavior,
- multi-store handling,
- parser/backfill progress,
- known pagination checkpoints.

The active source is Gmail using the `WalMart Tanks` label / `wmtanks@reynaldsbrothers.com` mailbox path. Outlook is not part of this workflow.

## Archived Gmail evidence

The source snapshots are stored under:

`02_Companies/Reynalds_Brothers/04_Communications/`

with names beginning:

`walmart_tanks_gmail_batch_2026-07-29`

These JSON files are historical evidence used for parser/backfill verification. They are not a replacement for current Work Item state.

The workflow documentation records indexing through 1,600 Gmail message IDs. Unmatched, multi-store, program-level, invoice/statement, or otherwise ambiguous emails stay in review until they can be filed safely.

---

# Runtime Implementation Map

## Workspace UI

`apps/web/app/reynalds-brothers/page.tsx`

## APIs

- Work Items: `apps/web/app/api/reynalds-brothers/work-items/`
- Email intake: `apps/web/app/api/reynalds-brothers/email-intake/`
- Gmail support: `apps/web/app/api/reynalds-brothers/gmail/`
- Local-data support: `apps/web/app/api/reynalds-brothers/local-data/`

## Core RB application logic

- `apps/web/lib/reynalds-brothers-work-items.ts`
- `apps/web/lib/reynalds-brothers-work-items.test.ts`
- `apps/web/lib/reynalds-brothers-email-intake.ts`
- `apps/web/lib/reynalds-brothers-email-intake.test.ts`
- `apps/web/lib/reynalds-brothers-email-intake-live-import.ts`
- `apps/web/lib/reynalds-brothers-workspace-live-data.ts`
- `apps/web/lib/reynalds-brothers-workspace-live-data.test.ts`
- `apps/web/lib/walmart-tanks-gmail-backfill.ts`

## Shared parser support

WalMart Tanks parser behavior also has coverage in the shared core package. Search `packages/core/` before creating duplicate parsing logic.

---

# Database Map

## Schema

`packages/database/prisma/schema.prisma`

This is the canonical shared database schema.

## Current seed

`packages/database/prisma/seed.ts`

This is the current repository seed. Treat the contents of this file on the active target as current seed truth.

Do not assume historical changelog statements or recovery copies are already represented in the current seed.

---

# Recovery Evidence and Seed-Parity Rule

Preserved recovery branch:

`recovery/reynalds-brothers-main-workspace-20260731`

Important checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

The recovery branch contains useful historical implementation and a richer seed snapshot, including fields such as:

- `customerUpdateStatus`
- `mediaStatus`
- `permitStatus`

Those recovery fields are not automatically canonical merely because they exist there.

## Mandatory rules

1. Do not replay the recovery branch wholesale.
2. Do not overwrite current files with recovery copies without semantic comparison.
3. Do not replay the recovery root page; the recovered `apps/web/app/page.tsx` would overwrite the current root behavior and was intentionally excluded.
4. Do not claim seed parity is complete.
5. Do not delete the recovery branch until the seed-parity review is intentionally completed and documented.
6. Compare current implementation, current canonical object docs, tests, and recovery evidence before promoting any missing recovery behavior.

---

# What Was Recovered in the 2026-08 Closure

The closure integration intentionally restored or reconciled:

- the dedicated `/reynalds-brothers` route,
- workspace registry/navigation support,
- robots exclusion,
- canonical Work Item documentation,
- the active Communication object,
- company Brain documentation,
- company README/changelog continuity,
- shared workspace helper integration.

The closure intentionally did **not** include:

- a root-page replacement,
- Koinonia changes,
- seed-data parity work,
- wholesale replay of the recovery branch.

---

# CI Continuity Rule

The repository CI sequence must generate Prisma Client before tests and build:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

The web workspace test command must be non-interactive (`vitest run`). Packages that intentionally contain no tests may use `--passWithNoTests` so the recursive workspace test command can complete deterministically.

This CI repair changed build/test infrastructure only; it did not change Reynalds Brothers runtime behavior.

---

# Data Authority Order

When sources disagree, use this order:

1. Current canonical files on the active target branch.
2. Current company Brain and object documentation.
3. Current tests and implementation behavior.
4. Current seed file when seed state is the question.
5. Changelogs and development logs for historical context.
6. Recovery branches and archived source snapshots as evidence.
7. Conversation history only as a lead to verify in the repository.

Repository inspection is mandatory. Chat memory never overrides verified repository state.

---

# Current Work Boundary

The RB recovery/closure milestone is complete enough to stop expanding Reynalds Brothers for now.

The unresolved RB item is the intentionally deferred seed-parity review. It should be reopened only as a focused task or if it becomes a verified blocker.

The broader production priority returns to the Koinonia Transactions website. Do not continue speculative RB platform or feature expansion merely because historical recovery material exists.

---

# Final Guardrails for Future AIs

- Keep Reynalds Brothers separate from Koinonia business logic.
- Preserve the recovery branch until seed parity is closed intentionally.
- Never equate a historical Gmail snapshot with live/current Work Item truth.
- Never equate the recovery seed with the current seed without reconciliation.
- Never recreate parsers, APIs, or workspace helpers until the existing implementation has been searched.
- Use the Work Item and Communication object definitions as the semantic contract.
- Record meaningful future RB decisions in the company docs and global Brain as appropriate.
