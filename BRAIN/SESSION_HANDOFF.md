# SESSION HANDOFF — Koinonia Marketing System

Status: Active Session Handoff  
Repository: Reynalds OS  
Current Branch: `feature/app-shell-foundation`  
Primary Business Priority: Koinonia Transactions website launch and client-acquisition system

---

# 2026-07-29 Current Session Update — Portal Login Production Readiness

Status: Source scaffold advanced / not production-live
Branch: `feature/app-shell-foundation`
Local state: checkpoint completed and pushed after each verified production-readiness slice
Push state: Jeremiah approved committing and pushing all completed portal-readiness work in the active thread

## Completed In This Session

- Added Clerk-managed auth wiring, provider-aware login, and protected portal routes.
- Added portal identity schema fields, `PortalInvitation`, and `AuditEvent`.
- Added `/employee/access` as a protected staff access workspace preview.
- Added `/api/portal/invitations` for invitation record list/create.
- Added clean JSON auth/configuration failures for portal APIs.
- Added optional Clerk provider invitation handoff through `sendProviderInvitation`.
- Added first-login invitation acceptance that can create the Koinonia user from an approved invitation.
- Explicitly treats pending Clerk sessions as signed out.
- Seeds all approved Koinonia portal role names and shared permission lists.
- Added scanner-gated portal document uploads and authorized private document downloads.
- Added protected showing, external access, and billing setup request workflows.
- Added explicit client/staff assignment fields to `RosObject`.
- Added `/employee/readiness` as the live production-readiness oversight view.
- Added `/employee/review` as the protected rules-based Staff Review Center for missing assignments, document gaps, billing setup, access needs, showing authorization, and stale work.
- Hardened readiness checks so placeholder, example, fake, or test-shaped Clerk keys do not count as production-ready.
- Hardened document upload readiness so live uploads require an absolute private storage path.
- Added payment processor readiness gates for provider name, public HTTPS setup URL, and webhook secret.
- Added invite acceptance readiness gates requiring one accepted client invite and one accepted staff invite before login is treated as production-ready.
- Added social login readiness gates for approved Clerk OAuth providers and social invite-matching verification.
- Added AI review readiness gates for provider configuration, approved prompts, privacy rules, citations, audit logging, and human approval.
- Added `/employee/launch` as a protected staff launch checklist for provider setup, database access, service workflow QA, document handling, billing/payment setup, optional social login, optional AI review, and final dry-run proof.
- Connected `/employee/launch` to the live readiness report so technical gates show Ready, Needs Attention, Blocked, or Manual Proof Needed from the same source as `/employee/readiness`.
- Added `/api/portal/launch-proof` and a proof form on `/employee/launch` so Owner/Operations-style staff can record safe manual proof with audit and timeline history.
- Added `/api/portal/work-items/[id]/assignment` and live assignment controls on `/employee/dashboard` so authorized staff can assign primary and backup owners for live portal work items.
- Added `/client/work/[id]` and `/employee/work/[id]` so scoped work items have detail pages with safe metadata, attached documents, timeline summaries, and staff assignment controls.
- Added `/api/portal/documents/[id]/status` and staff status controls on `/employee/documents` so live documents can move through review, approval, sending, revision, and archive states with audit/timeline history.
- Added `/api/portal/documents/[id]/approval` and client approval/revision controls on `/client/documents` so client-owned review documents can receive auditable Realtor responses.
- Added `/api/portal/documents/[id]/replacement` and staff replacement controls on `/employee/documents` so newer versions can be uploaded without overwriting prior document records.

## Recent Pushed Commits

- `0837948` Add portal readiness view and email intake oversight
- `b438c3d` Add Reynalds Brothers operations workspace
- `4d9c7ae` Add portal assignment fields to work objects
- `1c6b423` Connect client dashboard work items
- `5ce3fee` Require malware scan for portal document uploads
- `f6a3bd9` Add authorized portal document downloads
- `5a6765e` Add portal billing setup requests
- `e0c114c` Add portal work detail pages
- `0183b04` Add portal document status workflow
- `45faa55` Add client document approval responses

