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
- Remote: git@github.com:KoinoniaTransactions/Reynalds-OS.git

---

## Current Routes

Public Koinonia routes:

- /
- /services
- /about
- /contact
- /jeremiah

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

## Public Launch Verified

The public Koinonia website launch was verified on 2026-07-27.

### Production Domain

- Primary domain: `https://www.koinoniatransactions.com`
- Apex redirect: `https://koinoniatransactions.com` → `https://www.koinoniatransactions.com`

### Vercel Project

- Team: `Koinonia` / `koinonia3`
- Project: `reynalds-os-web`
- Project ID: `prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`
- Project domains currently include `www.koinoniatransactions.com` and `koinoniatransactions.com`.

---

## 2026-08-07 Production Isolation and Release Baseline

### Verified Current State

The public Koinonia domain and the repository are intentionally not on the same revision because Vercel is still honoring an Instant Rollback.

- Live Koinonia production is pinned to commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e` (`Add Koinonia meaning to About page`).
- Current GitHub `main` is `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` (`Add Koinonia digital business card`).
- Vercel built current `main` successfully, but it is staged behind the Instant Rollback and must not be promoted as-is.
- Current `main` contains unrelated non-Koinonia changes between the live rollback commit and the digital-card commit. Direct promotion of `main` would therefore publish more than the approved Koinonia release.
- Active Koinonia portal development remains separate and pre-live. It is not approved as the production source.

### Approved Digital Business Card Release Scope

The approved public business-card release consists only of these four files:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

Approved public route:

- `https://koinoniatransactions.com/jeremiah`

### Permanent Koinonia Production Rule

`koinonia-production` is the canonical cumulative Koinonia release line.

Verified status as of 2026-08-07:

- Branch `koinonia-production` now exists.
- It was created exactly from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
- Its isolated release commit is `3a4e8517420243cc21720ab86c6a74e9e844482d` (`Add approved Koinonia digital business card`).
- GitHub comparison verifies the branch is exactly one commit ahead of the live rollback baseline and changes only the four approved business-card files.
- Vercel deployment `dpl_476JZYzZXGPJoJBCpomCfbQEvpxh` is `READY` as a Preview deployment from `koinonia-production`.
- The user visually confirmed the isolated `/jeremiah` preview on 2026-08-07.
- No live custom-domain routing, production-branch setting, or rollback state has been changed yet.

### Koinonia Isolation Boundary

Koinonia release work must remain isolated.

Do not include, merge, deploy, reorganize, or modify Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work as part of a Koinonia production release.

A shared monorepo does not make unrelated product changes part of the Koinonia release scope.

### Portal Release Rule

Do not promote a portal-development branch directly to the public domain.

When the client/employee portal is production ready:

1. Start from the then-current `koinonia-production` baseline.
2. Integrate only the approved Koinonia portal feature set into a controlled release/integration branch.
3. Preserve every already-live Koinonia public feature, including `/jeremiah`.
4. Verify the combined public website + business card + portal release.
5. Advance `koinonia-production` only after that combined release is approved.

Production should move forward cumulatively. A later portal launch must not replace or remove previously approved public features.

### Vercel Transition Status

Vercel inspection confirms:

- `koinonia-production` currently deploys as Preview (`target: null`).
- The preview alias is `reynalds-os-web-git-koinonia-production-koinonia3.vercel.app`.
- The live project still contains both custom domains.
- The existing Instant Rollback remains in effect.

The next production action must therefore be deliberate: change the Vercel production source to `koinonia-production` and/or promote the verified isolated deployment so the custom domains move to this exact Koinonia-only release. Do not promote current `main`.

### Next Safe Action

Prepare and execute the Vercel production transition for the verified `koinonia-production` release only. Stop for explicit user approval immediately before any action that changes the live custom-domain routing or removes the existing Instant Rollback.
