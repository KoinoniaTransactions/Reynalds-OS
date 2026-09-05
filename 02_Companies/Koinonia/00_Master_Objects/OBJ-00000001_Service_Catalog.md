# OBJ-00000001 Service Catalog

Class: Master Object  
Type: Service Catalog  
Module: Koinonia  
Status: Active  
Version: 2.3  
Owner: Koinonia  
Memory Level: Foundational  
Effective Date: 2026-09-05

## Purpose

The Service Catalog is the single source of truth for Koinonia's service capabilities.

Service objects define **what Koinonia can support**. Package objects define **what the Realtor buys**. Pricing-rule objects define **how the commercial product is priced/billed**.

The public website may group these capabilities beneath simple client-facing umbrellas and does not need to expose every service object as a separate product.

## Current Canonical Service Capabilities

- **OBJ-00000002 — Transaction Management Service**  
  Status: Production Certified  
  Role: Contract-to-close transaction coordination foundation.

- **OBJ-00000014 — Contract & Document Support Service**  
  Status: Controlled / Standalone Compensation Gated  
  Role: Approved document workflow support from Realtor-provided terms/instructions. Standalone public compensation is not currently authorized by this catalog.

- **OBJ-00000015 — Listing & Seller Support Service**  
  Status: Controlled Launch Approved  
  Role: Listing intake, preparation/vendor coordination, launch support, base listing marketing integration, active-listing administration, and accepted-offer handoff under documented brokerage/MLS/approval controls.

- **OBJ-00000016 — Licensed Field Coverage Service**  
  Status: Controlled Launch Approved  
  Role: Buyer showings, professional open houses, inspection/appraisal/vendor access, and approved property field assignments under documented REAP/ministerial, access, brokerage, and compensation controls. Final walk-through representation, closing coverage, negotiation, and other brokerage-service duties remain gated.

- **OBJ-00000017 — Marketing & Growth Service**  
  Status: Controlled Launch Approved  
  Role: Managed Realtor/listing/database marketing execution and approved specialist coordination under documented advertising, account-access, approval, email, outside-cost, and results-claim controls.

- **OBJ-00000018 — CRM & Business Operations Service**  
  Status: Controlled Launch Approved  
  Role: CRM, follow-up, tasks, systems, vendors, reporting, workflow, and recurring business-operations support under documented client-access, communication, capacity, confidentiality, and escalation controls.

## Client-Facing Capability Umbrellas

The current commercial architecture organizes the above capabilities into five simple public discovery areas:

1. Transactions & Contracts
2. Listing & Seller Support
3. Licensed Field Coverage
4. Marketing & Growth
5. CRM & Business Operations

These umbrellas describe breadth; they are not a requirement to create a separate price/product for every capability.

## Legacy Service Objects Retained for History

- **OBJ-00000003 — Contract Preparation & Writing Service**  
  Historical Production Certified object. Current commercial use and prior standalone-pricing assumptions are superseded by OBJ-00000014 and the active Pricing Rules Catalog.

- **OBJ-00000004 — Licensed Showing Coverage Service**  
  Production Certified historical/narrower workflow. It remains a fulfillment foundation for OBJ-00000016.

- **OBJ-00000005 — Business Operations Support Service**  
  Production Certified historical/narrower workflow. Current expanded commercial definition is OBJ-00000018.

## Controlled Launch Standards

- Listing & Seller Support: `02_Companies/Koinonia/04_Departments/Operations/HAND_US_THE_LISTING_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
- Licensed Field Coverage: `02_Companies/Koinonia/04_Departments/Operations/LICENSED_FIELD_COVERAGE_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
- Marketing & Growth / Marketing Management: `02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`
- CRM & Business Operations / Koinonia Partnership: `02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

## Current Website Implementation Status

The public commercial architecture has been implemented on the `main` branch as **unfinished preview work**. This catalog's controlled-launch statuses authorize the documented public claims under their controls; they do **not** constitute owner approval of the current website design or permission to promote the website to production.

Production promotion remains a separate owner-review/release decision.

## Governance

1. A new commercial capability must be represented by a current service object or explicitly fit within an existing object's scope.
2. New capability objects are not automatically Production Certified merely because they are commercially defined.
3. A service may be publicly launched under a documented controlled-launch standard before full universal certification when the operating boundaries, client-specific gates, and claims are explicitly defined.
4. Regulated/licensed activities must preserve the applicable authority, brokerage relationship, approval, compensation, and compliance gates.
5. Fulfillment method is not the product; Koinonia may perform approved work directly, through licensed coverage, or through managed specialists/providers as applicable.
6. Koinonia must not represent third-party providers as employees/licensees when that is not true.
7. Normal outside provider costs are governed by the active outside-expense pricing rule rather than embedded hidden micro-fees.
8. Controlled-launch approval of a service does not bypass website preview, owner approval, QA, or production-release controls.

## Referenced By

Website, pricing, sales, marketing, client onboarding, proposal generation, finance, customer success, executive reporting, automation, and fulfillment systems.