# AI Handoff — Koinonia Marketing / Retargeting Readiness

Date: 2026-09-05  
Owner: Koinonia  
Repository: `KoinoniaTransactions/Reynalds-OS`  
Status: **Active checkpoint — documentation only; no production marketing infrastructure has been deployed from the readiness branch**

---

# 1. Why This Handoff Exists

The user is preparing a major social-media and email campaign and asked what must be in place so paid/organic clicks are not lost after the first visit.

The work expanded into a pre-launch technical audit covering:

- GA4;
- first/latest/conversion-touch attribution;
- campaign click IDs;
- lead/conversion events;
- Meta retargeting;
- TikTok retargeting;
- privacy/consent handling;
- public-vs-private tracking boundaries;
- CRM attribution persistence;
- a message-matched paid-social landing page;
- email deliverability/compliance readiness.

This handoff records the exact stopping point so the work can resume without reconstructing the chat.

---

# 2. Production Safety Rule

**Do not merge or deploy `koinonia-marketing-readiness` blindly.**

The branch was created from the then-current Koinonia production branch before the major commercial/site redesign completed on `main` on 2026-09-03/04.

Current verified branch heads at this checkpoint:

- `koinonia-production` — `6644802cce54c4e295df7d98895b1493fc79a337`
  - message: `Redirect retired appointments page to consultation scheduler`
  - date: 2026-09-01
- `koinonia-marketing-readiness` — `a3bc944e7eb950a4251416d6726266153d0c890e`
  - message: `Track paid coverage landing page`
  - date: 2026-09-02
- `main` — `973f0dff568a87e0ddcce89ca340fe586709d187`
  - message: `Update public SEO copy for current Koinonia services`
  - date: 2026-09-04

Git comparison at this checkpoint:

- readiness branch is 27 commits ahead of `koinonia-production` and 0 behind that branch;
- `main` and `koinonia-marketing-readiness` have materially diverged;
- comparison reported `main` ahead by 131 commits and readiness ahead by 93 commits from their merge base.

**Required integration strategy:** create a fresh marketing-integration branch from current `main` and selectively port/reimplement the readiness work against the current commercial architecture. Do not merge the old readiness branch wholesale into `main` or `koinonia-production`.

---

# 3. Current Commercial Architecture Overrides Older Marketing Copy

Since the readiness branch was created, Koinonia's public commercial model was materially expanded and approved.

Current controlled-launch products on `main` include:

1. Transaction Management — `$450` per successful closing.
2. Hand Us the Listing — `$350` per standard listing.
3. Licensed Field Coverage — from `$75` per standard assignment.
4. Professional Open House — `$200` per standard event.
5. Marketing Management — `$750/month`.
6. Koinonia Partnership — `$1,250/month`.
7. Custom Project — quoted before work begins.

Marketing Management and Koinonia Partnership both passed controlled-launch readiness on 2026-09-03.

Therefore, any older landing-page or campaign copy created on `koinonia-marketing-readiness` must be checked against the current website/product architecture before reuse.

Canonical commercial/readiness sources:

