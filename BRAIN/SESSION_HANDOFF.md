# Reynalds OS Session Handoff

## Purpose

This document provides the operational state of the repository at the conclusion of the most recent development session.

Historical information belongs in:

- DEVELOPMENT_LOG.md
- VERSION_HISTORY.md
- DECISION_LOG.md

This document should describe only the current repository state and the immediate next work.

---

# Repository Status

Repository:

Reynalds_OS_v11_3_1_Work

Primary Workspace:

Koinonia ERP

Current Branch:

feature/app-shell-foundation

GitHub Status:

Local branch synchronized with origin.

Working Tree:

Clean.

Production Build:

Passing.

---

# Repository Maturity

Reynalds OS is an actively developed production repository.

It contains substantial existing architecture, reusable components, business logic, documentation, content systems, design standards, and operating rules.

Future development should assume the repository is significantly more complete than it initially appears.

Never assume something is missing until the repository has been inspected.

---

# Mandatory Startup Workflow

Before recommending, creating, replacing, or redesigning anything:

1. Read START_HERE.md.
2. Read BRAIN/README.md.
3. Read BRAIN/CANONICAL_REGISTRY.md.
4. Read BRAIN/CURRENT_PRIORITIES.md.
5. Read BRAIN/DEVELOPMENT_STANDARDS.md.
6. Read BRAIN/DECISION_LOG.md.
7. Inspect the repository structure.
8. Search for existing implementations.
9. Identify the governing canonical source.
10. Only then recommend implementation.

Repository inspection is mandatory.

Conversation history is never a substitute for repository inspection.

---

# Current Development Phase

Launch preparation for the Koinonia production website.

Platform work should occur only when it directly accelerates website completion.

---

# Major Milestones Completed

- Repository-first workflow established.
- GitHub workflow established and verified.
- Hero Image System established.
- Hero Composition Standard established.
- Shared content architecture established.
- Component-first page architecture established.
- Desktop/mobile hero system completed for:
  - Home
  - About
  - Services
  - Contact
- Hero imagery integrated into React.
- Production assets and source assets committed.
- Production build verified.
- All work committed and pushed to GitHub.

---

# Immediate Next Task

Continue implementation of the Koinonia production website.

Next work begins immediately below the Home page hero.

Recommended order:

1. Refine Home page sections.
2. Complete Services page.
3. Complete About page.
4. Complete Contact page.
5. Pricing.
6. QA.
7. Launch.

Do not begin new operating system initiatives unless they directly accelerate these objectives.

---

# Pre-Execution Rule

Before every meaningful implementation:

1. Restate understanding.
2. Identify governing standards.
3. Recommend a better approach if one exists.
4. Explain exactly what will be created.
5. Wait for approval.
6. Execute.
7. Validate.
8. Commit.
9. Push.

---

# Final Reminder

Progress is measured by production completion, not by architectural expansion.

The repository already contains far more capability than is immediately visible.

Recover before reinventing.

Extend before creating.

Inspect before recommending.

## 2026-07-09 — Koinonia Home Completion Handoff

### Current Status

The Koinonia Home page is approved, build-passing, committed, and pushed.

Latest confirmed commits:

- `e124ca6` — Align Koinonia home page content
- `85c907d` — Polish Koinonia home page presentation

### Approved Home Design Rules

- Hero remains a split composition:
  - copy on the left
  - visual image on the right
- Home body section headers are centered as a complete header group.
- Eyebrow, heading, and lead paragraph should align together.
- The visible process section label is `The Koinonia Experience`.
- The internal documentation label is `Koinonia Experience`.
- CTA primary button should visually stand out as the primary action.
- Footer remains unchanged.

### Important Continuity Note

Do not restart or redesign the Home page in the next session.

The Home page is complete unless the user identifies a specific launch-blocking issue.

### Recommended Next Step

Begin the Koinonia Services page production pass using the existing content architecture and shared site components.

Before editing Services, review:

1. `START_HERE.md`
2. `BRAIN/SESSION_HANDOFF.md`
3. `BRAIN/DEVELOPMENT_LOG.md`
4. `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md`
5. Existing Services page files under `apps/web`
