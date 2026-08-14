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
| Product and Company Boundaries | BRAIN/PRODUCT_BOUNDARIES.md | Active |
| Product and Application Catalog | BRAIN/APPLICATION_CATALOG.md | Active |
| Development Standards | BRAIN/DEVELOPMENT_STANDARDS.md | Active |
| Design System Rules | BRAIN/DESIGN_SYSTEM_RULES.md | Active |
| Repository Architecture | docs/ARCHITECTURE.md | Active |
| Decision Log | BRAIN/DECISION_LOG.md | Active |
| Current Priorities | BRAIN/CURRENT_PRIORITIES.md | Active |
| Koinonia Properties DEV Continuity | BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md | Active Development |

---

# Koinonia Business

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Brand Core | 03_Knowledge/Brand/koinonia_brand_core.md | Active |
| Service Objects | 02_Companies/Koinonia/01_Services/ | Active |
| Koinonia Properties Property Management Service | 02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md | Active Development |
| Packages | 02_Companies/Koinonia/02_Packages/ | Active |
| Pricing | 02_Companies/Koinonia/03_Pricing/ | Active |

---

# Website

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Website Framework | 03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md | Active |
| Production Index | 03_Knowledge/Website/PRODUCTION_INDEX.md | Active |
| Page Specifications | docs/specifications/ | Active |
| Koinonia Properties Website Specification | 03_Knowledge/Website/koinonia_properties_production_spec.md | Active Development |
| Client Portal Specification | docs/specifications/KOINONIA_CLIENT_PORTAL_SPEC.md | Proposed |
| Component Catalog | 03_Knowledge/Website/component_catalog.md | Active |

---

# Application

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| React Application | apps/web/ | Active |
| Koinonia Properties Public Website | apps/properties-web/ | Active Development |
| Executable Product Registry | apps/web/lib/productRegistry.ts | Active |
| Product Registry Contract Tests | apps/web/lib/productRegistry.test.ts | Active |
| Workspace Navigation | apps/web/lib/workspaceNavigation.ts | Active |
| Design System | packages/design-system/ | Active |
| Database Schema | packages/database/prisma/schema.prisma | Active |

The Brain application catalog is authoritative for product meaning, ownership, audience, status, and boundaries. The executable product registry is authoritative for typed product metadata consumed by application code. Both sources must remain aligned.

For Koinonia Properties public website work, use the Koinonia Properties service object and website specification together with the Brain product-boundary sources. Use `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md` as the product-specific continuity record for current branch, validated checkpoints, preview state, approved IA decisions, and next work. Do not substitute Koinonia Transactions service definitions merely because both companies use the Koinonia name or share repository infrastructure.

---

# Recovery

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Recovery Snapshots | RECOVERY_AUDIT/ | Reference Only |

---

## Product Boundary Rule

Before proposing or modifying routing, hosting, repositories, deployments, workspaces, tenants, or application boundaries, consult `BRAIN/PRODUCT_BOUNDARIES.md` and `BRAIN/APPLICATION_CATALOG.md`, then identify whether the work concerns:

- Reynalds OS,
- a company,
- a public website,
- a company-specific internal operating system,
- or a record held inside Reynalds OS.

These concepts must not be treated as interchangeable.

Application code that identifies, classifies, filters, or navigates to products must consume `apps/web/lib/productRegistry.ts` instead of creating a competing product list.

---

## Rule

Always identify the canonical source before creating or modifying documentation, business rules, or application code.

When a code change modifies canonical product metadata or behavior, update the relevant Brain source in the same focused slice or immediate follow-up commit.