- `BRAIN/CURRENT_PRIORITIES.md`
- `02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
- `02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
- `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md`
- `02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

---

# 4. What Was Built on `koinonia-marketing-readiness`

The branch contains the following marketing-readiness implementation relative to `koinonia-production`:

## New files

- `apps/web/app/coverage/page.tsx`
- `apps/web/components/site/AdvertisingPixels/AdvertisingPixels.tsx`
- `apps/web/components/site/MarketingPrivacyControls/MarketingPrivacyControls.tsx`
- `apps/web/lib/advertising-events.ts`
- `apps/web/lib/marketing-consent.ts`

## Modified files

- `apps/web/app/layout.tsx`
- `apps/web/components/site/ConsultationIntake/ConsultationIntake.tsx`
- `apps/web/components/site/ContactActions/ContactActions.tsx`
- `apps/web/components/site/GoogleAnalytics/GoogleAnalytics.tsx`
- `apps/web/components/site/MarketingAttribution/MarketingAttribution.tsx`
- `apps/web/content/privacy.ts`
- `apps/web/lib/google-analytics.ts`
- `apps/web/lib/koinonia-relationship.test.ts`
- `apps/web/lib/koinonia-relationship.ts`
- `apps/web/lib/marketing-attribution.ts`

The branch has a successful Vercel preview build at head commit `a3bc944e7eb950a4251416d6726266153d0c890e`.

Verified preview deployment:

- deployment: `dpl_DmuC9by5xSjVx8bwCg44uggRzFGj`
- state: `READY`
- branch: `koinonia-marketing-readiness`
- target: preview / not production

---

# 5. Measurement / Attribution Work Completed in the Readiness Branch

The intended implementation does the following:

- mounts Google Analytics only on approved public-marketing routes;
- keeps marketing/ad tracking away from authenticated client/staff areas;
- records scheduler-open, consultation-type selection, contact-action and successful lead events;
- uses `generate_lead` as the primary successful-consultation conversion;
- captures and persists UTM data;
- preserves first-touch, latest-touch and conversion-touch attribution;
- extends click-ID capture/persistence to include:
  - `fbclid`
  - `ttclid`
  - `gclid`
  - `gbraid`
  - `wbraid`
  - `msclkid`
- extends the Koinonia relationship-profile normalizer so those paid-campaign IDs survive into CRM relationship records;
- includes tests proving the newer click IDs are not discarded.

The Koinonia relationship/CRM remains the intended source of truth for captured leads rather than introducing a separate marketing CRM at this stage.

---

# 6. Privacy / Consent Architecture Built

The readiness branch includes a public-site privacy preference control with:

- Essential only;
- Analytics allowed;
- Analytics + advertising allowed.

It also detects browser Global Privacy Control and forces targeted advertising off when GPC is enabled.

Advertising tracking is designed to remain inert unless:

1. visitor is on a public marketing route;
2. advertising consent is allowed;
3. a valid platform pixel ID exists.

The authenticated/private application must remain outside Meta/TikTok retargeting.

This implementation should be reviewed again when ported to current `main`, but the architecture is intentionally privacy-first and should be preserved unless a better compliant implementation is adopted.

---

# 7. Meta / TikTok Work Completed and Remaining

A browser pixel shell exists on the readiness branch for:

- Meta Pixel;
- TikTok Pixel.

The same successful Koinonia `generate_lead` event is intended to drive platform lead events so GA4, Meta and TikTok use the same business definition of a lead.

Current intended standard events:

- Meta: `Lead`
- TikTok: `Lead`

Do not activate the pixels until the real account IDs have been confirmed.

Still required:

- real Meta Pixel / Dataset ID;
- real TikTok Pixel ID;
- platform-side test-event verification;
- audience creation;
- converter exclusions;
- server-side conversion/event API work if adopted;
- deduplication if both browser and server events are used.

No reliable Meta/TikTok IDs were found in connected Gmail or the repository at this checkpoint.

---

# 8. GA4 Status — Important Gap

A Google Analytics component exists, but the real production `G-...` measurement ID has not been conclusively recovered/verified from the repo or available connected data in this workstream.

Required environment variable in the readiness implementation:

`NEXT_PUBLIC_GA_MEASUREMENT_ID`

Do not claim GA4 is fully functioning until:

1. correct GA4 property/web stream is identified;
2. measurement ID is installed in the appropriate environment;
3. a public page view appears in GA4 realtime/debug view;
4. `generate_lead` is observed after a test consultation submission.

---

# 9. Paid-Social Landing Page Work

A `/coverage` campaign landing page was created on the old readiness branch to continue the Campaign 01 promise instead of dumping cold paid traffic on the generic homepage.

Older campaign positioning used:

- `Real estate doesn't happen one thing at a time.`
- `Keep the client. Get the coverage.`

The landing-page concept remains strategically sound, but **the actual page must be reconciled with the current 2026-09-03/04 commercial architecture before launch**.

Do not copy the old page into production without checking current product names, pricing, claim boundaries, CTA strategy and current homepage/services copy.

Campaign source:

