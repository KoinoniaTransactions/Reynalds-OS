# Current Priorities

Last reconciled: 2026-09-05

## Active Phase

**Koinonia Marketing Launch Integration + Controlled Campaign Readiness**

The commercial/product readiness phase is substantially closed. The immediate work is now to make the current public site and CRM technically ready for a major social-media and email campaign without losing anonymous/high-intent traffic after the first click.

---

# Primary Objective

Build and verify the complete campaign path:

**ad / post / email -> public Koinonia page -> attribution -> intent events -> consultation/lead -> Koinonia relationship record -> follow-up -> retargeting / nurture**

Do not scale paid traffic until the measurement, privacy, retargeting and email-deliverability controls are proven in preview.

---

# Current Commercial Direction

Koinonia is the **white-glove, one-stop real-estate operations and Realtor support relationship**.

Primary positioning remains broader than traditional transaction coordination.

Current controlled-launch products:

1. Transaction Management — $450 per successful closing.
2. Hand Us the Listing — $350 per standard listing.
3. Licensed Field Coverage — from $75 per standard assignment.
4. Professional Open House — $200 per standard event.
5. Marketing Management — $750/month.
6. Koinonia Partnership — $1,250/month.
7. Custom Project — quoted before work begins.

Canonical product/readiness documentation in `02_Companies/Koinonia/` controls over older pricing/service copy.

---

# Commercial Readiness Status

## PASS — Hand Us the Listing

Controlled launch approved.

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/HAND_US_THE_LISTING_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

## PASS — Licensed Field Coverage

Controlled launch approved.

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/LICENSED_FIELD_COVERAGE_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

## PASS — Marketing Management

Controlled launch approved at $750/month.

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

Important paid-ad rule: paid advertising is campaign-specific/conditional, requires approved account access/objective/budget/claims/tracking and separate ad spend.

## PASS — Koinonia Partnership / CRM & Business Operations

Controlled launch approved at $1,250/month.

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

---

# Website State

The September `main` branch contains the newer white-glove product/site architecture and current SEO copy.

The public marketing instrumentation prototype was built separately on `koinonia-marketing-readiness`, which was forked from an older production baseline.

**Do not merge that branch wholesale.**

Current verified checkpoint heads:

- `main` — `973f0dff568a87e0ddcce89ca340fe586709d187` before the documentation-reconciliation commits of 2026-09-05;
- `koinonia-production` — `6644802cce54c4e295df7d98895b1493fc79a337`;
- `koinonia-marketing-readiness` — `a3bc944e7eb950a4251416d6726266153d0c890e`.

The marketing branch is a source of implementation ideas/code only. Integrate from a fresh branch based on current `main`.

---

# Marketing Technical Readiness — Completed Prototype Work

The old readiness branch contains working preview implementations for:

- GA4 loading limited to public marketing routes;
- funnel/micro-conversion event tracking;
- successful consultation `generate_lead` event;
- UTM attribution;
- first-touch/latest-touch/conversion-touch persistence;
- `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, `msclkid` capture/persistence;
- CRM preservation of paid click IDs;
- privacy choices and Global Privacy Control behavior;
- consent-gated Meta/TikTok browser tracking shells;
- a paid-social `/coverage` landing-page concept;
- tests for paid-attribution persistence.

Latest readiness preview at checkpoint:

- branch head: `a3bc944e7eb950a4251416d6726266153d0c890e`
- Vercel deployment: `dpl_DmuC9by5xSjVx8bwCg44uggRzFGj`
- state: `READY`
- target: preview, not production.

---

# Open Launch Gates

## GA4

Need to identify/confirm the real `G-...` Measurement ID and prove:

- page view in realtime/debug;
- successful `generate_lead` after test consultation.

Code existence alone is not proof analytics is working.

## Meta

Need to create/identify the Koinonia Meta Dataset/Pixel and obtain the real ID.

Then test:

- consent denied;
- consent granted;
- PageView;
- Lead;
- audience eligibility;
- converter exclusion.

## TikTok

Need to create/identify the Koinonia TikTok Pixel and obtain the real ID.

Current intended conversion event: `Lead`.

Test the same consent/page/lead path as Meta.

## Server-Side Events

Evaluate Meta Conversions API and TikTok Events API after browser tracking is proven.

If browser + server events are both used, deduplicate them.

Do not make server-side tracking a prerequisite for the first controlled test if browser tracking is accurate and sufficient to validate the funnel.

## Email Campaign

Before the major send, verify:

- SPF;
- DKIM;
- DMARC;
- compliant From/Reply-To identity;
- working unsubscribe;
- suppression of opted-out recipients;
- physical business address where required;
- list source/permission quality;
- campaign UTM naming;
- sending-domain/reputation strategy.

Avoid purchased/harvested lists as the default workflow.

---

# Retargeting Strategy

Initial launch audiences should remain broad enough to accumulate volume:

- public-site visitors;
- high-intent visitors (services/contact/scheduler interaction);
- Meta social/video engagers;
- TikTok engagers/video viewers;
- successful converters excluded where practical.

Capture service-interest detail from day one, but do not create many tiny service-specific retargeting audiences until traffic volume supports them.

---

# Campaign 01

Current paid-social working spec:

`02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

Core existing idea:

> Real estate does not happen one thing at a time.

Response line:

> Keep the client. Get the coverage.

The dedicated landing-page concept remains recommended, but any implementation must be reconciled against the current September product architecture and current approved claims before launch.

---

# Search / Domain State

- Search Console appeared correctly pointed; owner chose to leave sitemap alone.
- Both Squarespace website subscriptions were canceled.
- Vercel is the web host.
- Old Squarespace-DNS retention instructions are historical and should not be treated as current truth without fresh verification.
- Google Workspace Business Standard remains required for business email.
- `koinoniaadmin.com` registrar/Google Domain Registration cleanup may still need final confirmation after Cloudflare transfer completion.

---

# Immediate Next Task

**Create a fresh marketing-integration branch from current `main` and selectively port/reimplement the verified readiness capabilities.**

Then connect GA4/Meta/TikTok in preview and run a complete tagged end-to-end test.

Primary handoff:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

Production deployment remains gated on explicit owner approval.
