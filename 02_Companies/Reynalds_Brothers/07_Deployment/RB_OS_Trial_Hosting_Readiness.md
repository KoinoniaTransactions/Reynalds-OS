# Reynalds Brothers OS Trial Hosting Readiness

## Trial Target

Host the Reynalds Brothers OS trial the same way as Koinonia Transactions: a hosted operations workspace with real business data, private trial access, and a repeatable deployment path.

## Current State

- Local app route: `/operations`.
- Live Gmail source: `WalMart Tanks` label / `wmtanks@reynaldsbrothers.com`.
- Gmail index progress on 2026-07-29: 500 message ids indexed and Gmail still reported more pages.
- Current app data state: partial live snapshot seeded into Reynalds Brothers Work Items.
- Current hosting state: Sites connector returned `missing_account_user_id`, so project creation/deployment is blocked until the account connection is repaired.
- Production build state: `pnpm --filter @reynalds-os/web build` completed successfully on 2026-07-29.

## Trial Requirements

1. Finish Gmail pagination for the full `WalMart Tanks` label.
2. Convert all Gmail metadata into Work Item communications using the parser rules.
3. File strong matches under job cards by store number, WO, PO, city/state, subject, and sender.
4. Preserve weak or unmatched messages in the review queue.
5. Replace seed-only snapshot data with a repeatable import path.
6. Add private hosted deployment once Sites account/project creation works.

## Hosting Notes

Do not create a second hosting path for Reynalds Brothers OS.

Use the same hosted-trial pattern intended for Koinonia Transactions. When Sites access is available:

1. Create or reuse a Sites project for Reynalds Brothers OS.
2. Persist the returned `project_id` in `.openai/hosting.json`.
3. Build the exact source state.
4. Save a Sites version.
5. Deploy privately for trial access.

Attempted trial project slug:

`reynalds-brothers-os-trial`

The create-site request failed before a project id was returned, so no `.openai/hosting.json` project id has been persisted yet.

## Live Data Contract

The app exposes live-data status at:

`/api/reynalds-brothers/live-data`

This endpoint reports indexed Gmail volume, currently filed communications, review queue count, store coverage, and hosting readiness.
