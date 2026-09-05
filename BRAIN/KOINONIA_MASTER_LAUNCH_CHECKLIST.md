# Koinonia Master Launch Checklist

Last reconciled: 2026-09-05
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

The website customer experience must be completed and owner-approved before the marketing-integration work is treated as launch-ready. This avoids instrumenting a page structure that is still being changed.

Current next item:

**W1 — Fix Services & Pricing information architecture and detailed-scope behavior.**

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

- [ ] W1.1 — Remove the current giant fully-expanded `What do I actually get?` wall from the normal page flow.
- [ ] W1.2 — Preserve the current detailed product-scope content rather than rewriting the commercial model.
- [ ] W1.3 — Replace fake `See everything included` anchor behavior with true reveal behavior on the same page.
- [ ] W1.4 — Build/reuse one standard Koinonia detailed-scope interaction component.
- [ ] W1.5 — Preferred UX: polished modal/dialog on desktop and near-full-screen sheet on mobile, unless implementation review reveals a materially better accessible pattern.
- [ ] W1.6 — Ensure the detail experience supports long content cleanly, including internal scrolling where needed.
- [ ] W1.7 — Ensure close button, Escape key, focus handling, keyboard access, and screen-reader semantics are correct.
- [ ] W1.8 — Keep the parent Services page as lightweight/server-rendered as practical; isolate client interaction to the detail component rather than converting the entire page unnecessarily.

Acceptance criteria: the visitor can scan pricing quickly and open detailed scope for one product without being forced through every other product's detail content.

## W2 — Pricing-card hierarchy and scanability

- [ ] W2.1 — Each commercial product card clearly shows product name.
- [ ] W2.2 — Price and price basis are immediately visible.
- [ ] W2.3 — One clear outcome/promise is visible without excessive text.
- [ ] W2.4 — Keep only a short set of high-value inclusions visible on the card.
- [ ] W2.5 — `See everything included` is visually secondary to the primary service CTA.
- [ ] W2.6 — Pricing cards remain balanced and easy to compare on desktop and mobile.
- [ ] W2.7 — Current approved pricing remains unchanged unless canonical business documentation changes.

Acceptance criteria: a Realtor can understand the buying options and approximate differences with a fast visual scan.

## W3 — Services page visual hierarchy and density

- [ ] W3.1 — Review five capability cards for clarity and density.
- [ ] W3.2 — Refine white-glove differentiation section so it sells continuity/accountability without overexplaining.
- [ ] W3.3 — Make Marketing Management vs Koinonia Partnership distinction obvious.
- [ ] W3.4 — Review popular/common solution cards for redundancy and usefulness.
- [ ] W3.5 — Keep outside-cost explanation clear but brief.
- [ ] W3.6 — Keep professional/compliance boundaries present without letting them dominate the sales experience.
- [ ] W3.7 — Review section spacing and page rhythm so the page feels premium/light rather than documentation-heavy.
- [ ] W3.8 — Preserve the approved light/airy Koinonia visual system and existing hero direction unless Jeremiah explicitly reopens it.

Acceptance criteria: the Services page feels like a premium white-glove sales experience rather than a long operating manual.

## W4 — Homepage vs Services role

- [ ] W4.1 — Keep Homepage as the concise introduction to the white-glove model.
- [ ] W4.2 — Keep deeper product explanation primarily on Services & Pricing.
- [ ] W4.3 — Remove or tighten unnecessary duplication between Home and Services.
- [ ] W4.4 — Confirm Homepage still preserves the approved hero/image treatment.
- [ ] W4.5 — Verify Home pricing/support links point to the correct current Services interactions/sections.

Acceptance criteria: Home sells the concept quickly; Services explains the buying options in depth.

## W5 — CTA, navigation, and route behavior

- [ ] W5.1 — Audit `Tell Us What You Need` CTAs.
- [ ] W5.2 — Audit Transaction Management CTA.
- [ ] W5.3 — Audit Hand Us the Listing CTA.
- [ ] W5.4 — Audit Licensed Field Coverage / Open House CTA paths.
- [ ] W5.5 — Audit Marketing Management CTA.
- [ ] W5.6 — Audit Koinonia Partnership CTA.
- [ ] W5.7 — Audit Custom Project CTA.
- [ ] W5.8 — Audit Header and Footer navigation.
- [ ] W5.9 — Audit Contact / consultation scheduler behavior.
- [ ] W5.10 — Confirm retired `/appointments` behavior redirects correctly and is not revived as a stale page.
- [ ] W5.11 — Check all changed anchors/deep links after the Services detail UX changes.

