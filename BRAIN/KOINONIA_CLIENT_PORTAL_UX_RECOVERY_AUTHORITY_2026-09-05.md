# Koinonia Client / Realtor Portal UX Recovery Authority

Recorded: 2026-09-05
Status: ACTIVE RECONCILIATION CONTROL
Applies to: `integration/koinonia-canonical-reconciliation-20260905`

## Purpose

This file prevents the reconciliation effort from restoring an older, bulkier client portal over the most advanced Realtor-facing portal work.

The client portal is not merely a set of authenticated routes. It is the Realtor-facing operating experience for handing work to Koinonia with as little friction as possible.

## Canonical client UX source

The canonical Realtor-facing portal implementation is the later `chatgpt/koinonia-transaction-intake-redesign` lineage.

- Latest executable portal code checkpoint: `f3c9020f0cce2bde375096fadbd304c69cd09f07`
- Documentation head that preserves the same code plus the Sept. 5 portal handoff: `3507bbe595a562f242fd5e981266b8697dea334d`
- Portal handoff: `BRAIN/KOINONIA_PORTAL_HANDOFF_2026-09-05.md`

The two commits from `f3c9020...` to `3507bbe...` only add portal continuity documentation / START_HERE routing; they do not replace the executable client UX.

## Verified simplification progression

The client dashboard history contains the exact later simplification sequence:

1. `d3e961b510a0dce403f15b3620750dd7d58292af` — `Simplify Koinonia client dashboard around transactions`
2. `604e1096e8886de824a5e94422450c1b586783df` — `Simplify client transaction dashboard controls`
3. `34e1be21510dafe771fcdd52c9a7d71ba5a2e9e7` — `Modernize Realtor dashboard around transaction list`
4. `8382477678669db7dd8aab1aa2f71c2d1fb65b50` — `Use live transaction search suggestions`
5. `90e6004c4bf2cfe6d7559bfc0b48edd8ac64dad9` — `Add transaction quick actions and inbound email address`
6. `c6b1f2a432085ff81b1d37f937ec9296abe656f8` — `Hide transaction email until inbound service is fully configured`

These later commits supersede the large/card-heavy Aug. 15/Aug. 18 client dashboard presentation.

## Non-negotiable Realtor UX rules

The Realtor/client side must remain calm, minimal and service-oriented.

- Koinonia manages the transaction; the Realtor should not be forced to manage Koinonia's internal workflow.
- Property/address is the primary transaction anchor.
- Smaller typography and modern workspace density.
- Thin rows/dividers instead of giant cards.
- Fewer visible buttons.
- Secondary actions belong under compact contextual `•••` menus when appropriate.
- One obvious primary action at a time.
- `Start a file` remains a simple primary action.
- Attention appears only when Koinonia genuinely cannot proceed without the Realtor.
- The dashboard should surface what needs the Realtor and otherwise communicate that Koinonia has the work moving.
- Search suggestions appear while typing and match property address / client name.
- Realtor-facing status language stays quiet and human.
- Activity/history and secondary detail stay collapsed until needed.
- Do not expose staff workflow complexity, AI confidence internals, or checklist noise to the Realtor.

## Canonical main-page model

The later dashboard is transaction-first:

- `Your transactions`
- active / closing soon / closed filtering
- live search/autocomplete
- compact property-first transaction rows
- client, status and closing date visible without opening the file
- small `Needs you` indicator when required
- slim attention strip
- calm `Nothing needs you right now` state
- compact per-transaction `•••` quick actions

Do not restore the older dashboard that displayed multiple large summary cards, large showing panels, access-request panels, billing cards and other bulky controls directly on the main client page.

## Seamless document handoff rule

The Realtor should be able to hand a document to Koinonia without duplicate transaction identification or unnecessary form work.

Canonical transaction quick actions include:

- `Send document`
- `Open file`
- `Email documents` only when the inbound-email stack is fully configured

`Send document` is transaction-scoped. The dashboard passes `relatedObjectId` into the existing document intake flow so the Realtor does not select or type the transaction again.

The upload tool:

- recognizes the transaction from `relatedObjectId`;
- offers `Let Koinonia identify it` as the default document-type path;
- asks only for the file and optional useful context;
- records the requested action as `Review, identify, and file this document to the transaction`;
- confirms that Koinonia is reviewing/filing it;
- returns the Realtor to the transaction after upload.

The backend must preserve the same document as a workspace-visible record for Koinonia staff/admin, tied to the transaction, with timeline and audit history. The Realtor should not need to separately notify admin that the document was uploaded.

## Transaction-specific inbound email

The later portal architecture gives each transaction a deterministic email address:

`tx-<transaction-key>@files.koinoniatransactions.com`

The recipient address is the transaction routing key. Do not ask AI to guess the transaction when the recipient already identifies it.

The intended flow is:

Realtor forwards/emails document -> inbound provider receives it -> transaction is identified from recipient -> supported attachments are scanned/stored -> Document record is created -> transaction timeline/audit is updated -> Koinonia classifies/files/reviews it.

Do not display the transaction email to Realtors until the receiving domain, provider API key, webhook signing secret, webhook registration and required storage are all verified.

## Staff/admin side

The employee/admin portal may remain denser than the Realtor portal.

Client uploads must appear in the staff document workspace / transaction context so Koinonia can review, classify, replace/version, request Realtor review, send packages and preserve audit history.

Do not simplify the Realtor experience by discarding the richer admin data or workflow behind it.

## Recovery rule

During R1/R2/R3 reconciliation:

1. Restore authentication, permissions and schema as infrastructure.
2. When restoring client-facing portal pages, use `f3c9020...` / `3507bbe...` as the client UX authority.
3. Older Aug. 15/Aug. 18 portal UI is reference/backend archaeology only where the later lineage does not supersede it.
4. Recover the transaction-first dashboard, quick actions, transaction-scoped document intake, live search, compact transaction page and inbound-email architecture together as a coherent client experience.
5. Preserve current September commercial truth from `main`; do not revive old service names, prices or public package assumptions from the portal branch.
6. Validate client-to-admin document handoff end-to-end before marking the portal recovered.
7. Production remains owner-gated.

## Acceptance test for the recovered client portal

A Realtor should be able to sign in and, from the main portal experience:

- immediately see their transactions without navigating through large dashboard cards;
- tell whether Koinonia needs anything from them;
- search/find a file quickly;
- start a new file;
- use a compact transaction menu to send a document or open the file;
- send a document already tied to the correct transaction without re-identifying it;
- receive a simple confirmation while the document becomes available to Koinonia staff/admin;
- optionally email documents to a transaction-specific address once that infrastructure is verified;
- avoid seeing internal operational complexity unless a genuine Realtor decision is required.
