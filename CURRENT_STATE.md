# Current State — Reynalds OS / Koinonia

Last reconciled: 2026-09-05

## Active Project

Koinonia public commercial site, business operations platform, and marketing-launch readiness inside Reynalds OS.

## Current Commercial State

The Koinonia commercial model has been substantially reconciled and documented.

Current controlled-launch products:

- Transaction Management — $450 per successful closing.
- Hand Us the Listing — $350 per standard listing.
- Licensed Field Coverage — from $75 per standard assignment.
- Professional Open House — $200 per standard event.
- Marketing Management — $750/month.
- Koinonia Partnership — $1,250/month.
- Custom Project — quoted before work begins.

Standalone Contract & Document pricing remains gated and should not be publicly restored without the separate compensation/brokerage operating-model review.

Current readiness:

- Transaction Management — Production Certified.
- Hand Us the Listing / Listing & Seller Support — Controlled Launch Approved.
- Licensed Field Coverage — Controlled Launch Approved.
- Marketing Management / Marketing & Growth — Controlled Launch Approved.
- Koinonia Partnership / CRM & Business Operations — Controlled Launch Approved.

## Website State — IMPORTANT

The live Koinonia site is hosted through Vercel, but the **new September white-glove Homepage and Services & Pricing redesign on `main` is unfinished preview work and has not been owner-approved for production promotion**.

Working files include:

- `apps/web/content/services.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- `apps/web/content/home.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- `apps/web/config/seo.config.ts`

The working Services & Pricing implementation replaces the legacy pricing/service presentation and includes current pricing plus full “what do I actually get?” detail sections.

A passing Vercel preview/build is not equivalent to owner approval.

## Important Branch State

Current branch roles:

- `main` — active working/non-production repository state containing the newer commercial architecture and unfinished website redesign.
- `koinonia-production` — dedicated live-production branch. Do not update without explicit owner approval after review.
- `develop` — stale legacy branch; not the current website review path.
- `koinonia-marketing-readiness` — older non-production marketing-instrumentation prototype branch; do not merge wholesale.

The live production domain may therefore continue to show the older production site until the approved redesign is promoted.

## Current Marketing Launch Work

The owner is preparing a major social-media and email campaign and wants a full retention/conversion system rather than one-time ad clicks.

A non-production branch named `koinonia-marketing-readiness` was created from the older Koinonia production baseline and contains prototype implementation for:

- GA4 public-route analytics;
- funnel events;
- UTM and ad click-ID attribution;
- first/latest/conversion-touch persistence;
- Meta and TikTok browser pixel shells;
- privacy/consent controls;
- GPC handling;
- paid-social `/coverage` landing page;
- CRM preservation of Facebook, TikTok, Google and Microsoft paid click IDs.

The readiness branch and current `main` have materially diverged.

**Do not merge the readiness branch wholesale.** Create a fresh branch from current `main` and selectively port/reimplement the desired marketing infrastructure.

## Current External Marketing Gaps

Before the marketing stack is launch-ready:

- confirm the actual GA4 Measurement ID and prove realtime events;
- obtain/create the Meta Dataset/Pixel ID;
- obtain/create the TikTok Pixel ID;
- verify privacy choices and GPC behavior;
- verify page-view and `generate_lead` events in each platform's test tools;
- configure retargeting audiences and converter exclusions;
- decide on server-side Meta/TikTok conversion APIs and deduplication;
- verify SPF, DKIM, DMARC, unsubscribe and suppression handling before large-scale email sending.

## Search / Domain State

- Search Console appeared correctly pointed and the owner elected to leave the current sitemap alone.
- Both Squarespace website subscriptions were canceled.
- Production website hosting is Vercel.
- Old Squarespace DNS-retention warnings are historical and should not override current verified infrastructure.
- Google Workspace Business Standard remains needed for business email.
- Final `koinoniaadmin.com` registrar/billing cleanup may still require confirmation after the Cloudflare transfer process completes.

## Primary Handoffs

Commercial model + unfinished website implementation:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_COMMERCIAL_WEBSITE_UNFINISHED.md`

Marketing / retargeting readiness:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

## Immediate Next Work

For website work:

1. inspect the current non-production Homepage and Services & Pricing preview;
2. refine visual hierarchy, density, CTA behavior, mobile presentation, and final public copy as needed;
3. validate build/routes and owner-facing experience;
4. present the finished preview to Jeremiah;
5. only after explicit approval, prepare production promotion to `koinonia-production`.

For campaign infrastructure:

1. create a fresh marketing-integration branch from current `main`;
2. selectively port the verified readiness work;
3. connect/test the real GA4/Meta/TikTok identifiers in preview;
4. keep production deployment gated on explicit owner approval.

## Current Website Launch Blocker

The primary website blocker is **owner-approved visual/functional QA of the new commercial website implementation**, not missing product definition.
