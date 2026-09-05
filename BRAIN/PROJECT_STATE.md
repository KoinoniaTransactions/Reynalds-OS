# Reynalds OS Project State

Last reconciled: 2026-09-05

## Project

**Product:** Reynalds OS  
**Primary Business Workspace:** Koinonia  
**Repository:** `KoinoniaTransactions/Reynalds-OS`

---

# Current Repository / Branch State

Important active branches are purpose-specific and must not be conflated:

- `main` — current broad application/business/commercial development branch.
- `koinonia-production` — separately controlled Koinonia production branch.
- `koinonia-marketing-readiness` — non-production marketing instrumentation prototype built from an older production baseline.

Verified checkpoint heads before the 2026-09-05 documentation reconciliation commits:

- `main`: `973f0dff568a87e0ddcce89ca340fe586709d187`
- `koinonia-production`: `6644802cce54c4e295df7d98895b1493fc79a337`
- `koinonia-marketing-readiness`: `a3bc944e7eb950a4251416d6726266153d0c890e`

There is no valid current rule that the primary branch is `develop` or that `feature/app-shell-foundation` is the active working branch.

Never blindly merge these branches. Verify intent and diff first.

---

# Current Status

Reynalds OS is an active production-oriented monorepo with:

- Next.js application in `apps/web`;
- PostgreSQL/Prisma data layer;
- shared packages/design system;
- Koinonia CRM/relationship objects;
- transaction and operations tooling;
- public Koinonia website;
- controlled commercial product/readiness documentation;
- Vercel hosting/deployment infrastructure;
- marketing/campaign specifications;
- ongoing client/portal/platform development.

The Koinonia public website has already launched. The project is no longer in a pre-website or initial prototype phase.

---

# Current Koinonia Commercial State

Koinonia is positioned as a white-glove real-estate operations and Realtor support relationship.

Current controlled-launch products include:

- Transaction Management — $450 per successful closing.
- Hand Us the Listing — $350 per standard listing.
- Licensed Field Coverage — from $75 per standard assignment.
- Professional Open House — $200 per standard event.
- Marketing Management — $750/month.
- Koinonia Partnership — $1,250/month.
- Custom Project — quoted before work begins.

Use current service/package/pricing/readiness sources under `02_Companies/Koinonia/` rather than historical July offer architecture.

---

# Current Active Objective

Prepare Koinonia for a major social-media and email campaign with a complete measurement, attribution, retargeting and conversion system.

Target flow:

**campaign -> public website -> attribution -> intent -> lead -> Koinonia relationship/CRM -> follow-up -> retargeting/nurture**

This work must be integrated against the current September `main` architecture without destabilizing production.

---

# Marketing Readiness Prototype

A separate branch, `koinonia-marketing-readiness`, contains prototype work for:

- GA4 public-route loading;
- funnel events;
- UTM/click-ID attribution;
- first/latest/conversion-touch persistence;
- Meta/TikTok browser pixel shells;
- privacy/consent controls;
- Global Privacy Control handling;
- CRM persistence of paid click IDs;
- `/coverage` campaign landing-page concept.

The branch reached a successful Vercel preview build at its checkpoint head.

Because current `main` later received major commercial/site changes, the prototype branch is now an implementation reference only.

**Required path:** create a fresh integration branch from current `main` and selectively port/reimplement the needed capabilities.

---

# Open Technical Gates

Before the marketing campaign is considered launch-ready:

1. verify the real GA4 Measurement ID and prove realtime/page/lead events;
2. obtain/create the real Meta Dataset/Pixel ID;
3. obtain/create the real TikTok Pixel ID;
4. validate privacy choices and GPC behavior;
5. validate that authenticated/private routes do not load ad pixels;
6. verify end-to-end UTM/click-ID -> CRM attribution;
7. configure initial retargeting audiences and converter exclusions;
8. decide whether/when to add server-side conversion APIs;
9. verify SPF/DKIM/DMARC, unsubscribe and suppression before large email sending;
10. reconcile any campaign landing page with current commercial claims/products;
11. obtain explicit owner approval before production promotion.

---

# Infrastructure / Domain State

- Vercel is the website host.
- Search Console appeared correctly pointed and the owner chose to leave the sitemap alone.
- Both Squarespace website subscriptions were canceled.
- Old Squarespace-DNS dependency warnings are historical and not current authority.
- Google Workspace Business Standard remains required for business email unless intentionally replaced.
- `koinoniaadmin.com` registrar/old Google Domain Registration cleanup may still require final confirmation after transfer completion.

---

# Current Documentation Authority

Start with:

- `START_HERE.md`
- `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
- `BRAIN/HANDOFF.md`
- `BRAIN/CURRENT_PRIORITIES.md`
- `BRAIN/CANONICAL_REGISTRY.md`
- `CURRENT_STATE.md`
- `NEXT_ACTION.md`

Koinonia marketing technical checkpoint:

`02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_MARKETING_TECHNICAL_READINESS_2026-09-05.md`

---

# Next Recommended Task

Create a fresh marketing-integration branch from current `main`, selectively port the proven readiness capabilities, then verify real GA4/Meta/TikTok events and a tagged end-to-end consultation/CRM conversion in preview.

No production deployment without explicit owner authorization.
