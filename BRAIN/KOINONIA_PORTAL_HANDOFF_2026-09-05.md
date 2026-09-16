# Koinonia Realtor Portal — AI Handoff

**Recorded:** 2026-09-05 15:26 MT

This is an **isolated portal-workstream handoff**. It is additive. It does not replace the repository's central, marketing, or commercial website handoffs.

## Parallel handoffs that MUST be preserved

Other AI workstreams updated continuity documentation on 2026-09-05. A future AI must read and preserve those sources rather than treating this portal file as the only project truth.

Known parallel handoff commits include:

- `ee53949854ecfa3a26501ff479b63dc7c0627568` — Refresh central AI handoff for current Koinonia state (`BRAIN/HANDOFF.md`)
- `c0dd5fc9f63692c3d7ad852f94f3ee9ef2d90a9d` — Add Koinonia marketing readiness AI handoff
- `ab8d4f67f82a2eda8094f356201203b8382b6846` — Register current Koinonia marketing handoff sources
- `4a0cf140192227fce701a02f3e74a40f9196a104` — Point repository start guide to current Koinonia handoff
- `fde646d652973e125368a4d60a07f2eaa06c416f` — Add unfinished Koinonia commercial website AI handoff
- `488abe5eb20e88e19e2fa87c8d3612e04379b154` — Clarify unfinished website preview and commercial handoff state

**Do not overwrite those files from the portal branch.** If central continuity docs eventually need reconciliation, merge/reconcile all workstreams intentionally from the latest source versions.

---

# 1. Exact portal repository state before this handoff commit

Repository:

`KoinoniaTransactions/Reynalds-OS`

Portal feature branch:

`chatgpt/koinonia-transaction-intake-redesign`

Open PR:

`#22 — Start transaction-first buyer/seller intake redesign`

PR state:

- open
- draft
- mergeable
- base: `koinonia-production`

Exact portal feature head immediately before this documentation commit:

`f3c9020f0cce2bde375096fadbd304c69cd09f07`

Clean Vercel Preview for that code head:

- deployment: `dpl_ECMpmgaF8kppSZBtFGr2dLTR3XVi`
- URL: `https://reynalds-os-p7oh9iv7n-koinonia3.vercel.app`
- state: READY

GitHub CI for that code head:

- run ID: `33654796747`
- run number: `#232`
- conclusion: SUCCESS

Production branch at that checkpoint:

`koinonia-production` = `6644802cce54c4e295df7d98895b1493fc79a337`

Production message:

`Redirect retired appointments page to consultation scheduler`

Important: parallel public-site/marketing work exists on other branches. Do not reset, merge, or deploy production casually. PR #22 stays draft until portal QA/E2E, branch re-sync, and explicit owner approval.

The PR body is stale compared with the current implementation and must be rewritten before final review/merge.

---

# 2. Dominant product rule

The Realtor portal is **not** a portal where the Realtor manages the transaction.

It is a **transaction-management service that happens to have a portal**.

Controlling rules:

> Koinonia interprets. The Realtor responds only when Koinonia cannot proceed without them.

> Never ask the Realtor for information that Koinonia can obtain from an uploaded document, an existing transaction record, or another party/source Koinonia is responsible for coordinating.

> Koinonia absorbs the complexity. The Realtor experiences relief.

> Send us what you have. We'll take it from here.

Client/Realtor side should be calm, minimal, guided, progressive-disclosure oriented.

Staff side may be dense, operational and detailed.

Do not leak internal AI confidence mechanics, requirement-checklist complexity, or staff workflow into the Realtor experience unless a real decision is required.

---

# 3. Current visual / UX direction

User rejected earlier portal passes as too large, blocky, card-heavy and "90s" feeling.

Current design direction:

- smaller typography
- more useful information per screen
- fewer large cards
- thinner rows/dividers
- fewer visible buttons
- secondary actions under compact contextual `•••` menus
- secondary information collapsed by default
- Activity/history available but not open by default
- property/address is the primary transaction anchor
- quiet status language
- one obvious next action at a time
- modern SaaS/workspace density, not marketing-site typography

## Realtor dashboard implemented

- compact transaction rows
- property first
- client/status/closing information visible without opening file
- small `Needs you` indicator when applicable
- compact filters
- modern live search/autocomplete while typing
- address/client matching
- keyboard navigation for suggestions
- single primary `Start a file`
- slim attention treatment
- compact per-transaction `•••` quick actions

## Transaction page implemented

