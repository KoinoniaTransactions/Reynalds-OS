# Koinonia Production Release Handoff — 2026-08-07

Status: Investigation complete; production-isolation plan approved; no production branch or domain change executed yet.

## Objective

Investigate why the approved Jeremiah digital business card at `/jeremiah` was present in GitHub and successful Vercel previews but returned the Reynalds OS 404 on the public Koinonia domain.

The investigation also needed to separate three states that had become easy to confuse:

1. the public Koinonia website currently serving production traffic,
2. Koinonia client/employee portal development,
3. unrelated work elsewhere in the shared monorepo.

## Verified Local / GitHub State

The user's local repository was checked with read-only Git commands.

- Local repository: `/Users/jeremiahreynalds/Projects/Reynalds_OS_v11_3_1_Work`
- Local branch at the start of the audit: `chatgpt/portal-access-status`
- Local branch was clean.
- Local and remote portal branch both pointed to `8263f9f72ff6dbb6dcbcfed97757be459df253b7` before this documentation pass.
- `origin/main` pointed to `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` after fetch.
- The local-vs-main count `191 17` reflected diverged branch history, not unpushed local changes.

Conclusion: Mac/GitHub synchronization was not the cause of the public 404.

## Verified Live Production State

Vercel project:

- Team: `Koinonia` / `koinonia3`
- Project: `reynalds-os-web`
- Project ID: `prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`

The public domains are attached to the project:

- `koinoniatransactions.com`
- `www.koinoniatransactions.com`

However, those domains are still assigned to an older deployment because Vercel is honoring an Instant Rollback.

Current live deployment commit:

- `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`
- Commit message: `Add Koinonia meaning to About page`

That deployment predates `/jeremiah`, so the public route correctly returned the old app's 404.

## Verified Staged Main Deployment

Current GitHub `main`:

- `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16`
- Commit message: `Add Koinonia digital business card`

Vercel successfully built this commit as a production-target deployment, but the deployment remained `Production Staged` because the Instant Rollback kept the custom domains on the older deployment.

The Vercel promotion dialog explicitly warned that promotion would undo the existing Instant Rollback.

## Why Direct Main Promotion Was Rejected

A comparison from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e` to current `main` showed that `main` was 17 commits ahead and included unrelated repository work in addition to the business card.

Therefore, promoting current `main` would not be a Koinonia-only release.

User instruction is explicit: Koinonia is isolated. Do not touch, merge, deploy, modify, or reorganize Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work as part of Koinonia work.

## Approved Digital Business Card Scope

The approved card release is only these files:

- `apps/web/app/jeremiah/page.tsx`
- `apps/web/app/jeremiah/digital-card.module.css`
- `apps/web/public/jeremiah-reynalds.vcf`
- `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`

Approved public route:

- `https://koinoniatransactions.com/jeremiah`

The card includes contact actions, Koinonia pronunciation/meaning, QR sharing, and the approved scripture footer.

## Portal Development Boundary

Active Koinonia portal-development branch:

- `chatgpt/portal-access-status`
- pre-documentation head: `8263f9f72ff6dbb6dcbcfed97757be459df253b7`

Vercel treats this branch as preview development, not the live custom-domain production source.

The unfinished portal is therefore not what caused the `/jeremiah` 404.

Important future rule: never promote the portal-development branch directly to the public domain. Doing so could replace production with a branch that does not contain already-live public features.

## Approved Permanent Release Architecture

Create a permanent branch named:

`koinonia-production`

This is the canonical cumulative production line for Koinonia.

Status as of this handoff:

- Decision approved.
- Brain documentation updated.
- `koinonia-production` has **not yet been created**.
- No Vercel production alias/domain change has been made.
- The existing Instant Rollback remains in effect.

Initial branch plan:

1. Create `koinonia-production` exactly from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
2. Add only the four approved digital-business-card files.
3. Allow Vercel to create an isolated preview.
4. Verify existing public Koinonia pages plus `/jeremiah` and contact-save behavior.
5. Stop for explicit approval.
6. Only then change the Koinonia production source/domain routing.

## Future Portal Launch Model

Production must move forward cumulatively:

- current public website
- then public website + digital business card
- later public website + digital business card + approved client/employee portal

When the portal is ready, start from the then-current `koinonia-production` branch and integrate only the approved Koinonia portal feature set into a controlled release/integration branch. Verify the combined release before advancing production.

Never replace `koinonia-production` with a development branch.

## Next Safe Action

Create `koinonia-production` from `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`, add only the approved four card files, and inspect the isolated preview. Do not alter live custom-domain routing until the user explicitly approves that preview.

## Canonical Continuity References

Read these before continuing Koinonia deployment work:

- `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`
- `BRAIN/DECISION_LOG.md` — D-020
- `BRAIN/CURRENT_PRIORITIES.md`
- `BRAIN/HANDOFF.md` — Koinonia Production Continuity — 2026-08-07
- this file
