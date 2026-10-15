# Koinonia Marketing Integration Audit — 2026-09-16

Owner: Koinonia / Jeremiah
Status: M3 GA4 PROOF COMPLETE; M4 META PROOF COMPLETE; M5 TIKTOK BROWSER RECEIPT COMPLETE — TikTok campaign-readiness UI still pending; production gated
Branch: `koinonia-marketing-integration-2026-09-16`

## Baseline decision

The initial M1 instruction said to create the fresh marketing branch from then-current `main`. That was attempted first, but a post-release comparison showed that `main` still materially diverges from the application now running in production.

The production release checkpoint at `f6c821111ff17a602eee92db01998a0c52bf62f0` contains both:

- the owner-approved September public website; and
- the recovered Portal/auth/runtime/Prisma safeguards that were deliberately preserved during W9.

Because those production safeguards are not fully represented on `main`, continuing marketing integration from `main` would recreate the branch-divergence problem that W9 was designed to avoid.

Therefore this integration branch was deliberately moved to the exact production release commit:

`f6c821111ff17a602eee92db01998a0c52bf62f0`

This is the controlling Phase B application baseline unless a later explicit reconciliation changes it.

## Old readiness branch audit

Legacy source branch:

`koinonia-marketing-readiness` at `a3bc944e7eb950a4251416d6726266153d0c890e`

The old branch must NOT be merged wholesale. It diverged materially from both current production and current `main`.

Useful capabilities to selectively port/reimplement:

- public-route GA4 gating;
- first/latest/conversion-touch attribution;
- UTM capture including `utm_term`;
- click-ID persistence for `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, and `msclkid`;
- consent preference model;
- Global Privacy Control handling;
- Meta/TikTok browser pixel shell with real-ID validation;
- successful-consultation `generate_lead` event;
- CRM/Relationship attribution persistence;
- `/coverage` campaign concept after current-content reconciliation.

Capabilities/content that must NOT be copied blindly:

- old page assemblies or visual structure;
- stale product names, pricing, or service copy;
- old consultation UI that would regress the current focus trap, return-focus behavior, service-id preselection, or current content;
- any old Portal/auth/application files;
- platform IDs that are not confirmed real values;
- any production deployment or pixel activation before the applicable owner gate.

## Current production starting state relevant to marketing

Production already contains an earlier attribution foundation:

- `MarketingAttribution` is mounted globally;
- attribution v2 stores first/latest touch in local storage;
- current production captures UTMs plus `fbclid` and `ttclid`;
- GoogleAnalytics component exists but is not currently mounted in the production root layout;
- the current consultation form does not yet submit attribution or emit marketing events;
- current production consultation processing is email-first and does not yet contain the readiness branch CRM attribution persistence implementation.

## Integration rules

1. Preserve current production Portal/auth/runtime behavior.
2. Preserve current approved public website architecture and commercial copy.
3. Extend current production components; do not replace them with old readiness versions wholesale.
4. Keep advertising tracking off authenticated/private routes.
5. Require consent before analytics/advertising scripts load according to the selected privacy model.
6. Honor Global Privacy Control by forcing targeted advertising off.
7. `generate_lead` may fire only after a consultation submission is accepted successfully.
8. Do not invent GA4, Meta, TikTok, or other platform identifiers.
9. Configure and test all real platform IDs in preview before production.
10. No production promotion before the Phase B owner gate.

## M1 result

- M1.1 Fresh integration branch: COMPLETE.
- M1.2 No wholesale readiness merge: COMPLETE.
- M1.3 Legacy readiness implementation compared against current application: COMPLETE.

## M2 implementation result

M2 is implemented and validated on this branch:

- public marketing-route boundaries are explicit;
- authenticated/private routes remain excluded;
- consent choices gate analytics and advertising scripts;
- Global Privacy Control forces advertising tracking off;
- first-touch, latest-touch, and conversion-touch attribution are preserved;
- supported UTM and advertising click IDs persist through consultation intake into CRM;
- `generate_lead` fires only after the consultation API accepts the request; and
- the consultation CRM relationship, timeline event, and follow-up task are created before the API returns success.

## M3 GA4 proof state

The verified GA4 property is `Koinonia Transactions Website` (account `552251206`) with measurement ID `G-CNMN80KHQE`.

The ID remains available only through the preview fallback on `*.vercel.app`; this branch does not activate GA4 on the production hostname.

The earlier Windsor standard-report check on 2026-09-17 for September 16-17 confirmed the controlled preview conversion on `reynalds-os-op6jrrly7-koinonia3.vercel.app/contact`: one `generate_lead`, two `consultation_scheduler_open`, and one `consultation_type_select`. Micro-events were separately named and were not counted as leads.

M3.4 was initially open because no preview-host `page_view` row appeared in Windsor standard reporting. The GA component was corrected in remote commit `09b3f1cf98cbd141ddb33f1bdbb7bd811cf270fa` so that, after analytics consent and GA script readiness, it emits an explicit `page_view` event while leaving the initial `send_page_view: false` configuration, route gating, preview-only measurement ID fallback, and consent model unchanged.

Vercel deployed that exact commit as preview deployment `dpl_BkFbiijwhocKx37D8mdDM8C6fhX4` at `reynalds-os-ltiqcvgeu-koinonia3.vercel.app`. Runtime logs confirm user navigation on that deployment across `/`, `/services`, `/about`, and `/contact` at approximately 23:38-23:39Z on 2026-09-17.

Immediately afterward, GA4 Realtime operator evidence showed:

- `page_view` as the #1 event with 9 events;
- `generate_lead` as a key event with 1 event;
- a page-title view card containing the visited Koinonia pages, including home, services/pricing, referral-partner content, and contact.

Operator evidence was captured in:

- `Screenshot 2026-09-17 at 5.42.43 PM.png` — GA4 Realtime Event count by Event name showing `page_view` = 9.
- `Screenshot 2026-09-17 at 5.42.56 PM.png` — GA4 Realtime page-title views plus the `page_view` card.

Windsor standard reporting returned no rows yet for the brand-new `reynalds-os-ltiqcvgeu-koinonia3.vercel.app` hostname at the immediate post-test query, which is consistent with its non-realtime reporting lag. The Realtime proof plus exact-deployment runtime navigation evidence completes M3.4. M3 GA4 preview proof is complete.

## M4 Meta asset and preview proof

Verified Meta assets:

- Business portfolio: `Koinonia Transactions`
- Dedicated ad account: `Koinonia Transactions` (`1378958464415174`)
- Dataset/Pixel: `Koinonia Transactions Website` (`4341788166086497`)
- Connected asset: the dedicated Koinonia ad account above
- Conversions API: intentionally deferred

The verified Pixel ID is wired only for `*.vercel.app` preview hosts when no configured environment value is present. Production remains off unless a later owner-approved production environment configuration activates it.

Preview verification completed on 2026-09-17:

1. With `Essential only`, no Meta scripts loaded.
2. With `Allow analytics & ads`, Meta loaded Pixel `4341788166086497` and recorded `PageView`.
3. A controlled consultation request returned HTTP 200 from `/api/koinonia/consultation` at 2026-09-17T13:44:23Z.
4. Meta Events Manager subsequently showed both `PageView` and `Lead` as Active, with one event each, from the preview website.

Operator evidence was captured in:

- `Screenshot 2026-09-17 at 8.17.19 AM.png` — Meta Overview filtered to September 17, 2026.
- `Screenshot 2026-09-17 at 8.17.29 AM.png` — Meta Overview showing Active `PageView` and Active `Lead`, one event each.

No corrective tracking-code change was required after proof; Meta's Overview feed populated after its normal processing delay.

## M5 TikTok status and proof — 2026-09-17

### Confirmed assets and code

- TikTok advertiser/account ID: `7672243853892927504`.
- Pixel: `Koinonia Transactions Website`, ID `DAM02MRC77U9262DRMS0`.
- Application submission funnel selected in TikTok setup.
- Browser Pixel only; Events API has not been implemented.
- Remote code commit `846d0e95cada4d4833da921d8fd456963b5de60a` changes only TikTok's consultation event from `Lead` to `SubmitForm` in `apps/web/lib/advertising-events.ts`. Meta remains `Lead`.
- Consent gating and existing personal-data handling were not changed. Do not paste TikTok's generated `identify` template containing email/phone/external-ID placeholders into the site.

### Browser and Events Manager proof

The exact TikTok preview deployment `dpl_7ozffoPtxMQbiL4WXd7W42XjadFn` was confirmed READY and running commit `846d0e9`.

The user selected `Allow analytics & ads`, then submitted one controlled consultation with the note `TEST—please disregard`. Vercel runtime logs on the exact deployment recorded:

- `POST /api/koinonia/consultation` -> HTTP 200 at 2026-09-17T23:22:13Z.

Immediately after the successful submission, TikTok Pixel Helper showed one matching pixel (`DAM02MRC77U9262DRMS0`) with green events including:

- `LandingPageView`
- `Pageview`
- `EngagedSession`
- `Lead`

TikTok Events Manager Test Events then provided the authoritative browser receipt:

- displayed event: `Submit form`;
- code: `Lead`;
- connection method: `Browser`;
- setup method: `Custom code`;
- URL: `https://reynalds-os-kjxkjqnba-koinonia3.vercel.app/contact#schedule-consultation`;
- parameter content included `description: Contract & Document Support`;
- received time displayed by TikTok: `2026-09-17 16:22:18 (UTC-07:00) America/Denver`.