- compact property/title header
- quiet status context
- compact `Send document`
- secondary navigation under `•••`
- compact Koinonia Overview
- facts shown as thin inline row instead of giant mini-cards
- recent/current files shown first
- older files under `View more`
- Activity collapsed by default
- duplicate bottom upload CTA removed

## Document Center / intake visually tightened

- smaller headings
- thin library/document rows
- reduced padding
- fewer boxed surfaces
- upload behaves like a tool, not a giant destination page
- transaction-scoped upload can be launched directly from dashboard quick actions

## Mobile auth intentionally postponed

User tested Preview on iPhone and Google/Clerk returned a 400 during OAuth. Cause is Preview `*.vercel.app` + current Clerk Google OAuth domain boundary using production-format keys.

Decision: **do not change Clerk Preview credentials right now.** Mobile Preview auth is intentionally deferred. Do not replace working production Clerk credentials blindly.

---

# 4. Immutable document review/versioning requirement

User requires Koinonia to send Realtor documents for easy review, approval or change request.

Governing rule:

> Never overwrite the prior document. Create a new version and preserve the history.

Distinction:

- **Versions** = revisions of the same document instance
- **Sequences** = separate contractual documents/events over time

Example:

- Amend/Extend #1 v1 → v2 → v3 = one sequence with revisions
- Amend/Extend #2 v1 = separate event/root, not another version of #1

Existing schema already supports this, no migration required:

- `Document.versionNumber`
- `versionLabel`
- `previousDocumentId`
- `supersededByDocumentId`
- `replacementReason`
- `supersededAt`
- `lifecycleState`

Current replacement flow creates a new record/version, links it to prior version, supersedes old version, preserves history, and keeps one clear current active version.

Client pages should surface current active versions by default; history is secondary.

Realtor authorization was expanded so staff-created, client-visible documents can be reviewed/downloaded through transaction access rather than ownership alone.

Relevant routes include:

- `/api/portal/documents/[id]/approval`
- `/api/portal/documents/[id]/replacement`
- `/api/portal/documents/[id]/status`
- `/api/portal/documents/[id]/download`

Canonical stored status remains `Ready for Client Review`; staff-facing language is Realtor-specific such as `Send to Realtor for Review` / `Realtor Requested Changes`.

---

# 5. Inline-first Realtor document review

User explicitly rejected a download-first workflow.

Current intended/implemented review experience:

- document is previewed inline in the portal
- exact Koinonia question/instruction appears beside it
- Realtor gets a small set of clear choices
- correction details are progressive disclosure, appearing only when needed
- opening larger/downloading remains optional
- Koinonia owns document revision; Realtor should not have to manually edit Koinonia-generated documents

Typical visible decision language:

- `Looks right`
- `Needs a correction`

---

# 6. Attention-state logic and fixes

A major QA bug was found:

Dashboard marked a transaction `Needs attention`, but the transaction page could still say `Everything is moving forward` and gave no explanation or resolution.

Rule now:

Every Realtor-facing Attention state must answer:

1. What is wrong?
2. What do you need me to decide/do?
3. What happens after I answer?

## Document mismatch case

Stored extraction can contain:

- `documentMatch = mismatch`
- `documentMatchReason`
- source document ID/type

Transaction page should surface the reason and a direct decision:

- `Yes, keep it`
- `No, wrong document`

`No, wrong document` removes the wrong source document from this transaction, records timeline/audit history, clears stale attention and tells Realtor to send the correct document when available.

## Missing transaction identity after Keep

Second QA bug: clicking Keep could return backend "more information needed" with no input fields.

Correct behavior now:

If the document legitimately belongs to the transaction but identity facts are still missing, Koinonia asks only for facts it cannot derive.

Potential missing facts:

- client name
- property address
- buyer vs seller represented side
- pre-contract vs under-contract stage

Two Realtor paths:

1. `Save and continue` / enter missing facts now
2. `I'll send another document later`

If facts are entered, extraction state updates and Realtor attention resolves.

If Realtor chooses later, this leaves the Realtor `Needs attention` queue and becomes a Koinonia waiting state. Do not keep nagging the Realtor for information they already said will arrive in another document.

Relevant endpoint:

`apps/web/app/api/portal/transactions/[id]/attention/route.ts`

Supported actions:

- `remove_mismatched_document`
- `provide_missing_facts`
- `wait_for_future_document`

---

# 7. Obligation architecture

Do not rebuild the system around a static document checklist.

Core model:

`source → due date/status → evidence/completion → exception/change → current state → history`