`02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

---

# 10. Retargeting Strategy Decision

Retargeting remains recommended, but launch should begin broad enough to accumulate useful audience volume.

Initial audience strategy:

- public-site visitors;
- higher-intent visitors (services/contact/scheduler interaction);
- Meta social/video engagers;
- TikTok engagers/video viewers;
- exclude successful converters where feasible.

Do not over-segment into many tiny service-specific audiences at launch. Capture service-interest data now and segment later when traffic volume supports it.

---

# 11. Email Campaign Readiness

Before a large outbound/marketing-email campaign:

- verify SPF;
- verify DKIM;
- verify DMARC;
- verify valid physical postal address in commercial messages where required;
- provide working unsubscribe/opt-out;
- maintain suppression of opted-out recipients;
- avoid harvested/obviously improper lists;
- prefer permission-based, relationship-based, or properly sourced business lists;
- protect normal business-email reputation from bulk-marketing traffic where practical;
- use campaign UTMs consistently.

Existing Koinonia Marketing Management readiness explicitly treats email/newsletter marketing as controlled-launch approved with CAN-SPAM controls and paid advertising as campaign-specific/conditional.

Canonical control:

`02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

---

# 12. Domain / Squarespace / Google Housekeeping Status

This is separate from the marketing-code branch but relevant to launch operations.

Known state from the owner conversation:

- both Squarespace website subscriptions were found and canceled;
- `koinoniatransactions.com` DNS/registration is no longer dependent on the old Squarespace website;
- `koinoniaadmin.com` Cloudflare registrar transfer was waiting on the transfer/verification email at the last checkpoint;
- Google Workspace Business Standard must remain active because it provides business email;
- the separate Google `Domain Registration` charge/subscription should only be cleaned up after `koinoniaadmin.com` is confirmed active at Cloudflare Registrar;
- Search Console appeared to be pointed correctly and the owner chose to leave the sitemap alone.

Do not reintroduce the obsolete instruction that Squarespace must remain because DNS depends on it. The old deployment-readiness DNS note was historical and has been superseded by the Cloudflare migration/cancellation work.

---

# 13. Recommended Resume Sequence

When work resumes, do this in order:

1. Read this handoff and current `BRAIN/CURRENT_PRIORITIES.md`.
2. Re-read the current public-commercial architecture on `main`.
3. Create a fresh integration branch from current `main`.
4. Selectively port/reimplement the readiness capabilities rather than merging the old branch.
5. Verify privacy/consent controls against current public routes.
6. Recover/confirm the GA4 measurement ID and prove realtime traffic.
7. Obtain Meta Pixel/Dataset ID.
8. Obtain TikTok Pixel ID.
9. Add platform IDs to preview environment only first.
10. Test consent denial and consent grant behavior.
11. Test page-view and lead events in GA4/Meta/TikTok test tools.
12. Submit a tagged test consultation and verify:
    - UTM/click-ID capture;
    - CRM relationship record;
    - first/latest/conversion touch;
    - follow-up task;
    - successful platform conversion event.
13. Reconcile Campaign 01 landing-page copy with the current Koinonia products/claims.
14. Audit bulk-email authentication/unsubscribe/suppression before the email blast.
15. Present the finished preview to the owner.
16. **Only after express owner approval**, promote the reviewed changes into the Koinonia production path.

---

# 14. Hard Rules for the Next AI / Developer

- Do not deploy production without explicit owner authorization.
- Do not merge `koinonia-marketing-readiness` wholesale.
- Do not install pixels in authenticated client/admin routes.
- Do not invent GA4/Meta/TikTok IDs.
- Do not claim analytics works merely because code exists.
- Do not use old pricing/service architecture when current `main` has newer approved commercial rules.
- Do not treat every micro-event as a lead conversion.
- Keep `generate_lead` tied to a successful lead submission.
- Keep click IDs and first/latest/conversion-touch attribution intact.
- Do not launch bulk email without authentication, unsubscribe and suppression controls.
- Paid-ad claims/budgets require campaign-specific approval under the Marketing Management readiness standard.

---

# 15. Immediate Next Human Step

The owner had just been asked to open **Meta Events Manager** so the real Koinonia Meta Dataset/Pixel could be created or identified, followed immediately by TikTok Events Manager.

However, because `main` materially changed after the readiness branch was created, the technical work should first be ported to a fresh branch from current `main` before any platform IDs are wired into a preview.
