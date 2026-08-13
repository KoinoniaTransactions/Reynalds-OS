# Reynalds Brothers Changelog

## 2026-07-29

- Promoted Reynalds Brothers from a simple shared operations queue into a dedicated company workspace route at `/reynalds-brothers`.
- Added the first Work Item engine helper for lanes, metrics, readiness checks, and fallback preview records.
- Added a dedicated Work Item API at `/api/reynalds-brothers/work-items` scoped to `wks_reynalds_brothers`.
- Added Work Item create and update API actions with timeline events.
- Added Work Item intake and operational update forms to the Reynalds Brothers workspace.
- Activated the Communication object for email/call/text evidence.
- Added the first email intake API and UI preview for analyzing, filing, or creating Work Items from email.
- Updated the active seed Work Items with customer update, media, permit, and billing-readiness fields.
- Preserved the separation between Koinonia and Reynalds Brothers as distinct company domains inside Reynalds OS.
- Specialized the first division build-out around Walmart ACC, UCO, and Pressure Washing work.
- Added approval-controlled intake rules: AI-created jobs start in Needs Approval and remain inactive until approved by an authorized office user.
- Added Lucernex, PO, permit, tank, oil-removal, CompanyCam, route region, and billing pass-off fields to Work Items.
- Replaced generic board lanes with division lanes: Needs Approval, Triage, Permits, Tanks, Scheduling, Field Work, Billing, and Complete.
- Added red-flag logic for missing PO, permit delays, tank assignment/receiving, coordinated oil removal, field proof, and billing approval.
- Updated email intake to use Walmart-style job naming, detect multi-store emails, and flag multi-store AI-created jobs for human review.
- Added job-specific checklist templates for ACC Level 1, ACC Level 2, ACC Tank Replacement, DIY Only, UCO Tank Replacement, and Pressure Washing.
- Added checklist progress, open required-item counts, and saveable checklist completion toggles to the Reynalds Brothers dashboard.
- Added smart checklist automation so completed checklist items can update PO, permit, tank, oil-removal, pressure-washing vendor, media, billing, and phase status fields.
- Expanded the Work Item update panel so office users can edit approval, Lucernex, PO, permit, tank, oil-removal, CompanyCam, pressure-washing vendor, completion, and billing approval fields directly.
- Added email intake action controls so classified emails can create Needs Approval jobs, file to matched job timelines, or remain visible in the unmatched review queue.
- Added approval action controls that let the current approver activate a drafted job into its correct first working phase or hold it for review.
- Added route-batch planning that groups approved active jobs by region and highlights ready versus blocked scheduling candidates.
- Added tank inventory package summaries for ACC, DIY, and UCO jobs with required tank lists, assigned serials, and scheduling readiness.
- Added field-proof summaries for CompanyCam, required photos/documents, manager details, signature status, completion date, and billing readiness.
- Added billing handoff summaries that show the current owner, completed approvals, pending approvals, and next action for the Shay to Jeremiah to Darren to Josh pass-off.
- Added a Reynalds Brothers-only brand styling layer inspired by reynaldsbrothers.com colors, scoped to the company workspace instead of the shared Reynalds OS or Koinonia stylesheet.
- Added first-trial pasted spreadsheet import so real ACC/UCO/PW rows can be previewed, validated, and created as Needs Approval jobs.
- Added local first-trial mode so imported rows, manual jobs, approvals, checklist changes, and status edits can be exercised in the browser when the live database is unavailable.
- Added service-line intelligence, evidence coverage, and a flattened WalMart Tanks review inbox to the Reynalds Brothers command console.
- Promoted the operations screen into a Reynalds Brothers OS command queue with work filters, selected job detail, communications, review queue, and readiness evidence.
- Added WalMart Tanks Gmail communication workflow for the `WalMart Tanks` / `wmtanks` Gmail label.
- Added parser-backed filing rules for store number, WO, PO, city/state, subject, and sender.
- Seeded the live testing model with the newest WalMart Tanks Gmail page: 17 filed communications and 3 review items.
- Updated operations cards to show filed communications and the unmatched email review queue.
- Deployed Sites version 3 of the Reynalds Brothers OS trial with all 11 first-page WalMart Tanks store cards, review inbox, filters, filed communication summaries, and JSON status/jobs endpoints.
- Indexed the next WalMart Tanks Gmail page through 600 message IDs and captured page-6 filing candidates for the next backfill wave.
- Deployed Sites version 4 with 19 store cards, 26 filed communications, 4 review items, and a 600-message Gmail index status.
- Expanded the WalMart Tanks parser tests for LxRetail, PAP, and full `Walmart ####` permit subjects.
- Aligned the Prisma seed with the hosted version-4 WalMart Tanks model, including the second-wave page-6 store cards and supplier review item.
- Indexed the next WalMart Tanks Gmail page through 700 message IDs and captured page-7 filing candidates plus the Port Orange review item.
- Expanded parser coverage for page-7 WalMart Tanks project release, pump-out, and tank-observation subjects.
- Deployed Sites version 6 with 27 store cards, 38 filed communications, 5 review items, and a 700-message Gmail index status.
- Aligned the Prisma seed with the hosted version-6 WalMart Tanks model, including page-7 store cards and the Port Orange review item.
- Indexed the next WalMart Tanks Gmail page through 800 message IDs and captured page-8 filing candidates plus multi-store review items.
- Promoted the earlier Port Orange EQ-number review thread onto Store 582 after the page-8 Supercenter thread confirmed the store number.
- Prepared the version-8 live snapshot with 30 store cards, 43 filed communications, 6 review items, and seed/API parity.
- Indexed the next WalMart Tanks Gmail page through 900 message IDs and captured page-9 filing candidates for stores 7658, 3702, 1283, 4702, 5802, 121, and 697.
- Expanded parser coverage for Sam's Club project-release subjects, bare store-number subjects, WM address subjects, and Puerto Rico completion forms.
- Prepared the next live snapshot with 37 store cards, 50 filed communications, 7 review items, and seed/API parity.
- Indexed the next WalMart Tanks Gmail page through 1000 message IDs and captured page-10 filing candidates for stores 1907, 2331, and Sam's Club 7676.
- Enriched existing Store 3702 and Store 5802 cards with earlier Gmail thread communications while leaving the Store 211 duplicate thread marked already filed.
- Expanded parser coverage for doubled `WM WM ####` Jotform subjects and Sam's Club fee-proposal subjects.
- Indexed the next WalMart Tanks Gmail page through 1100 message IDs and captured page-11 filing candidates for stores 4801, 4201, 3826, 4843, 175, 2928, and Sam's Club 4794.
- Enriched Sam's Club 4702 with the larger UCO tank installation thread and held page-11 supplier/incomplete-location items in review.
- Expanded parser coverage for lowercase `store #### City, ST`, parenthesized `#### City ST`, and curly-apostrophe Sam's Club subjects with WO numbers.
- Indexed the next WalMart Tanks Gmail page through 1200 message IDs, added Sam's Club 8156 and 8224 cards, enriched Store 3826, and preserved the next page token for continued backfill.
- Indexed the next WalMart Tanks Gmail page through 1300 message IDs, added Store 970 and Sam's Club 6521 cards, and held page-13 multi-store permit/route emails in review.
- Indexed the next WalMart Tanks Gmail page through 1400 message IDs, added Sam's Club 8263 plus Stores 5172 and 690, and held page-14 invoice/statement emails in review.
- Indexed the next WalMart Tanks Gmail page through 1500 message IDs, added Stores 5780, 1185, 5960, 3535, and 4445, enriched Store 471, and held Store 5182 for city/state review.
- Indexed the next WalMart Tanks Gmail page through 1600 message IDs, added Stores 1090, 501, 4421, and NHM 7251, enriched Store 5172, and held page-16 non-job emails in review.

