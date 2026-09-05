# Current State — Reynalds OS / Koinonia

Last reconciled: 2026-09-05

## Active Project

Koinonia public commercial site, business operations platform, and marketing-launch readiness inside Reynalds OS.

## Current Public/Commercial State

The Koinonia site is already launched and hosted through Vercel. The current `main` branch reflects the newer September white-glove commercial architecture and public-site redesign work.

Current controlled-launch products:

- Transaction Management — $450 per successful closing.
- Hand Us the Listing — $350 per standard listing.
- Licensed Field Coverage — from $75 per standard assignment.
- Professional Open House — $200 per standard event.
- Marketing Management — $750/month.
- Koinonia Partnership — $1,250/month.
- Custom Project — quoted before work begins.

Marketing Management and Koinonia Partnership both have controlled-launch readiness documentation on `main`.

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

The branch head at checkpoint is:

`a3bc944e7eb950a4251416d6726266153d0c890e`

The corresponding Vercel preview deployment reached `READY`.

## Important Branch State

Current verified heads at the checkpoint:

- `main`: `973f0dff568a87e0ddcce89ca340fe586709d187`
- `koinonia-production`: `6644802cce54c4e295df7d98895b1493fc79a337`
- `koinonia-marketing-readiness`: `a3bc944e7eb950a4251416d6726266153d0c890e`

`main` and the marketing-readiness branch have materially diverged.

**Do not merge the readiness branch wholesale.** Create a fresh branch from current `main` and selectively port/reimplement the desired marketing infrastructure.

## Current External Gaps

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

## Current Primary Handoff

Read:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

## Immediate Next Technical Step

Create a fresh marketing-integration branch from current `main`, selectively port the verified readiness work, then connect and test the real GA4/Meta/TikTok account identifiers in preview before any production deployment.
