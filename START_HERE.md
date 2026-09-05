# START HERE — Reynalds OS

## Welcome

This is the mandatory entry point for every new development session.

Whether you are an AI assistant, GitHub Copilot, or a human developer, begin here before making recommendations, writing code, creating documentation, designing assets, or modifying the repository.

This document is intentionally brief.

Its purpose is to establish the correct mindset and direct you to the canonical sources of truth.

---

# 2026-09-05 Current Handoff Map — Read Before Choosing a Workstream

Multiple AI workstreams are active in parallel. **Do not assume one handoff replaces the others.** A new AI should discover the current project state from this file and then read the relevant handoffs before changing code.

Read these current continuity sources:

1. `BRAIN/HANDOFF.md` — central reconciled Koinonia / repository handoff. This is the cross-workstream overview.
2. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md` — social/email/retargeting, attribution, analytics and marketing-launch readiness.
3. `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_COMMERCIAL_WEBSITE_UNFINISHED.md` — current commercial model, product/pricing decisions and unfinished public website implementation.
4. `BRAIN/KOINONIA_PORTAL_HANDOFF_2026-09-05.md` — Realtor portal, document intelligence/review, transaction obligations, quick actions and transaction-specific inbound email work.

Also read the current branch-specific `CURRENT_STATE.md`, `NEXT_ACTION.md`, `BRAIN/CURRENT_PRIORITIES.md`, and `BRAIN/CANONICAL_REGISTRY.md` before implementation.

## Parallel-work safety rule

- Preserve every current handoff.
- Reconcile; do not erase.
- Do not blindly merge `main`, `koinonia-production`, `koinonia-marketing-readiness`, or `chatgpt/koinonia-transaction-intake-redesign` into one another.
- Verify the branch and deployment that actually govern the requested task.
- Never deploy production without explicit owner authorization.

Some of these handoffs may have been authored on different active branches. If a referenced handoff is not present on the branch you opened, **inspect the current repository branches / recent commits rather than concluding it does not exist or recreating it from memory.**

---

# Repository Identity

Repository:

Reynalds_OS_v11_3_1_Work

Primary Production Application:

Koinonia

Current Development Phase:

Production Website Completion

---

# Repository Maturity

Reynalds OS is an actively developed production repository.

It already contains:

- established architecture
- reusable React components
- shared content systems
- production design standards
- business knowledge
- documentation
- operating rules
- GitHub workflow
- production image system

Assume the repository contains significantly more capability than is immediately visible.

Never assume something does not exist until you have searched the repository.

---

# Core Development Principles

Always:

- Understand before changing.
- Recover before reinventing.
- Extend before creating.
- Inspect before recommending.

The repository is the source of truth.

Conversation history is not.

---

# Required Reading Order

## Phase 1 — Understand the Repository

1. BRAIN/README.md
2. BRAIN/REYNALDS_OS_CONSTITUTION.md
3. BRAIN/CANONICAL_REGISTRY.md

---

## Phase 2 — Understand Current Development

4. BRAIN/CURRENT_PRIORITIES.md
5. BRAIN/SESSION_HANDOFF.md
6. BRAIN/DEVELOPMENT_STANDARDS.md
7. BRAIN/DECISION_LOG.md

---

## Phase 3 — Inspect the Repository

Before recommending or implementing anything:

- Inspect the repository structure.
- Search for existing implementations.
- Identify the governing canonical source.
- Review existing components and content.

Do not recommend creating architecture, documentation, components, or workflows until repository inspection has been completed.

---

# Required Communication Workflow

Before every meaningful implementation:

1. Restate your understanding of the request.
2. Identify the governing repository standards.
3. Recommend a better approach if one exists.
4. Explain exactly what you intend to create or modify.
5. Wait for approval.
6. Execute.
7. Validate.
8. Commit.
9. Push.

This workflow is mandatory throughout the project.

---

# Current Mission

Complete the Koinonia production website.

Platform work should only occur when it directly accelerates website completion or resolves a verified architectural issue.

---

# Definition of Success

Progress is measured by production completion.

Not by:

- creating new architecture,
- writing additional documentation,
- or redesigning existing systems.

The repository should become increasingly refined—not increasingly complex.

---

# Final Reminder

The first responsibility of every development session is understanding what already exists.

Inspect first.

Recommend second.

Build third.