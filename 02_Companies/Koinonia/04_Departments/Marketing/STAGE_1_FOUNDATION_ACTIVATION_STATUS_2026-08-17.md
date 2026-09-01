# Koinonia Transactions — Stage 1 Foundation Activation Status

Status: Operational Foundation Verified / Reporting Follow-Up Pending
Date: 2026-08-17  
Stage: Foundation Activation

## 2026-09-01 Reconciliation

The production website foundation, controlled live attribution test, and live social-profile setup
have now been confirmed. Named inbound ownership and the first dashboard baseline remain approval
gates before publishing. GA4 recorded the controlled `generate_lead`; its Admin key-event designation
remains pending while the new event finishes processing into the administrative event list.

Verified since the original checkpoint:

- GA4 property and web stream created for `https://www.koinoniatransactions.com`
- GA4 measurement ID configured only in Vercel Production
- GA4 tag deployed and verified on the public Koinonia website
- internal OS and secure portal routes remain excluded from GA4
- successful consultation requests emit `generate_lead` without personal information
- controlled consultation submission returned success and created the expected Relationship flow
- Resend accepted the internal consultation notification
- GA4 Realtime recorded `generate_lead`
- Facebook, Instagram, and TikTok profiles are user-confirmed configured and ready for content
- production deployment `dpl_2TfSPReybmuqyUwTw8MKL83fvWvH` reached `READY`

Reconciliation work on isolated branch
`feature/koinonia-stage1-marketing-reconciliation` corrects attribution so the CRM can preserve:

- original first touch
- latest attributable touch
- conversion touch

The reconciliation was merged to `koinonia-production` in merge commit
`74038b67fa5289ae60f968331628bafbf17980ff` and verified through the controlled production
consultation.

## Purpose

Record what was actually activated and verified during Stage 1 of the Koinonia marketing implementation plan.

Stage 1 scope is limited to:

1. launch-critical website privacy/attribution/conversion foundation
2. live production deployment verification
3. Facebook / Instagram / TikTok profile configuration
4. tracked profile destinations
5. inbound lead ownership/readiness

This stage does not authorize outreach, campaign publishing, paid ads, nurture email, or brokerage activation.

---

# Original Website Foundation Release — COMPLETE (Historical Record)

The integration branch was not promoted wholesale.

A surgical release branch was used:

`release/koinonia-marketing-foundation-20260817`

The release branch was based on `koinonia-production` and isolated only the launch-critical website foundation.

The original production foundation release and release branch were identical at:

`3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`

Included production files:

- `apps/web/app/api/koinonia/consultation/route.ts`
- `apps/web/app/layout.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/components/site/ConsultationIntake/ConsultationIntake.tsx`
- `apps/web/components/site/MarketingAttribution/MarketingAttribution.tsx`
- `apps/web/content/privacy.ts`
- `apps/web/content/shared.ts`
- `apps/web/lib/koinonia-consultation-relationship.ts`

No unrelated integration-branch portal, Properties, Reynalds Brothers, marketing-document, or broader website work was included.

---

# Original Vercel Foundation Deployment — COMPLETE (Historical Record)

Project:

`reynalds-os-web`

Vercel project ID:

`prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`

Original production deployment:

`dpl_7AdpShYxdHdxxsGByfPPkUa3r9UQ`

Deployment commit:

`3ed887c39a05f53eb9ddeb3e4d207b9e45c4f856`

Deployment state:

**READY**

Production aliases reported by Vercel:

- `www.koinoniatransactions.com`
- `koinoniatransactions.com`
- `reynalds-os-web.vercel.app`
- `reynalds-os-web-koinonia3.vercel.app`
- production branch alias

Vercel reported no alias error for the production deployment.

The later Stage 1 reconciliation was merged in commit
`74038b67fa5289ae60f968331628bafbf17980ff` and deployed as
`dpl_2TfSPReybmuqyUwTw8MKL83fvWvH`. That later deployment supersedes the original foundation
deployment as the current production checkpoint.

---

# Public Search / Cache Note

