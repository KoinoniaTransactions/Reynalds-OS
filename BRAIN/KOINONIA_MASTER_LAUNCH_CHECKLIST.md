# Koinonia Master Launch Checklist

Last reconciled: 2026-10-13 (against documented September 16-18 evidence)
Owner: Koinonia / Jeremiah
Status: ACTIVE EXECUTION CHECKLIST

This file is the persistent checklist for completing the current Koinonia public website and controlled marketing launch.

Use this file whenever the owner asks for "the checklist", "the plan", "where are we", or "what is next".

Update the checkboxes as work is completed. Do not mark an item complete because code merely exists; mark it complete only when its acceptance criteria are actually satisfied.

## Status legend

- [x] Complete
- [ ] Not complete
- OWNER GATE = requires Jeremiah's explicit approval before proceeding past that point

---

# Current execution order

The website customer experience has been completed, owner-approved, and promoted to production. Marketing instrumentation and campaign work now proceed as a separate controlled phase.

Current next item:

**NEXT: M6 full tagged lead-to-CRM acceptance test; finish Meta/TikTok consent and audience readiness, M7 email, M8 campaign page. M1-M3 foundation/proof are complete in preview.**

---

# Foundation already completed

- [x] F1 — Current white-glove commercial model substantially defined.
- [x] F2 — Current controlled-launch products and pricing reconciled in canonical September documentation.
- [x] F3 — Current branch roles documented: `main`, `koinonia-production`, and `koinonia-marketing-readiness` are not interchangeable.
- [x] F4 — Commercial website unfinished-work handoff documented.
- [x] F5 — Marketing / retargeting readiness handoff documented.
- [x] F6 — `START_HERE.md`, `CURRENT_STATE.md`, handoffs, and current priorities reconciled through 2026-09-05.
- [x] F7 — Master persistent launch checklist created.

---

# PHASE A — Finish and approve the public website

## W1 — Services & Pricing detail experience

- [x] W1.1 — Remove the current giant fully-expanded `What do I actually get?` wall from the normal page flow.
- [x] W1.2 — Preserve the current detailed product-scope content rather than rewriting the commercial model.
- [x] W1.3 — Replace fake `See everything included` anchor behavior with true reveal behavior on the same page.
- [x] W1.4 — Build/reuse one standard Koinonia detailed-scope interaction component.
- [x] W1.5 — Preferred UX: polished modal/dialog on desktop and near-full-screen sheet on mobile, unless implementation review reveals a materially better accessible pattern.
- [x] W1.6 — Ensure the detail experience supports long content cleanly, including internal scrolling where needed.
- [x] W1.7 — Ensure close button, Escape key, focus handling, keyboard access, and screen-reader semantics are correct.
- [x] W1.8 — Keep the parent Services page as lightweight/server-rendered as practical; isolate client interaction to the detail component rather than converting the entire page unnecessarily.

Acceptance criteria: the visitor can scan pricing quickly and open detailed scope for one product without being forced through every other product's detail content.

## W2 — Pricing-card hierarchy and scanability

- [x] W2.1 — Each commercial product card clearly shows product name.
- [x] W2.2 — Price and price basis are immediately visible.
- [x] W2.3 — One clear outcome/promise is visible without excessive text.
- [x] W2.4 — Keep only a short set of high-value inclusions visible on the card.
- [x] W2.5 — `See everything included` is visually secondary to the primary service CTA.
- [x] W2.6 — Pricing cards remain balanced and easy to compare on desktop and mobile.
- [x] W2.7 — Current approved pricing remains unchanged unless canonical business documentation changes.

Acceptance criteria: a Realtor can understand the buying options and approximate differences with a fast visual scan.

## W3 — Services page visual hierarchy and density

- [x] W3.1 — Review five capability cards for clarity and density.
- [x] W3.2 — Refine white-glove differentiation section so it sells continuity/accountability without overexplaining.
- [x] W3.3 — Make Marketing Management vs Koinonia Partnership distinction obvious.
- [x] W3.4 — Review popular/common solution cards for redundancy and usefulness.
- [x] W3.5 — Keep outside-cost explanation clear but brief.
- [x] W3.6 — Keep professional/compliance boundaries present without letting them dominate the sales experience.
- [x] W3.7 — Review section spacing and page rhythm so the page feels premium/light rather than documentation-heavy.
- [x] W3.8 — Preserve the approved light/airy Koinonia visual system and existing hero direction unless Jeremiah explicitly reopens it.

Acceptance criteria: the Services page feels like a premium white-glove sales experience rather than a long operating manual.

## W4 — Homepage vs Services role