Operator evidence was captured in:

- `Screenshot 2026-09-17 at 5.26.55 PM.png` — Pixel Helper showing green `Lead` after the successful submission.
- `Screenshot 2026-09-17 at 5.31.06 PM.png` — TikTok Test Events showing `Submit form` with `Code: Lead` and browser receipt details.

This completes browser-side conversion receipt proof for M5. No additional test submission is required.

### Diagnostics and readiness

TikTok Diagnostics still shows one `Missing events` critical card. Its details explicitly request commerce-funnel events:

- Page view
- View content
- Add to cart
- Initiate checkout
- Purchase

The card labels the recommendation for `Commerce advertisers`, while Koinonia's funnel is consultation/lead based. At the time of proof it showed `0 campaigns` impacted and `0.00%` events affected. Do not add fake ecommerce events solely to clear this warning.

Operator evidence:

- `Screenshot 2026-09-17 at 5.31.48 PM.png` — Diagnostics card summary.
- `Screenshot 2026-09-17 at 5.32.06 PM.png` — Diagnostics detail listing ecommerce funnel events.

TikTok Overview still displayed `Status: Not ready for campaign` and had not yet visually advanced the `Browser events received` setup step when checked only minutes after the test. Treat this as platform-status/UI propagation still pending; do not claim campaign readiness yet.


## TikTok organic profile / business verification update — 2026-09-18

Stage 1 organic-profile verification advanced:

- Public TikTok account confirmed as `Koinonia Transactions` with username `@koinoniatransactions`.
- Approved circled-K profile image is in use.
- Approved TikTok bio is now in use: `Operations support for Colorado Realtors. Need help carrying the operation? ↓`
- TikTok Business Suite is available on the account, but one Business Suite surface still labels the account `Personal account` despite the owner having switched the profile to Business Account on 2026-09-17.
- The mobile Verify flow produced `Something went wrong` when re-entered.
- The existing Business Registration record was then located and is already `Pending / Under Review`.
- That pending registration shows the Koinonia company website, legal business name `KOINONIA TRANSACTIONS LLC`, and an IRS EIN assignment document uploaded as company certification.
- Do not submit a duplicate verification application or toggle the account back and forth between Personal and Business while this registration is pending.
- Do not store or repeat the EIN itself in repository documentation.
- The profile Website field is not yet available; treat the tracked TikTok profile destination as pending until Business Registration review finishes and/or TikTok exposes the Website field.
- TikTok organic profile setup is therefore PARTIALLY COMPLETE / VERIFICATION PENDING, not blocked by missing company formation or missing EIN documentation.


## Facebook organic profile verification — 2026-09-18

Operator screenshot confirms the live Koinonia Facebook Page at `facebook.com/KoinoniaTransactions`.

Verified from the visible Page header:

- Page name: `Koinonia Transactions`.
- Public handle/path uses `KoinoniaTransactions`.
- Approved circled-K profile image is in use.
- Public category displays `Real Estate`.
- A `Contact us` Page action button is present.
- The Page intro identifies Koinonia as real estate operations support for Colorado Realtors.

