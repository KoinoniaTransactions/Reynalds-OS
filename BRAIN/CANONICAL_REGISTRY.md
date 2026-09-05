# Reynalds OS Canonical Registry

## Purpose

This document identifies the authoritative source for every major area of the Reynalds OS repository.

Before creating new documentation, copy, or code, verify whether a canonical source already exists.

Core principle:

Recover before reinventing.

---

# Brain & Platform

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Project Vision | BRAIN/PRODUCT_VISION.md | Active |
| Project State | BRAIN/PROJECT_STATE.md | Active |
| Constitution | BRAIN/REYNALDS_OS_CONSTITUTION.md | Active |
| Development Standards | BRAIN/DEVELOPMENT_STANDARDS.md | Active |
| Design System Rules | BRAIN/DESIGN_SYSTEM_RULES.md | Active |
| Repository Architecture | docs/ARCHITECTURE.md | Active |
| Decision Log | BRAIN/DECISION_LOG.md | Active |
| Current Priorities | BRAIN/CURRENT_PRIORITIES.md | Active |
| Current AI / Developer Handoff | BRAIN/HANDOFF.md | Active |
| Koinonia Marketing Launch Handoff | BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md | Active Checkpoint |
| Private Case Workspace Architecture | BRAIN/PRIVATE_CASE_WORKSPACES.md | Active |

---

# Koinonia Business

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Brand Core | 03_Knowledge/Brand/koinonia_brand_core.md | Active |
| Service Objects | 02_Companies/Koinonia/01_Services/ | Active |
| Packages | 02_Companies/Koinonia/02_Packages/ | Active |
| Pricing | 02_Companies/Koinonia/03_Pricing/ | Active |
| Client-Facing Sales Architecture | 02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md | Active |
| Marketing Management Launch Controls | 02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md | Active |
| Koinonia Partnership Launch Controls | 02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md | Active |
| Paid Social Campaign 01 | 02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md | Production Working Spec |
| Marketing Technical Readiness | 02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_MARKETING_TECHNICAL_READINESS_2026-09-05.md | Active Checkpoint |

---

# Website

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Website Framework | 03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md | Active |
| Production Index | 03_Knowledge/Website/PRODUCTION_INDEX.md | Active |
| Page Specifications | docs/specifications/ | Active |
| Component Catalog | 03_Knowledge/Website/component_catalog.md | Active |
| Koinonia Deployment / Hosting Readiness | BRAIN/KOINONIA_DEPLOYMENT_READINESS.md | Active / Reconciled 2026-09-05 |

---

# Application

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| React Application | apps/web/ | Active |
| Design System | packages/design-system/ | Active |
| Database Schema | packages/database/prisma/schema.prisma | Active |
| Marketing Instrumentation Prototype | branch `koinonia-marketing-readiness` | Reference / Do Not Merge Wholesale |

---

# Recovery

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Recovery Snapshots | RECOVERY_AUDIT/ | Reference Only |

---

## Rule

Always identify the canonical source before creating or modifying documentation, business rules, or application code.

When a dated checkpoint conflicts with a newer approved canonical business/readiness document, the newer approved canonical source controls. Experimental branches are implementation references, not business-rule authority.