Documents are evidence attached to obligations/events.

Current obligation concepts/states include baseline, scheduled/upcoming, due soon, satisfied, passed-needs-review, superseded, not applicable.

Recurring Amend/Extend rules:

- zero/many allowed
- amendments change only what they actually change
- history preserved
- late-arriving initial contract does not imply amendment required
- passed deadline does not automatically mean amendment required

Core files include:

- `apps/web/lib/colorado-contract-deadlines.ts`
- `apps/web/lib/transaction-obligations.ts`
- `apps/web/lib/transaction-obligation-persistence.ts`
- `apps/web/lib/transaction-obligation-evidence.ts`
- `apps/web/lib/transaction-obligation-resolution.ts`
- `apps/web/lib/transaction-obligation-dependencies.ts`
- `apps/web/lib/transaction-portal-projections.ts`

## Conditional obligations

Resolution deadlines remain conditional until the triggering objection/event occurred.

Examples:

- inspection resolution depends on inspection objection
- title resolution depends on record/off-record title objection
- appraisal resolution depends on appraisal objection
- due diligence resolution depends on due-diligence objection
- survey/ILC resolution depends on survey/ILC objection

Latest CI exposed an old test expecting title-resolution due today without a title objection. The test was corrected to use an unconditional title deadline; production conditional behavior was preserved.

---

# 8. Realtor top-of-file overview

Every Realtor file should answer in roughly five seconds:

- where does this stand?
- is everything okay?
- do you need anything from me?
- what happens next?

Use structured transaction truth rather than AI guessing.

Relevant helper exists:

`buildRealtorTransactionOverview`

Desired status language:

- On Track
- Need Something From You
- Attention Needed
- Closing Soon
- Closed

Follow-up still worth verifying: ensure the literal top transaction page is fully driven by obligation-aware Realtor projection and active review requests, not only generic `buildPortalWorkspaceSummary` truth.

Do not use paid OpenAI merely to render this overview.

---

# 9. OpenAI extraction / cost controls

Current extraction adapter:

`apps/web/lib/openai-transaction-extraction.ts`

Behavior includes:

- server-side OpenAI Files with `purpose=user_data`
- temporary provider file expiration (~3600 sec)
- Responses API structured JSON
- `store: false`
- best-effort provider file deletion
- code default model `gpt-5.6-luna`

User funded API with a small prepaid balance and wants cost control.

Rules:

- no paid AI for deterministic UI tests
- keep auto-reload off unless user changes it
- confidence/classification internals belong backstage
- high confidence → proceed quietly
- medium confidence → staff review
- genuine ambiguity → narrow Realtor clarification

---

# 10. Live search

User rejected search requiring Enter before seeing results.

Implemented behavior:

- suggestions appear while typing
- property address and client name are matched
- address matches prioritized
- click/tap result directly
- keyboard arrows + Enter supported
- Enter still supports full filtered view

Do not regress to a plain server-submit-only search form.

---

# 11. Transaction quick actions

User wants Realtors to hand Koinonia work from the transaction list without opening every file.

Implemented foundation:

Each transaction row gets compact `•••` quick actions rather than several bulky visible buttons.

Key actions:

- `Send document`
- `Open file`
- `Email documents` only when inbound mail is fully configured

`Send document` is transaction-scoped. It routes to Document Center with the transaction ID and existing upload component reads `relatedObjectId`, so Realtor does not select the transaction again.

Do not turn this back into a generic upload flow requiring duplicate identification.

---

# 12. Transaction-specific inbound email architecture

User requirement:

Every new transaction gets a unique email address. Realtor can email/forward documents directly to that address. System receives email, knows the transaction, ingests attachments, classifies/files them and updates transaction state.

Architecture rule:

**Use recipient address as transaction routing key. Do not ask AI to guess the transaction when the recipient already identifies it.**

Address shape:

`tx-<transaction-key>@files.koinoniatransactions.com`

Address utility:

`apps/web/lib/transaction-inbound-email.ts`

No schema migration needed for deterministic addressing.

## Provider decision

Preferred provider: Resend inbound receiving.

Reason:

- fits current Next.js/Vercel runtime
- webhook stays inside Reynalds OS
- app fetches received message/attachments through HTTPS
- no second Cloudflare Worker runtime required

Do not switch to Cloudflare Email Workers without a new reason.

## Planned dedicated inbound subdomain

`files.koinoniatransactions.com`

Keep it separate from normal Google Workspace root-domain mail.

## Application-side inbound pipeline already built

