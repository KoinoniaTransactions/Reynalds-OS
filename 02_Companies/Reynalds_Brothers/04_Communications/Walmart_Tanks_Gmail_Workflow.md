# WalMart Tanks Gmail Workflow

## Scope

This workflow imports Gmail messages from the `WalMart Tanks` label and the `wmtanks@reynaldsbrothers.com` mailbox path into Reynalds Brothers Work Items.

Outlook is not part of this workflow.

## Filing Rules

Emails are filed as Work Item communications by the strongest available identifier:

1. Walmart or Sam's Club store number from `Location ID`, `Store/Club`, `Store#`, `store: WM`, `Walmart ####`, `Sam's Club ####`, `WM ####`, or `NHM ####`.
2. ServiceChannel work order or tracking number.
3. Purchase order number such as `PO# WM-0157`.
4. City and state from subject or body snippet.
5. Subject and sender as supporting evidence.

The importer records the Gmail message id, thread id when available, subject, sender, sent time, display URL, attachments, extracted store number, WO, PO, city/state, and match confidence.

## Review Queue

Emails go to review when the importer cannot safely identify the right job card. Review items must keep the original subject, sender, Gmail URL, detected PO if any, and review reason.

Examples from the 2026-07-29 live Gmail batch:

- `Frontline International Invoice(s) - 71768`: invoice present, no store/WO/PO exposed in Gmail search metadata.
- `Tracking Information For PO# WM-0157`: PO detected, no store/job card identified from metadata.
- `Re: Walmart - Request for Anti-Siphon Exemption`: program-level subject without store/WO/PO.

## Current Implementation

- Parser and matching rules live in `packages/core/index.ts`.
- Parser coverage lives in `packages/core/index.test.ts`.
- Seeded live testing cards live in `packages/database/prisma/seed.ts`.
- Operations cards render filed communications from `data.communications` and unmatched messages from `data.reviewQueue`.
- Parser coverage now includes ServiceChannel notes, Jotform completion forms, doubled `WM WM ####` Jotform subjects, LxRetail workflow updates, PAP notifications, full `Walmart ####` permit-coordination subjects, Sam's Club fee/proposal subjects, project-release subjects, pump-out requests, and tank-observation subjects.

The 2026-07-29 live test pulled the newest Gmail page for `label:"WalMart Tanks" -in:spam -in:trash`, filed 17 emails onto store/job cards, and placed 3 emails into review.

## Follow-On Indexing

The next pagination pass indexed through 600 Gmail message IDs and preserved `nextPageToken` `00774033279200523994` for continued read-only backfill. The sampled page-6 threads produced new filing candidates for stores 1068, 2214, 5480, 471, 5094, 3296, 1540, and 1168. Supplier sales-order threads that reference multiple stores stay in review until their attachments or invoice details can split them safely.

The following pass indexed through 700 Gmail message IDs and preserved `nextPageToken` `11510645988125521422`. The sampled page-7 threads added project-release, pump-out, plans/specs, AST testing, and Jotform completion candidates for stores 3425, 458, 814, 1621, 0533, 4621, 211, 551, and 5480. The Port Orange EQ-number thread remains review-only until a store number can be confirmed.

The next pass indexed through 800 Gmail message IDs and preserved `nextPageToken` `14607626984538127042`. The sampled page-8 threads added clean filing candidates for stores 4857, 582, 5094, and 6364. Multi-store billing and pump-out coordination threads were held for review so invoices and service windows can be split onto the right cards.

The next pass indexed through 900 Gmail message IDs and preserved `nextPageToken` `14861455326103467498`. The sampled page-9 threads added completion, project-release, UCO-tank, and AST-inspection candidates for stores 7658, 3702, 1283, 4702, 5802, 121, and 697. The Home Office and Transportation grease tank removal thread stays in review because it is a non-store, multi-location billing/project item.

The next pass indexed through 1000 Gmail message IDs and preserved `nextPageToken` `08665399679078636519`. The sampled page-10 threads added new cards for stores 1907, 2331, and Sam's Club 7676, enriched existing stores 3702 and 5802, and kept the Store 211 tank-observation thread marked as already filed.

The next pass indexed through 1100 Gmail message IDs and preserved `nextPageToken` `06189598496395367753`. The sampled page-11 threads added clean cards for stores 4801, 4201, 3826, 4843, 175, 2928, and Sam's Club 4794, enriched Sam's Club 4702, and sent the Frontline monthly statement plus Store 1118 incomplete city/state Jotform to review.

The next pass indexed through 1200 Gmail message IDs and preserved `nextPageToken` `03463701910574169314`. The sampled page-12 threads added clean cards for Sam's Club 8156 and Sam's Club 8224, enriched Store 3826 with the earlier LES pump-out/service coordination, marked the Store 121 thread already filed, and held Store 970 for a precise re-read because the sampled output was truncated.

The next pass indexed through 1300 Gmail message IDs and preserved `nextPageToken` `14633006943640916215`. The sampled page-13 threads added clean cards for Store 970 Picayune and Sam's Club 6521 Houma, kept the Store 4794 thread marked already filed, and sent the multi-store permitting-contract and route-notification emails to review for splitting.

The next pass indexed through 1400 Gmail message IDs and preserved `nextPageToken` `07992450762596571690`. The sampled page-14 threads added clean cards for Sam's Club 8263 Tulsa, Store 5172 Perry, and Store 690 Elizabethton. Two invoice/statement emails stayed in review because they span multiple stores or monthly supplier balances.

The next pass indexed through 1500 Gmail message IDs and preserved `nextPageToken` `05186283183254454331`. The sampled page-15 threads added clean cards for Stores 5780, 1185, 5960, 3535, and 4445, enriched Store 471 with non-standard tank drawings, kept Store 3826 marked already filed, and sent Store 5182 to review because its sampled city/state field omitted the state.

The next pass indexed through 1600 Gmail message IDs and preserved `nextPageToken` `15362772058712427822`. The sampled page-16 threads added clean cards for Stores 1090, 501, 4421, and NHM 7251, enriched Store 5172 with its ACC completion packet, marked Store 5960 already filed, and sent non-job program/vendor emails to review.
