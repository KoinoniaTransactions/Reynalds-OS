# Reynalds OS v8.0 Developer Handoff

## What This Repository Is

This is the first production codebase scaffold for Reynalds OS and Koinonia ERP.

It includes:
- Next.js app scaffold.
- TypeScript monorepo.
- ROS design system package.
- Core platform package.
- Prisma database schema.
- AI Copilot package scaffold.
- API route stubs.
- Docker Compose Postgres.
- CI workflow.
- Developer documentation.

## What This Repository Is Not Yet

This is not a fully running production SaaS app yet.

It is a build-ready scaffold that defines:
- Project structure.
- Architecture.
- Data model.
- Initial APIs.
- Design system direction.
- MVP implementation path.

## Recommended First Developer Tasks

1. Install dependencies with pnpm.
2. Configure `.env`.
3. Start Postgres with Docker.
4. Run Prisma generate.
5. Run initial migration.
6. Start Next.js dev server.
7. Replace API stubs with Prisma-backed services.
8. Implement authentication.
9. Implement Object Explorer backed by database.
10. Implement Timeline creation on object updates.

## Local Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Build Priorities

1. Authentication.
2. Workspace model.
3. Object Engine.
4. Timeline events.
5. CRM and Transactions.
6. Operations queue.
7. Finance MVP.
8. Copilot read-only context.
