# Current Priorities

<!-- KOINONIA PROPERTIES PRIORITY 2026-08-13 -->
## Koinonia Properties DEV — Paused / Resume-Ready — 2026-08-14

### Current status

Koinonia Properties DEV is intentionally **paused and not a current active priority**.

The standalone public website remains in `apps/properties-web/` on branch `integration/koinonia-properties-web-20260812`.

This workstream remains separate from Koinonia Transactions LIVE, Koinonia Transactions DEV, Reynalds Brothers, and broad Reynalds OS platform work.

### Clean stopping point

- Standalone 14-route Properties application boundary is established and validated.
- Audience-first information architecture is implemented.
- Primary public journeys are Owners, Find a Home, and Residents.
- Header, mobile navigation, shared Koinonia branding/favicon, and footer are established.
- Home is fully visually accepted.
- Owner Services `/owners` is fully visually accepted.
- Latest validated Properties runtime checkpoint: `ce97310`.
- Latest accepted Owner Services Preview source/docs head before this closeout: `036c243`.
- Preview deployment remains non-production; do not use `--prod` without explicit approval.

### Resume point

When Koinonia Properties DEV becomes active again, begin by reading:

- `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`
- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`
- `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
- `03_Knowledge/Website/koinonia_properties_production_spec.md`

Then verify the exact Properties branch/head before any write or deployment.

Rental Analysis `/rental-analysis` is the logical next page candidate because it is the preferred owner entry point, but it is **not authorized or active work while this project is paused**.

### Known resume-time cleanup

- Rental Analysis contains unapproved leasing-only/full-service language that should be reviewed when that page becomes active.
- Pricing contains unapproved Leasing-Only / Full-Service / Portfolio package framing and should be reviewed in its own approved page slice.
- Shared `PropertiesInquiry` still contains the owner prompt `Leasing-only, full-service, or unsure` on pages that render that owner inquiry.
- Geographic/service-area claims remain unverified and must not be invented.

### Working rules when resumed

- Verify exact repo/worktree, branch, and target files before edits.
- Restate the proposed slice and wait for approval before significant work.
- Keep Properties work isolated from Transactions, Reynalds Brothers, and parallel AI branches.
- Review each page for current prospective-client usefulness, Koinonia brand fit, and current SEO/search intent—not artwork alone.
- Run focused Properties validation and `git diff --check` before treating a runtime checkpoint as validated.
- Use Vercel Preview only unless production deployment is explicitly approved.
<!-- END KOINONIA PROPERTIES PRIORITY 2026-08-13 -->

---

<!-- PERSONAL FINANCE PRIORITY 2026-08-05 -->
## Focused Personal Finance Priority — 2026-08-05

### Current priority

Improve matching safety and clarity before attempting to increase match coverage.

### Approved next proposal boundary

- expose first-versus-second score gap;
- mark gaps below 10 percentage points as ambiguous;
- block suggestion preselection when ambiguous;
- show evidence labels and gap;
- keep the 75% high-confidence threshold;
- do not increase amount weighting;
- keep no-evidence transactions manual.

### Evidence

- 18 amount-only matches;
- one description-signal row;
- 10 target ambiguities;
- median and average gap of 4%;
- 16 transactions without a suggestion.

### Deferred

Learned merchant-description history is deferred until the existing confirmed-allocation history is inspected and proves sufficient for safe learning.

### Do not

- do not add automatic classification or reconciliation;
- do not expand unrelated UI;
- do not work on the broader dashboard issue;
- do not push without explicit approval.
<!-- END PERSONAL FINANCE PRIORITY 2026-08-05 -->

---

## Active Phase

Koinonia Production Website

---

# Primary Objective

Complete and launch the Koinonia website as the first production application built on Reynalds OS.

All development should support this objective unless a platform improvement directly accelerates website production.

---

# Repository Status

Current State:

Production website under active development.

Repository architecture is established.

Core Brain documentation is established.

GitHub workflow is established.

Component architecture is established.

Hero Image System is established.

Current emphasis is implementation, refinement, and launch.

---

# Current Production Milestones

## ✅ Completed

- Repository architecture established
- Brain documentation established
- Canonical Registry established
- Decision Log established
- Development Standards established
- Hero Composition Standard established
- Koinonia Image System established
- Shared content architecture established
- Component-first website architecture established
- Desktop and mobile hero system completed for:
  - Home
  - About
  - Services
  - Contact
- Hero imagery implemented in React
- Production build verified
- GitHub workflow established and verified

---

## Active Work

Current source focus:

Portal login production readiness for client and employee access has been advanced locally, but remains pre-live until Clerk production keys, staff MFA, database-backed invitation tests, and real provider user verification are complete.

Complete the production pages.

Current page order:

1. Home
2. Services
3. About
4. Contact
5. Pricing
6. FAQ
7. Launch QA

---

# Current Development Workflow

Every production task follows this sequence:

1. Understand the request.
2. Review existing implementation.
3. Recommend improvements if appropriate.
4. Explain planned work.
5. Wait for approval.
6. Implement.
7. Verify localhost.
8. Verify production build.
9. Commit.
10. Push to GitHub.
11. Update Brain only if a meaningful architectural discovery occurred.

---

# Development Philosophy

The repository should grow through refinement rather than reinvention.

Always:

- recover before reinventing
- reuse before replacing
- extend before creating

The existing architecture should be strengthened, not restarted.

---

# Platform Development Rule

Operating system work is now secondary.

Platform improvements should occur only when they:

- remove repeated work,
- solve an architectural limitation,
- accelerate Koinonia production, or
- improve long-term maintainability.

Do not interrupt website production for speculative platform development.

---

# Immediate Next Tasks

1. Refine Home page sections.
2. Complete Services page.
3. Complete About page.
4. Complete Contact page.
5. Build Pricing page.
6. Complete responsive polish.
7. QA every page.
8. Launch.

---

# Success Criteria

The current milestone is achieved when:

- Every public page is production quality.
- Desktop and mobile experiences are complete.
- All pages use the shared component architecture.
- Hero system is consistent across the site.
- Production build passes.
- Changes are committed and pushed to GitHub.

Only then should focus shift back toward broader Reynalds OS expansion.