- [x] W4.1 — Keep Homepage as the concise introduction to the white-glove model.
- [x] W4.2 — Keep deeper product explanation primarily on Services & Pricing.
- [x] W4.3 — Remove or tighten unnecessary duplication between Home and Services.
- [x] W4.4 — Confirm Homepage still preserves the approved hero/image treatment.
- [x] W4.5 — Verify Home pricing/support links point to the correct current Services interactions/sections.

Acceptance criteria: Home sells the concept quickly; Services explains the buying options in depth.

## W5 — CTA, navigation, and route behavior

- [x] W5.1 — Audit `Tell Us What You Need` CTAs.
- [x] W5.2 — Audit Transaction Management CTA.
- [x] W5.3 — Audit Hand Us the Listing CTA.
- [x] W5.4 — Audit Licensed Field Coverage / Open House CTA paths.
- [x] W5.5 — Audit Marketing Management CTA.
- [x] W5.6 — Audit Koinonia Partnership CTA.
- [x] W5.7 — Audit Custom Project CTA.
- [x] W5.8 — Audit Header and Footer navigation.
- [x] W5.9 — Audit Contact / consultation scheduler behavior.
- [x] W5.10 — Confirm retired `/appointments` behavior redirects correctly and is not revived as a stale page.
- [x] W5.11 — Check all changed anchors/deep links after the Services detail UX changes.

Acceptance criteria: every visible CTA lands in the intended current flow with no dead, stale, or misleading destinations.

## W6 — Desktop and mobile visual QA

- [x] W6.1 — Desktop Services visual QA.
- [x] W6.2 — Mobile Services visual QA.
- [x] W6.3 — Desktop Homepage visual QA.
- [x] W6.4 — Mobile Homepage visual QA.
- [x] W6.5 — Detail modal/sheet desktop QA.
- [x] W6.6 — Detail modal/sheet mobile QA.
- [x] W6.7 — Verify typography, spacing, card heights, price visibility, buttons, and scroll behavior.
- [x] W6.8 — Verify no text clipping, overflow, awkward whitespace, or unusable long-content states.

Acceptance criteria: the approved commercial experience works cleanly at representative desktop and mobile widths.

## W7 — Technical website QA

- [x] W7.1 — Typecheck passes.
- [x] W7.2 — Production build passes.
- [x] W7.3 — Relevant tests pass.
- [x] W7.4 — Public routes load correctly.
- [x] W7.5 — SEO metadata reflects current white-glove commercial architecture.
- [x] W7.6 — Accessibility review of interactive components and key page structure.
- [x] W7.7 — Dead-link / route-link review.
- [x] W7.8 — Contact/consultation submission behavior verified.
- [x] W7.9 — Non-production Vercel preview generated from the reviewed website state.

Acceptance criteria: a clean preview exists that accurately represents the candidate website release and passes technical validation.

## W8 — OWNER GATE: website approval

- [x] W8.1 — Jeremiah reviews the final non-production Homepage and Services & Pricing preview.
- [x] W8.2 — Requested visual/content/functional corrections completed.
- [x] W8.3 — Jeremiah explicitly approves the public website experience for production preparation.

**OWNER GATE satisfied 2026-09-16.**

## W9 — Website production promotion

- [x] W9.1 — Prepare controlled production promotion from the approved website state.
- [x] W9.2 — Promote only the reviewed/approved state to `koinonia-production`.
- [x] W9.3 — Verify actual production domain reflects the approved release.
- [x] W9.4 — Verify primary routes and retired-route redirects in production.
- [x] W9.5 — Record production release checkpoint in repo documentation.

Production release completed 2026-09-16 at `koinonia-production` commit `f6c821111ff17a602eee92db01998a0c52bf62f0`, Vercel deployment `dpl_F5sqbQzSDmvK15x97dbAjF5GkWUv`. The release deliberately reconciled the owner-approved public website with the recovered September transaction-first Realtor Portal while preserving production auth/internal infrastructure and the Prisma/Vercel bundling safeguard. Release verification and deferred activation notes are recorded in `BRAIN/KOINONIA_PRODUCTION_RELEASE_2026-09-16.md`.

Acceptance criteria: satisfied. The production domain shows the owner-approved website, the Portal routes are present and no longer exhibit the prior Prisma runtime failure, and the retired `/appointments` path resolves to the current Contact / consultation experience.

---

# PHASE B — Marketing, attribution, retargeting, and campaign readiness

## M1 — Fresh marketing integration branch

**Baseline reconciliation:** M1.1 is accepted as complete with a documented exception: the branch was initially attempted from `main`, then deliberately rebased to approved production release `f6c8211` because `main` lacked recovered Portal/auth/Prisma safeguards. This branch is NON-PRODUCTION. See `BRAIN/KOINONIA_MARKETING_INTEGRATION_AUDIT_2026-09-16.md`.

