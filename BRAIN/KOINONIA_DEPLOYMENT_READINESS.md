# Koinonia Deployment Readiness

Status: Approved Deployment Plan v1
Decision Date: 2026-07-13
Owner: Koinonia Transactions / Reynalds OS

---

## Decision

Koinonia should launch from the current custom Next.js site inside the Reynalds OS monorepo.

Approved direction:

- Use the existing GitHub repository
- Deploy the current Next.js app
- Use a Vercel-style deployment path
- Do not rebuild in Squarespace before launch
- Keep the public Koinonia website on root paths
- Keep Reynalds OS preserved at /dashboard
- Keep /koinonia routes available as aliases unless intentionally removed later

---

## Repository

- GitHub repo: KoinoniaTransactions/Reynalds-OS
- Current branch: feature/app-shell-foundation
- Remote: git@github.com:KoinoniaTransactions/Reynalds-OS.git

---

## Current Routes

Public Koinonia routes:

- /
- /services
- /about
- /contact

Alias routes still available:

- /koinonia
- /koinonia/services
- /koinonia/about
- /koinonia/contact

Internal Reynalds OS route:

- /dashboard

---

## Recommended Deployment Platform

- Vercel or a Vercel-style Next.js deployment platform
- Recommended production domain: https://koinoniatransactions.com
- SEO config supports NEXT_PUBLIC_SITE_URL
- Fallback domain in code is https://koinoniatransactions.com

---

## Monorepo Structure

The repository is a pnpm monorepo.

Deployable app:

- apps/web

The web app depends on workspace packages including database and design-system packages.

Because the web app depends on the database package, Prisma Client generation should run before the production web build.

---

## Verified Local Deployment Build Sequence

This sequence was verified locally and passed:

1. pnpm install --frozen-lockfile
2. pnpm --filter @reynalds-os/database db:generate
3. cd apps/web
4. pnpm build

The build generated the public Koinonia routes, dashboard route, sitemap, robots file, and manifest route.

---

## Recommended Vercel Settings

Framework Preset:

- Next.js

Root Directory:

- apps/web

Install Command:

- cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @reynalds-os/database db:generate

Build Command:

- pnpm build

Output Directory:

- Leave default / do not override

---

## Required Environment Variables

Minimum recommended production environment variables:

- NEXT_PUBLIC_SITE_URL=https://koinoniatransactions.com
- NEXT_PUBLIC_APP_NAME=Koinonia
- AUTH_PROVIDER=clerk before real portal login
- ROS_DEFAULT_WORKSPACE_ID=production workspace value
- DATABASE_URL=production database URL

Additional portal-login variables before accepting real client or staff data:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
- NEXT_PUBLIC_AUTH_SIGN_IN_URL
- NEXT_PUBLIC_AUTH_SIGN_OUT_URL
- KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS
- ROS_ALLOW_MOCK_AUTH=false

Document and billing variables before accepting real portal work:

- PORTAL_DOCUMENT_UPLOAD_DIR
- PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND
- KOINONIA_PAYMENT_PROCESSOR_PROVIDER
- KOINONIA_PAYMENT_SETUP_URL
- KOINONIA_PAYMENT_WEBHOOK_URL
- KOINONIA_PAYMENT_WEBHOOK_SECRET

Optional gates should stay disabled unless fully configured:

- KOINONIA_SOCIAL_LOGIN_CONFIGURED=false
- KOINONIA_AI_REVIEW_ENABLED=false

Important:

- Do not commit production secrets to the repository
- Do not blindly copy local .env secrets into Vercel
- Add only variables required for public launch
- Treat dashboard and API variables separately from the public website launch
- Do not enable ROS_ALLOW_MOCK_AUTH on any deployment that can receive real portal data
- Run `pnpm verify:portal` before accepting real client or staff portal access
- Confirm `pnpm verify:portal` reports production Clerk keys, public HTTPS auth and payment URLs, private document storage, malware scanning, an active Owner portal user, active staff MFA, accepted client/staff invitations, and completed required launch proof

---

## Launch SEO Foundation Already Completed

- Core metadata
- Per-page metadata
- Canonical URLs
- Sitemap
- Robots file
- Open Graph metadata
- Twitter metadata
- Social preview image
- Web manifest
- Favicons and icons
- Local/service keyword refinement

---

## Deployment Risks / Watch Items

- Monorepo build path must be configured correctly
- Prisma Client generation should run before web build
- Dashboard and API routes may require database configuration
- Production secrets should not be copied blindly from local env files
- NEXT_PUBLIC_SITE_URL should match the final production domain

---

## Next Deployment Steps