Public web-search results still showed older indexed Koinonia site content immediately after release.

Do not use search-engine cached/indexed text as proof that the new production deployment failed.

The deployment platform reports the correct production commit as READY and assigned to the Koinonia domains.

A direct human browser check should still confirm the public-domain rendering after CDN/DNS/cache propagation as needed.

---

# Website Verification — COMPLETE

Verified from the production website and controlled consultation flow:

- `/privacy` renders on `www.koinoniatransactions.com`
- footer Privacy link opens `/privacy`
- `/contact` consultation form renders
- a controlled test consultation creates/updates one Koinonia Relationship
- a controlled UTM test preserves source/medium/campaign/content
- an existing Relationship's original first-touch values are not overwritten by later consultation activity
- expected consultation notification behavior works if configured
- GA4 `generate_lead` appears in Realtime after a controlled consultation

A real form submission should use clearly labeled internal/test data and be cleaned up or retained as test evidence according to normal CRM practice.

---

# Social Profile Configuration — USER-CONFIRMED COMPLETE

The account owner confirmed that Facebook, Instagram, and TikTok were already configured and ready
for posting. The live Facebook Page was also observed under the correct **Koinonia Transactions**
identity. Earlier copy in this document describing manual profile configuration as pending is
superseded. Do not restart or overwrite established live profile setup merely to reproduce the Day 2
specification.

The established live profiles are the source of truth unless the user intentionally reopens profile
copy or configuration.

## Facebook

Confirmed display name:

**Koinonia Transactions**

Confirmed live bio retained by user decision on 2026-09-01:

**Real estate operations support for Colorado Realtors. Transactions • Contracts • Showings • Business Support. Real Estate Operations. Elevated.**

Primary tracked CTA:

`https://www.koinoniatransactions.com/contact?utm_source=facebook&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=facebook_page_button#schedule-consultation`

Website field:

`https://www.koinoniatransactions.com/?utm_source=facebook&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=facebook_website_field`

## Instagram

The account owner confirmed the profile is completely configured and ready for posting. Do not
replace its live bio with older prepared copy unless the user intentionally reopens it.

Tracked bio link:

`https://www.koinoniatransactions.com/contact?utm_source=instagram&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=instagram_bio#schedule-consultation`

## TikTok

The account owner confirmed the profile is completely configured and ready for posting. Do not
replace its live bio with older prepared copy unless the user intentionally reopens it.

Tracked bio link:

`https://www.koinoniatransactions.com/contact?utm_source=tiktok&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=tiktok_bio#schedule-consultation`

LinkedIn remains excluded.

---

# Inbound Lead Ownership — READY BY PROCESS, OWNER CONFIRMATION PENDING

The Lead Response & Consultation Playbook defines the response process and standards.

Before Stage 2 organic publishing begins, confirm one named owner for each active inbound source:

- website consultations
- Facebook comments/DMs
- Instagram comments/DMs
- TikTok comments/DMs

At initial launch, one person may own all four sources if that is operationally realistic.

No acquisition channel should be activated if inbound leads cannot be reviewed and answered reliably.

---

# Stage 1 Decision

## Complete

- surgical production release
- production branch reconciliation
- Vercel production deployment
- Koinonia domain aliases attached to production deployment
- profile copy and tracked links fully specified
- lead-response operating process built
- controlled consultation and UTM verification
- GA4 Realtime `generate_lead` verification
- Facebook / Instagram / TikTok profile configuration confirmed

## Pending Before Live Organic Publishing

- named inbound lead owner confirmation
- first dashboard/control baseline
- T1/T2 media production and pilot-package QA
- explicit publishing approval

## Reporting Follow-Up

- verify `generate_lead` appears in GA4 Admin after processing
- mark `generate_lead` as a key event and verify the designation

## Not Authorized Yet

- organic campaign publishing
- Realtor outreach
- brokerage outreach
- nurture email
- Meta ad activation
- TikTok paid activation
- promotional SMS

Stage 2 should not begin until the Stage 1 pending items are confirmed.