- [x] M1.1 — Create a fresh marketing-integration branch from the then-current approved/current `main` state.
- [x] M1.2 — Do not merge `koinonia-marketing-readiness` wholesale.
- [x] M1.3 — Compare old readiness implementation against current public routes/components before porting.

Acceptance criteria: marketing work begins from the current website architecture with no wholesale legacy-branch merge.

## M2 — Port/reimplement measurement and attribution foundation

**Evidence:** Production-baseline integration audit, source implementations, unit tests and passing CI #405 substantiate M2 on the preview branch. This is implementation/test completion, not final unified M6 acceptance or production activation.

- [x] M2.1 — Public-route GA4 loading.
- [x] M2.2 — Scheduler-open event.
- [x] M2.3 — Consultation/service-selection intent events where useful.
- [x] M2.4 — Contact call/text/email events where useful.
- [x] M2.5 — Successful consultation `generate_lead` event tied only to accepted lead submission.
- [x] M2.6 — UTM capture/persistence.
- [x] M2.7 — First-touch attribution persistence.
- [x] M2.8 — Latest-touch attribution persistence.
- [x] M2.9 — Conversion-touch attribution persistence.
- [x] M2.10 — Capture/preserve `fbclid`.
- [x] M2.11 — Capture/preserve `ttclid`.
- [x] M2.12 — Capture/preserve `gclid`.
- [x] M2.13 — Capture/preserve `gbraid`.
- [x] M2.14 — Capture/preserve `wbraid`.
- [x] M2.15 — Capture/preserve `msclkid`.
- [x] M2.16 — CRM/Koinonia Relationship persistence of attribution and click IDs.
- [x] M2.17 — Privacy preference controls.
- [x] M2.18 — Global Privacy Control behavior.
- [x] M2.19 — Keep advertising tracking off authenticated client/staff areas.
- [x] M2.20 — Attribution persistence tests pass.

Acceptance criteria: campaign source data survives from anonymous visit through accepted lead and CRM relationship record.

## M3 — Prove GA4

**Proof note:** GA4 `G-CNMN80KHQE`, preview-only configuration, Realtime `page_view` (9), `generate_lead` (1), and separately named scheduler/type events were recorded September 17 after explicit page_view fix `09b3f1c`.

- [x] M3.1 — Identify/confirm the real Koinonia GA4 property/web stream.
- [x] M3.2 — Confirm the real `G-...` Measurement ID.
- [x] M3.3 — Configure the correct ID in preview environment.
- [x] M3.4 — Prove a real public page view in GA4 Realtime/DebugView.
- [x] M3.5 — Prove a successful test consultation produces `generate_lead`.
- [x] M3.6 — Confirm micro-events are not incorrectly counted as leads.

Acceptance criteria: GA4 is proven with real observed events, not merely present in code.

## M4 — Meta tracking and retargeting

**Proof note:** September 17 preview showed Essential-only without Meta scripts, analytics+ads with Pixel PageView, and Meta Events Manager Active `PageView` and `Lead` after HTTP 200 consultation. Audience creation and converter exclusions remain unchecked.

- [x] M4.1 — Create/identify correct Koinonia Meta Dataset/Pixel.
- [x] M4.2 — Confirm ownership/account access.
- [x] M4.3 — Add real ID to preview only first.
- [x] M4.4 — Test advertising consent denied behavior.
- [x] M4.5 — Test advertising consent granted behavior.
- [x] M4.6 — Verify Meta PageView/test event.
- [x] M4.7 — Verify Meta Lead event from successful lead submission.
- [ ] M4.8 — Create initial useful-volume website/high-intent/social-engager audiences.
- [ ] M4.9 — Configure converter exclusion where practical.
- [ ] M4.10 — Decide later whether Meta Conversions API is warranted; if added with browser events, implement deduplication.

## M5 — TikTok tracking and retargeting

**Proof note:** TikTok Test Events recorded browser `Submit form` (Code: Lead) after an HTTP 200 consultation; Pixel Helper also showed Pageview/LandingPageView. TikTok campaign-ready status and business registration remain pending. Explicit consent-denied test and initial audiences/exclusions are not yet evidenced in this audit.

- [x] M5.1 — Create/identify correct Koinonia TikTok Pixel.
- [x] M5.2 — Confirm ownership/account access.
- [x] M5.3 — Add real ID to preview only first.
- [ ] M5.4 — Test advertising consent denied behavior.
- [ ] M5.5 — Test advertising consent granted behavior.
- [x] M5.6 — Verify TikTok page/test event.
- [x] M5.7 — Verify TikTok Lead event from successful lead submission.
- [ ] M5.8 — Create initial useful-volume audiences.
- [ ] M5.9 — Configure converter exclusion where practical.
- [ ] M5.10 — Decide later whether TikTok Events API is warranted; if added with browser events, implement deduplication.

### Preview database safety verification — 2026-10-14

