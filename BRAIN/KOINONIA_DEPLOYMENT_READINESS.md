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
- AUTH_PROVIDER=mock
- ROS_MOCK_WORKSPACE_ID=production-safe value
- DATABASE_URL=production or placeholder database URL

Important:

- Do not commit production secrets to the repository
- Do not blindly copy local .env secrets into Vercel
- Add only variables required for public launch
- Treat dashboard and API variables separately from the public website launch

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

