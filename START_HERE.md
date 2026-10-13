# START HERE — Reynalds OS

Last reconciled: 2026-09-05

## Welcome

This is the mandatory entry point for every new development session.

Whether you are an AI assistant, GitHub Copilot, or a human developer, begin here before making recommendations, writing code, creating documentation, designing assets, or modifying the repository.

The repository is the primary source of truth. Conversation history is supporting context, not a substitute for repository inspection.

---

# Repository Identity

Repository:

`KoinoniaTransactions/Reynalds-OS`

Primary application:

`apps/web`

Current business/application focus:

**Koinonia public commercial platform + marketing launch readiness**

Current immediate implementation focus:

**Finish and owner-approve the current September white-glove public website experience, then integrate social/email/retargeting measurement and conversion infrastructure safely against that approved architecture.**

Persistent execution checklist:

`BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md`

Whenever the owner asks for "the checklist", "the plan", "where are we", or "what is next", read and update that file.

---

# Repository Maturity

Reynalds OS is an actively developed production repository.

It already contains:

- established architecture;
- reusable React components;
- shared content systems;
- production design standards;
- business knowledge;
- commercial product/readiness rules;
- operating workflows;
- CRM/relationship data structures;
- deployment infrastructure;
- marketing/campaign specifications.

Assume the repository contains more capability and newer decisions than any single old handoff may show.

Never assume something does not exist until the repository has been searched.

---

# Core Development Principles

Always:

- Understand before changing.
- Recover before reinventing.
- Extend before creating.
- Inspect before recommending.
- Identify the canonical business source before changing claims/pricing.
- Verify branch/deployment state before declaring something live.

---

# Required Reading Order

## Phase 1 — Current Checkpoint

1. `BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md`
2. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_COMMERCIAL_WEBSITE_UNFINISHED.md`
3. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
4. `BRAIN/HANDOFF.md`
5. `BRAIN/CURRENT_PRIORITIES.md`
6. `CURRENT_STATE.md`
7. `NEXT_ACTION.md`

## Phase 2 — Governance / Canonical Sources

8. `BRAIN/REYNALDS_OS_CONSTITUTION.md`
9. `BRAIN/CANONICAL_REGISTRY.md`
10. `BRAIN/DEVELOPMENT_STANDARDS.md`
11. `BRAIN/DECISION_LOG.md`

## Phase 3 — Koinonia Marketing / Commercial Sources

12. `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_MARKETING_TECHNICAL_READINESS_2026-09-05.md`
13. `02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
14. `02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
15. `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md`
16. `02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

Read additional product/service/pricing objects as required by the task.

---

# Critical Branch Warning

Do not treat these branches as interchangeable:

- `main`
- `koinonia-production`
- `koinonia-marketing-readiness`

The marketing-readiness branch was built from an older production baseline and diverged from the newer September commercial/site work on `main`.

For current marketing integration:

**create a fresh branch from current `main` and selectively port/reimplement the readiness functionality. Do not merge the old readiness branch wholesale.**

Never deploy production without explicit owner approval.

---

# Before Implementing Anything

1. Inspect current repository state.
2. Read the master launch checklist and identify the next unchecked active item.
3. Confirm the governing canonical source.
4. Confirm the correct branch.
5. Search for an existing implementation.
6. Compare current commercial claims to the proposed implementation.
7. Prefer a preview/non-production path for risky changes.
8. Validate build/runtime behavior.
9. Update the master launch checklist for completed work.
10. Document meaningful decisions.
11. Request explicit owner approval before production promotion.

---

# Current Mission

First, complete and owner-approve the current white-glove public website experience.

Then prepare Koinonia's public commercial system for a controlled marketing launch where paid/social/email traffic can be measured, retained, retargeted and converted without compromising privacy, CRM attribution or production stability.

The campaign funnel is:

**campaign -> public website -> attribution -> intent -> lead -> Koinonia relationship -> follow-up -> retargeting/nurture**

---

# Definition of Success

Success is not merely adding pixels or producing more documentation.

For the current phase, success means:

- the public website presents the current white-glove commercial model clearly and has Jeremiah's explicit approval;
- current commercial messaging remains accurate;
- GA4 is proven with real events;
- Meta/TikTok use verified IDs and test events;
- public/private tracking boundaries are correct;
- first/latest/conversion-touch attribution reaches the CRM;
- retargeting audiences can be built;
- email authentication/unsubscribe/suppression are ready;
- a tagged test lead completes the entire funnel;
- the owner reviews the result before production deployment.

---

# Final Reminder

Inspect first.

Recover second.

Use the checklist.

Integrate carefully.

Deploy only with authorization.


---

## CURRENT KOINONIA APPROVAL PRECEDENCE — 2026-10-13

**This section overrides older branch-specific next-step instructions and prelaunch status assertions in this file.** The owner-approved public website was released 2026-09-16 on `koinonia-production` at `f6c821111ff17a602eee92db01998a0c52bf62f0`. It is NOT awaiting website completion or approval. The later, controlled marketing work uses `koinonia-marketing-integration-2026-09-16` (draft PR #36), based on that approved production checkpoint—not an unreviewed merge of the legacy `koinonia-marketing-readiness` branch.

**Authoritative/current by subject, regardless of older labels such as Active:**

1. **Public offers, pricing, tone and site:** the approved production commit's `apps/web/content/{brand,home,services,about,contact,referrals}.ts` and its implemented UI. Five support capabilities: Transactions & Contracts; Listing & Seller Support; Licensed Field Coverage; Marketing & Growth; CRM & Business Operations. Current public products: Transaction Management $450 per successful closing; Hand Us the Listing $350 per standard listing; Licensed Field Coverage from $75; professional open house $200; Marketing Management $750/month; Koinonia Partnership $1,250/month; custom projects quoted. Separate 40% Referral Partner Option, not a sixth operational service. Licensed document-support capabilities do not authorize invented standalone public pricing.
2. **Launch checklist and actual milestones:** `BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md` on `koinonia-marketing-integration-2026-09-16`. W1–W9 website accepted and released; marketing M6 unified tagged-to-CRM proof and later M7–M11 stages are still gated; do not reset completed stages.
3. **Marketing activation authority:** `02_Companies/Koinonia/04_Departments/Marketing/MARKETING_ACTIVATION_READINESS_PLAN.md` (integration branch) governs permission to publish, send, outreach or spend. The historic fixed-date August calendar does NOT authorize activity. LinkedIn company presence was later owner-approved, superseding the earlier exclusion.
4. **Measured preview evidence:** `BRAIN/KOINONIA_MARKETING_INTEGRATION_AUDIT_2026-09-16.md` (integration branch) documents separately proven GA4, Meta and TikTok preview events, NOT full M6 cross-platform tagged attribution or live production activation. October CRM screenshots confirmed Relationship, task, timeline and referrer storage; no campaign UTM/click ID was demonstrated. A read-only attribution display exists on the marketing branch only.
5. **Portal:** `BRAIN/KOINONIA_PORTAL_HANDOFF_2026-09-05.md` plus later approved production code. Realtor experience should remove operational burden; staff internal views can be detailed. Do not regress portal/auth/Prisma safeguards.

**Historical where conflicting:** `CURRENT_STATE.md`, `PROJECT_MEMORY.md`, `NEXT_ACTION.md`, `BRAIN/PROJECT_STATE.md`, `BRAIN/CURRENT_PRIORITIES.md`, older website recovery/specification materials, service/pricing objects and older marketing handoffs. Earlier $389/$599 transaction pricing, $299/$599/$999 monthly tiers, four-category service snapshots, the initial LinkedIn exclusion, fixed-date marketing calendar and prelaunch website status must NOT replace approved September decisions. Preserve historical documents for provenance; do not ask the owner to reconfirm settled choices because an old file disagrees.

**New session procedure:** first identify the actual branch and latest approved deployment, inspect the approved production commercial content, read the current marketing-branch checklist and activation gate, then inspect relevant implementation before proposing any new work. Never equate a ready preview, passing build or draft PR with approval to publish or deploy. No marketing publishing, outbound sends, paid spend, new test submissions or production promotion without applicable explicit owner authorization. When later owner-approved changes occur, update these existing entry points and the relevant governing sources together; do not create competing 'master truth' documents.
