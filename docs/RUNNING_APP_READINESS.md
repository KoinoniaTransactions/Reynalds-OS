# ROS v8.5 — Running App Readiness

## Purpose

Move the project from generated scaffold toward a running local application.

## Added

- Root README with local development commands.
- Package-level TypeScript configs.
- Local validation checklist.
- Developer startup sequence.
- Implementation status report.
- Updated project version metadata.

## Local Startup Checklist

1. Install Node.js 22+.
2. Install pnpm 9+.
3. Run `pnpm install`.
4. Copy `.env.example` to `.env`.
5. Start Postgres with `docker compose up -d`.
6. Generate Prisma client.
7. Run Prisma migration.
8. Run seed.
9. Start development server.
10. Open `/objects`.

## Validation Commands

```bash
pnpm install
pnpm --filter @reynalds-os/database db:generate
pnpm --filter @reynalds-os/database db:migrate
pnpm --filter @reynalds-os/database db:seed
pnpm test
pnpm build
pnpm dev
```

## Known Constraint

This archive is not dependency-installed inside this sandbox. A real local checkout is required for full verification.
