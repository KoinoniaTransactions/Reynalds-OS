# Koinonia Marketing M2 Foundation Checkpoint — 2026-09-16

Owner: Koinonia / Jeremiah
Status: M2 IMPLEMENTATION FOUNDATION VALIDATED — NOT PROMOTED

## Scope

Phase B marketing integration is being developed on `koinonia-marketing-integration-2026-09-16`, based on the exact approved production checkpoint `f6c821111ff17a602eee92db01998a0c52bf62f0`.

The legacy `koinonia-marketing-readiness` branch was audited but was not merged wholesale.

## Validated integration head

`499d90e418c5c7a7e4bf13d05b649e09b0905001`

Draft validation PR:

`#36 — M2 marketing attribution, consent, and CRM foundation`

PR #36 is intentionally draft and must not be merged before the later marketing owner gate.

## Implemented foundation

- explicit public marketing-route boundary;
- GA4 loading shell gated by analytics consent, a valid real Measurement ID, and approved public routes;
- Meta/TikTok browser pixel shells gated by advertising consent, valid real platform IDs, and approved public routes;
- authenticated Portal/client/employee/CRM routes excluded from marketing instrumentation;
- privacy choices for essential-only, analytics, and analytics + advertising;
- Global Privacy Control enforcement that disables targeted advertising;
- public marketing attribution limited to approved marketing routes;
- first-touch, latest-touch, and conversion-touch persistence;
- UTM capture including `utm_term`;
- click-ID persistence for `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, and `msclkid`;
- consultation scheduler-open event;
- consultation-type selection event;
- public contact-action event;
- `generate_lead` emitted only after the consultation API accepts the lead;
- Koinonia Relationship CRM persistence for attribution, consultation request, timeline event, and follow-up task;
- Relationship attribution normalization extended so Google/Microsoft campaign IDs are not discarded;
- consultation route tests mock the database and verify extended campaign IDs survive into CRM relationship data.

## Validation

Vercel preview deployment for exact head:

`dpl_A7SmkhDcKVdh2Dzaaa2qvXWAHScL`

Result: READY.

Verified in the Vercel production-style preview build:

- Prisma Client generation successful;
- no pending database migrations;
- workspace TypeScript package builds successful;
- Next.js production compilation successful;
- lint/type validity check successful;
- 34 static pages generated;
- current public routes plus the full recovered Portal route family remain in the build artifact.

GitHub Actions CI:

- run `35121403413` / CI #396;
- `pnpm install --frozen-lockfile` — success;
- Prisma generate — success;
- `pnpm test` — success;
- `pnpm build` — success;
- overall conclusion — success.

## Important correction during M2

An intermediate edit of `apps/web/lib/koinonia-relationship.ts` accidentally replaced more of the production module than intended and dropped the existing `suggestRelationshipQuickCapture` export. Vercel correctly caught the regression.

The module was then restored from the current production implementation and only the campaign-touch fields were extended. The repaired exact head above passed the full Vercel and GitHub CI validation.

This reinforces the governing rule: extend current production behavior; do not replace established modules with older branch copies.

## Release-discipline note

This checkpoint documentation was initially written to `koinonia-production` by mistake, which triggered a documentation-only production-target rebuild. No application file or marketing implementation was promoted. The production branch was immediately restored to the approved release commit `f6c821111ff17a602eee92db01998a0c52bf62f0`, and this checkpoint now lives on `main` instead.

## Still intentionally unproven / inactive

The following are NOT considered complete merely because the code exists:

- real GA4 property/web-stream identification;
- real GA4 Measurement ID configuration;
- observed GA4 page view in Realtime/DebugView;
- observed GA4 `generate_lead` after a controlled consultation submission;
- real Meta Pixel/Dataset ID;
- real TikTok Pixel ID;
- platform-side Meta/TikTok event verification;
- retargeting audience/exclusion configuration;
- `/coverage` campaign landing-page reconciliation;
- production marketing instrumentation.

No GA4, Meta, or TikTok identifier was invented or activated during M2.

## Next execution step

M3 — identify and prove the real Koinonia GA4 property/web stream and Measurement ID in preview before any production marketing activation.
