# Koinonia Deployment Readiness

Status: Production release line established; 2026-08-15 public-site release live; portal integration reconciliation required before portal promotion
Decision Date: 2026-07-13
Latest Production Verification: 2026-08-15
Owner: Koinonia Transactions / Reynalds OS

---

## Decision

Koinonia uses the custom Next.js site inside the Reynalds OS monorepo and deploys through Vercel.

Permanent release direction:

- Keep Koinonia release work isolated from Personal Finance, Reynalds Brothers, and unrelated Reynalds OS work.
- Use `koinonia-production` as the canonical cumulative Koinonia release line and source of truth for what is live.
- Do not promote `main`, portal-development branches, or other development branches directly to the public Koinonia domain.
- Future Koinonia releases must build forward from the then-current `koinonia-production` baseline so already-live features remain present.
- A development branch may never replace production wholesale when its history has diverged from production.
- Portal work must be reconciled with the current production line in a dedicated integration branch before it can be considered for release.

---

## Repository

- GitHub repo: `KoinoniaTransactions/Reynalds-OS`
- Canonical Koinonia release branch: `koinonia-production`
- Portal development branch: `chatgpt/portal-access-status`
- Current portal/production reconciliation branch: `integration/koinonia-portal-production-sync-20260815`
- Remote: `git@github.com:KoinoniaTransactions/Reynalds-OS.git`

---

## Release Terminology

Use these terms consistently:

### Production public site

The version currently intended to be served at `koinoniatransactions.com` and `www.koinoniatransactions.com`.

Canonical branch: `koinonia-production`.

### Public-site release branch

A temporary, isolated branch used to prepare and visually verify a bounded public-site change before advancing `koinonia-production`.

The 2026-08-15 release used:

- `chatgpt/koinonia-referral-partner-page`

### Portal development branch

The still-in-development client/employee portal line.

Current branch:

- `chatgpt/portal-access-status`

This branch is not a production replacement branch.

### Portal integration/reconciliation branch

A controlled branch used to combine the current portal work with the then-current production public-site baseline without losing already-live features.

Current branch:

- `integration/koinonia-portal-production-sync-20260815`

---

## Public Routes

Current public Koinonia routes include:

- `/`
- `/services`
- `/about`
- `/contact`
- `/referrals`
- `/jeremiah`

Alias routes still available unless intentionally removed later:

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

---

## Vercel Project

- Team: `Koinonia` / `koinonia3`
- Project: `reynalds-os-web`
- Project ID: `prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`
- Primary public domain: `https://www.koinoniatransactions.com`
- Apex domain: `https://koinoniatransactions.com`
- Production Branch Tracking: `koinonia-production`
- Auto-assign Custom Production Domains: Enabled

Apex behavior is verified as a permanent redirect to the `www` domain.

---

## 2026-08-07 Production Isolation Investigation

The public Koinonia domain had remained pinned to an older Vercel deployment because of an Instant Rollback dated July 30.

Historical live rollback baseline:

- Commit: `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`
- Message: `Add Koinonia meaning to About page`

GitHub `main` at the time of the investigation was:

- Commit: `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16`
- Message: `Add Koinonia digital business card`

Direct promotion of `main` was rejected because the comparison from the live rollback baseline to `main` included unrelated repository work in addition to the digital business card.

The Koinonia portal-development branch was separately verified as pre-live development and was not the cause of the public `/jeremiah` 404.

---

## Koinonia Isolation Boundary

Koinonia release work must remain isolated.

Do not include, merge, deploy, modify, or reorganize:

- Personal Finance
- Reynalds Brothers
- unrelated Reynalds OS work

as part of a Koinonia production release.

A shared monorepo does not make unrelated project changes part of the Koinonia release scope.

The portal development branch currently contains broader shared-repository work in addition to Koinonia portal work. That is an additional reason it must never be promoted directly as a production replacement.

---

## Digital Business Card Release Scope

The approved `/jeremiah` release consists of these four files:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

Canonical public route:

- `https://koinoniatransactions.com/jeremiah`

`/jeremiah` is an already-live production feature and is now a permanent preservation requirement for every future Koinonia release unless an intentional documented decision removes or replaces it.

---

## Koinonia Production Branch History