- Vercel Neon Native Integration is attached to `reynalds-os-web` for Production and Preview. Its **Create Database Branch for Deployment: Preview** setting was enabled by the owner; Production remains unchecked.
- A fresh **Preview-only** Vercel deployment `dpl_Gs8d8suqqPZJ3cdxx7AeeyxZV6vZ` of existing marketing commit `36ebb6822932fd60de92f05780236d35f9701987` reached READY at `reynalds-os-akw026u1j-koinonia3.vercel.app`.
- The Neon console screenshot dated 2026-10-14 09:12 local shows the resulting branch `preview/koinonia-marketing-integration-2026-09-16` (project `neon-coral-flower`, `lucky-voice-55289048`), **created by Vercel** at 2026-10-14 09:06:08, **parent `main`**, one database and one compute; production `main` remains separately listed.
- The newly deployed Preview CRM loaded existing Relationship records read-only. This is compatible with copying data when branching from `main`; seeing those records is **not** evidence of a shared live connection.
- Preview/Development consultation notification suppression was implemented in `8ffaa2c` and covered by tests in `36ebb68`; CI for `36ebb68` succeeded. Production email behavior was not changed.
- **Evidence boundary:** Branch creation and Preview health are confirmed, but the runtime application's resolved database branch identifier has **not** been independently read from the deployed function. Treat isolation as strongly supported by the Vercel-created branch and deployment timing, not as conclusively proven by runtime connection metadata. No write-level isolation test was executed.
- Do not restart prior environment setup or create another branch manually. Do not submit another consultation until the last connection/migration/notification safeguards are accepted and the owner authorizes the single controlled test. This verification is infrastructure progress, not M6 unified acceptance and not approval for production publishing.

### Runtime database verification (2026-10-14)

The authenticated diagnostic on Preview commit `ec87434` returned Neon branch ID `br-cool-cloud-afmcgqot`, matching the branch ID displayed in Neon for `preview/koinonia-marketing-integration-2026-09-16`. The executing Preview is therefore confirmed to use its separate child branch. No database write was made. Preview notification suppression CI passed. The diagnostic is temporary and must be removed. A full tagged M6 lead conversion is still pending approval; marketing production promotion remains gated.

### October 14 tagged Preview consultation evidence

Owner confirmed the isolated Preview CRM Relationship `Koinonia M6 QA` displays the expected UTM source `m6qa`, medium `test`, campaign `koinonia_m6_20261014`, and content `controlled_preview`. The screenshot independently showed the saved Consultation Relationship, latest consultation request, and generated next-action follow-up. This establishes tagged visit-to-CRM UTM persistence for this controlled test. Owner's confirmation of the attribution fields is recorded; the individual expanded field screenshot was not captured in this session. Do not claim advertising click-ID proof (the tagged URL contained none), cross-platform event correlation, converter exclusions, or timeline-event inspection from these results. No further test submission is needed for UTM persistence.

## M6 — End-to-end tagged campaign acceptance test
**2026-10-14 audience/exclusion inspection (read-only):** Owner inspected the Koinonia Transactions Meta ad account (`1378958464415174`) in both enhanced and standard Audiences views; both displayed the audience-creation empty state, with no existing Custom, Lookalike, or Saved Audiences visible. Owner then inspected TikTok Ads Manager Audiences for Koinonia Transactions llc (`7672243853892927504`); the list showed `No Data`. Thus **neither platform currently displays a configured converter-exclusion audience**. No campaign or retargeting activation was authorized or performed. M6.14 is **REVIEWED / CONFIGURATION DEFERRED** consistent with the approved insufficient-audience-volume gate; keep the M6.14 checkbox unchecked and revisit only at actual campaign preparation when eligible audience volume and exclusion capability can be assessed. Meta M4.8/M4.9 and TikTok M5.8/M5.9 remain open. No audiences, contact lists or ads were created or modified. This supersedes the earlier instruction to inspect the audiences.

