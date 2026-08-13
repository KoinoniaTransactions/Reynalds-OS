# Architect Handoff — Reynalds OS

## What This Project Is

Reynalds OS is a repository-first operating platform supporting multiple business domains and production applications.

The current production priority is the Koinonia Transactions website.

Reynalds Brothers is a separate managed company domain with its own workspace, business objects, communications, workflows, and recovery history.

---

# Core Boundaries To Preserve

- The public Koinonia Transactions website uses root launch paths such as `/`, `/services`, `/about`, and `/contact`.
- The internal Reynalds OS dashboard is preserved at `/dashboard`.
- Reynalds Brothers has a dedicated workspace at `/reynalds-brothers`.
- Koinonia Transactions, Koinonia Properties, and Reynalds Brothers remain separate business domains.
- Shared code/infrastructure does not merge company data or business rules.
- The repository and Brain are authoritative over conversation history.

---

# Current Verified RB Integration State

Target branch:

`reynalds-brothers-only`

Verified checkpoint after CI repair and RB closure:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

PR #15 merged the CI repair first at:

`c2e512335685040f7479bec5e99d58a72a40ee73`

PR #14 then merged the RB workspace closure at:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

GitHub Actions runs #41 and #42 both passed.

---

# Reynalds Brothers Start Point

Before changing RB, read:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

That file is the current company data map and points to:

- company operating rules,
- Work Item and Communication objects,
- WalMart Tanks Gmail workflow and archived evidence,
- active workspace/API/runtime files,
- tests,
- current database schema/seed,
- preserved recovery evidence.

---

# Recovery Guardrail

Preserve:

`recovery/reynalds-brothers-main-workspace-20260731`

Recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

The recovery branch is reference evidence, not canonical current state.

Seed parity remains intentionally unresolved.

Do not:

1. wholesale replay the recovery branch,
2. replay the recovery root `apps/web/app/page.tsx`,
3. assume recovery seed fields are already current,
4. delete the recovery branch before seed-parity closure.

---

# Current CI Contract

`.github/workflows/ci.yml` must currently execute:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

The web Vitest script is non-interactive. Testless packages may use `--passWithNoTests`.

This sequence exists because CI demonstrated that Prisma Client generation is required before the production build with the current workspace architecture.

---

# Current Priority

After the Brain synchronization is reviewed and integrated, return to Koinonia Transactions website work.

Do not treat the successful RB recovery as a reason to keep expanding that company domain.

---

# Critical Warnings

1. Do not recreate systems that already exist.
2. Do not present conceptual work as repository work.
3. Do not mix company-domain business logic.
4. Do not replace current repository truth with historical recovery content without semantic reconciliation.
5. Do not remove the preserved RB recovery branch until seed parity is intentionally completed.
6. Do not merge meaningful work without appropriate validation and fresh approval.
7. Inspect current routes before assuming old routing documentation is still correct.

---

# Architect Workflow

Before a meaningful change:

1. Identify the business/platform owner of the change.
2. Read the governing Brain/canonical source.
3. Inspect current implementation and tests.
4. Search recovery/history only when needed.
5. Propose the smallest coherent safe scope.
6. Wait for approval.
7. Implement in an isolated work context.
8. Validate.
9. Update continuity if durable state changed.