`koinonia-production` was originally created exactly from the historical live rollback commit:

- Base: `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`

The approved card release was added as one isolated commit:

- Release commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Message: `Add approved Koinonia digital business card`

The 2026-08-15 public-site release then advanced production cumulatively from that card baseline to:

- Release commit: `56910eb48f04195ff0c9c11a5df914561006543c`
- Message: `Wire approved referral hero assets`

This was a non-forced fast-forward. The release branch was verified as 33 commits ahead of the then-current production baseline and 0 commits behind before promotion.

---

## 2026-08-15 Public-Site Release

The following approved public-site work was promoted cumulatively to `koinonia-production`:

- Dedicated 40% Referral Partner page and route.
- Public referral messaging and disclosure boundaries.
- Professional Open House Coverage as the fifth core Koinonia Transactions service lane.
- Open-house pricing and pay-at-successful-close package relationship.
- Home, Services, and Contact presentation/content updates related to the five-service architecture.
- Reusable balanced five-card layout treatment.
- Referral-page spacing refinement.
- Approved desktop and mobile Referral Partner hero assets.
- Referral hero wired through the existing full-bleed Hero system.
- Relevant public SEO updates.

Production deployment:

- Deployment ID: `dpl_7eLwcVgfSiNyop1QihqxgccnN9y6`
- Source branch: `koinonia-production`
- Source commit: `56910eb48f04195ff0c9c11a5df914561006543c`
- Target: Production
- Ready state: `READY`

Post-release verification on 2026-08-15:

- `https://www.koinoniatransactions.com/referrals` returned HTTP 200 from the new production deployment.
- The referral page rendered the approved full-bleed desktop/mobile hero assets.
- `https://www.koinoniatransactions.com/jeremiah` returned HTTP 200 from the same production deployment.
- The production build explicitly generated both `/referrals` and `/jeremiah`.
- Vercel reported the production deployment as `READY` with no alias error.

---

## Portal Release Rule

Do not promote a portal-development branch directly to the public domain.

When the Koinonia client/employee portal is production ready:

1. Treat the then-current `koinonia-production` branch as the source of truth for all already-live public behavior.
2. Use a dedicated integration/reconciliation branch; do not overwrite or force-move production to the portal branch.
3. Reconcile the portal work with current production intentionally, especially shared files such as layout, Header, Footer, Hero, SEO, design-system styles, package/configuration files, and other common application surfaces.
4. Preserve every already-live Koinonia public feature, including `/jeremiah`, `/referrals`, the five-service public architecture, and approved public hero/layout changes.
5. Exclude unrelated Reynalds Brothers, Personal Finance, Koinonia Properties, or other non-approved repository work from the Koinonia Transactions production release.
6. Verify the combined public website + business card + portal release in a non-production deployment.
7. Advance `koinonia-production` only after the combined release is explicitly approved.

Production must move forward cumulatively.

---

## 2026-08-15 Portal Divergence Finding

Before the public-site release, `chatgpt/portal-access-status` and `koinonia-production` were verified as diverged.

The portal branch split from production history before the approved `/jeremiah` production commit. Therefore, treating the portal branch as a replacement for production could remove the business card and other public work added after the split.

The portal branch also contains a broad set of shared and unrelated repository changes. This makes a direct branch replacement unsafe even if the portal feature itself becomes ready.

A dedicated reconciliation branch was created from the current portal development line:

- `integration/koinonia-portal-production-sync-20260815`

Its purpose is to receive and reconcile the current production public-site state without disturbing either the live production branch or the active portal development branch.

Creating the integration branch does not itself mean the production public-site changes have been merged into it. The actual reconciliation must be performed and reviewed intentionally because the histories overlap on shared application files.

---

## Current Production Baseline

As of 2026-08-15, the authoritative Koinonia public production baseline is:

- Branch: `koinonia-production`
- Commit: `56910eb48f04195ff0c9c11a5df914561006543c`
- Live Vercel deployment: `dpl_7eLwcVgfSiNyop1QihqxgccnN9y6`
- `/jeremiah`: live and verified
- `/referrals`: live and verified
- Vercel Production Branch Tracking: `koinonia-production`

Future Koinonia production changes must build forward from this baseline.
