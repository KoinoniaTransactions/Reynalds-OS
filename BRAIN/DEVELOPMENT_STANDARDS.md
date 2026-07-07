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

## Launch Classification Rule

Classify new ideas as:

- Required before launch
- Version 1.1 enhancement
- Future vision

Website launch work takes priority over future-platform expansion unless the platform work directly accelerates launch.