Acceptance criteria: every visible CTA lands in the intended current flow with no dead, stale, or misleading destinations.

## W6 — Desktop and mobile visual QA

- [ ] W6.1 — Desktop Services visual QA.
- [ ] W6.2 — Mobile Services visual QA.
- [ ] W6.3 — Desktop Homepage visual QA.
- [ ] W6.4 — Mobile Homepage visual QA.
- [ ] W6.5 — Detail modal/sheet desktop QA.
- [ ] W6.6 — Detail modal/sheet mobile QA.
- [ ] W6.7 — Verify typography, spacing, card heights, price visibility, buttons, and scroll behavior.
- [ ] W6.8 — Verify no text clipping, overflow, awkward whitespace, or unusable long-content states.

Acceptance criteria: the approved commercial experience works cleanly at representative desktop and mobile widths.

## W7 — Technical website QA

- [ ] W7.1 — Typecheck passes.
- [ ] W7.2 — Production build passes.
- [ ] W7.3 — Relevant tests pass.
- [ ] W7.4 — Public routes load correctly.
- [ ] W7.5 — SEO metadata reflects current white-glove commercial architecture.
- [ ] W7.6 — Accessibility review of interactive components and key page structure.
- [ ] W7.7 — Dead-link / route-link review.
- [ ] W7.8 — Contact/consultation submission behavior verified.
- [ ] W7.9 — Non-production Vercel preview generated from the reviewed website state.

Acceptance criteria: a clean preview exists that accurately represents the candidate website release and passes technical validation.

## W8 — OWNER GATE: website approval

- [ ] W8.1 — Jeremiah reviews the final non-production Homepage and Services & Pricing preview.
- [ ] W8.2 — Requested visual/content/functional corrections completed.
- [ ] W8.3 — Jeremiah explicitly approves the public website experience for production preparation.

**OWNER GATE: Do not promote the redesign to `koinonia-production` before W8.3 is checked.**

## W9 — Website production promotion

- [ ] W9.1 — Prepare controlled production promotion from the approved website state.
- [ ] W9.2 — Promote only the reviewed/approved state to `koinonia-production`.
- [ ] W9.3 — Verify actual production domain reflects the approved release.
- [ ] W9.4 — Verify primary routes and retired-route redirects in production.
- [ ] W9.5 — Record production release checkpoint in repo documentation.

Acceptance criteria: the public domain, not merely GitHub or a Vercel preview, shows the owner-approved website.

---

# PHASE B — Marketing, attribution, retargeting, and campaign readiness

## M1 — Fresh marketing integration branch

- [ ] M1.1 — Create a fresh marketing-integration branch from the then-current approved/current `main` state.
- [ ] M1.2 — Do not merge `koinonia-marketing-readiness` wholesale.
- [ ] M1.3 — Compare old readiness implementation against current public routes/components before porting.

Acceptance criteria: marketing work begins from the current website architecture with no wholesale legacy-branch merge.

## M2 — Port/reimplement measurement and attribution foundation

- [ ] M2.1 — Public-route GA4 loading.
- [ ] M2.2 — Scheduler-open event.
- [ ] M2.3 — Consultation/service-selection intent events where useful.
- [ ] M2.4 — Contact call/text/email events where useful.
- [ ] M2.5 — Successful consultation `generate_lead` event tied only to accepted lead submission.
- [ ] M2.6 — UTM capture/persistence.
- [ ] M2.7 — First-touch attribution persistence.
- [ ] M2.8 — Latest-touch attribution persistence.
- [ ] M2.9 — Conversion-touch attribution persistence.
- [ ] M2.10 — Capture/preserve `fbclid`.
- [ ] M2.11 — Capture/preserve `ttclid`.
- [ ] M2.12 — Capture/preserve `gclid`.
- [ ] M2.13 — Capture/preserve `gbraid`.
- [ ] M2.14 — Capture/preserve `wbraid`.
- [ ] M2.15 — Capture/preserve `msclkid`.
- [ ] M2.16 — CRM/Koinonia Relationship persistence of attribution and click IDs.
- [ ] M2.17 — Privacy preference controls.
- [ ] M2.18 — Global Privacy Control behavior.
- [ ] M2.19 — Keep advertising tracking off authenticated client/staff routes.
- [ ] M2.20 — Attribution persistence tests pass.