**2026-10-14 M6.9/M6.14 decision boundary:** M6.9 is CONDITIONAL/NOT APPLICABLE to the completed Oct 14 UTM-only submission; no `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, or `msclkid` was supplied. Parsing and preservation are implemented, and unit tests explicitly cover these six identifiers, but actual click-ID persistence from a real tagged click remains unverified; do not mark live click-ID proof complete or generate fake click IDs. M6.14 remains OPEN: Meta M4.8/M4.9 and TikTok M5.8/M5.9 audience-creation/exclusion gates have not been verified, and TikTok's approved playbook forbids retargeting campaigns before minimum audience volumes. Review existing audience eligibility/availability read-only; no campaign, targeting, custom audience, uploads, or paid activation without owner authorization. The historical 2026-10-13 read-only table and obsolete next-action paragraph farther down are superseded by the October 14 evidence entries and current checkboxes; do not repeat the consultation test.

**TikTok October 14 verification:** Owner screenshot at ~10:08 Mountain, TikTok Koinonia Transactions Website pixel `DAM02MRC77U9262DRMS0`, date filtered specifically to 2026-10-14, showed Page view=3, Landing page view=2, Submit form=1, Engaged session=1. This aligns with the ~09:29 isolated Preview M6 consultation and verifies M6.13. M6.9 (click IDs not supplied) and M6.14 (converter exclusions) remain open. The 2026-10-13 audit table below is historical, not current status.

**Meta October 14 verification:** Owner screenshot at 10:00 Mountain in Koinonia Transactions Website dataset/pixel `4341788166086497` showed `PageView` 3 active and `Lead` 1 active; Lead last received 31 minutes prior, aligning with the 09:29 controlled consultation. Previous zero-event view reflected reporting lag. M6.12 accepted. No repeat submission or pixel reconfiguration required.

**GA4 October 14 Preview evidence:** Owner screenshots from GA4 Realtime ~09:40-09:41 Mountain show page_view=2, session_start=2, user_engagement=2, consultation_scheduler_open=1, consultation_type_selected=1, first_visit=1, form_start=1, and generate_lead=1. This coincides with the single accepted Koinonia M6 QA consultation and satisfies M6.3, M6.4, M6.11 for the controlled test. Do not repeat GA4 conversion tests. Meta and TikTok same-test receipts and converter exclusions remain open.


**2026-10-14 controlled Preview update:** Owner confirmed the `Koinonia M6 QA` Relationship's expected tagged campaign fields were present and confirmed `consultation.requested` and `task.created` timeline entries passed. Screenshot also showed the saved consultation, generated follow-up and Profile; the form showed an accepted confirmation. M6.1, M6.2, M6.5–M6.8 and M6.10 are accepted for this test. The earlier September-only evidence table below is retained as historical context, not current status. M6.3–M6.4, M6.9 (no click ID was supplied), M6.11–M6.14 remain open without same-test receipts. Do not submit another consultation merely to repeat proven CRM tests.

**Evidence boundary:** Separate controlled preview tests proved GA4 `generate_lead`, Meta `Lead`, and TikTok `SubmitForm`/Lead. They do NOT yet prove one single tagged test traveled through all required UTM/click-ID, CRM relationship, follow-up, and cross-platform steps. Therefore M6 remains unchecked pending a unified acceptance record.

### M6 evidence review — 2026-10-13 (read-only audit of September evidence)

| Item | September evidence | Acceptance status |
| --- | --- | --- |
| M6.1 tagged landing | Preview test URLs exist; no recorded complete tagged URL -> accepted lead trace | OPEN |
| M6.2 first touch | Unit tests prove first-touch stability; no inspected live preview CRM row | OPEN |
| M6.3 page event | GA4 Realtime page_view=9 on September 17; not tied to one identified tagged lead | OPEN |
| M6.4 high-intent | GA4 reported scheduler-open and consultation-type events; cross-test identity not established | OPEN |
| M6.5 submission | Separate controlled consultations submitted for Meta/TikTok tests | OPEN for unified M6 test (individual action proven) |
| M6.6 accepted API | HTTP 200 confirmed in Vercel logs for September 17 Meta/TikTok tests | OPEN for unified M6 test (individual action proven) |
| M6.7 Relationship | Consultation route source writes Relationship; test mocks prisma; no independent preview DB read | OPEN |
| M6.8 touch fields | marketing-attribution and API unit tests validate first/latest/conversion touch | OPEN without saved preview row |
| M6.9 click IDs | Unit tests cover fbclid, ttclid, gclid, gbraid, wbraid, msclkid; no preview CRM verification | OPEN |
| M6.10 follow-up | Route source uses a database transaction for Relationship, consultation timeline and follow-up task; no independent preview DB read | OPEN |
| M6.11 GA4 lead | GA4 reported one generate_lead in preview | OPEN for unified M6 trace (platform proof already satisfied M3) |
| M6.12 Meta lead | Meta Events Manager reported active Lead after accepted preview consultation | OPEN for unified M6 trace (platform proof already satisfied M4) |
| M6.13 TikTok lead | TikTok Test Events received browser SubmitForm, code Lead, after accepted preview consultation | OPEN for unified M6 trace (platform proof already satisfied M5) |
| M6.14 converter exclusions | Audiences/exclusions not yet configured/verified | OPEN |

**Specific next controlled action (preview only, no deployment):** Check whether the September test consultation's Relationship/timeline/task can be inspected in an existing isolated preview database without exposing personal information. If not, plan a single *new* tagged preview-only submission using unmistakably test-only identity and notes, recording campaign URL, event time, API receipt, anonymized stored Relationship first/latest/conversion touch and click IDs, follow-up task/timeline, and GA4/Meta/TikTok test receipts. Verify the preview database is isolated from production, the test will not send a real customer email, and any test records can be cleaned up **before** submitting. Do not send another test until that isolation is confirmed. Audience/exclusion acceptance remains independently gated. No production activation, merge, or publish.

Source pointers: `BRAIN/KOINONIA_MARKETING_INTEGRATION_AUDIT_2026-09-16.md`; `apps/web/lib/marketing-attribution.test.ts`; `apps/web/app/api/koinonia/consultation/route.test.ts`; `apps/web/app/api/koinonia/consultation/route.ts`; draft PR #36.


- [x] M6.1 — Open controlled tagged campaign URL.
- [x] M6.2 — Verify first-touch attribution stored.
- [x] M6.3 — Verify landing/page event.
- [x] M6.4 — Trigger and verify a high-intent event.
- [x] M6.5 — Submit a real test consultation.
- [x] M6.6 — Verify backend accepted the lead.
- [x] M6.7 — Verify Koinonia Relationship record created/updated.
- [x] M6.8 — Verify first/latest/conversion-touch fields.
- [ ] M6.9 — Verify supplied click IDs survive where applicable.
- [x] M6.10 — Verify follow-up task/timeline behavior.
- [x] M6.11 — Verify GA4 `generate_lead`.
- [x] M6.12 — Verify Meta `Lead`.
- [x] M6.13 — Verify TikTok `Lead`.
- [ ] M6.14 — Verify converter-exclusion eligibility/behavior as designed.

Acceptance criteria: one controlled test proves the entire campaign -> site -> lead -> CRM -> measurement path.

## M7 — Email campaign launch readiness
**2026-10-14 M7 minimum Resend marketing setup specification (design only):** Configure one topic named `Koinonia Updates & Realtor Resources`, purpose permission-based educational/nurture emails, with **default subscription Opt-out** (new contacts not automatically subscribed to this topic). Resend's Topic status is distinct from the global Contact `Subscribed` status: BOTH must permit mailing. Do not import CRM contacts, auto-enroll consultation submitters, start campaigns, or send broadcasts. Before marketing launch, require documented permission/source and opt-in timestamp/basis for each eligible contact; preserve CRM marketing opt-out / do-not-contact flags; enforce unsubscribe across Resend and CRM, with no re-enrollment by imports; verify a branded unsubscribe footer and real opt-out test; honor provider hard-bounce/complaint suppressions. Keep transactional consultation notifications separate from Topic-based marketing. M7.7-M7.9 stay OPEN until actual end-to-end verification, and campaign sender/footer/physical mailing address remain unverified.

**2026-10-14 Resend Topics follow-up:** Owner confirmed Resend Audience > Topics has no topics configured. No subscription-topic preferences are yet implemented. This is a baseline observation, not verification of unsubscribe or suppression enforcement. M7.7-M7.9 remain open. No topics or recipients were created.

**2026-10-14 Resend marketing baseline:** Owner confirmed Broadcasts has no campaigns, Resend Audience shows 0 contacts / 0 subscribers / 0 unsubscribers, and Suppressions shows none. This is an empty initial state, not evidence of functioning unsubscribe or suppression controls. M7.7, M7.8 and M7.9 remain open. No imports, sends, or enrollments authorized.

**2026-10-14 Resend production delivery verified:** Owner inspected Resend Emails > Sending and one existing production consultation notification detail. The message, `Koinonia Custom Project Consultation Request`, was sent 2026-10-13 at 3:11 PM, from `Koinonia <noreply@koinoniatransactions.com>` to internal `jeremiah@koinoniaadmin.com`, using Resend API `POST /emails`; delivery event shows Delivered. This proves existing transactional notification sender and delivery, without generating another test or contacting a customer. It does not verify Resend mass marketing, unsubscribe/suppression, or sending-volume reputation planning. M7.4 remains open for marketing-side strategy.

**2026-10-14 Resend deployment check:** The expected email configuration variable names are present in Vercel for Production and Preview. Their values and runtime validity were not checked. No delivery evidence was obtained, so M7.4 remains open. No settings were changed.

**2026-10-14 Resend role confirmed from implementation:** `apps/web/app/api/koinonia/consultation/route.ts` implements Resend API POST `/emails` for production consultation notifications after successful CRM persistence. Defaults are from `Koinonia <noreply@koinoniatransactions.com>` and to internal `jeremiah@koinoniaadmin.com`, overridable by `CONTACT_INTAKE_FROM_EMAIL` / `CONTACT_INTAKE_TO_EMAIL`. Non-production Vercel environments explicitly suppress the notification. `apps/web/lib/resend-inbound-email.ts` and `/api/webhooks/resend/inbound` implement separate inbound transaction email ingestion. These are established code paths, NOT proof production secrets, Resend mail delivery, or bulk campaign tooling were verified. M7.4 remains pending runtime verification and sender reputation strategy; do not create another platform, send messages, or change environment settings without approval. Note that the production consultation sender is a no-reply address for an INTERNAL notification, not the approved customer relationship reply identity.

**2026-10-14 Gmail sender identity confirmation:** Owner screenshot of Gmail Settings > Accounts confirms `jeremiah@koinoniatransactions.com` set as DEFAULT Send mail as and `Reply from the same address the message was sent to` selected. `jeremiah@koinoniaadmin.com` remains available for internal/billing but is no longer default. This verifies Gmail one-to-one From/reply settings for M7.5; sender identities for any eventual bulk campaign provider remain subject to its own QA before activation.

**2026-10-14 M7.4/M7.5 infrastructure review:** Existing approved email playbook preserves one-to-one, warm, nurture, and transactional email as separate modes. Workspace sender `jeremiah@koinoniatransactions.com` was demonstrably used in the SPF/DKIM/DMARC PASS diagnostic; sender display name Jeremiah Reynalds was visible. Customer-facing domain is exclusively `koinoniatransactions.com`, admin domain internal/billing. Cloudflare already has Resend/SES records and repo contains inbound Resend webhook code; this is **not** proof of an operational Resend outbound campaign sender. M7.4 remains open pending explicit documented sender/provider separation and outbound reputation approach. M7.5 remains open until actual Reply-To and campaign From identity are confirmed. No new provider selection, DNS edits, mailing, or platform activation.

**2026-10-14 Google Workspace authentication evidence:** Owner's Gmail Show Original screenshot for a diagnostic message sent from jeremiah@koinoniatransactions.com to the owner's Gmail address showed SPF PASS, DKIM PASS (d=koinoniatransactions.com), DMARC PASS, and delivery in 14 seconds. M7.1-M7.3 are complete for the Workspace sender only. Resend sending and marketing campaign compliance are not yet verified. No customer-facing campaign was sent.

**Owner-confirmed email domain boundary (2026-10-14):** `koinoniatransactions.com` is the ONLY customer-facing Koinonia email domain (outreach, relationship/service correspondence, and any approved marketing sends). `koinoniaadmin.com` is reserved for INTERNAL ADMINISTRATION AND BILLING, not customer-facing sending. Do not propose or configure customer-facing campaigns from the admin domain. M7 authentication, sender identity and deliverability review should focus on `koinoniatransactions.com` and its actual Google Workspace sender/alias configuration; review `koinoniaadmin.com` only if needed to explain shared Workspace technical dependencies. This owner decision supersedes earlier general domain alternatives. DNS records and send-as behavior remain unverified.

**2026-10-14 M7 reconciliation (existing decisions preserved):** Source: `02_Companies/Koinonia/04_Departments/Marketing/EMAIL_MARKETING_OPERATIONS_PLAYBOOK.md`. Build-stage rules are already defined: four distinct email modes (personal, warm follow-up, permission-based nurture, transactional); consent/source qualification and suppression categories; one-to-one initial sequence Day 0/4/10/21 only after approval; nurture cadence roughly 1-2 useful messages/month; commercial footer/unsubscribe rules; identifiable sender/domain strategy; manual first-50 learning and reply priority; UTM format `utm_source=email`, mode-specific `utm_medium`, stable campaign ID and content identifier. **M7.10 naming/UTM convention is defined and accepted.** These are operational decisions, NOT evidence that SPF/DKIM/DMARC, selected campaign platform, footer/address, real suppressions, or actual sender identities are technically verified. DNS record inspection was not established in this session; M7.1-M7.9 and M7.11 remain unchecked until evidence-specific checks. Do not redo the email playbook, send campaigns, enroll recipients, or upload contact lists. All outbound launch/publish gates remain closed pending explicit owner approval.


- [x] M7.1 — Verify SPF.
- [x] M7.2 — Verify DKIM.
- [x] M7.3 — Verify DMARC.
- [ ] M7.4 — Confirm sending-domain/reputation strategy.
- [x] M7.5 — Verify accurate From/Reply-To identity.
- [ ] M7.6 — Verify physical postal address requirement in campaign messages.
- [ ] M7.7 — Verify working unsubscribe/opt-out.
- [ ] M7.8 — Verify suppression of opted-out recipients.
- [ ] M7.9 — Review list source/permission quality.
- [x] M7.10 — Define consistent campaign UTM convention.
- [ ] M7.11 — Define safe initial sending-volume/reputation plan.

Acceptance criteria: outbound email can be sent without bypassing authentication, unsubscribe, suppression, or basic list-quality controls.

## M8 — Campaign 01 / `/coverage` landing page

- [ ] M8.1 — Reconcile the old `/coverage` concept against current September products, pricing, and claim boundaries.
- [ ] M8.2 — Preserve/reassess Campaign 01 positioning: `Real estate doesn't happen one thing at a time.`
- [ ] M8.3 — Preserve/reassess response line: `Keep the client. Get the coverage.`
- [ ] M8.4 — Build/update the page against the approved current visual system.
- [ ] M8.5 — Ensure CTA path and attribution capture are correct.
- [ ] M8.6 — Validate desktop/mobile presentation.
- [ ] M8.7 — Validate campaign message match from ad/post to landing page.

