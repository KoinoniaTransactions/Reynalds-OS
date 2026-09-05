# Koinonia Deployment Readiness

Last reconciled: 2026-09-05  
Owner: Koinonia Transactions / Reynalds OS

---

## Current Hosting Decision

Koinonia uses the custom Next.js application inside the Reynalds OS monorepo and deploys through Vercel.

Do not reopen the Squarespace-vs-custom-site decision unless the owner explicitly asks to reconsider it.

Primary repository:

`KoinoniaTransactions/Reynalds-OS`

Deployable app:

`apps/web`

Vercel project:

- name: `reynalds-os-web`
- project ID: `prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`
- team ID: `team_RS9WLroI94mnI3PQ3eh3u1sw`

Known project domains include:

- `koinoniatransactions.com`
- `www.koinoniatransactions.com`

---

# Branch / Production Safety

Current verified branch heads at the 2026-09-05 checkpoint:

- `koinonia-production` — `6644802cce54c4e295df7d98895b1493fc79a337`
- `main` — `973f0dff568a87e0ddcce89ca340fe586709d187` before the 2026-09-05 documentation reconciliation commits
- `koinonia-marketing-readiness` — `a3bc944e7eb950a4251416d6726266153d0c890e`

Important:

- do not assume `main` is production;
- do not assume `koinonia-production` contains all newer `main` work;
- do not blindly merge `main` into `koinonia-production`;
- do not merge `koinonia-marketing-readiness` wholesale into either branch;
- production deployment requires explicit owner authorization.

The marketing-readiness branch was created from the older production baseline and materially diverged from the later September commercial/site work on `main`.

---

# Current Public-Site State

The Koinonia public website has already been launched and is hosted through Vercel.

The current `main` branch contains a newer white-glove public commercial architecture than the old July launch state.

Current public commercial products include:

- Transaction Management;
- Hand Us the Listing;
- Licensed Field Coverage;
- Professional Open House;
- Marketing Management;
- Koinonia Partnership;
- Custom Projects.

Always use current commercial/readiness sources on `main` before modifying public copy.

---

# Monorepo / Build Requirements

The project remains a pnpm monorepo.

Relevant build facts:

- app: `apps/web`
- Prisma/database package: `packages/database`
- generate Prisma Client before production web builds when required by the deployment environment
- preserve the repository's established Next.js/Prisma monorepo configuration and do not remove workarounds/configuration without understanding why they exist.

Historical verified pattern included:

1. `pnpm install --frozen-lockfile`
2. generate Prisma Client
3. run the web/monorepo build

Use the current Vercel project configuration and current repository scripts as source of truth rather than copying old July commands blindly.

---

# Environment / Secret Rules

Never commit production secrets.

Do not copy local `.env` files blindly into Vercel.

Add only environment variables required by the deployed features.

Known marketing-launch variables introduced/proposed by the non-production readiness work include:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID`

These must not be populated with guessed values.

Consultation/email delivery historically uses variables such as:

- `RESEND_API_KEY`
- `CONTACT_INTAKE_TO_EMAIL`
- `CONTACT_INTAKE_FROM_EMAIL`

Secrets remain outside Git.

---

# Search / SEO State

Current SEO foundation includes canonical metadata, sitemap, robots, social metadata and public-route SEO configuration.

At the latest owner checkpoint:

- Google Search Console appeared correctly pointed;
- the owner elected to leave the current sitemap alone;
- the retired `/appointments` route has a permanent redirect to the current consultation path.

Do not create duplicate sitemap files unless a new technical reason is established.

---

# Squarespace / DNS Historical Correction

Older versions of this file said:

> Squarespace is still involved in the active DNS management path. Do not cancel or disconnect Squarespace...

That was true at the time it was written, but it is **historical and no longer authoritative**.

Latest owner-reported state:

- both Squarespace website subscriptions were found and canceled;
- website hosting remains on Vercel;
- Cloudflare migration/registrar work replaced the old Squarespace dependency path;
- `koinoniaadmin.com` transfer/billing cleanup may still require final confirmation after the transfer email/process completes.

Do not resurrect the old Squarespace dependency warning without fresh infrastructure verification.

---

# Google Workspace / Domain Billing Rule

Google Workspace Business Standard is separate from old website hosting and is required for Koinonia business email unless the owner deliberately chooses another email platform.

Do not cancel Google Workspace merely to eliminate a recurring Google charge.

If a Google `Domain Registration` subscription for `koinoniaadmin.com` still exists, only unwind it after confirming the registrar transfer is complete and the domain is active at the intended registrar.

---

# Marketing Launch Preview State

A separate non-production branch was used to prototype campaign-retention infrastructure:

`koinonia-marketing-readiness`

Checkpoint head:

`a3bc944e7eb950a4251416d6726266153d0c890e`

Verified Vercel preview deployment:

- `dpl_DmuC9by5xSjVx8bwCg44uggRzFGj`
- state: `READY`
- target: preview / not production

Prototype includes GA4, attribution, consent, Meta/TikTok pixel shells and a campaign landing-page concept.

Because the prototype branch predates the current commercial/site architecture, create a fresh branch from current `main` and selectively port/reimplement rather than merging it wholesale.

Primary handoff:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

---

# Production Promotion Checklist

Before promoting new marketing instrumentation:

1. integrate against current `main` on a fresh branch;
2. build successfully;
3. visually QA affected public routes;
4. confirm authenticated/private routes do not load ad pixels;
5. verify privacy controls/GPC behavior;
6. confirm actual GA4/Meta/TikTok IDs;
7. verify test page and lead events;
8. verify CRM attribution persistence;
9. verify email campaign authentication/compliance if email launch is included;
10. show the owner the preview/results;
11. obtain explicit production authorization;
12. promote only the reviewed changes to the correct production path.