Still requires manual verification before Facebook Stage 1 profile setup is complete:

- exact destination behind the `Contact us` button;
- tracked Facebook website-field URL;
- public email and phone;
- Instagram professional account connection;
- message/comment notification ownership;
- whether the intro/About copy should be normalized to the current approved profile specification.

The current cover image remains a branded Koinonia cover but uses older service/positioning copy; do not treat cover creative as a blocker unless owner chooses to refresh it.


## LinkedIn company presence added — 2026-09-18

The owner reversed the earlier decision to exclude LinkedIn and created a Koinonia Transactions Company Page. LinkedIn is now an approved company-presence, credibility, professional-network, and selective organic-content channel. This does not authorize LinkedIn paid media.

Operator screenshots of the live member view confirm:

- Page: `Koinonia Transactions` at `linkedin.com/company/koinonia-transactions`.
- Approved circled-K profile image is in use.
- Branded cover image is present.
- Industry displays `Real Estate`.
- Location displays `Parker, Colorado`.
- Company-size band currently displays `2-10 employees`; owner should confirm this band is factually appropriate.
- Website currently displays `https://www.koinoniatransactions.com`.
- Public phone is present.
- Current tagline: `More than transaction coordination—licensed coverage and business support for Colorado real estate professionals.`
- About/Overview text is populated and generally aligned with Koinonia, but it reflects an older service model.
- LinkedIn Services is enabled, with Remote availability, Contact for pricing, Real Estate / Real Estate Marketing categories, and a native `Request services` control.
- No Koinonia organic posts are visible yet in the member-view Posts tab.

Required LinkedIn-specific cleanup:

1. Tagline updated to current broader Koinonia positioning — COMPLETE.
2. About/Overview updated to current five-area public capability model — COMPLETE.
3. Services language still needs review against the current website capability model.
4. Tracked LinkedIn organic-profile website URL — COMPLETE (operator screenshot confirms tracked URL is live).
5. Configure a tracked website/contact CTA where the Page admin interface permits.
6. Confirm Super Admin settings and inbound message/request ownership.
7. Confirm the `2-10 employees` size band is accurate.

Do not reopen completed Facebook/Instagram/TikTok setup simply because LinkedIn was added. LinkedIn is an incremental channel addition to the existing marketing system.

## Current gates and next work

- Do not merge PR #36 yet.
- Do not activate GA4, Meta, or TikTok tracking on production before the M10 owner gate.
- Do not enable Windsor write actions or create paid campaigns.
- M3 GA4 preview proof is complete.
- M4 Meta preview proof is complete.
- M5 TikTok browser event and conversion receipt proof is complete.
- Next execution slice: verify whether TikTok Overview/campaign-readiness status updates after platform processing; then proceed to the next Phase B milestone defined by the project plan, without activating production until the owner gate.

### Working constraints for the next AI

- The user's earlier request to minimize checks/tools applied to Work mode, not normal chat mode. In chat mode, use available connectors proactively, take larger chunks of work, and avoid unnecessary handoffs to the user when the connector can do the work directly.
- Keep responses concise when practical, but do not artificially slow execution.
- Do not promise that chat, connectors, or plugins consume no allowance. The assistant cannot inspect the user's remaining allowance.
- Keep PR #36 and M10 production activation gates in place.
- GitHub connector works for this repository. Shell `git push` previously failed because HTTPS credentials were unavailable; that did not imply the connector was unavailable.
- Local remote-tracking refs were stale during the earlier session. Do not blindly push/rebase the local branch based on its ahead count.
- Local correction commit `c9e05d0` corresponds to remote connector commit `846d0e9`; do not reapply the TikTok fix.
- Current remote GA4 page-view correction commit is `09b3f1cf98cbd141ddb33f1bdbb7bd811cf270fa`.
- Local workspace referenced by the prior Work-mode handoff: `/workspace/scratch/419974b1d059/Reynalds-OS`, branch `koinonia-marketing-integration-2026-09-16`.
- Preserve unrelated local/uncommitted edits if a local workspace is used.
- No production deployment, PR merge, paid campaign launch, or new tracking activation is authorized by this documentation update.