Acceptance criteria: paid traffic lands on a current, message-matched page rather than stale product architecture or a generic homepage by default.

## M9 — Final marketing preview and launch review

- [ ] M9.1 — Full preview includes approved website + marketing instrumentation + campaign landing flow.
- [ ] M9.2 — Re-run privacy/consent checks.
- [ ] M9.3 — Re-run key conversion checks.
- [ ] M9.4 — Confirm no advertising pixels on authenticated/private routes.
- [ ] M9.5 — Confirm all platform IDs are real and correct.
- [ ] M9.6 — Confirm retargeting audiences/exclusions are configured as intended.
- [ ] M9.7 — Confirm email gates are satisfied before major send.

## M10 — OWNER GATE: marketing launch approval

- [ ] M10.1 — Jeremiah reviews final website/campaign/measurement preview and test results.
- [ ] M10.2 — Requested corrections completed.
- [ ] M10.3 — Jeremiah explicitly approves production marketing instrumentation/campaign launch.

**OWNER GATE: Do not promote experimental marketing tracking or campaign landing changes to production before M10.3 is checked.**

## M11 — Controlled production marketing launch

- [ ] M11.1 — Promote only reviewed/approved marketing changes.
- [ ] M11.2 — Verify production public routes and consent behavior.
- [ ] M11.3 — Verify production GA4 page view and lead conversion.
- [ ] M11.4 — Verify production Meta/TikTok events as appropriate.
- [ ] M11.5 — Verify production CRM attribution on a controlled test.
- [ ] M11.6 — Confirm retargeting audiences begin populating as expected.
- [ ] M11.7 — Record final launch checkpoint and any deferred v1.1 items.

