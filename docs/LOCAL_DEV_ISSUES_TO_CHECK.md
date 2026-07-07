# Local Development Issues to Check

When this project is run locally, check these first:

## 1. Prisma / Next.js Runtime

Confirm `@prisma/client` is generated before starting Next.js.

Command:

```bash
pnpm --filter @reynalds-os/database db:generate
```

## 2. Workspace Package Resolution

Confirm pnpm workspace links resolve:

```bash
pnpm install
pnpm -r build
```

## 3. Next.js Route Handler Types

If Next.js route handler type constraints complain, adjust `[id]/route.ts` params typing to match the installed Next.js version.

## 4. Decimal Serialization

If invoice/payment API responses later include Prisma Decimal values, serialize them to strings before returning JSON.

## 5. Auth Replacement

Current auth is mock-auth. Replace `apps/web/lib/auth.ts` with managed auth session lookup before production use.

## 6. Seed Data

Seed assumes hardcoded IDs. If Prisma models change, update `packages/database/prisma/seed.ts`.
