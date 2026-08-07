# Koinonia Deployment Readiness

Status: Production release line established; digital business card live; production branch tracking locked
Decision Date: 2026-07-13
Latest Production Verification: 2026-08-07
Owner: Koinonia Transactions / Reynalds OS

---

## Decision

Koinonia uses the custom Next.js site inside the Reynalds OS monorepo and deploys through Vercel.

Permanent release direction:

- Keep Koinonia release work isolated from Personal Finance, Reynalds Brothers, and unrelated Reynalds OS work.
- Use `koinonia-production` as the canonical cumulative Koinonia release line.
- Do not promote `main`, portal-development branches, or other development branches directly to the public Koinonia domain.
- Future Koinonia releases must build forward from the then-current `koinonia-production` baseline so already-live features remain present.

---

## Repository

- GitHub repo: `KoinoniaTransactions/Reynalds-OS`
- Canonical Koinonia release branch: `koinonia-production`
- Remote: `git@github.com:KoinoniaTransactions/Reynalds-OS.git`

---

## Public Routes

Current public Koinonia routes include:

- `/`
- `/services`
- `/about`
- `/contact`
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

---

## Digital Business Card Release Scope

The approved `/jeremiah` release consists only of these four files:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

Canonical public route:

- `https://koinoniatransactions.com/jeremiah`

---

## Koinonia Production Branch

`koinonia-production` was created exactly from the historical live rollback commit:

- Base: `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`

The approved card release was added as one isolated commit:

- Release commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Message: `Add approved Koinonia digital business card`

GitHub comparison verified that this branch was exactly one commit ahead of the live rollback baseline and changed only the four approved business-card files.

---

## Verified Preview

Initial isolated preview:

- Deployment ID: `dpl_476JZYzZXGPJoJBCpomCfbQEvpxh`
- Branch: `koinonia-production`
- Commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- State: `READY`
- Target at preview time: Preview

The user visually approved `/jeremiah` before production promotion.

---

## 2026-08-07 Production Cutover Complete

The verified Koinonia-only release was promoted through Vercel and the July 30 Instant Rollback was intentionally ended.

Current production deployment:

- Deployment ID: `dpl_CnP7Q6ELnWdeamrHjLto1DJpmf1L`
- Deployment URL: `reynalds-os-j5aebl826-koinonia3.vercel.app`
- Source branch: `koinonia-production`
- Source commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Commit message: `Add approved Koinonia digital business card`
- Target: Production
- Ready state: `READY`
- Promotion source deployment: `dpl_476JZYzZXGPJoJBCpomCfbQEvpxh`

Post-cutover verification completed on 2026-08-07:

- `https://www.koinoniatransactions.com/` returned HTTP 200 from deployment `dpl_CnP7Q6ELnWdeamrHjLto1DJpmf1L`.
- `https://www.koinoniatransactions.com/jeremiah` returned HTTP 200 from the same deployment.
- `https://koinoniatransactions.com/jeremiah` returned a permanent redirect to the `www` route.
- `https://www.koinoniatransactions.com/jeremiah-reynalds.vcf` returned HTTP 200 with the approved Jeremiah Reynalds vCard.
- Vercel reported no runtime errors for `/` or `/jeremiah` during the release verification window.

The digital business card is live.

---

## 2026-08-07 Production Branch Safeguard Complete

After the manual production promotion, Vercel still showed the prior production branch tracking rule for `main`. This was corrected in Project Settings → Environments → Production → Branch Tracking.

Verified saved configuration:

- Branch condition: `Branch is`
- Production branch: `koinonia-production`
- Vercel confirmation text: every commit pushed to `koinonia-production` will create a Production Deployment.
- Auto-assign Custom Production Domains remains Enabled.
- Vercel displayed `Branch tracking saved successfully.`

This means pushes to shared-repository `main` are no longer the normal automatic source for Koinonia Production deployments.

Do not change this branch-tracking rule back to `main` unless the Koinonia release architecture is intentionally redesigned and documented first.

---

## Portal Release Rule

Do not promote a portal-development branch directly to the public domain.

When the Koinonia client/employee portal is production ready:

1. Start from the then-current `koinonia-production` baseline.
2. Integrate only the approved Koinonia portal feature set into a controlled release/integration branch.
3. Preserve every already-live Koinonia public feature, including `/jeremiah`.
4. Verify the combined public website + business card + portal release.
5. Advance `koinonia-production` only after that combined release is approved.

Production must move forward cumulatively.

---

## Current Production Baseline

As of 2026-08-07, the authoritative Koinonia public production baseline is:

- Branch: `koinonia-production`
- Commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Live Vercel deployment: `dpl_CnP7Q6ELnWdeamrHjLto1DJpmf1L`
- `/jeremiah`: live and verified
- Vercel Production Branch Tracking: `koinonia-production`

Future Koinonia production changes must build forward from this baseline.
