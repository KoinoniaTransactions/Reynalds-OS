# Current Priorities

<!-- KOINONIA PROPERTIES PRIORITY 2026-08-13 -->
## Focused Koinonia Properties DEV Priority — 2026-08-13

### Current priority

Complete and launch the standalone **Koinonia Properties** public website from `apps/properties-web/` on branch `integration/koinonia-properties-web-20260812`.

This workstream is separate from Koinonia Transactions LIVE, Koinonia Transactions DEV, Reynalds Brothers, and broad Reynalds OS platform work.

### Current validated state

- Audience-first information architecture is implemented.
- Primary public journeys are Owners, Find a Home, and Residents.
- Contact remains top-level.
- Request Rental Analysis remains the persistent primary CTA.
- Existing 14-route sitemap is retained; supporting routes are grouped contextually instead of exposed as equal header items.
- Mobile primary navigation is collapsed behind an accessible hamburger menu.
- Current validated code checkpoint before this documentation sync: `ffb10e7`.
- Focused Properties boundary validation passed at that checkpoint.
- Current visual-QA preview: `https://koinonia-properties-gxc8xwqhu-koinonia3.vercel.app`.
- Preview deployment is non-production; do not use `--prod` without explicit approval.

### Immediate next action

Complete mobile visual QA of the hamburger/navigation shell.

After the mobile IA shell is visually accepted, begin the Owner Services production pass at `/owners`.

### Governing sources

- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`
- `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`
- `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
- `03_Knowledge/Website/koinonia_properties_production_spec.md`
- `apps/properties-web/`

### Required working rules

- Verify exact repo/worktree, branch, and target files before edits.
- Restate the proposed slice and wait for approval before significant work.
- Keep slices focused.
- Run focused Properties validation and `git diff --check`.
- Update relevant canonical documentation and the Properties continuity record whenever public structure, behavior, claims, or durable decisions change.
- Record durable architectural/product decisions in `BRAIN/DECISION_LOG.md`.
- Keep Properties work isolated from Transactions and Reynalds Brothers.
- Do not alter heroes during unrelated content/navigation slices.
- Do not imply unfinished private owner/resident systems are live.
- Do not publish unverified pricing, geographic coverage, guarantees, statistics, or private-system claims.

### Deferred / not current work

- Koinonia Transactions website changes.
- Koinonia Transactions client/employee portal work.
- Private Koinonia Properties owner/resident platform development.
- Reynalds Brothers changes.
- Broad Reynalds OS redesign.
- Production deployment or custom-domain launch until explicitly approved.
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
