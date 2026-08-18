# Koinonia Transactions — Stage 1 Foundation Activation

Status: Partially Complete — External Account / End-to-End Verification Pending  
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

Initial production PR:

`#19 — Release Koinonia marketing foundation`

Initial foundation production commit:

`3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`

Stage 1 metadata cleanup PR:

`#20 — Fix Koinonia Contact metadata`

Current Stage 1 production commit:

`c4aab034c93782d9c3e2c00f17bb9bb9627a4cdd`

The integration branch was not merged wholesale.

The initial release candidate was built directly from `koinonia-production` and contained only eight launch-critical files:

- `apps/web/app/api/koinonia/consultation/route.ts`
- `apps/web/app/layout.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/components/site/ConsultationIntake/ConsultationIntake.tsx`
- `apps/web/components/site/MarketingAttribution/MarketingAttribution.tsx`
- `apps/web/content/privacy.ts`
- `apps/web/content/shared.ts`
- `apps/web/lib/koinonia-consultation-relationship.ts`

The later Contact metadata cleanup changed only:

- `apps/web/app/contact/page.tsx`

No portal, Koinonia Properties, Reynalds Brothers, outreach, paid-media, or campaign-publishing changes were included.

## Vercel Deployment — Complete

Vercel project:

`reynalds-os-web`

Current production deployment:

`dpl_782KJFH6APVTznJCCMwN4wLksVKj`

Production deployment commit:

`c4aab034c93782d9c3e2c00f17bb9bb9627a4cdd`

Vercel deployment state:

**READY**

Production aliases include:

- `koinoniatransactions.com`
- `www.koinoniatransactions.com`

## Live Public-Domain Verification — Green

Verified directly against `https://www.koinoniatransactions.com` through the connected Vercel environment:

- `/privacy` returns HTTP 200
- Privacy Policy renders with August 17, 2026 last-updated date
- footer includes the Privacy link
- `/contact` returns HTTP 200
- consultation scheduler is present
- production HTML loads the global `MarketingAttribution` component
- the live site is served by the current Vercel production deployment
- `/contact` canonical URL is correct
- `/contact` metadata now uses **Contact Koinonia**, not the earlier incorrect About metadata
- Open Graph and Twitter metadata for `/contact` now use the Contact title/description

The earlier DNS-blocked status was based on an intermediate verification state and is superseded by this live custom-domain verification.

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

## Production Runtime Health — Green

Vercel runtime error review for the production project found no runtime errors in the reviewed activation window.

The current production deployment completed successfully.

## CI Note

An earlier GitHub Actions run did not reach application install/test/build because pnpm was declared in two locations:

- workflow: `version: 9`
- `package.json`: `packageManager: pnpm@9.0.0`

That is a CI workflow configuration issue rather than an application failure from this marketing foundation release.

Vercel preview and production deployments built successfully.

Repairing the broader CI workflow remains separate from this marketing activation slice unless it becomes necessary for a later release.

## End-to-End Consultation / CRM Verification — Pending

A real production form POST has not been submitted during this Stage 1 verification.

This is intentionally still pending because the production route may send an internal Resend notification when configured, and the current activation boundary has avoided triggering email activity without an explicit test decision.

One clearly labeled internal test consultation should later verify:

- submission succeeds
- one Koinonia Relationship is created/updated
- selected pressure/service/path are stored
- source/UTM fields are present
- first-touch data is not overwritten on a later direct interaction
- consultation timeline event is created
- follow-up task / next action is created
- optional notification email behavior matches configuration

After verification, archive/close the test Relationship/task as appropriate.

## Social Profile Configuration — Pending Authenticated Account Access

Exact profile copy, link destinations, and UTMs are specified in:

`DAY_2_PROFILE_CONVERSION_SETUP_2026-08-18.md`

A fresh plugin/connectivity check found no available Facebook, Instagram, Meta, TikTok, or social-management connector capable of editing those profiles from this workspace.

Therefore live profile edits remain an authenticated account-owner step.

Required configuration:

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

## Lead Ownership / Dashboard — Pending Final Human Confirmation

The website intake code assigns the Koinonia relationship/follow-up workflow around the Koinonia operating mailbox and Relationship system, but Stage 1 still requires an explicit human owner for daily inbound monitoring.

Operating rule:

**Every meaningful Relationship gets one owner, one current next action, and one next-action date.**

Before Stage 2 organic publishing, confirm who will monitor:

- website consultation submissions
- Facebook/Instagram/TikTok buying-intent DMs/comments
- direct professional introductions

## Stage 1 Decision

### Complete / Green

- surgical production code release
- production Vercel build/deployment
- public custom domain serving Vercel production
- live Privacy Policy
- live Privacy footer link
- live Contact page and scheduler
- Contact metadata corrected
- global first-touch browser attribution capture deployed
- consultation attribution payload deployed
- consultation-to-Relationship persistence implementation deployed
- production runtime health check

### Pending

- one controlled end-to-end consultation/CRM test
- Facebook profile configuration
- Instagram profile configuration
- TikTok profile configuration
- final human inbound lead-owner confirmation

## Activation Boundary

Until the remaining Stage 1 items are confirmed:

- Stage 1 remains **PARTIALLY COMPLETE**
- Stage 2 organic campaign publishing remains OFF
- outbound email remains OFF
- brokerage outreach remains OFF
- Meta paid remains OFF
- TikTok paid remains OFF
- promotional SMS remains OFF

## Next Action

Complete the authenticated Facebook / Instagram / TikTok profile configuration and explicitly confirm the human inbound lead owner. Then run one controlled internal consultation/CRM test when internal notification-email behavior is acceptable to test.

Do not approve Stage 2 organic publishing until those Stage 1 items are reviewed.
