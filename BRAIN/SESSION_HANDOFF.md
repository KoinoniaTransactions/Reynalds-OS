# Reynalds OS Session Handoff

## Purpose

This document is the operational handoff for the next development session.

It is intentionally current-focused.

Historical information belongs in:

- DEVELOPMENT_LOG.md
- VERSION_HISTORY.md
- DECISION_LOG.md

This document should only describe the repository as it exists today.

---

# Repository Status

Repository:

Reynalds_OS_v11_3_1_Work

Primary Workspace:

Koinonia ERP

Current Branch:

feature/app-shell-foundation

Production build:

Passing

---

# Required Startup Workflow

Before making recommendations or creating code, documentation, imagery, or architecture:

1. Read START_HERE.md.
2. Read BRAIN/README.md.
3. Read BRAIN/CANONICAL_REGISTRY.md.
4. Read PROJECT_STATE.md.
5. Read CURRENT_PRIORITIES.md.
6. Read DEVELOPMENT_STANDARDS.md.
7. Read DECISION_LOG.md.
8. Inspect the repository.

Do not begin implementation until the existing architecture is understood.

---

# Repository Maturity

Reynalds OS is no longer an early-stage project.

Many architectural systems, workflows, documentation structures, reusable components, and business models already exist.

Assume the repository is more complete than your initial understanding.

Search before recommending.

Recover before reinventing.

Extend before creating.

Never recommend new architecture until you have verified that an equivalent solution does not already exist.

---

# Current Development Focus

Primary objective:

Complete the Koinonia production website.

Platform expansion should occur only when it directly accelerates website production or solves a recurring architectural problem.

---

# Koinonia Website Status

Current website architecture is component-first.

Canonical sources include:

- Brand Core
- Website Production Framework
- Image System
- Production Index
- Page Specifications

Reusable content should live in the content architecture.

Reusable presentation belongs in shared React components.

---

# Hero Production Standard

The Koinonia website follows a single visual system.

Every hero should:

- use the same office
- preserve permanent anchor elements
- tell the story through objects
- allow HTML to communicate the marketing message
- follow the Hero Composition Standard
- include separate desktop and mobile compositions

Previously approved heroes are the reference standard.

Do not reinvent the visual language.

Extend it.

---

# Required Pre-Execution Validation

Before performing significant work:

1. Restate what you understand.
2. Identify the governing repository standards.
3. Explain any better approach.
4. Explain exactly what will be executed.
5. Wait for approval.
6. Execute.
7. Validate against the governing standard.

---

# Current Working Philosophy

The repository is the source of truth.

The Brain explains the repository.

Conversation history is temporary.

Approved architectural decisions are considered closed unless intentionally reopened.

Website launch takes priority over further platform expansion.

---

# Immediate Next Task

Continue production of the Koinonia website.

Follow the established page production workflow:

1. Design review.
2. Desktop hero.
3. Mobile hero.
4. Source assets.
5. Production assets.
6. React implementation.
7. Local verification.
8. Production build.
9. Commit.

Repeat for each remaining page until the website is complete.

---

# Final Reminder

Do not measure progress by how much new architecture is created.

Measure progress by how faithfully existing architecture is understood, extended, and brought to production.

The objective is not to redesign Reynalds OS.

The objective is to complete it.