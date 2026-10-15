# Reynalds OS Canonical Registry

## Purpose

This document identifies the authoritative source for every major area of the Reynalds OS repository.

Before creating new documentation, copy, or code, verify whether a canonical source already exists.

Core principle:

Recover before reinventing.

## CURRENT-SOURCE PRECEDENCE — mandatory for all Koinonia work

Later explicitly owner-approved and production-released decisions supersede earlier drafts, even when earlier documents are still labelled `Active` or `Canonical`. Start with `BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md` on the marketing integration branch for latest accepted gates; for public business model and pricing use the actual approved production website at `koinonia-production` release `f6c821111ff17a602eee92db01998a0c52bf62f0` (`apps/web/content/home.ts`, `services.ts`, `contact.ts`, `referrals.ts`, `brand.ts`, `about.ts`). Use the Marketing Activation Readiness Plan for live-channel authorization and the marketing integration audit for September preview evidence. Never revert to older proposals solely because their registry entry says Active. Resolve true new conflicts through evidence and owner approval; do not reopen settled choices.

---

# Brain & Platform

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Project Vision | BRAIN/PRODUCT_VISION.md | Active |
| Project State | BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md (active Koinonia launch workstream) | Current milestone and gates |
| Earlier project-state snapshots | BRAIN/PROJECT_STATE.md; BRAIN/CURRENT_PRIORITIES.md; CURRENT_STATE.md; PROJECT_MEMORY.md; NEXT_ACTION.md | Historical where superseded by September launch evidence |
| Constitution | BRAIN/REYNALDS_OS_CONSTITUTION.md | Active |
| Development Standards | BRAIN/DEVELOPMENT_STANDARDS.md | Active |
| Design System Rules | BRAIN/DESIGN_SYSTEM_RULES.md | Active |
| Repository Architecture | docs/ARCHITECTURE.md | Active |
| Decision Log | BRAIN/DECISION_LOG.md | Active |
| Current Koinonia Priorities | BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md | Active controlled checklist; W1-W9 approved and released |

---

# Koinonia Business

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Brand principles | 03_Knowledge/Brand/koinonia_brand_core.md | Active principles; current approved public expression in production website content |
| Current public capabilities/products | apps/web/content/home.ts and apps/web/content/services.ts at approved production release f6c8211 | Current owner-approved presentation; five areas, separate 40% referral option |
| Current public pricing | apps/web/content/services.ts at approved production release f6c8211 | $450 successful-close TC; $350 listing; from $75 field; $200 open house; $750/month Marketing; $1,250/month Partnership; custom quoted |
| Earlier service/package/pricing objects | 02_Companies/Koinonia/01_Services/; 02_Companies/Koinonia/02_Packages/; 02_Companies/Koinonia/03_Pricing/; BRAIN/KOINONIA_SERVICES_PRICING_BLUEPRINT.md | Historical where inconsistent with approved September products/prices |

---

# Website

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Website Framework | 03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md | Active |
| Approved public production content | apps/web/content/{brand,home,services,about,contact,referrals}.ts at koinonia-production release f6c8211 | Governs current public expression |
| Production Index | 03_Knowledge/Website/PRODUCTION_INDEX.md | Historical recovery map where prelaunch status conflicts |
| Page Specifications | docs/specifications/ | Implementation references; historical where contradicted by owner-approved September website |
| Component Catalog | 03_Knowledge/Website/component_catalog.md | Active |

---

# Application

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| React Application | apps/web/ | Active |
| Design System | packages/design-system/ | Active |
| Database Schema | packages/database/prisma/schema.prisma | Active |

---

# Recovery

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Recovery Snapshots | RECOVERY_AUDIT/ | Reference Only |

---

## Marketing control

| Subject | Governing Source | Status |
|---|---|---|
| Owner gates and outstanding milestones | BRAIN/KOINONIA_MASTER_LAUNCH_CHECKLIST.md | Current on integration branch; marketing PR #36 draft/unmerged |
| Channel approval, outreach, publishing, paid spend | 02_Companies/Koinonia/04_Departments/Marketing/MARKETING_ACTIVATION_READINESS_PLAN.md | Owner-gated; dated launch calendar does not authorize sending |
| Preview measurement proof | BRAIN/KOINONIA_MARKETING_INTEGRATION_AUDIT_2026-09-16.md | September evidence; not unified M6 nor production activation |
| Legacy LinkedIn exclusion | 02_Companies/Koinonia/04_Departments/Marketing/EXECUTION_INDEX.md | Superseded by later owner approval of LinkedIn company presence |

## Rule

Always identify the canonical source before creating or modifying documentation, business rules, or application code.


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
