# Koinonia Transactions — Stage 1 Foundation Activation

Status: Partially Complete — External Account Verification Pending  
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

## Production Release

Production branch before release:

`56910eb48f04195ff0c9c11a5df914561006543c`

Release branch:

`release/koinonia-marketing-foundation-20260817`

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

Vercel preview build completed successfully before promotion.

Vercel production deployment:

`dpl_7AdpShYxdHdxxsGByfPPkUa3r9UQ`

Production deployment status at verification:

**READY**

## Live Verification — Green

Verified against the Vercel production deployment/custom Koinonia domain:

- `https://www.koinoniatransactions.com/privacy` returns HTTP 200
- Privacy Policy renders
- footer includes Privacy link
- `/contact` returns HTTP 200
- consultation scheduler is present
- production HTML loads the `MarketingAttribution` component
- production deployment is serving commit `3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`
- Vercel reports both `www.koinoniatransactions.com` and `koinoniatransactions.com` as production aliases

## Consultation / CRM Change Released

Consultation requests now attempt to:

- create or update one Koinonia Relationship
- preserve an existing more-advanced lifecycle
- capture selected pressure/service/path
- preserve exact submitted problem language when appropriate
- preserve first-touch acquisition source when already present
- capture campaign/source detail from attribution
- create a consultation-request timeline event
- create one open follow-up task
- continue accepting the request even if optional Resend email notification is not configured

## Remaining Live Verification — Yellow

A true form POST was not generated from the available connector environment.

Still verify manually with one clearly labeled internal test consultation:

- submission succeeds
- Relationship is created/updated
- source/UTM fields are present
- first-touch data is not overwritten on a later direct visit
- follow-up task is created
- notification email behavior matches configuration

After verification, archive/close the test Relationship/task as appropriate.

## Social Profile Configuration — Yellow

The profile copy, link destinations, and UTMs are already specified in:

`DAY_2_PROFILE_CONVERSION_SETUP_2026-08-18.md`

No connected Facebook, Instagram, TikTok, or social-management plugin is available in the current tool environment.

Therefore live profile edits remain a manual/account-access step.

Required manual checks:

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

## Lead Ownership / Dashboard

Operating rule is already defined:

**Every meaningful Relationship gets one owner, one current next action, and one next-action date.**

Before Stage 2 organic publishing, confirm the human owner who will check:

- website consultation submissions
- Facebook/Instagram/TikTok buying-intent DMs/comments
- direct professional introductions

## Stage 1 Decision

### Complete

- surgical production code release
- production Vercel build
- live privacy page
- privacy footer link
- global first-touch browser attribution capture
- consultation form attribution payload
- consultation-to-Relationship persistence implementation

### Pending Manual Verification

- one end-to-end consultation submission/CRM test
- Facebook profile configuration
- Instagram profile configuration
- TikTok profile configuration
- final inbound lead-owner confirmation

## Next Gate

Do not begin Stage 2 organic publishing until the pending manual Stage 1 items are confirmed.