Current feature branch contains:

1. deterministic transaction recipient generation
2. recipient → transaction ID resolution
3. Resend inbound HTTPS client (no SDK dependency required)
4. Svix-style webhook signature verification
5. webhook endpoint: `apps/web/app/api/webhooks/resend/inbound/route.ts`
6. `email.received` parsing
7. received email/attachment metadata fetch
8. attachment download
9. supported-file filtering
10. inline/signature-image noise handling
11. malware scanning through existing portal scanner
12. shared Cloudflare R2 persistence
13. workspace/system R2 persistence without fabricating logged-in actor
14. Document creation with honest inbound/system attribution
15. timeline/audit traceability
16. idempotency so webhook retry cannot duplicate documents
17. classification through existing Koinonia extraction engine
18. high-confidence → quiet Koinonia handling
19. ambiguity/mismatch → staff review rather than immediate Realtor burden
20. dashboard `Email documents` remains hidden unless full inbound stack is configured

Inbound events should not impersonate the Realtor. System/null actor is appropriate; sender email belongs in metadata/audit.

## Required environment values for live receiving

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `KOINONIA_TRANSACTION_INBOUND_DOMAIN=files.koinoniatransactions.com`

Full automatic classification also requires already-used R2/OpenAI settings.

## Tests

Deterministic tests added for:

- transaction inbound email address generation/routing
- Resend webhook signature verification

Both passed in CI #232.

## Safety gating

Do not show transaction email addresses to Realtors until all are real:

- receiving domain verified
- provider API key configured
- webhook signing secret configured
- webhook registered
- storage available

Current UI intentionally hides `Email documents` until full configuration is detected.

---

# 13. Exact point where this work paused

The application-side inbound email code is built and validated.

Work then moved into the **one-time external Resend + Cloudflare receiving setup**.

The user said `proceed`.

Current next browser action:

1. Open Resend Domains.
2. Add `files.koinoniatransactions.com`.
3. Enable Receiving.
4. Resend displays an inbound MX record.
5. In Cloudflare for `koinoniatransactions.com`, add that MX record on the `files` subdomain.
6. Use the exact current Mail Server value Resend displays; do not hardcode an old docs example.
7. Verify receiving domain in Resend.
8. Create Resend webhook for `email.received`.
9. Final webhook endpoint should be production URL ending `/api/webhooks/resend/inbound`.
10. Capture webhook signing secret and provider API key securely.

Critical warning:

**Do not register the final production webhook against a temporary Preview URL.** Final webhook belongs on production after this portal branch is approved/merged/redeployed.

At handoff there was no connected Resend or Cloudflare DNS plugin/tool available to perform provider/DNS account setup directly. User must do the browser configuration or connect an appropriate integration.

If the user reaches a Resend screen showing DNS/MX values, use that exact screen to guide Cloudflare entry.

Do not ask the user to paste secrets into repository files.

---

# 14. Expected inbound operational flow after activation

Realtor sends/forwards email to unique transaction address
→ Resend receives it
→ verified `email.received` webhook reaches Reynalds OS
→ recipient identifies exact transaction
→ app fetches attachments
→ scan + R2 store
→ create Document record
→ classify/extract
→ update transaction/timeline/operations
→ high confidence: no human action
→ medium confidence: staff review
→ genuine ambiguity: narrow Realtor question

Product experience:

**Realtor sends documents. Koinonia sorts and manages them.**

---

# 15. Intentionally NOT complete/live

Do not claim any of these are live unless later evidence proves otherwise:

- inbound MX for `files.koinoniatransactions.com` not yet confirmed verified
- Resend API key not yet confirmed active for this feature in Vercel
- Resend webhook secret not yet confirmed active
- final production webhook not registered yet
- transaction email addresses intentionally hidden
- mobile Preview auth intentionally postponed
- PR #22 still draft
- final production re-sync not complete
- final synthetic E2E not complete
- PR body stale

---

# 16. Recent implementation/build lessons

## Document lifecycle typing

Intermediate build failed because Prisma lifecycle state was generic string where document grouping expected canonical lifecycle type. Fix was to normalize with `getPortalDocumentLifecycleState(document)` before version grouping.

## Inbound webhook response collision

First webhook route build failed because response object specified `received` twice (acknowledgement and attachment count). Fixed before clean `f3c9020...` checkpoint.

## Scoped upload TypeScript/precedence issue

An intermediate transaction-scoped upload change had a precedence/type issue. It was corrected; current scoped upload is clean.

