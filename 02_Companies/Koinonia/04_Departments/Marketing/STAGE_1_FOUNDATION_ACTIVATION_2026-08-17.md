# Koinonia Transactions — Stage 1 Foundation Activation

Status: In Progress — DNS / External Account Configuration Pending  
Date: 2026-08-17  
Owner: Marketing + Sales

## Scope Authorized

Stage 1 only:

1. surgical release of launch-critical website privacy/attribution work
2. live conversion/UTM-path verification
3. Facebook / Instagram / TikTok public profile configuration
4. inbound lead-owner / dashboard readiness

Not authorized by this stage:

- prospect outreach
- marketing email sends
- campaign/nurture sends
- social campaign publishing
- Meta ad activation or spend
- brokerage outreach
- TikTok paid

## Production Release — Complete

Production branch before release:

`56910eb48f04195ff0c9c11a5df914561006543c`

Release branch:

`release/koinonia-marketing-foundation-20260817`

Production PR:

`#19 — Release Koinonia marketing foundation`

Released production commit:

`3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`

The integration branch was not merged wholesale.

The release candidate was built directly from `koinonia-production` and contained only eight launch-critical files:

- `apps/web/app/api/koinonia/consultation/route.ts`
- `apps/web/app/layout.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/components/site/ConsultationIntake/ConsultationIntake.tsx`
- `apps/web/components/site/MarketingAttribution/MarketingAttribution.tsx`
- `apps/web/content/privacy.ts`
- `apps/web/content/shared.ts`
- `apps/web/lib/koinonia-consultation-relationship.ts`

No portal, Koinonia Properties, Reynalds Brothers, outreach, paid-media, or campaign-publishing changes were included.

## Vercel Deployment — Complete

Vercel project:

`reynalds-os-web`

Production deployment:

`dpl_7AdpShYxdHdxxsGByfPPkUa3r9UQ`

Production deployment commit:

`3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`

Vercel deployment state:

**READY**

The Vercel project lists both intended custom domains:

- `koinoniatransactions.com`
- `www.koinoniatransactions.com`

## Production Code Includes

- public Privacy Policy route
- Privacy footer link
- session-level first-touch marketing attribution
- UTM source / medium / campaign / content capture
- Facebook/TikTok click indicators for source classification without intentionally retaining raw click IDs as long-term Relationship acquisition fields
- consultation privacy-reference language
- consultation submission attribution payload
- consultation-to-Koinonia Relationship persistence
- preservation of existing first-touch acquisition values
- consultation type -> pressure/service/path mapping
- consultation timeline event
- open follow-up task / next action
- successful intake even when optional Resend notification delivery is not configured

## CI Note

GitHub Actions did not reach install, test, or build.

The workflow failed in `pnpm/action-setup@v4` because pnpm is declared in two locations:

- workflow: `version: 9`
- `package.json`: `packageManager: pnpm@9.0.0`

This is a CI workflow configuration issue rather than an application test/build failure from this release.

Vercel successfully built the preview and production deployment.

Repair CI separately by defining the pnpm version in one location only.

## DNS / Public Domain — BLOCKED

The current public `www.koinoniatransactions.com` response still serves the previous legacy website rather than the new `reynalds-os-web` production deployment.

Therefore Stage 1 is **not live-complete** even though Vercel production is READY.

The website DNS at the current DNS provider/registrar must be changed so the apex/root and `www` hostname route to Vercel.

Current Vercel custom-domain documentation shows the standard externally managed DNS configuration as:

- apex/root `@` A record -> `76.76.21.21`
- `www` CNAME -> `cname.vercel-dns-0.com`

Before editing DNS, use the Vercel domain settings/inspection screen for the Koinonia project as the final source of truth for the exact records requested for these specific domains.

Do not remove or alter mail-related MX, SPF, DKIM, DMARC, or other email TXT records while changing website routing.

## Required Live Verification After DNS Switch

After the public domain resolves to Vercel, verify on the actual custom domain:

1. `/privacy` returns and renders correctly
2. footer Privacy link works
3. `/contact` consultation scheduler opens
4. one clearly labeled internal test consultation submits successfully
5. one Koinonia Relationship is created/updated
6. consultation timeline event is created
7. follow-up task / next action is created
8. UTM source / medium / campaign / content are preserved in acquisition data
9. a later direct visit/submission does not overwrite original first-touch source
10. optional notification email behavior matches production configuration

Archive/close the internal test Relationship/task afterward as appropriate.

## Social Profile Configuration — Pending Manual / Authenticated Account Access

Exact profile copy, link destinations, and UTMs are already specified in:

`DAY_2_PROFILE_CONVERSION_SETUP_2026-08-18.md`

No connected Facebook, Instagram, TikTok, or social-management plugin is available in the current tool environment.

Required account-authenticated configuration:

### Facebook

- correct Koinonia Transactions Page
- approved display/category/About copy
- approved profile image
- tracked CTA/contact link
- Meta/Instagram business connection as applicable

### Instagram

- correct professional account
- approved bio
- approved profile image
- tracked bio link

### TikTok

- correct Koinonia Transactions Business Account
- approved bio
- approved profile image
- tracked profile website link

Do not publish campaign content during profile configuration.

## Lead Ownership / Dashboard — Pending Final Confirmation

Operating rule:

**Every meaningful Relationship gets one owner, one current next action, and one next-action date.**

Before Stage 2 organic publishing, confirm the human owner who will monitor:

- website consultation submissions
- Facebook/Instagram/TikTok buying-intent DMs/comments
- direct professional introductions

## Stage 1 Decision

### Complete

- surgical production code release
- production Vercel build/deployment
- privacy/attribution/Relationship persistence code

### Pending

- public DNS cutover to Vercel
- post-cutover live website verification
- one controlled end-to-end consultation/CRM test
- Facebook profile configuration
- Instagram profile configuration
- TikTok profile configuration
- final inbound lead-owner confirmation

## Activation Boundary

Until all pending Stage 1 items are confirmed:

- Stage 1 remains **IN PROGRESS**
- Stage 2 organic publishing remains OFF
- outbound email remains OFF
- brokerage outreach remains OFF
- Meta paid remains OFF
- TikTok paid remains OFF
- promotional SMS remains OFF

## Next Action

Complete the DNS routing change for `koinoniatransactions.com` and `www.koinoniatransactions.com`, then run the live Stage 1 verification checklist before approving Stage 2.