---

# Items intentionally deferred unless they become necessary

- [ ] D1 — Separate SEO product pages for every service.
- [ ] D2 — Meta Conversions API.
- [ ] D3 — TikTok Events API.
- [ ] D4 — Highly segmented service-specific retargeting audiences before traffic volume supports them.
- [ ] D5 — Portal/internal-platform expansion unrelated to public launch completion.
- [ ] D6 — Standalone public Contract & Document pricing until brokerage/compensation gate is resolved.

Deferred items are not launch blockers unless specifically promoted into the active plan by the owner.

---

## Reconciliation evidence and remaining profile work (2026-10-13)

- Sources: PR #36 (open/draft/unmerged; head before reconciliation `59a07c7`); `BRAIN/KOINONIA_MARKETING_INTEGRATION_AUDIT_2026-09-16.md`; September 17 GA4/Meta/TikTok preview operator receipts; GitHub CI #405. All claims describe *recorded September tests*, not October live re-verification.
- September 18 LinkedIn company page established; tagline and About updated, tracked website link recorded and a clean LinkedIn tracking redirect added at `59a07c7`. LinkedIn Services wording, tracked CTA availability, message/request owner, Super Admin and company size remain to verify. This channel is not a new paid-campaign approval.
- TikTok organic Business Registration is pending review and profile website-field availability is unresolved. Do not submit duplicate registration or assume campaign readiness.
- Facebook Page confirmed, but Contact Us destination, tracked website field, Instagram connection, public contact details and notification ownership need checking.
- Keep Meta/TikTok audiences, cross-platform unified M6 test, email M7, `/coverage` M8, marketing M9-M11 and all owner gates open until independently proven.
- `main` retains its older checklist; this reconciled copy lives exclusively on the marketing integration branch pending separate branch-management decision. The correction intentionally does not modify `main` or production.

---

# Permanent rules

1. Repository truth controls over chat memory.
2. Current canonical business objects/readiness docs control claims and pricing.
3. Do not restore legacy prices/tier structures without explicit approved business change.
4. Do not merge `koinonia-marketing-readiness` wholesale.
5. Do not promote to production without Jeremiah's explicit approval at the applicable owner gate.
6. A passing Vercel preview is not production approval.
7. Do not invent GA4, Meta, TikTok, or other platform identifiers.
8. Keep advertising tracking off authenticated client/staff areas.
9. `generate_lead` means a successful accepted lead submission, not a button click or other micro-event.
10. Update this checklist after each completed work slice so it remains the persistent execution record.