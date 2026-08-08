# Reynalds OS Brain

## Purpose

The Brain is the authoritative operating knowledge for Reynalds OS.

Its purpose is to preserve architectural continuity, business knowledge, development standards, and project direction so future development never depends on memory, scattered chat history, or obsolete prototypes.

---

# Core Principles

1. The Brain is the primary source of truth.
2. Recover before reinventing.
3. Architecture before implementation.
4. Business Objects before interface.
5. Every major decision should be documented.

---

# Canonical Source Rule

Before creating new documentation, business rules, copy, or code:

1. Read `BRAIN/CANONICAL_REGISTRY.md`
2. Identify the authoritative source.
3. Extend existing work whenever possible.
4. Only create something new when no canonical source exists.

Before proposing product architecture, also read:

- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`

These documents establish the difference between companies, public websites, company-specific operating systems, and records held inside Reynalds OS.

---

# Brain Contents

## Foundation

- PRODUCT_VISION.md
- REYNALDS_OS_CONSTITUTION.md
- PRODUCT_BOUNDARIES.md
- APPLICATION_CATALOG.md
- PROJECT_STATE.md
- CURRENT_PRIORITIES.md
- CANONICAL_REGISTRY.md

## Development

- DEVELOPMENT_STANDARDS.md
- DESIGN_SYSTEM_RULES.md
- DATABASE_CONVENTIONS.md
- WORKFLOW_ENGINE_RULES.md
- AI_COPILOT_RULES.md

## Repository

- MODULE_MAP.md
- DECISION_LOG.md
- ARCHITECTURAL_DECISIONS.md
- VERSION_HISTORY.md
- ROADMAP.md

## Session Continuity

- HANDOFF.md
- SESSION_HANDOFF.md

---

# Relationship to Other Knowledge

The Brain explains:

- what Reynalds OS is,
- which products and companies exist,
- how their boundaries are defined,
- how the system is built,
- why decisions were made.

Business-specific knowledge belongs under:

`02_Companies/`

Brand knowledge belongs under:

`03_Knowledge/Brand/`

Website production belongs under:

`03_Knowledge/Website/`

Application implementation belongs under:

`apps/`

---

# Development Rule

Before implementing new features:

1. Consult the Brain.
2. Consult the Canonical Registry.
3. Identify the affected product in the Application Catalog.
4. Confirm its boundaries in Product Boundaries.
5. Consult Business Objects.
6. Recover existing work.
7. Implement.
8. Document.
9. Commit.

---

# J&M Reynalds Finances Canonical Reading

When working on J&M Reynalds Finances, read these sources before proposing architecture or meaningful implementation:

1. `BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md`
2. `docs/PERSONAL_FINANCE_PRODUCTION_ARCHITECTURE_V1.md`
3. `BRAIN/CURRENT_PRIORITIES.md`
4. `BRAIN/PROJECT_STATE.md`
5. `BRAIN/SESSION_HANDOFF.md`
6. relevant implementation under `apps/web/app/personal/`, `apps/web/components/personal-finance-*`, and `apps/web/lib/personal-finance-*`

The Personal Finance architecture is authoritative for product identity, household ownership, development-data safety, production direction, financial-provider boundaries, and real-data onboarding gates.

J&M Reynalds Finances is a private household application. Do not force it into public-website, company-operating-system, or central-OS assumptions merely because those are existing repository patterns.
