# Koinonia Production Release — 2026-09-16

Owner approval: Jeremiah
Release status: COMPLETE

## Production checkpoint

The owner-approved Koinonia public website and recovered transaction-first Realtor Portal were promoted to `koinonia-production` on 2026-09-16.

Production branch commit:

`f6c821111ff17a602eee92db01998a0c52bf62f0`

Production Vercel deployment:

`dpl_F5sqbQzSDmvK15x97dbAjF5GkWUv`

Production domains attached to this deployment include:

- `https://koinoniatransactions.com`
- `https://www.koinoniatransactions.com`

## Release contents

This production release includes:

- the owner-approved current Koinonia public website architecture and September commercial content;
- current Home, Services & Pricing, Contact, Referrals, Privacy, SEO, and consultation/detail interactions;
- retained Portal navigation from the public site;
- the recovered September transaction-first Realtor Portal workstream, including compact dashboard, `Start a file`, Buyer/Seller intake, `/client/transactions/new`, transaction workspace/detail behavior, document review/versioning, transaction attention/deadline/projection logic, employee transaction controls, transaction-specific permissions, and inbound-email plumbing;
- the production Prisma/Vercel packaging safeguard required for database-backed Portal routes.

## Verification performed

Before production promotion, the combined candidate passed:

- Prisma generation;
- database migration check with no pending migrations;
- `pnpm test`;
- `pnpm build`;
- Vercel preview deployment and route generation.

After production promotion:

- Vercel production deployment reached `READY`;
- `https://www.koinoniatransactions.com/` returned the approved current Homepage from the new production deployment;
- `/services` returned the current Services & Pricing experience;
- the retired `/appointments` path resolved to the current Contact / consultation experience;
- `/client/dashboard` routed signed-out traffic into the secure sign-in flow rather than throwing a runtime/database error;
- production runtime logs for the release deployment showed no error or fatal entries during the verification window.

## Deferred / separate activation work

The recovered Portal contains application-side support for transaction document extraction and transaction-specific inbound email, but provider/environment activation and end-to-end verification remain separate follow-up work. Those items were not treated as blockers for the public website / Portal release because the core production Portal and public website were verified independently.

Marketing instrumentation and campaign activation remain a separate Phase B workstream and require their own validation and owner gate.