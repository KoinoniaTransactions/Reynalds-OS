# Current State — Reynalds OS v11.3.1

## Active Production Priority

Koinonia Transactions website.

The 2026-08 Reynalds Brothers recovery/closure and CI stabilization work is complete enough to leave the active critical path.

---

# Verified Repository Checkpoint

Repository:

`KoinoniaTransactions/Reynalds-OS`

Reynalds Brothers integration target:

`reynalds-brothers-only`

Verified checkpoint after merged CI repair and RB closure:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

---

# Recently Completed

## CI repair

PR #15 — `Fix pnpm setup in CI`

Merged at:

`c2e512335685040f7479bec5e99d58a72a40ee73`

Current CI order:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

The repair also makes web Vitest non-interactive and allows intentionally testless workspaces to pass recursively.

GitHub Actions run #41 passed.

## Reynalds Brothers closure

PR #14 — `Restore Reynalds Brothers workspace closure`

Merged at:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

GitHub Actions run #42 passed.

The closure restored/reconciled the dedicated RB workspace, canonical Work Item/Communication documentation, navigation/robots integration, and company continuity without changing Koinonia or performing seed parity.

---

# Reynalds Brothers Data Location

Start with:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

That file maps:

- company rules,
- object definitions,
- WalMart Tanks Gmail workflow and archive snapshots,
- workspace/API/runtime code,
- tests,
- database schema/current seed,
- preserved recovery evidence.

---

# Outstanding Recovery Item

Reynalds Brothers seed parity is intentionally unresolved.

Preserve branch:

`recovery/reynalds-brothers-main-workspace-20260731`

Recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

Do not delete or wholesale replay this branch. The current seed is `packages/database/prisma/seed.ts`; the richer recovery seed is evidence for a future focused parity review.

---

# Company Boundary

Koinonia Transactions, Koinonia Properties, and Reynalds Brothers are separate business domains inside the broader Reynalds OS ecosystem.

Do not mix company-specific rules or records merely because they share technical infrastructure.

---

# Immediate Next Direction

Complete review/integration of the current Brain synchronization, then resume Koinonia Transactions website work.

Do not reopen Reynalds Brothers feature expansion or seed parity unless explicitly approved or required by a verified blocker.
