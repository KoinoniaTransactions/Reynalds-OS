# Development Standards

## Stack

Recommended production stack:

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- pnpm workspace
- Managed authentication
- Docker for local database
- GitHub Actions for CI

## Repository Layout

```text
apps/
  web/
packages/
  auth/
  core/
  database/
  design-system/
  ai/
docs/
BRAIN/
```

## Development Workflow

1. Create or select a ticket.
2. Implement the smallest working slice.
3. Run typecheck/build/tests locally.
4. Fix errors immediately.
5. Update documentation.
6. Commit changes.
7. Move to next ticket.

---

## Pre-Execution Validation Workflow

Before generating code, images, documentation, architecture, or making significant recommendations:

1. Restate what you understand the request to be.
2. Identify the governing canonical documentation, approved designs, or repository standards.
3. Determine whether the work should extend an existing artifact before proposing a new one.
4. If a better approach exists, explain it before execution.
5. Clearly describe exactly what you are about to do.
6. Wait for explicit approval before executing.
7. After execution, verify the result against the governing standard before continuing.

Core Principle:

**Search first. Extend second. Create last.**

This workflow exists to prevent architectural drift, duplicate work, and the recreation of previously approved solutions.

---

## Release Rule

Do not create a new version only for documentation unless the documentation materially changes how the project is built, run, or understood.

## Code Rule

Production code should be readable before it is clever.

## API Rule

Every API should be:

- Workspace-scoped.
- Permission-checked.
- Validated.
- Auditable when it changes data.
- Documented if public to the app.

## Testing Rule

At minimum:

- Core logic should have unit tests.
- API behavior should have route/service tests.
- Critical user flows should eventually have end-to-end tests.

## Repository-First Execution Rule

Do not claim work is complete unless the actual repository files were changed.

Every meaningful change must update the continuity package and relevant documentation before release.

## AI / Developer Handoff Rule

Every new chat or new developer should begin with `START_HERE.md`.

Follow the Pre-Execution Validation Workflow before making recommendations or generating significant work.

Approved architectural and design decisions should be treated as settled unless intentionally reopened.

## Launch Classification Rule

Classify new ideas as:

- Required before launch
- Version 1.1 enhancement
- Future vision

Website launch work takes priority over future-platform expansion unless the platform work directly accelerates launch.

---

## J&M Reynalds Finances Development Standard - 2026-08-07

J&M Reynalds Finances is a private household financial application with its own approved ownership and security boundary.

The general Reynalds OS workspace rules remain valid for business and platform work. Personal Finance must not be forced into a business workspace model merely to reuse that convention.

### Scope and Authorization

Protected Personal Finance operations are household-scoped.

Before a production Personal Finance read or write, server-side code must establish:

1. authenticated identity;
2. active HouseholdMember membership;
3. household ownership of the requested resource;
4. permission for the requested action.

Authentication alone is not authorization.

### Development Data

Ordinary Personal Finance development uses synthetic Demo data only.

Do not request or enter real household account, mortgage, property, income, budget, debt, or transaction values for feature development.

Before real-data onboarding:

- complete the approved production security gate;
- run Personal Finance Clean reset;
- verify the blank first-run state;
- obtain explicit approval to begin real household onboarding.

### Local and Hosted Boundaries

Current localhost and private-network restrictions are development safety controls.

Do not create remote access by simply weakening the current host guard.

Hosted production requires the separately approved authentication, household authorization, managed persistence, HTTPS, secrets, monitoring, backup, recovery, and environment-separation controls.

### Financial Provider Development

Manual financial workflows remain first-class.

Provider integrations must remain behind server-side provider boundaries and must not define the canonical Personal Finance domain.

Plaid is the preferred first provider candidate to evaluate later, using sandbox or test data only until production readiness is separately approved.

Provider synchronization must not silently classify, review, reconcile, allocate, or confirm transactions.

### Implementation Discipline

Use stable IDs for financial relationships and navigation. Do not use display names as durable relationship keys.

Keep Personal Finance work separate from Koinonia-specific architecture unless shared infrastructure is genuinely required.