## Verified Locally

- `pnpm --filter @reynalds-os/auth test`
- `pnpm --filter @reynalds-os/web exec vitest run`
- `pnpm --filter @reynalds-os/database build`
- `pnpm --filter @reynalds-os/web build`
- Production preview route check for `/employee/access` with mock auth allowed returned 200.
- Production preview route check for `/employee/readiness` with mock auth allowed returned 200.
- Production preview route check for `/employee/review` with mock auth allowed returned 200.
- Production preview with mock auth disabled returned clean 503 JSON from `/api/me` and `/api/portal/invitations`.

## Still Not Production Ready

- Live Clerk production keys are not configured in deployment.
- Staff MFA must be enabled and verified in Clerk.
- Docker/Postgres was unavailable locally, so full invitation create/list/send/acceptance could not be tested against a live database.
- A real Clerk invite email must be sent and accepted by a test client and a test staff user.
- Full readiness verification now blocks until those accepted client/staff invitations are present in the production database.
- If social login is enabled, full readiness verification blocks until approved providers are listed and social invite matching is marked verified.
- If AI review is enabled, full readiness verification blocks until provider, prompts, privacy, citations, audit logging, and human approval controls are marked verified.
- Staff should use `/employee/launch` alongside `/employee/readiness` before deciding that real client portal activity can start.
- `/employee/launch` now shows live readiness-derived status for technical gates, but service workflow QA and end-to-end dry-run completion still require staff proof.
- Launch proof notes must not contain passwords, access codes, card data, bank details, API keys, or private login details.
- Work assignment notes must also avoid passwords, access codes, card data, bank details, API keys, and private login details.
- Work detail pages intentionally show safe metadata labels and timeline summaries instead of raw JSON payloads.
- Document status update notes must avoid passwords, access codes, card data, bank details, API keys, and private login details.
- Client document approval/revision notes must avoid passwords, access codes, card data, bank details, API keys, and private login details.
- Document replacement notes must avoid passwords, access codes, card data, bank details, API keys, and private login details.
- In-browser editing, e-signature routing, and final archive delivery still need production integrations.
- The Staff Review Center is rules-based. AI summarization should stay read-only until privacy controls, citations, audit events, and human approval gates are verified.
- No real client documents, billing setup, staff assignments, or internal notes should be accepted until the real-provider checklist passes.

---

# 1. Start Here

The Reynalds OS Brain is already an advanced and intentionally developed operating system.

Do not treat the Brain as:

- A rough notes folder.
- A brainstorming archive.
- An unfinished outline.
- A prompt that should be summarized and replaced.
- A reason to redesign the project from scratch.

The Brain contains accumulated decisions, operating standards, architecture, business rules, brand direction, and historical context developed across many sessions.

Assume the Brain is advanced unless the repository itself clearly proves otherwise.

Before recommending changes, read:

1. `BRAIN/START_HERE.md`
2. `BRAIN/README.md`
3. `BRAIN/PRODUCT_VISION.md`
4. `BRAIN/ARCHITECTURE_PRINCIPLES.md`
5. `BRAIN/PROJECT_STATE.md`
6. `BRAIN/CURRENT_PRIORITIES.md`
7. `BRAIN/SESSION_HANDOFF.md`
8. `BRAIN/AI_BRAIN_OPERATING_GUIDE.md`
9. `BRAIN/VERSION_HISTORY.md`
10. Relevant domain-specific Brain documents for the current task

Do not begin with legacy documents unless the canonical documents direct you there or historical context is actually needed.

---

# 2. Repository

Local repository:

`~/Desktop/Reynalds_OS_v11_3_1_Work`

Remote repository:

`github.com:KoinoniaTransactions/Reynalds-OS.git`

