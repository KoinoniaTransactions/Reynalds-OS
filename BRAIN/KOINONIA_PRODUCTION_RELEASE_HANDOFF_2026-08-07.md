# Koinonia Production Release Handoff — 2026-08-07

Status: Koinonia production branch created and isolated preview visually approved; no live production/domain change executed yet.

## Objective

Investigate why the approved Jeremiah digital business card at `/jeremiah` was present in GitHub and successful Vercel previews but returned the Reynalds OS 404 on the public Koinonia domain, then establish a safe Koinonia-only production release line.

## Verified Local / GitHub State

- Local repository checked: `/Users/jeremiahreynalds/Projects/Reynalds_OS_v11_3_1_Work`
- Local branch at the start of the audit: `chatgpt/portal-access-status`
- Local branch was clean and synchronized with its remote before Brain-document updates.
- `origin/main` pointed to `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` after fetch.
- The local-vs-main count `191 17` reflected diverged branch history, not unpushed local changes.

Conclusion: Mac/GitHub synchronization was not the cause of the public 404.

## Verified Live Production State

Vercel project:

- Team: `Koinonia` / `koinonia3`
- Project: `reynalds-os-web`
- Project ID: `prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`

Project domains include:

- `koinoniatransactions.com`
- `www.koinoniatransactions.com`

The custom domains are still serving an older deployment because Vercel is honoring an Instant Rollback.

Current live production baseline:

- Commit: `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`
- Message: `Add Koinonia meaning to About page`

That deployment predates `/jeremiah`, so the public route returns the older app's 404.

## Why Current Main Must Not Be Promoted

Current GitHub `main`:

- Commit: `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16`
- Message: `Add Koinonia digital business card`

Vercel successfully built this as a production-target deployment, but it remained staged behind the Instant Rollback.

Comparison from the live baseline to current `main` showed unrelated repository work in addition to the card. Therefore direct promotion of `main` is rejected for Koinonia production.

## Koinonia Isolation Boundary

Koinonia release work is isolated.

Do not include, merge, deploy, modify, or reorganize Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work as part of a Koinonia production release.

## Approved Digital Business Card Scope

Only these four files belong to the approved card release:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

Approved public route:

- `https://koinoniatransactions.com/jeremiah`

## Permanent Koinonia Release Architecture

Canonical production branch:

`koinonia-production`

Verified status as of 2026-08-07:

- `koinonia-production` now exists.
- It was created exactly from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
- Isolated card commit: `3a4e8517420243cc21720ab86c6a74e9e844482d` (`Add approved Koinonia digital business card`).
- GitHub comparison verifies this branch is exactly one commit ahead of the live rollback baseline.
- The only changed files are the four approved business-card files listed above.

## Verified Vercel Preview

Vercel deployment:

- Deployment ID: `dpl_476JZYzZXGPJoJBCpomCfbQEvpxh`
- Branch: `koinonia-production`
- Commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Ready state: `READY`
- Deployment target: Preview (`target: null`)
- Branch alias: `reynalds-os-web-git-koinonia-production-koinonia3.vercel.app`

The user visually confirmed the isolated `/jeremiah` preview on 2026-08-07.

No live production source, custom-domain assignment, or rollback state was changed during preview verification.

## Portal Development Boundary

The Koinonia client/employee portal remains pre-live development and must not be promoted directly to the public domain.

Future portal launch rule:

1. Start from the then-current `koinonia-production` baseline.
2. Integrate only the approved Koinonia portal feature set through a controlled release/integration branch.
3. Preserve every already-live Koinonia public feature, including `/jeremiah`.
4. Verify the combined release.
5. Advance the cumulative Koinonia production line only after approval.

Never replace `koinonia-production` with a portal-development branch.

## Current Vercel Transition Boundary

Vercel project inspection confirms the isolated Koinonia release is still only a Preview while the public project domains remain attached to the project and the Instant Rollback remains in effect.

The next action changes live production and therefore requires explicit approval immediately before execution.

Approved transition target:

- Production source/release: `koinonia-production`
- Exact verified release commit: `3a4e8517420243cc21720ab86c6a74e9e844482d`
- Exact verified Vercel deployment: `dpl_476JZYzZXGPJoJBCpomCfbQEvpxh`

Do not promote current `main`.

## Next Safe Action

Change Vercel production routing/source only to the verified `koinonia-production` release, thereby moving the Koinonia custom domains to the exact isolated card deployment and ending the stale rollback state. Verify the public homepage and `/jeremiah` immediately after the change.

No such live change has been executed as of this handoff.

## Canonical Continuity References

Read these before continuing Koinonia deployment work:

- `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`
- `BRAIN/DECISION_LOG.md` — D-020
- `BRAIN/CURRENT_PRIORITIES.md`
- `BRAIN/HANDOFF.md` — Koinonia Production Continuity — 2026-08-07
- this file
