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

---

# Koinonia Business

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Brand Core | 03_Knowledge/Brand/koinonia_brand_core.md | Active |
| Service Objects | 02_Companies/Koinonia/01_Services/ | Active |
| Packages | 02_Companies/Koinonia/02_Packages/ | Active |
| Pricing | 02_Companies/Koinonia/03_Pricing/ | Active |
| Billing and Payment Architecture | docs/specifications/KOINONIA_BILLING_PAYMENT_SPEC.md | Active |

---

# Website

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| Website Framework | 03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md | Active |
| Production Index | 03_Knowledge/Website/PRODUCTION_INDEX.md | Active |
| Page Specifications | docs/specifications/ | Active |
| Client Portal Specification | docs/specifications/KOINONIA_CLIENT_PORTAL_SPEC.md | Proposed |
| Component Catalog | 03_Knowledge/Website/component_catalog.md | Active |

---

# Application

| Subject | Canonical Source | Status |
|---------|------------------|--------|
| React Application | apps/web/ | Active |
| Executable Product Registry | apps/web/lib/productRegistry.ts | Active |
| Product Registry Contract Tests | apps/web/lib/productRegistry.test.ts | Active |
| Workspace Navigation | apps/web/lib/workspaceNavigation.ts | Active |
| Design System | packages/design-system/ | Active |
| Database Schema | packages/database/prisma/schema.prisma | Active |

The Brain application catalog is authoritative for product meaning, ownership, audience, status, and boundaries. The executable product registry is authoritative for typed product metadata consumed by application code. Both sources must remain aligned.

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
- a company-specific operating system,
- or a record held inside Reynalds OS.

These concepts must not be treated as interchangeable.

Application code that identifies, classifies, filters, or navigates to products must consume `apps/web/lib/productRegistry.ts` instead of creating a competing product list.

---

## Rule

Always identify the canonical source before creating or modifying documentation, business rules, or application code.

When a code change modifies canonical product metadata or behavior, update the relevant Brain source in the same focused slice or immediate follow-up commit.