Expected branch:

`feature/app-shell-foundation`

At the beginning of the next session, verify:

```bash
cd ~/Desktop/Reynalds_OS_v11_3_1_Work

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export GIT_SSH="/usr/bin/ssh"
export GIT_PAGER=cat

pwd
git branch --show-current
git status
git log -8 --oneline

Do not assume the working tree is clean.

Inspect staged and unstaged changes before editing:

git diff --name-status
git diff --cached --name-status
git diff
git diff --cached

Never discard, overwrite, reset, or unstage work without first understanding what it is.

3. User Workflow Requirements

Jeremiah prefers the following workflow for significant project changes:

Restate what you understand he wants.
Identify the Brain documents, existing files, and approved standards governing the work.
Explain whether there is a better approach.
Explain exactly which files you plan to inspect or change.
Wait for approval before making significant architectural, design, content, or code changes.
Provide full-file replacements rather than partial snippets when manual file editing is required.
Use guarded and idempotent scripts whenever practical.
Stage changes for review before committing.
Show the staged file list and staged diff summary.
Do not commit until Jeremiah approves the result.
Do not stage unrelated files.
Keep the Brain updated when an important decision becomes canonical.

Do not create expansion work merely because it is possible.

The Koinonia website and business launch remain the priority.

4. Current Koinonia Project State

Koinonia Transactions is positioned as:

Real Estate Operations Support for Colorado Realtors

Core positioning:

Koinonia helps Realtors protect client service by organizing the operational work that competes for their time.

Primary message currently used in marketing:

You focus on your clients. We'll keep the business running.

Primary service categories:

Transaction Support
Contract & Document Support
Licensed Showing Coverage
Monthly Operations Partnership

Professional boundary:

Koinonia provides operational support. Realtors remain responsible for client advice, negotiation decisions, brokerage compliance, legal questions, and final approval.

Koinonia should not be described as:

A generic virtual assistant.
A discount paperwork service.
A replacement brokerage.
A brokerage-supervision provider.
A legal, tax, or financial adviser.
An unlimited assistant service.
5. Existing Website and Repository Direction

The public Koinonia site exists inside Reynalds OS.

Primary public routes include:

/koinonia
/koinonia/services
/koinonia/about
/koinonia/contact

The public website uses shared content and reusable page assemblies.

Do not rebuild or replace the website architecture without reviewing the existing implementation and Brain documentation.

The Koinonia website launch is the priority.

Avoid expanding or redesigning Reynalds OS unless a change is necessary for:

Continuity.
Preventing repeated errors.
Supporting the website launch.
Preserving canonical business decisions.
Resolving a real architectural problem.
6. Approved Koinonia Brand Direction

The approved visual direction is:

Light and airy.
Bright, clean, calm, and organized.
Approachable.
Premium through typography, spacing, black, warm white, and gold.
Minimal rather than crowded.
Professional without appearing corporate or impersonal.
Faith-rooted without allowing the faith message to overpower the practical service message.

Avoid:

Dark and moody visual systems.
Generic real-estate stock photography.
Crowded flyer layouts.
Overly ornate luxury treatments.
Excessive decorative gold.
Marketing copy embedded into hero images.
Reinventing already approved design systems.

Approved brand meaning:

Koinonia
/koy-noh-NEE-uh/
fellowship · joint participation · sharing in common

Approved scripture treatment:

Bear one another's burdens. Work heartily, as for the Lord.

Galatians 6:2 · Colossians 3:23

Use the meaning and scripture intentionally, but do not repeat them so prominently that they compete with the business message.

7. Business Card State

The business card has been developed separately from the older HTML preview.

Important distinction:

Jeremiah previously approved a specific front design.
Do not substitute a newly generated or newly imagined front.
The corrected back was approved in concept.
The back uses a gold K inside a thin circle.
The K is centered between thin gold divider lines.
Text must not overlap the K.
The promise and service information are centered.
The scripture treatment remains below the lower divider.

Jeremiah's approved title is:

Support Partner

Before modifying the business card, ask Jeremiah to identify or provide the exact approved front artifact if it is not available in the current conversation.

Do not infer that an older repository HTML business-card preview is necessarily the final approved printer-ready card.

8. Current Marketing-System Direction

Existing materials are located primarily in:

02_Companies/Koinonia/05_Business_Materials

Relevant files may include:

README.md
branded_materials_design_standard.md
service_sheet.md
service_sheet_design_spec.md
brochure_copy.md
brochure_design_spec.md
print_ready/index.html
print_ready/service_sheet.html
print_ready/one_page_flyer.html
print_ready/koinonia_materials.css

The existing documentation already established that the one-page piece should be completed before creating a tri-fold brochure.

The emerging marketing-system build order is:

Business Card
Brokerage Introduction Sheet
Service Guide
Pricing Insert
Digital Introduction Packet
Tri-fold Brochure
Presentation Folder

Do not skip directly to a large presentation-folder system before validating the essential pieces and actual sales process.

9. Brokerage Introduction Sheet

The current one-page piece is intended to function as a:

Brokerage Introduction Sheet

It is not primarily intended as a random mass-distribution flyer.

Appropriate uses include:

A leave-behind after a meeting with a managing broker.
A handout during a brokerage or team presentation.
A follow-up attachment after a warm introduction.
A conversation aid during a meeting with an agent or team leader.
A professional overview included with a business card.
A digital PDF shared after a referral or consultation.

It is less appropriate as:

An unattended stack of generic flyers.
A cold direct-mail piece with no context.
A replacement for a sales conversation.
A detailed pricing sheet.
The only path a prospect has to understand or contact Koinonia.

Its purpose is to:

Establish the Realtor's operational problem.
Introduce Koinonia's role.
Present the four service categories.
Establish credibility and professional boundaries.
Give the reader an obvious next step.
10. Current Marketing Question and Next Action

Jeremiah reviewed the Brokerage Introduction Sheet visually and said it looked good.

He then asked:

When and where should this material be used?
How does it point people to Koinonia easily?
What is the intended sales role of the piece?

The answer established that it should function as a relationship-supported brokerage leave-behind.

The recommended next refinement is to improve its conversion path by adding:

A stronger call-to-action section.
A direct consultation invitation.
A QR code.
A visible phone/text option.
A visible website or consultation URL.

Language such as:

Schedule a Brokerage or Agent Consultation

Potential supporting language:

For individual Realtors, teams, and brokerages.

The QR code should lead directly to the consultation or scheduling destination rather than merely to the homepage, provided that destination actually exists and is confirmed.

Do not invent a scheduler URL.

Before editing, inspect the website's current contact or scheduling implementation and determine the canonical URL.

11. Immediate Next-Session Procedure

The next chat should:

Verify the repository location, branch, and Git status.
Read the required Brain documents.
Read BRAIN/AI_BRAIN_OPERATING_GUIDE.md.
Inspect all staged and unstaged changes.
Confirm whether the Brand & Marketing System v2 and Brokerage Introduction Sheet files were actually created.
Open or inspect the current Brokerage Introduction Sheet.
Inspect the website contact page and determine the correct consultation destination.
Present a precise CTA and QR-code implementation plan.
Wait for Jeremiah's approval before modifying the sheet.
Stage the approved changes without committing.
Ask Jeremiah to visually review the result.
Commit only after approval.
12. Critical Continuity Rule

Do not respond to this handoff by proposing a new project architecture or replacing the Brain with a simplified interpretation.

The correct response is to:

Read the system.
Understand the system.
Verify the current repository state.
Respect approved decisions.
Continue from the documented next action.

The Brain is an advanced operational source of truth.

Treat missing understanding as a reason to read more—not as permission to reinvent the project.
