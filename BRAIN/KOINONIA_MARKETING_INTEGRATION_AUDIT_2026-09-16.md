# Koinonia Marketing Integration Audit — 2026-09-16

Owner: Koinonia / Jeremiah
Status: M3 CONVERSION + M4 META PROOF COMPLETE; M5 TIKTOK BROWSER EVENTS OBSERVED — SubmitForm and TikTok reporting proof pending; production gated
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

The existing local audit records a Windsor standard-report check on 2026-09-17 for September 16-17 confirming the controlled preview conversion on `reynalds-os-op6jrrly7-koinonia3.vercel.app/contact`: one `generate_lead`, two `consultation_scheduler_open`, and one `consultation_type_select`. This recorded evidence completes M3.5 and M3.6; micro-events were separately named, not counted as leads. This handoff preserves that local status; the report was not re-queried during this update.

M3.4 remains open: no preview-host `page_view` row was present in that report. Do not represent the missing page-view proof as complete.

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

## Current gates and next work

- Do not merge PR #36 yet.
- Do not activate GA4, Meta, or TikTok tracking on production before the M10 owner gate.
- Do not enable Windsor write actions or create paid campaigns.
- Next execution slice: manually verify TikTok SubmitForm after one successful test consultation, then verify receipt in TikTok Events Manager; complete the remaining M3.4 GA4 preview page_view proof.


## M5 TikTok status and AI handoff — 2026-09-17

### Confirmed assets and code

- TikTok advertiser/account ID: `7672243853892927504`.
- Pixel: `Koinonia Transactions Website`, ID `DAM02MRC77U9262DRMS0`.
- Application submission funnel selected in TikTok setup. Earlier Diagnostics showed a commerce-oriented Missing events warning; its resolution has NOT been verified.
- Browser Pixel only; Events API has not been implemented.
- Remote code commit `846d0e95cada4d4833da921d8fd456963b5de60a` changes only TikTok's consultation event from `Lead` to `SubmitForm` in `apps/web/lib/advertising-events.ts`. Meta remains `Lead`.
- Consent gating and existing personal-data handling were not changed. Do not paste TikTok's generated `identify` template containing email/phone/external-ID placeholders into the site.
- Existing test suite: 338 tests passed. Next.js production build completed successfully locally before publishing the one-line correction. These are code checks, NOT proof TikTok received events.
- Preview URL: https://reynalds-os-kjxkjqnba-koinonia3.vercel.app/koinonia
- Deployment ID: `dpl_7ozffoPtxMQbiL4WXd7W42XjadFn`. Connector last reported BUILDING; user subsequently opened this exact preview successfully. No later READY API check was performed.

### Latest operator evidence

User screenshot `Screenshot 2026-09-17 at 4.18.46 PM.png` shows TikTok Pixel Helper on the updated preview:

- one pixel found, matching `DAM02MRC77U9262DRMS0`;
- green checks for `LandingPageView`, `Pageview`, and `EngagedSession`.

This confirms browser-helper observations only. It does NOT establish Events Manager receipt, campaign readiness, or successful SubmitForm tracking. Earlier TikTok Test Events remained empty despite browser Pageview detection.

### Exact next user step

The user was instructed to close Pixel Helper, click Tell Us What You Need, submit one test consultation using their own details and message TEST—please disregard, then reopen Pixel Helper after the form success message. Warn that the test may create a real inquiry/email/CRM record. Look for `SubmitForm` and ask for the resulting screenshot. No screenshot confirming this test has been received yet.

After helper confirmation, guide the user to verify the event in TikTok Events Manager. Do not claim that renaming the form event fixed the earlier missing Pageview reporting; these are separate proof requirements.

### Working constraints for the next AI

- User is strongly concerned about usage limits. Default to short chat responses and user-performed steps. No automated testing, builds, browsing, deployment polling, or background work unless explicitly requested.
- Do not promise that chat, connectors, or plugins consume no allowance. The assistant cannot switch conversation mode or inspect the user's remaining allowance.
- This status-update request authorizes a documentation commit only, not production deployment, PR merge, paid campaigns, or new tracking changes.
- Keep PR #36 and M10 production activation gates in place.
- GitHub connector works for this repository. Shell `git push` failed because HTTPS credentials were unavailable; that did not imply the connector was unavailable.
- Local remote-tracking refs were stale: the Meta/TikTok preview configuration was already on GitHub. Do not blindly push/rebase the local branch based on its ahead count.
- Local correction commit `c9e05d0` corresponds to remote connector commit `846d0e9`; do not reapply the fix.
- Local workspace: `/workspace/scratch/419974b1d059/Reynalds-OS`, branch `koinonia-marketing-integration-2026-09-16`.
- Preserve local uncommitted changes to this audit and `apps/web/public/assets/images/koinonia/about/about-hero-desktop.png`. The local GA4 status was reconciled into this remote audit update; the local worktree itself was not overwritten.
- Package-manager attempt had generated an allowBuilds placeholder block in pnpm-workspace.yaml; that side effect was removed. No dependency-policy change was committed.
