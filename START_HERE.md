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

**Koinonia canonical capability recovery + commercial launch readiness**

Current immediate implementation focus:

**Recover the strongest surviving Koinonia portal, transaction, referral, document, billing and marketing capabilities into one controlled reconciliation branch built from current September `main`, then resume final public-site and marketing launch work against that recovered baseline.**

Canonical reconciliation branch:

`integration/koinonia-canonical-reconciliation-20260905`

Capability recovery ledger:

`BRAIN/KOINONIA_CAPABILITY_RECOVERY_LEDGER_2026-09-05.md`

Persistent execution checklist:

`BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md`

Whenever the owner asks for "the checklist", "the plan", "where are we", or "what is next", read both the Capability Recovery Ledger and master launch checklist before answering.

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

Important current recovery fact:

**No single historical Koinonia branch contains the complete current platform.**

`main` contains the newest September commercial/public-site truth, while substantial portal/transaction/referral/document/payment/marketing capabilities survive on parallel branches. The current reconciliation effort must recover those capabilities selectively rather than treating any one branch as a wholesale merge source.

---

# Core Development Principles

Always:

- Understand before changing.
- Recover before reinventing.
- Extend before creating.
- Inspect before recommending.
- Identify the canonical business source before changing claims/pricing.
- Verify branch/deployment state before declaring something live.
- Recover capability-level behavior, not stale branch-level assumptions.

---

# Required Reading Order

## Phase 1 — Current Recovery Checkpoint

1. `BRAIN/KOINONIA_CAPABILITY_RECOVERY_LEDGER_2026-09-05.md`
2. `BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md`
3. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_COMMERCIAL_WEBSITE_UNFINISHED.md`
4. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
5. `BRAIN/HANDOFF.md`
6. `BRAIN/CURRENT_PRIORITIES.md`
7. `CURRENT_STATE.md`
8. `NEXT_ACTION.md`

## Phase 2 — Governance / Canonical Sources

9. `BRAIN/REYNALDS_OS_CONSTITUTION.md`
10. `BRAIN/CANONICAL_REGISTRY.md`
11. `BRAIN/DEVELOPMENT_STANDARDS.md`
12. `BRAIN/DECISION_LOG.md`

## Phase 3 — Koinonia Marketing / Commercial Sources

13. `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_MARKETING_TECHNICAL_READINESS_2026-09-05.md`
14. `02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
15. `02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
16. `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md`
17. `02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`

Read additional product/service/pricing objects and source-branch implementations as required by the task.

---

# Critical Branch Warning

Do not treat these branches as interchangeable:

- `main`
- `koinonia-production`
- `integration/koinonia-canonical-reconciliation-20260905`
- `chatgpt/koinonia-transaction-intake-redesign`
- `chatgpt/koinonia-consultation-system`
- `koinonia-marketing-readiness`
- `koinonia-paid-social-launch-readiness`

Current branch roles:

- `main` — governing September commercial/public-site baseline.
- `integration/koinonia-canonical-reconciliation-20260905` — active controlled recovery branch created from current `main`; this is where capability recovery work should proceed.
- `koinonia-production` — separately controlled live-production lineage; contains some later production deltas but must not be merged wholesale.
- `chatgpt/koinonia-transaction-intake-redesign` — richest preserved portal/transaction operating lineage and a major recovery source, not a wholesale merge source.
- `chatgpt/koinonia-consultation-system` — parallel consultation workflow source requiring selective reconciliation.
- `koinonia-marketing-readiness` — older marketing instrumentation source requiring selective porting.
- `koinonia-paid-social-launch-readiness` — paid-social landing/attribution source requiring selective reconciliation.

For all recovery work:

**use the Capability Recovery Ledger, compare the source implementation against current September business truth, and port only the smallest stable capability slice.**

Never deploy production without explicit owner approval.

---

# Before Implementing Anything

1. Inspect current repository state.
2. Read the Capability Recovery Ledger and master launch checklist.
3. Identify the next unchecked active recovery item.
4. Confirm the governing canonical business source.
5. Confirm the correct source branch and reconciliation branch.
6. Search for an existing implementation before creating anything.
7. Compare historical code/claims/pricing to current commercial truth.
8. Prefer capability-level selective recovery over wholesale branch merges.
9. Prefer a preview/non-production path for risky changes.
10. Validate build/runtime behavior after each stable slice.
11. Update the recovery ledger/checklist for completed work.
12. Document meaningful decisions.
13. Request explicit owner approval before production promotion.

---

# Current Mission

First, recover and reconcile the strongest surviving Koinonia operational platform capabilities onto the current September commercial baseline.

The recovery order is broadly:

**portal/auth foundation -> transaction/client operations -> document workflow -> referrals -> billing/payments -> later production deltas -> marketing/paid-social -> consultation -> composite verification**

After that recovered platform baseline is proven, complete and owner-approve the white-glove public website experience and controlled marketing launch.

The eventual campaign funnel remains:

**campaign -> public website -> attribution -> intent -> lead -> Koinonia relationship -> follow-up -> retargeting/nurture**

---

# Definition of Success

Recovery success is not merely finding old code or creating more documentation.

A capability is recovered only when:

- the intended behavior exists on the canonical reconciliation branch;
- it is reconciled against current September commercial truth;
- relevant build/tests pass;
- privacy, permission, billing and human-review boundaries are preserved;
- continuity documentation is updated.

Launch success then means:

- the recovered portal/transaction/referral/document foundation is stable;
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

Use the ledger and checklist.

Integrate carefully.

Deploy only with authorization.
