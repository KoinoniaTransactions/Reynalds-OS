# Reynalds OS Canonical Registry

Reconciled for navigation: 2026-11-17. Audit baseline: `main` at `868c265aba7ef625b1dd471f7d5fc508e2770151`.

## How to resolve authority

Use this registry before old handoffs. Record **decision / implementation / verification / production** independently. Read later sections of each source for explicit supersession. Newer timestamps, merged status and labels alone are insufficient. Current owner instructions govern the authorized task; preserve conflicting evidence rather than silently selecting a winner.

## Authority and recovery map

| Subject | Source and observed location | What the evidence establishes / limits |
| --- | --- | --- |
| Transactions commercial model | Approved September production checkpoint `f6c821111ff17a602eee92db01998a0c52bf62f0`, `apps/web/content/{brand,home,services,about,contact,referrals}.ts`; later production code on `koinonia-production` | Website accepted/released, not awaiting original redesign approval. Confirm later subject changes before using September content as current. See retained October precedence below. |
| Transactions production source | `koinonia-production` at `1fd246d` observed November 17 | Contains October services/social-link changes and November branded-link expansion. Branch tip is not fresh runtime/deployment proof. `main` is a different tree. |
| Marketing checklist and activation | `koinonia-marketing-integration-2026-09-16`: `BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md` and `02_Companies/Koinonia/04_Departments/Marketing/MARKETING_ACTIVATION_READINESS_PLAN.md` | Existing integration/checklist; do not recreate from the September 5 task list. Later social-engine evidence must be read separately. |
| Social publishing/acquisition implementation | `feature/koinonia-social-publishing-engine-foundation-2026-11-02`: `BRAIN/KOINONIA_SOCIAL_PUBLISHING_ENGINE_BUILD_PLAN_2026-11-02.md`; draft PR #49 | Active work owned by another AI. Preview implementation and tests are distinct from authenticated acceptance and live activation. Fetch its latest head when needed; this audit does not edit it. |
| Properties dual-service positioning | `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_PROPERTIES_POSITIONING_AND_LOCAL_DISCOVERY_2026-11-03.md`, on audit baseline `main` | Approved equal residential sales / management; initial management Maps priority. Proposed Properties name later superseded in the November 6 record below. |
| Realty successor name and unified social identity | Same positioning path, **sections 11–12**, on `decision-koinonia-realty-2026-11-06` at `6438c32`; [PR #58](https://github.com/KoinoniaTransactions/Reynalds-OS/pull/58) | Records owner-selected Koinonia Realty LLC, one Realty brand / two funnels, Transactions separate. Open/unmerged at audit, not an anonymous proposal to discard. Name availability, entity/firm licensing, domain/handle ownership and public migration remain gated. No legal clearance inferred. |
| Management fees and operating decisions | `02_Companies/Koinonia/03_Pricing/KOINONIA_PROPERTIES_MANAGEMENT_LEASING_FEES_2026-11-04.md`, on `main` | Approved 8% / 10% management model and associated fees/rules. Not Transactions pricing; not legal clearance or public-release evidence. Realty naming direction preserves these decisions. |
| Owner communication standard | `docs/properties-communication-integrity-standard-2026-11-04`, PR #53 | Proactive communication / follow-through document for review. Proposed 60-minute target is not a proven public guarantee. |
| Properties / future Realty website | `integration/koinonia-properties-consolidated-2026-11-17` at `af7b28b`, `apps/properties-web/`; PRs #54–57 and rental-budget branch | November dual-service, pricing, inquiry and rental-estimate work exists. August DEV-state claims about 14 routes, no domain or absent features are historical. Consolidation branch is a recovery pointer, not a released or fully reconciled master. |
| Properties inquiry / rental runtime evidence | Same consolidated branch: `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_PROPERTIES_LEAD_INTAKE_ACTIVATION_2026-11-04.md`, especially November 5–6 checkpoints | Owner-reported rental inquiry receipt and one rent-estimate validation. Later budget build requires Redis activation/tests. Earlier “not implemented” paragraphs are time-bound. Does not prove every inquiry type, protected budget runtime or production release. |
| Historical service, package, pricing and website specs | `02_Companies/Koinonia/{01_Services,02_Packages,03_Pricing}/`, `03_Knowledge/Website/`, `docs/specifications/` | Mixed scope/history. September commercial precedence and November subject decisions override conflicting older claims. Use still-compatible scope; never treat entire directories as uniformly approved/current. |
| Governance / architecture | `BRAIN/REYNALDS_OS_CONSTITUTION.md`, `BRAIN/DEVELOPMENT_STANDARDS.md`, `docs/ARCHITECTURE.md` | Shared principles, subject to explicit owner instructions and current product/branch boundaries. Product Copilot behavior is not a blanket prohibition on authorized development. |
| Private records | `BRAIN/PRIVATE_RECORDS_BOUNDARY.md`; `BRAIN/PRIVATE_CASE_WORKSPACES.md` | Public code/governance and private factual records have different storage homes. Private content must not be copied into public Git for convenience. |

## Additional subject navigation

| Subject | Existing source | Scope |
| --- | --- | --- |
| Product vision | `BRAIN/PRODUCT_VISION.md` | Platform vision; not proof of delivery or current priorities. |
| Brand core | `03_Knowledge/Brand/koinonia_brand_core.md` | Shared voice; read later company-specific naming and positioning decisions. |
| Commercial sales architecture | `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md` | Commercial rationale; reconcile with approved production and later subject decisions. |
| Marketing Management fulfillment | `02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md` | Retain service-specific fulfillment/public-claim limits. |
| Partnership fulfillment | `02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md` | Retain service-specific fulfillment/public-claim limits. |
| Campaign creative | `02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md` | Working creative, not authority to publish, spend or revive a dated calendar. |
| Website framework and components | `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md`, `03_Knowledge/Website/PRODUCTION_INDEX.md`, `03_Knowledge/Website/component_catalog.md` | Production method/history; current source and release evidence control actual state. |
| Shared design and data | `BRAIN/DESIGN_SYSTEM_RULES.md`, `packages/design-system/`, `packages/database/prisma/schema.prisma` | Check the target branch; implementation/schema may differ across workstreams. |
| Decision lineage | `BRAIN/DECISION_LOG.md` | Read alongside the branch-specific approval records above. |
| Recovery snapshots | `RECOVERY_AUDIT/` | Historical reference; preserve. |

## Coverage and unresolved reconciliation

- Git: fetched remote branch refs on November 17; inspected key main, production, Realty, Properties and social records. No branches deleted, merged, rebased or reset. No claim that all historical documents have been semantically audited.
- Drive: located Koinonia Admin, Marketing & Website, Templates & SOPs, legal-filings folders and several sales-tracker versions. Discovery is not content approval; version names and modification dates do not prove which tracker is authoritative. Private file IDs, client records and contact data belong in a private locator/index, not this public registry.
- Storage clarification: the owner is unsure whether a separate vault was ever used. No separate vault is established as a project source, and locating one is not a prerequisite. Continue with GitHub, accessible Drive records and relevant ChatGPT history; record an additional source only if evidence identifies it.
- Cross-source decisions: confirm original approvals and private source coverage before archiving business data or choosing among tracker copies. Carry only sanitized business decisions into Git; keep supporting private evidence and locators private.
- Realty PR #58 records later decisions missing from `main`; reconcile its source deliberately. This navigation cleanup does not merge the PR or implement the rebrand.
- Deployment and legal status: this audit reads historical evidence and source trees. It does not reverify live hosting, legal formation, license authority, ownership of domains/accounts, or provider credentials.

## Retained approval provenance — October 13, 2026

The following is the previously recorded October checkpoint, preserved for provenance. For later branches/evidence use the map above; in particular, do not interpret its September production SHA, “current” next steps or implementation limits as a November runtime audit.

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


---
