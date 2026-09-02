# Current Priorities

## Active Phase

Koinonia White-Glove Service Expansion + Production Operations Backbone

---

# Primary Objective

Evolve Koinonia from a transaction-coordination-centered offering into the approved **white-glove, one-stop Realtor support relationship** while preserving the production website, existing transaction architecture, and repository-first operating standards.

The immediate platform objective is to make the expanded service model operational rather than merely marketable.

---

# Current Strategic Direction

Koinonia is intended to support nearly any legitimate operational need around running and serving a Realtor's business, subject to clear legal, brokerage, professional-responsibility, capacity, and economic boundaries.

Client-facing capability umbrellas:

1. Transactions & Contracts
2. Listings & Seller Operations
3. Licensed Field Coverage
4. Marketing & Growth
5. CRM, Client & Business Operations

The public architecture should remain simple even while the underlying capability catalog becomes broad.

Core customer experience:

> Bring Koinonia the need. We help get it handled.

Canonical brand source:

- `03_Knowledge/Brand/koinonia_brand_core.md`

Owner direction:

- `02_Companies/Koinonia/04_Departments/Operations/OWNER_DIRECTION_WHITE_GLOVE_ONE_STOP_SUPPORT_2026-09-02.md`

Working capability master:

- `02_Companies/Koinonia/04_Departments/Operations/realtor_capability_catalog_working_master_2026-09-02.md`

---

# Repository / Product Status

## Public website

The Koinonia public website is established and remains the primary marketing/conversion destination.

Current service/marketing copy must continue to follow canonical service-claim rules. Expanded capabilities should not be promoted as production-certified until the relevant operating and pricing rules are approved.

## Existing production service foundation

Canonical Service Catalog currently remains the source of truth for the existing certified service objects:

- Transaction Management
- Contract Preparation & Writing
- Licensed Showing Coverage
- Business Operations Support

The approved expansion work is intentionally being designed and implemented before those canonical objects are rewritten.

## Marketing / positioning expansion

Current design work establishes Marketing & Growth as an intended major Koinonia capability and supersedes earlier assumptions that Koinonia should avoid becoming a meaningful Realtor marketing provider.

Working marketing design:

- `02_Companies/Koinonia/04_Departments/Marketing/REALTOR_MARKETING_SERVICE_DESIGN_2026-09-02.md`

## Hand Us the Listing

`Hand Us the Listing` is the first integrated white-glove workflow being turned into application infrastructure.

Blueprint:

- `02_Companies/Koinonia/04_Departments/Operations/HAND_US_THE_LISTING_INTEGRATED_WORKFLOW_2026-09-02.md`

Implemented backbone documentation:

- `docs/HAND_US_THE_LISTING_BACKBONE_IMPLEMENTATION.md`

Current implementation includes:

- Listing Engagement domain model on the existing RosObject architecture
- listing intake validation
- `/api/koinonia/listings` create/list endpoint
- automatic launch checklist tasks
- listing timeline events
- `/listings` Listing Center UI
- accepted-offer handoff into the existing Transaction object/Transaction Center
- idempotent Listing Engagement -> Transaction relationship
- initial contract-to-close handoff tasks

---

# Current Development Principles

Every production task should continue to follow:

1. Inspect existing implementation.
2. Identify governing canonical documentation.
3. Extend before creating parallel systems.
4. Implement the smallest coherent working slice.
5. Keep APIs workspace-scoped, permission-checked, validated, and auditable.
6. Add tests for core logic.
7. Run test/build verification.
8. Update relevant continuity documentation.

Core principle:

**Recover before reinventing. Reuse before replacing. Extend before creating.**

---

# Active Work Order

## Priority 1 — Listing Operations Backbone

Continue the Hand Us the Listing implementation on the existing Object Engine.

Next slices:

1. Listing phase/status progression
2. launch checklist completion controls
3. approval queue
4. Marketing Work Order
5. Vendor Work Order
6. quick action: Open House
7. quick action: Property / Field Coverage
8. quick action: Create / Refresh Marketing
9. document/email intake integration
10. accepted-offer handoff enhancements and transaction deadline automation

## Priority 2 — Canonical Service Reconciliation

After the underlying workflows are sufficiently defined:

- formalize Listing Operations
- expand Licensed Showing Coverage toward Licensed Field Coverage if approved
- formalize Marketing & Growth service scope
- reconcile Professional Open House Coverage
- update packages/pricing
- only then update public website/service claims

## Priority 3 — Realtor Management Model

Design the premium recurring relationship that can combine:

- CRM / business operations
- marketing
- listing operations
- contract support
- transaction management
- licensed field coverage
- vacation / overflow coverage

Do not promise unlimited usage until actual capacity and unit economics are measured.

---

# Current Non-Negotiable Boundaries

- Do not build a proprietary Showami-style marketplace merely to fulfill field tasks.
- Fulfillment method is not the product; Koinonia owns the service relationship and accountability.
- Do not misrepresent third-party specialists/providers as Koinonia employees or licensees.
- Do not perform or imply Realtor/broker professional judgment where authority remains with the responsible Realtor/brokerage.
- Physical closing-attendance coverage remains specifically gated pending the approved brokerage/designation/responsibility model.
- Expanded working capability documents do not automatically authorize public advertising or pricing.

---

# Immediate Next Task

Complete and verify the first Listing Operations application slice, then continue into the **Listing Launch Control Board**:

- phase/status progression
- checklist completion
- approvals
- marketing/vendor work orders
- field/open-house quick actions

The goal is a Realtor experience where:

> **I got a listing. I handed it to Koinonia. They kept the operational work moving all the way through closing and follow-up.**

---

# Success Criteria for Current Phase

The current phase is successful when:

- a Realtor can initiate a Listing Engagement with minimal input;
- Koinonia can see and manage the launch work from one record;
- listing marketing/vendor/field work can be attached without separate client-facing systems;
- an accepted offer becomes a Transaction without duplicate intake;
- operational approvals and exceptions are visible;
- the service architecture remains consistent with the white-glove one-stop support direction;
- test/build verification remains passing;
- canonical service/pricing/public claims are updated only after operational certification.