1. Create or import the Vercel project from GitHub.
2. Select repo KoinoniaTransactions/Reynalds-OS.
3. Set root directory to apps/web.
4. Set install command to cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @reynalds-os/database db:generate.
5. Set build command to pnpm build.
6. Add production environment variables.
7. Deploy preview.
8. Verify /, /services, /about, /contact, /dashboard, /sitemap.xml, /robots.txt, and /manifest.webmanifest.
9. Connect production domain.
10. Add Google Search Console.
11. Add analytics.
12. Review Google Business Profile.

---

## Future Rule

When launch resumes, do not reopen the Squarespace vs custom-site decision unless the user explicitly asks to reconsider.

Recorded launch decision:

Launch the current custom Next.js Koinonia site using a Vercel-style deployment path.

---

## Public Contact Values

Launch public contact values are set in `apps/web/content/brand.ts`.

- Phone: `719-745-8497`
- Text: `719-745-8497`
- Email: `jeremiah@koinoniaadmin.com`
- Website: `https://koinoniatransactions.com`

The active SEO configuration file is `apps/web/config/seo.config.ts`.

---

## Public Launch Verified

The public Koinonia website launch was verified on 2026-07-27.

### Production Domain

- Primary domain: `https://www.koinoniatransactions.com`
- Apex redirect: `https://koinoniatransactions.com` → `https://www.koinoniatransactions.com`

### Vercel Deployment

- Project: `reynalds-os-web`
- Production branch: `main`
- Launch commit: `ebb9fb8`
- Launch commit message: `Finalize Koinonia launch contact values`

### Verified Services

- Public pages load.
- Scheduler route loads.
- Real-domain scheduler form sends through Resend.
- Email receipt confirmed at `jeremiah@koinoniaadmin.com`.

### DNS Management Note

Squarespace is still involved in the active DNS management path. Do not cancel or disconnect Squarespace until all DNS records have been inventoried and intentionally migrated.

---

## 2026-08-07 Production Isolation and Release Baseline

### Verified Current State

The public Koinonia domain and the repository are intentionally not on the same revision because Vercel is still honoring an Instant Rollback.

- Live Koinonia production is pinned to commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e` (`Add Koinonia meaning to About page`).
- Current GitHub `main` is `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` (`Add Koinonia digital business card`).
- Vercel built current `main` successfully, but it is staged behind the Instant Rollback and must not be promoted as-is.
- Current `main` contains unrelated non-Koinonia changes between the live rollback commit and the digital-card commit. Direct promotion of `main` would therefore publish more than the approved Koinonia release.
- The active Koinonia portal-development branch is `chatgpt/portal-access-status` at `8263f9f72ff6dbb6dcbcfed97757be459df253b7` (`Document portal provider and billing foundation`). It is development/preview work and is not approved as the production source.

### Approved Digital Business Card Release Scope

The approved public business-card release consists only of these four files:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

The approved public route is `/jeremiah`. The QR code and digital contact experience should continue to resolve through `https://koinoniatransactions.com/jeremiah` after production promotion.

### Permanent Koinonia Production Rule

Create and maintain a dedicated branch named `koinonia-production` as the canonical Koinonia release line.

Important status as of 2026-08-07:

- `koinonia-production` is an approved plan but has **not yet been created**.
- Creating the branch, changing Vercel's production source, assigning custom-domain aliases, or promoting a deployment are separate future execution steps and require explicit approval and verification.

When created, the initial `koinonia-production` branch should:

1. Start exactly from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
2. Add only the four approved digital-business-card files listed above.
3. Produce an isolated preview and verify the public site plus `/jeremiah` before any domain change.
4. Become the permanent forward-moving Koinonia release baseline after the isolated release is approved.

### Koinonia Isolation Boundary

Koinonia release work must remain isolated.

Do not include, merge, deploy, reorganize, or modify Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work as part of a Koinonia production release.

A shared monorepo does not make unrelated product changes part of the Koinonia release scope.

### Portal Release Rule

Do **not** promote `chatgpt/portal-access-status`, `feature/app-shell-foundation`, or another Koinonia development branch directly to the public domain.

When the client/employee portal is production ready:

1. Start from the then-current `koinonia-production` baseline.
2. Integrate only the approved Koinonia portal feature set into a release/integration branch.
3. Preserve every already-live Koinonia public feature, including the digital business card.
4. Verify the combined public website + business card + portal release.
5. Advance `koinonia-production` only after that combined release is approved.

Production should move forward cumulatively. A later portal launch must not replace or remove previously approved public features.

### Next Safe Deployment Action

The next safe production action is to create `koinonia-production` from `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`, add only the approved card files, verify its preview, and stop for approval before changing live Vercel domain routing.
