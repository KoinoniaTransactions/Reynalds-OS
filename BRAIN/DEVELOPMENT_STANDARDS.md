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

## Entity Isolation Rule

Every company, project, workspace, operating system, portal, and other operational entity inside Reynalds OS must be isolated by default.

Shared infrastructure, packages, schemas, and reusable patterns are allowed, but entity-specific state must never silently bleed across boundaries.

This includes:

- Database records and queries.
- Workspace and tenant identifiers.
- Authentication and mock-auth identities.
- Environment variables and runtime configuration.
- Fixtures, seeds, migrations, and test data.
- Files, documents, storage locations, and secrets.
- Queues, workflows, automations, and background processing.
- Branches, build inputs, deployments, domains, and release state.
- Logs, audit records, caches, and temporary local development state.

Every entity-specific operation must resolve and verify its intended entity or workspace explicitly before reading or writing data.

Local development must not rely on a shared environment value when that value could silently redirect work into another entity. Prefer explicit entity-scoped or process-scoped overrides for temporary local work.

Cross-entity access or integration is allowed only when it is intentionally designed, explicitly scoped, permission-controlled where applicable, and auditable. Accidental cross-entity inheritance is a defect.

When working in a shared monorepo, do not modify, stage, reset, migrate, deploy, seed, or otherwise mutate another entity's state unless that entity is explicitly part of the approved work.

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