# Project Memory — Reynalds OS v11.3.1

## Current Priority

Resume the Koinonia Transactions production website after completing the 2026-08 Reynalds Brothers recovery/closure and CI stabilization.

---

# Repository-First Standard

The repository is authoritative.

Do not claim current state from chat memory, historical changelogs, recovery branches, or archived snapshots without verifying current canonical files.

Recover before reinventing. Extend before creating.

---

# Important Current Checkpoint

Verified Reynalds Brothers target after the completed recovery closure:

`reynalds-brothers-only` at `e84b4e610e6075f6f54907f277714a94b24dd7e6`

This target contains:

- the merged CI repair from PR #15,
- the merged RB workspace closure from PR #14,
- successful CI run #41 for the repair,
- successful CI run #42 for the closure.

---

# Reynalds Brothers Memory

Reynalds Brothers is a separate managed company domain.

Start with:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

Primary operating object:

`rb.work_item`

Dedicated workspace:

`/reynalds-brothers`

Communication evidence is modeled through the canonical Communication object and the WalMart Tanks Gmail workflow.

WalMart Tanks source/archive documentation lives under:

`02_Companies/Reynalds_Brothers/04_Communications/`

---

# Recovery Memory

Preserve:

`recovery/reynalds-brothers-main-workspace-20260731`

at recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

The recovery branch is evidence, not canonical runtime truth.

Seed parity is unresolved. The recovery seed contains richer historical fields that are not all represented in the current seed.

Do not:

- delete the recovery branch,
- replay it wholesale,
- replay its root page,
- claim seed parity is complete.

---

# Current CI Contract

The current CI order is:

1. frozen-lockfile install,
2. Prisma Client generation,
3. repository tests,
4. production build.

Web Vitest runs non-interactively. Intentionally testless workspaces may pass with `--passWithNoTests`.

---

# Company Separation Memory

Do not collapse company boundaries.

- Reynalds OS is shared infrastructure.
- Koinonia Transactions is its own business domain.
- Koinonia Properties is its own business domain.
- Reynalds Brothers is its own business domain.

Company-specific data and operating rules remain with their company domain.

---

# Next Action Memory

After the Brain synchronization is reviewed and integrated, return to the Koinonia Transactions website.

Reopen Reynalds Brothers only for an explicitly approved focused task or verified blocker.
