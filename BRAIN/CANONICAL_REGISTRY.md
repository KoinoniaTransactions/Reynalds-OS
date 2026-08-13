# Reynalds OS Canonical Registry

## Purpose

This document identifies the authoritative source for each major area of Reynalds OS.

Before creating documentation, business rules, copy, data transforms, or application code, identify the canonical source first.

Core principle:

**Recover before reinventing. Extend before creating.**

---

# Brain & Platform

| Subject | Canonical Source | Status |
|---|---|---|
| Project Vision | `BRAIN/PRODUCT_VISION.md` | Active |
| Project State | `BRAIN/PROJECT_STATE.md` | Active |
| Current Priorities | `BRAIN/CURRENT_PRIORITIES.md` | Active |
| Session Handoff | `BRAIN/SESSION_HANDOFF.md` | Active / current-state only |
| Engineering History | `BRAIN/DEVELOPMENT_LOG.md` | Active / chronological |
| Constitution | `BRAIN/REYNALDS_OS_CONSTITUTION.md` | Active |
| Development Standards | `BRAIN/DEVELOPMENT_STANDARDS.md` | Active |
| Architectural Decisions | `BRAIN/ARCHITECTURAL_DECISIONS.md` | Active |
| Decision Log | `BRAIN/DECISION_LOG.md` | Active |
| Module Map | `BRAIN/MODULE_MAP.md` | Active |
| Repository Architecture | `docs/ARCHITECTURE.md` | Active |
| Root Continuity Package | `START_HERE.md`, `CURRENT_STATE.md`, `PROJECT_MEMORY.md`, `NEXT_ACTION.md`, `ARCHITECT_HANDOFF.md` | Active |

---

# Koinonia Business

| Subject | Canonical Source | Status |
|---|---|---|
| Brand Core | `03_Knowledge/Brand/koinonia_brand_core.md` | Active |
| Service Objects | `02_Companies/Koinonia/01_Services/` | Active |
| Packages | `02_Companies/Koinonia/02_Packages/` | Active |
| Pricing | `02_Companies/Koinonia/03_Pricing/` | Active |

Koinonia business rules remain separate from Reynalds Brothers business rules even when both use shared Reynalds OS platform capabilities.

---

# Reynalds Brothers

| Subject | Canonical Source | Status |
|---|---|---|
| Company Overview & Operating Rules | `02_Companies/Reynalds_Brothers/README.md` | Active |
| Company Brain / Data Map | `02_Companies/Reynalds_Brothers/06_Brain/README.md` | Active |
| Object Catalog | `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000000_Object_Catalog.md` | Active |
| Work Item Object | `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000001_Work_Item.md` | Active |
| Communication Object | `02_Companies/Reynalds_Brothers/00_Master_Objects/OBJ-RB-000004_Communication.md` | Active |
| WalMart Tanks Gmail Workflow | `02_Companies/Reynalds_Brothers/04_Communications/Walmart_Tanks_Gmail_Workflow.md` | Active |
| WalMart Tanks Gmail Archive Snapshots | `02_Companies/Reynalds_Brothers/04_Communications/walmart_tanks_gmail_batch_2026-07-29*.json` | Historical evidence / reference |
| Company Change History | `02_Companies/Reynalds_Brothers/CHANGELOG.md` | Historical record |
| Workspace UI | `apps/web/app/reynalds-brothers/page.tsx` | Active implementation |
| Work Item API | `apps/web/app/api/reynalds-brothers/work-items/` | Active implementation |
| Email Intake API | `apps/web/app/api/reynalds-brothers/email-intake/` | Active implementation |
| Gmail API Support | `apps/web/app/api/reynalds-brothers/gmail/` | Active implementation |
| Local Data API Support | `apps/web/app/api/reynalds-brothers/local-data/` | Active implementation |
| Work Item Logic & Tests | `apps/web/lib/reynalds-brothers-work-items.ts`, `apps/web/lib/reynalds-brothers-work-items.test.ts` | Active implementation |
| Email Intake Logic & Tests | `apps/web/lib/reynalds-brothers-email-intake.ts`, `apps/web/lib/reynalds-brothers-email-intake.test.ts` | Active implementation |
| Live Email Import | `apps/web/lib/reynalds-brothers-email-intake-live-import.ts` | Active implementation |
| Workspace Live Data | `apps/web/lib/reynalds-brothers-workspace-live-data.ts`, `apps/web/lib/reynalds-brothers-workspace-live-data.test.ts` | Active implementation |
| Gmail Backfill Logic | `apps/web/lib/walmart-tanks-gmail-backfill.ts` | Active implementation |
| Database Schema | `packages/database/prisma/schema.prisma` | Active |
| Current Seed State | `packages/database/prisma/seed.ts` | Active current repository seed |
| Recovery Evidence | branch `recovery/reynalds-brothers-main-workspace-20260731` at checkpoint `b8f48e1892ff11d7e4179fa3a5daa755e5571a4b` | Reference only; preserve until seed parity review |

## Reynalds Brothers Recovery Rule

The recovery branch is evidence, not the canonical runtime state. Do not copy it wholesale over current files. Recovered content must be reconciled file-by-file against the current target.

The preserved recovery seed contains fields and records that are not all present in the current seed. Seed parity is intentionally unresolved. Do not delete the recovery branch until that review is explicitly completed.

---

# Website

| Subject | Canonical Source | Status |
|---|---|---|
| Website Framework | `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md` | Active |
| Production Index | `03_Knowledge/Website/PRODUCTION_INDEX.md` | Active |
| Page Specifications | `docs/specifications/` | Active |
| Component Catalog | `03_Knowledge/Website/component_catalog.md` | Active |

---

# Application

| Subject | Canonical Source | Status |
|---|---|---|
| React / Next.js Application | `apps/web/` | Active |
| Design System | `packages/design-system/` | Active |
| Database Schema | `packages/database/prisma/schema.prisma` | Active |
| CI Workflow | `.github/workflows/ci.yml` | Active |

The current CI prerequisite sequence is:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

Prisma generation is explicit because the schema lives in the database workspace and must exist before type validation and production build.

---

# Recovery

| Subject | Canonical Source | Status |
|---|---|---|
| Repository Recovery Snapshots | `RECOVERY_AUDIT/` | Reference only |
| Reynalds Brothers Preserved Recovery Branch | `recovery/reynalds-brothers-main-workspace-20260731` | Reference only / do not delete until seed parity review |

Recovery sources never automatically override the active repository. Compare first, reconcile intentionally, validate, then document.

---

# Rule

Always identify the canonical source before creating or modifying documentation, business rules, data, or application code.

When a historical changelog, recovery branch, chat summary, and current repository disagree, the current canonical repository files win unless an intentional recovery decision changes them.
