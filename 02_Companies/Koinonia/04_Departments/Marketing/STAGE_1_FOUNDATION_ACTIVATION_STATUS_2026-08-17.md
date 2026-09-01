# Koinonia Transactions — Stage 1 Foundation Activation Status

Status: Partially Complete / Manual Social Configuration Pending  
Date: 2026-08-17  
Stage: Foundation Activation

## 2026-09-01 Reconciliation

Stage 1 remains partially complete. The production website foundation has advanced, but social
profile configuration, named inbound ownership, and a controlled live attribution test still need
human confirmation.

Verified since the original checkpoint:

- GA4 property and web stream created for `https://www.koinoniatransactions.com`
- GA4 measurement ID configured only in Vercel Production
- GA4 tag deployed and verified on the public Koinonia website
- internal OS and secure portal routes remain excluded from GA4
- successful consultation requests emit `generate_lead` without personal information
- production deployment `dpl_DHHeV1EgXd2vfezxQx2jeTtDQ1Gd` reached `READY`

Reconciliation work on isolated branch
`feature/koinonia-stage1-marketing-reconciliation` corrects attribution so the CRM can preserve:

- original first touch
- latest attributable touch
- conversion touch

That correction is not represented as live until it is reviewed, released, and verified against a
controlled production consultation.

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

# Website Production Release — COMPLETE

The integration branch was not promoted wholesale.

A surgical release branch was used:

`release/koinonia-marketing-foundation-20260817`

The release branch was based on `koinonia-production` and isolated only the launch-critical website foundation.

The production branch and release branch are now identical at:

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

# Vercel Production Deployment — COMPLETE

Project:

`reynalds-os-web`

Vercel project ID:

`prj_7WLWYfFPKfmzLNPzaA0247ENMGjd`

Production deployment:

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

---

# Public Search / Cache Note

Public web-search results still showed older indexed Koinonia site content immediately after release.

Do not use search-engine cached/indexed text as proof that the new production deployment failed.

The deployment platform reports the correct production commit as READY and assigned to the Koinonia domains.

A direct human browser check should still confirm the public-domain rendering after CDN/DNS/cache propagation as needed.

---

# Website Verification Remaining

Before Stage 1 is marked fully complete, manually verify from a normal public browser:

- `/privacy` renders on `www.koinoniatransactions.com`
- footer Privacy link opens `/privacy`
- `/contact` consultation form renders
- a controlled test consultation creates/updates one Koinonia Relationship
- a controlled UTM test preserves source/medium/campaign/content
- an existing Relationship's original first-touch values are not overwritten by later consultation activity
- expected consultation notification behavior works if configured
- GA4 `generate_lead` appears in Realtime/DebugView after a controlled consultation

A real form submission should use clearly labeled internal/test data and be cleaned up or retained as test evidence according to normal CRM practice.

---

# Social Profile Configuration — MANUAL PENDING

No authenticated Facebook, Instagram, or TikTok management connector is available in the current environment.

No installable social-management plugin was available when checked.

Therefore profile changes were **not** represented as completed.

Use the approved Day 2 profile specification.

## Facebook

Display name:

**Koinonia Transactions**

Intro:

**Real estate operations support for Colorado Realtors. You focus on clients. We carry the operation.**

About:

**Koinonia Transactions helps Colorado Realtors with transaction support, contract and document support, licensed showing coverage, professional open house coverage, and monthly operations support.**

Primary tracked CTA:

`https://www.koinoniatransactions.com/contact?utm_source=facebook&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=facebook_page_button#schedule-consultation`

Website field:

`https://www.koinoniatransactions.com/?utm_source=facebook&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=facebook_website_field`

## Instagram

Bio:

**Real estate operations support for Colorado Realtors.**  
**Transactions • Docs • Showings • Open Houses • Operations**  
**Need help? ↓**

Tracked bio link:

`https://www.koinoniatransactions.com/contact?utm_source=instagram&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=instagram_bio#schedule-consultation`

## TikTok

Bio:

**Operations support for Colorado Realtors. Need help carrying the operation? ↓**

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

## Pending Manual Verification / Configuration

- public-browser privacy/contact verification
- controlled consultation + UTM test
- Facebook profile edits
- Instagram profile edits
- TikTok profile edits
- named inbound lead owner confirmation

## Not Authorized Yet

- organic campaign publishing
- Realtor outreach
- brokerage outreach
- nurture email
- Meta ad activation
- TikTok paid activation
- promotional SMS

Stage 2 should not begin until the Stage 1 pending items are confirmed.
