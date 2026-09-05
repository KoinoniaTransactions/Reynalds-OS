# Koinonia Marketing Technical Readiness — 2026-09-05

Owner: Koinonia  
Status: **Active implementation checkpoint**  
Scope: Koinonia's own social-media, paid-media and email campaign launch infrastructure

---

## Purpose

This document records the technical system Koinonia needs so campaign traffic is not reduced to one-time anonymous clicks.

Target funnel:

**ad / post / email -> public Koinonia site -> tracked interest -> consultation/lead -> CRM relationship -> follow-up -> retargeting / nurture**

This is an implementation/readiness record. It does not replace the commercial scope rules in the Marketing Management or Koinonia Partnership readiness standards.

---

# Current Decision

Koinonia should launch major social/email campaigns only after the core measurement and retention loop is verified.

Retargeting is recommended, but the launch system must include more than pixels:

- accurate attribution;
- intent-event tracking;
- first-party lead capture;
- CRM persistence;
- follow-up;
- privacy/consent controls;
- platform retargeting;
- email authentication and unsubscribe/suppression controls;
- message-matched landing experiences.

---

# Current Repository Situation

A prototype implementation was built on:

`koinonia-marketing-readiness`

Checkpoint head:

`a3bc944e7eb950a4251416d6726266153d0c890e`

That branch was created from the older `koinonia-production` baseline and predates the major 2026-09-03/04 commercial/site changes on `main`.

**Do not merge the prototype branch wholesale into current `main`.**

Required implementation path:

1. create a fresh integration branch from current `main`;
2. selectively port/reimplement the desired marketing capabilities;
3. reconcile all public copy/landing pages against current product architecture;
4. verify in preview;
5. require explicit owner approval before production deployment.

---

# Prototype Capabilities Already Built

Relative to the old production baseline, the readiness prototype includes:

- public-route GA4 component;
- event helper layer;
- consultation scheduler-open event;
- consultation-type-selection event;
- contact call/text/email events;
- successful consultation `generate_lead` event;
- UTM persistence;
- first-touch/latest-touch/conversion-touch attribution;
- paid click-ID capture/persistence;
- Koinonia CRM relationship normalization for paid click IDs;
- privacy preference storage;
- Global Privacy Control handling;
- consent-gated Meta browser pixel shell;
- consent-gated TikTok browser pixel shell;
- shared Lead conversion definition across GA4/ad platforms;
- `/coverage` paid-social landing-page concept;
- attribution persistence tests.

Prototype files include:

- `apps/web/app/coverage/page.tsx`
- `apps/web/components/site/AdvertisingPixels/AdvertisingPixels.tsx`
- `apps/web/components/site/MarketingPrivacyControls/MarketingPrivacyControls.tsx`
- `apps/web/lib/advertising-events.ts`
- `apps/web/lib/marketing-consent.ts`
- modifications to GA4, consultation intake, contact actions, attribution and Koinonia relationship helpers.

---

# Attribution Standard

Capture and preserve where available:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `ttclid`
- `gclid`
- `gbraid`
- `wbraid`
- `msclkid`
- referrer
- landing page
- capture timestamp

Preserve:

- first touch;
- latest touch;
- conversion touch.

Do not overwrite original acquisition data merely because a later session has a different campaign source.

---

# Conversion Standard

Primary conversion:

`generate_lead`

Definition:

A successful consultation/lead submission that the backend accepts.

Micro-events such as scheduler open, service selection, phone click, text click and email click are diagnostic/intent events. They are not equivalent to a lead.

Platform event target:

- Meta: `Lead`
- TikTok: `Lead`

Keep one business definition of a successful lead across analytics platforms whenever possible.

---

# Privacy / Public-Private Boundary

Marketing analytics and advertising technology must be limited to the public marketing experience.

Authenticated client/staff routes should not be included in Meta/TikTok retargeting merely because they share the same Next.js app shell.

Prototype consent choices:

- Essential only;
- Analytics;
- Analytics + advertising.

Global Privacy Control should disable targeted-advertising tracking.

When porting, confirm the current route list because the current public site has changed since the prototype branch was created.

---

# GA4 Gate

Open item:

The real production `G-...` Measurement ID has not been conclusively verified in this workstream.

Do not claim GA4 is working until all are proven:

1. correct GA4 property/web stream;
2. correct measurement ID;
3. measurement ID configured in preview/production environment as appropriate;
4. realtime/debug page view observed;
5. successful test consultation produces `generate_lead`.

Prototype environment variable:

`NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

# Meta Gate

Need to create or identify the Koinonia Meta Dataset/Pixel.

Required before activation:

- real ID;
- correct business/ad account ownership/access;
- test PageView;
- test Lead;
- consent denied/granted behavior;
- initial website/high-intent/social-engager audiences;
- converter exclusion.

Future enhancement:

Meta Conversions API may improve event resilience/measurement. If browser + server events are both used, deduplicate them.

---

# TikTok Gate

Need to create or identify the Koinonia TikTok Pixel.

Required before activation:

- real Pixel ID;
- correct business/ad account access;
- test page event;
- test `Lead` event;
- consent denied/granted behavior;
- retargeting audience setup;
- converter exclusion.

Future enhancement:

TikTok Events API may be added after browser tracking is proven. Deduplicate browser/server events if both are used.

---

# Retargeting Launch Strategy

Do not over-segment initial audiences.

Start with useful-volume groups such as:

- all eligible public-site visitors;
- higher-intent visitors (services/contact/scheduler interaction);
- Facebook/Instagram engagers or video viewers;
- TikTok engagers or video viewers;
- converters excluded where practical.

Capture service-level intent from day one, but split into service-specific audiences only when traffic volume makes the segmentation useful.

---

# Landing-Page Strategy

Campaigns should not default to sending every visitor to the homepage.

Campaign 01 source:

`02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

Existing campaign idea:

> Real estate does not happen one thing at a time.

Existing response line:

> Keep the client. Get the coverage.

A `/coverage` prototype exists, but it predates the newer white-glove commercial architecture and must be rewritten/reconciled before production use.

Current product names/prices/claim boundaries on `main` control.

---

# Email Campaign Gate

Before a major Koinonia outbound email campaign, verify:

- SPF;
- DKIM;
- DMARC;
- sending-domain strategy;
- accurate From/Reply-To;
- non-deceptive subject lines;
- physical postal address where required;
- working unsubscribe/opt-out;
- suppression list;
- list source/permission quality;
- campaign UTM convention;
- sending-volume/reputation plan.

Koinonia's Marketing Management readiness standard already requires CAN-SPAM controls and discourages harvested/improper lists.

Canonical compliance/business source:

`02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

---

# End-to-End Acceptance Test

Before production launch, run one controlled test URL containing campaign attribution.

Example test flow:

1. open tagged campaign URL;
2. verify first-touch attribution stored;
3. verify page view/landing event;
4. trigger a high-intent event such as scheduler open;
5. submit a real test consultation;
6. verify backend success;
7. verify Koinonia Relationship record;
8. verify first/latest/conversion touch;
9. verify paid click IDs where supplied;
10. verify follow-up task/timeline event;
11. verify GA4 `generate_lead`;
12. verify Meta `Lead` in test events;
13. verify TikTok `Lead` in test events;
14. verify converted tester is eligible for converter exclusion as designed.

Do not scale paid traffic until this path is proven.

---

# Production Rule

No marketing instrumentation or campaign landing-page changes from this workstream are authorized for production merely because they exist in a branch or preview.

Production requires owner review and explicit approval.

Primary AI handoff:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
