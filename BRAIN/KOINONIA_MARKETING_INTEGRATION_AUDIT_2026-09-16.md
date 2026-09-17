# Koinonia Marketing Integration Audit — 2026-09-16

Owner: Koinonia / Jeremiah
Status: M4 META PREVIEW PROOF COMPLETE — production activation remains gated
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

The ID remains available only through the preview fallback on `*.vercel.app`; this branch does not activate GA4 on the production hostname. Preview runtime and focused tests proved the accepted consultation path, but M3.4-M3.6 remain open until GA4 reporting visibly confirms the preview `page_view`, `generate_lead`, and separation of micro-events from leads.

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
- Next execution slice: finish outstanding GA4 reporting proof, then begin M5 TikTok account/Pixel identification and preview-only validation.