Acceptance criteria: campaign source data survives from anonymous visit through accepted lead and CRM relationship record.

## M3 — Prove GA4

- [ ] M3.1 — Identify/confirm the real Koinonia GA4 property/web stream.
- [ ] M3.2 — Confirm the real `G-...` Measurement ID.
- [ ] M3.3 — Configure the correct ID in preview environment.
- [ ] M3.4 — Prove a real public page view in GA4 Realtime/DebugView.
- [ ] M3.5 — Prove a successful test consultation produces `generate_lead`.
- [ ] M3.6 — Confirm micro-events are not incorrectly counted as leads.

Acceptance criteria: GA4 is proven with real observed events, not merely present in code.

## M4 — Meta tracking and retargeting

- [ ] M4.1 — Create/identify correct Koinonia Meta Dataset/Pixel.
- [ ] M4.2 — Confirm ownership/account access.
- [ ] M4.3 — Add real ID to preview only first.
- [ ] M4.4 — Test advertising consent denied behavior.
- [ ] M4.5 — Test advertising consent granted behavior.
- [ ] M4.6 — Verify Meta PageView/test event.
- [ ] M4.7 — Verify Meta Lead event from successful lead submission.
- [ ] M4.8 — Create initial useful-volume website/high-intent/social-engager audiences.
- [ ] M4.9 — Configure converter exclusion where practical.
- [ ] M4.10 — Decide later whether Meta Conversions API is warranted; if added with browser events, implement deduplication.

## M5 — TikTok tracking and retargeting

- [ ] M5.1 — Create/identify correct Koinonia TikTok Pixel.
- [ ] M5.2 — Confirm ownership/account access.
- [ ] M5.3 — Add real ID to preview only first.
- [ ] M5.4 — Test advertising consent denied behavior.
- [ ] M5.5 — Test advertising consent granted behavior.
- [ ] M5.6 — Verify TikTok page/test event.
- [ ] M5.7 — Verify TikTok Lead event from successful lead submission.
- [ ] M5.8 — Create initial useful-volume audiences.
- [ ] M5.9 — Configure converter exclusion where practical.
- [ ] M5.10 — Decide later whether TikTok Events API is warranted; if added with browser events, implement deduplication.

## M6 — End-to-end tagged campaign acceptance test

- [ ] M6.1 — Open controlled tagged campaign URL.
- [ ] M6.2 — Verify first-touch attribution stored.
- [ ] M6.3 — Verify landing/page event.
- [ ] M6.4 — Trigger and verify a high-intent event.
- [ ] M6.5 — Submit a real test consultation.
- [ ] M6.6 — Verify backend accepted the lead.
- [ ] M6.7 — Verify Koinonia Relationship record created/updated.
- [ ] M6.8 — Verify first/latest/conversion-touch fields.
- [ ] M6.9 — Verify supplied click IDs survive where applicable.
- [ ] M6.10 — Verify follow-up task/timeline behavior.
- [ ] M6.11 — Verify GA4 `generate_lead`.
- [ ] M6.12 — Verify Meta `Lead`.
- [ ] M6.13 — Verify TikTok `Lead`.
- [ ] M6.14 — Verify converter-exclusion eligibility/behavior as designed.

Acceptance criteria: one controlled test proves the entire campaign -> site -> lead -> CRM -> measurement path.

## M7 — Email campaign launch readiness

- [ ] M7.1 — Verify SPF.
- [ ] M7.2 — Verify DKIM.
- [ ] M7.3 — Verify DMARC.
- [ ] M7.4 — Confirm sending-domain/reputation strategy.
- [ ] M7.5 — Verify accurate From/Reply-To identity.
- [ ] M7.6 — Verify physical postal address requirement in campaign messages.
- [ ] M7.7 — Verify working unsubscribe/opt-out.
- [ ] M7.8 — Verify suppression of opted-out recipients.
- [ ] M7.9 — Review list source/permission quality.
- [ ] M7.10 — Define consistent campaign UTM convention.
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
