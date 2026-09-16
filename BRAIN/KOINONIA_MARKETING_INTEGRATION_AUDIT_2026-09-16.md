# Koinonia Marketing Integration Audit — 2026-09-16

Owner: Koinonia / Jeremiah
Status: M1 COMPLETE — selective marketing integration may proceed on this branch only
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

Next execution slice: M2 — selectively port/reimplement measurement, attribution, consent, and CRM persistence against the current production baseline.
