# Current Priorities

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