---

## 2026-08-12/13 — Recovery Closure and CI Stabilization

- Audited the preserved `recovery/reynalds-brothers-main-workspace-20260731` branch instead of assuming it could be replayed wholesale.
- Confirmed that broad recovery replay was unsafe because recovery contained older/conflicting application state, including a root-page replacement that would regress current routing.
- Preserved the recovery branch as evidence for unresolved seed parity rather than treating it as canonical runtime truth.
- Reconciled the dedicated `/reynalds-brothers` workspace closure into the current target through PR #14, `Restore Reynalds Brothers workspace closure`.
- PR #14 restored/reconciled the RB route, workspace registry/navigation support, robots exclusion, Work Item documentation, active Communication object, company Brain/README/changelog continuity, and shared workspace helper integration.
- PR #14 intentionally excluded Koinonia changes, root-page replacement, seed-data parity changes, and wholesale recovery replay.
- Focused pre-merge validation for the RB closure passed: Prisma generation, 34/34 focused RB tests, web TypeScript validation, and diff checks.
- Repaired repository CI separately through PR #15, `Fix pnpm setup in CI`.
- Removed the duplicate pnpm version declaration so the root `packageManager` remains the single pnpm version source.
- Changed the web test script to non-interactive `vitest run` for deterministic CI execution.
- Allowed the intentionally testless database and design-system workspaces to pass recursive Vitest with `--passWithNoTests`.
- Added explicit `pnpm db:generate` after dependency installation and before tests/build because the Prisma schema lives in the database workspace and Client generation was not occurring automatically in CI.
- Local final validation passed `pnpm db:generate`, full repository `pnpm test`, and full repository `pnpm build`.
- Full local test validation included 83 actual tests across tested packages; the web workspace reported 75 tests.
- GitHub Actions run #41 passed the final CI repair end-to-end.
- PR #15 merged first at `c2e512335685040f7479bec5e99d58a72a40ee73`.
- The RB closure was then validated against the repaired target; GitHub Actions run #42 passed.
- PR #14 merged at `e84b4e610e6075f6f54907f277714a94b24dd7e6`.
- The current RB integration checkpoint is therefore `reynalds-brothers-only` at `e84b4e610e6075f6f54907f277714a94b24dd7e6`.

### Seed-History Clarification

The 2026-07-29 entries above record historical trial/recovery work and should remain preserved as history. They do **not** mean every richer recovery seed field is present in the current merged `packages/database/prisma/seed.ts`.

The preserved recovery checkpoint `b8f48e1892ff11d7e4179fa3a5daa755e5571a4b` contains richer seed fields such as `customerUpdateStatus`, `mediaStatus`, and `permitStatus` that are not all canonical current seed state.

Seed parity is intentionally unresolved. Do not delete the recovery branch until that parity review is explicitly completed and documented.

### Current Direction

The RB recovery/closure milestone is complete enough to leave the active critical path. After continuity documentation is synchronized, production attention returns to the Koinonia Transactions website. Reopen RB feature expansion or seed parity only through an explicitly approved focused task or a verified blocker.
