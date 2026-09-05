# Developer / AI Handoff

Last reconciled: 2026-09-05

## Start Here

For current work, read in this order:

1. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
2. `BRAIN/CURRENT_PRIORITIES.md`
3. `CURRENT_STATE.md`
4. `BRAIN/CANONICAL_REGISTRY.md`
5. `BRAIN/REYNALDS_OS_CONSTITUTION.md`
6. `BRAIN/DEVELOPMENT_STANDARDS.md`
7. `NEXT_ACTION.md`

The dated Koinonia marketing handoff is the current session checkpoint for the social/email/retargeting launch work.

---

# Current Repository Reality

Primary app:

`apps/web/`

Primary database schema:

`packages/database/prisma/schema.prisma`

Repository:

`KoinoniaTransactions/Reynalds-OS`

Current important branches at the 2026-09-05 checkpoint:

- `main` — current commercial/business/application work and current public-site redesign source.
- `koinonia-production` — separately controlled Koinonia production branch; do not assume it equals `main`.
- `koinonia-marketing-readiness` — experimental/pre-production marketing instrumentation branch created from an older production baseline. Do not merge wholesale.

## Critical Branch Safety Rule

Never blindly merge `main` into `koinonia-production`, or `koinonia-marketing-readiness` into either branch.

The marketing-readiness branch materially diverged from the newer commercial/site work on `main`. For marketing instrumentation, start a fresh integration branch from current `main` and selectively port/reimplement the needed work.

Never deploy production without explicit owner authorization.

---

# Current Koinonia Business Direction

Koinonia is positioned as a white-glove real-estate operations and Realtor support relationship, not merely a traditional transaction-coordination company.

Current controlled-launch commercial products include:

- Transaction Management — $450 per successful closing.
- Hand Us the Listing — $350 per standard listing.
- Licensed Field Coverage — from $75 per standard assignment.
- Professional Open House — $200 per standard event.
- Marketing Management — $750/month.
- Koinonia Partnership — $1,250/month.
- Custom Project — quoted before work begins.

Always confirm commercial claims against the current canonical product/readiness documents before modifying the public site or marketing materials.

---

# Current Marketing / Retargeting Work

The owner is preparing a major social and email campaign and asked for a complete click-retention/conversion system.

A non-production branch, `koinonia-marketing-readiness`, contains prototypes for:

- GA4 public-route loading;
- funnel events;
- UTM/click-ID attribution;
- first/latest/conversion-touch persistence;
- Meta/TikTok browser pixel shells;
- privacy/consent controls and GPC handling;
- CRM persistence of `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, `msclkid`;
- a `/coverage` paid-social landing page.

This branch has a successful Vercel preview build, but it predates the current main-branch commercial/site architecture.

Full checkpoint:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

---

# Current External-Platform Gaps

Still required before paid retargeting can be considered launch-ready:

- confirm the real GA4 measurement ID and prove live events;
- create/identify the real Meta Dataset/Pixel ID;
- create/identify the real TikTok Pixel ID;
- test browser consent denied/granted behavior;
- test page-view and lead events in platform test tools;
- create initial retargeting audiences and converter exclusions;
- decide whether to add server-side conversion APIs;
- if browser + server events are both used, implement deduplication;
- audit email authentication, unsubscribe and suppression before a large send.

Do not invent or guess external platform identifiers.

---

# Domain / Search / Legacy Squarespace State

At the latest owner checkpoint:

- both Squarespace website subscriptions were canceled;
- Koinonia production site is hosted through Vercel;
- `koinoniatransactions.com` is no longer relying on Squarespace website hosting;
- Search Console appeared correctly pointed and the owner chose to leave the existing sitemap alone;
- `koinoniaadmin.com` registrar-transfer cleanup and Google domain-registration billing may still need final confirmation after the transfer email/process completes;
- Google Workspace Business Standard should remain active because it provides business email.

The old instruction saying Squarespace must remain due to active DNS dependency is historical and must not be treated as current truth without fresh verification.

---

# Do Not Start From

Do not start from the old standalone HTML app shell as the active product source.

Historical reference only:

`07_Application_Prototypes/ROS_Koinonia_Interactive_App_Shell_v7_2.html`

Do not start marketing work from old July pricing/service documentation when September canonical product/readiness documents exist.

---

# Core Engineering Rules

- Recover before reinventing.
- Identify the canonical source before creating a duplicate source of truth.
- Do not claim work is complete from conversation history alone.
- Verify repository state and relevant deployment state.
- Protect production from experimental branches.
- Do not commit production secrets or platform credentials.
- Do not put advertising trackers inside authenticated client/staff areas.
- Do not call micro-events leads; successful consultation/lead submission remains the lead conversion.

---

# Recommended Next Work

For the current Koinonia marketing launch:

1. create a fresh integration branch from current `main`;
2. selectively port/rebuild the marketing-readiness instrumentation;
3. reconcile the paid landing page with the current commercial architecture;
4. confirm GA4 and platform IDs;
5. run full tagged click -> page -> intent event -> consultation -> CRM -> platform conversion test;
6. audit outbound email authentication/compliance;
7. show the owner the final preview;
8. only deploy after explicit approval.
