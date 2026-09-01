# Koinonia Transactions — Stage 1 Foundation Activation

Status: Partially Complete — Social Account / Browser Test Pending  
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
- promotional SMS

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

The initial release candidate was built directly from `koinonia-production` and contained only the launch-critical privacy, attribution, consultation-intake, Relationship-persistence, and footer changes required for Stage 1. The later Contact metadata cleanup changed only `apps/web/app/contact/page.tsx`.

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

Verified through the connected Vercel environment:

- `/privacy` returns HTTP 200
- Privacy Policy renders
- footer includes the Privacy link
- `/contact` returns HTTP 200
- consultation scheduler is present
- production HTML loads the global `MarketingAttribution` component
- the live site is served by the current Vercel production deployment
- `/contact` canonical URL is correct
- `/contact` metadata uses **Contact Koinonia**
- Open Graph and Twitter metadata for `/contact` use the Contact title/description

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

## Inbound Lead Ownership — Confirmed in Production Code

Production Relationship persistence is configured with:

`ownerEmail = jeremiah@koinoniaadmin.com`

The consultation route also defaults the intake notification recipient to:

`jeremiah@koinoniaadmin.com`

unless `CONTACT_INTAKE_TO_EMAIL` is explicitly overridden in the production environment.

Therefore the current system-level owner for website consultation intake and follow-up tasks is Jeremiah / the Koinonia operating mailbox.

Operating rule remains:

**Every meaningful Relationship gets one owner, one current next action, and one next-action date.**

## End-to-End Consultation / CRM Verification — Pending Browser-Originated Test

A controlled internal production test was authorized on August 17, 2026.

The attempted automated POST did **not** reach Koinonia because the execution container could not resolve `www.koinoniatransactions.com`.

Result:

- no consultation request was submitted
- no Relationship was created from this attempted test
- no internal notification email was triggered
- Vercel runtime logs showed no matching consultation request in the verification window

This is an execution-environment DNS limitation, not evidence of a Koinonia application failure.

One clearly labeled browser-originated internal test still needs to verify:

- submission succeeds
- one Koinonia Relationship is created/updated
- selected pressure/service/path are stored
- source/UTM fields are present
- first-touch data is not overwritten on a later direct interaction
- consultation timeline event is created
- follow-up task / next action is created
- optional notification email behavior matches configuration

Recommended internal test attribution:

- `utm_source=facebook`
- `utm_medium=organic_social`
- `utm_campaign=stage1_internal_verification`
- `utm_content=internal_test`

Use a clearly labeled test name/notes and archive or close the test Relationship/task afterward.

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
- system-level website lead owner confirmed

### Pending

- one controlled browser-originated consultation/CRM test
- Facebook profile configuration
- Instagram profile configuration
- TikTok profile configuration

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

Complete the authenticated Facebook / Instagram / TikTok profile configuration and run one controlled browser-originated internal consultation/CRM test.

Do not approve Stage 2 organic publishing until those items are reviewed.