Do not reintroduce those intermediate forms.

---

# 17. Stable foundations

Protected document storage:

- R2 bucket: `koinonia-portal-documents`
- existing portal document upload/storage path is canonical
- inbound email extends the same storage/security path

Canonical database schema:

`packages/database/prisma/schema.prisma`

Canonical app:

`apps/web/`

Design system:

`packages/design-system/`

Governance:

- search first, extend second, create last
- recover before reinventing
- shared `RosObject`/platform foundations before parallel systems
- permissions on writes
- meaningful changes produce timeline/audit evidence

---

# 18. Colorado legal/form caution

Colorado deadline registry and obligation architecture exist, but do not claim broad legal completeness without current authoritative Colorado DRE verification.

Preserved rules:

- blank/N/A/Deleted deadline values do not create obligations
- time-only fields are not standalone deadline-date obligations
- amendments preserve history rather than overwrite it

Re-verify current mandatory forms before expanding exact legal semantics.

---

# 19. Synthetic E2E documents from prior work

Synthetic NOT LEGALLY VALID test files were created in a prior working environment under `/mnt/data/koinonia_test_docs/`:

1. `01_initial_purchase_contract.pdf`
2. `02_amend_extend_1_inspection.pdf`
3. `03_amend_extend_2_appraisal_loan.pdf`
4. `04_amend_extend_3_closing.pdf`
5. `05_seller_listing_agreement.pdf`
6. `06_seller_property_disclosure.pdf`
7. `07_hoa_association_documents.pdf`
8. `08_lead_based_paint_disclosure.pdf`
9. `09_late_arriving_initial_contract.pdf`

Use #1→#4 for recurring amendment/obligation/version E2E and #9 for late-baseline behavior if still available. They are not real documents.

---

# 20. Next portal actions in order

## Immediate inbound-email setup

1. Add `files.koinoniatransactions.com` to Resend and enable Receiving.
2. Add Resend-provided inbound MX record in Cloudflare under `files`.
3. Verify domain in Resend.
4. Configure `email.received` webhook for eventual production `/api/webhooks/resend/inbound`.
5. Add API key/webhook secret/inbound domain securely to intended Vercel environment.
6. Redeploy.
7. Verify `Email documents` becomes visible only when full stack is configured.
8. Send one controlled real test email with safe PDF to a generated transaction address.
9. Verify end to end: recipient routing → webhook → attachment fetch → scan → R2 → Document → classification → timeline → staff/Realtor state.

## Then portal completion

10. Preserve compact visual system; only polish friction found in testing.
11. Verify top overview is fully obligation-aware via `buildRealtorTransactionOverview`.
12. Verify Realtor review notifications appear in dashboard/UI.
13. Verify staff receives signal when Realtor requests document changes.
14. Verify separate Amend/Extend events create separate root sequences, not replacement versions.
15. Run synthetic contract → amendment sequence → review/version loop → obligations → overview E2E.
16. Resume mobile auth only if owner explicitly chooses to.
17. Rewrite PR #22 body to actual implementation.
18. Re-sync feature branch with current `koinonia-production` immediately before final merge, preserving independent marketing/public-site changes.
19. Full Preview QA.
20. Only remove draft / merge / deploy production with explicit owner approval.

---

# 21. User working preferences relevant to takeover

- `Proceed` / `Next` means continue autonomously.
- Prefer decisive execution and minimal unnecessary questions.
- Repository truth beats chat memory.
- Do not touch unrelated projects/branches; other AIs are working in parallel.
- Finish AI-driven portal first; non-AI parser/fallback is a later separate project.
- User is cost-conscious with OpenAI API.
- Realtor experience should mean fewer controls, less homework, more Koinonia ownership.

---

# 22. Takeover checklist

Before any new portal code change:

1. Read `START_HERE.md` from the current relevant branch/state.
2. Read the latest central `BRAIN/HANDOFF.md` from its current branch.
3. Read the marketing-readiness handoff.
4. Read the commercial website handoff on `main`.
5. Read this portal handoff completely.
6. Inspect PR #22 and verify its actual current head; this documentation commit advances head beyond `f3c9020...`.
7. Verify Vercel/CI for current portal head.
8. Verify current `koinonia-production` head before any re-sync.
9. Do not assume Resend/DNS setup is complete unless runtime/environment evidence or owner confirmation proves it.
10. Resume at inbound-domain setup unless owner changes priority.

**Repository truth is multi-workstream. Preserve all current handoffs; reconcile, never erase.**