# Reynalds OS Brain

Last reconciled: 2026-09-05

## Purpose

The Brain is the authoritative operating knowledge for Reynalds OS.

Its purpose is to preserve architectural continuity, business knowledge, development standards, deployment safety, and current project direction so future development does not depend on memory, scattered chat history, or obsolete prototypes.

---

# Core Principles

1. The Brain is the primary operating knowledge layer.
2. Recover before reinventing.
3. Architecture before implementation.
4. Business Objects before interface.
5. Every major decision should be documented.
6. Current canonical sources override older historical notes.
7. Branch and deployment state must be verified before claiming something is live.

---

# Canonical Source Rule

Before creating new documentation, business rules, copy, or code:

1. Read `BRAIN/CANONICAL_REGISTRY.md`.
2. Identify the authoritative source.
3. Extend existing work whenever possible.
4. Only create something new when no suitable canonical source exists.
5. If an experimental branch conflicts with newer approved business rules, the newer canonical business rules control.

---

# Current Entry Points

For the present Koinonia marketing-launch phase, start with:

- `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
- `BRAIN/HANDOFF.md`
- `BRAIN/CURRENT_PRIORITIES.md`
- `CURRENT_STATE.md`
- `NEXT_ACTION.md`

The dated Koinonia AI handoff is the active session-resume checkpoint for the social/email/retargeting work.

---

# Brain Contents

## Foundation

- `PRODUCT_VISION.md`
- `REYNALDS_OS_CONSTITUTION.md`
- `PROJECT_STATE.md`
- `CURRENT_PRIORITIES.md`
- `CANONICAL_REGISTRY.md`

## Development

- `DEVELOPMENT_STANDARDS.md`
- `DESIGN_SYSTEM_RULES.md`
- `DATABASE_CONVENTIONS.md`
- `WORKFLOW_ENGINE_RULES.md`
- `AI_COPILOT_RULES.md`
- dated development checkpoint files when a major cross-system state must be preserved

## Repository

- `MODULE_MAP.md`
- `DECISION_LOG.md`
- `ARCHITECTURAL_DECISIONS.md`
- `VERSION_HISTORY.md`
- `ROADMAP.md`

## Session Continuity

- `HANDOFF.md` — general current handoff
- `AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md` — current Koinonia marketing checkpoint
- `DEVELOPMENT_CHECKPOINT_2026-09-05_KOINONIA_MARKETING.md` — engineering/documentation audit record

Do not assume an undocumented `SESSION_HANDOFF.md` exists. Use the actual files registered above and in the Canonical Registry.

---

# Relationship to Other Knowledge

The Brain explains:

- what Reynalds OS is;
- how it is built;
- why decisions were made;
- what the current development state is;
- what safety/continuity constraints apply.

Business-specific knowledge belongs under:

`02_Companies/`

Brand knowledge belongs under:

`03_Knowledge/Brand/`

Website production knowledge belongs under:

`03_Knowledge/Website/`

Application implementation belongs under:

`apps/`

---

# Development Rule

Before implementing new features:

1. Consult `START_HERE.md`.
2. Consult the current AI/developer handoff.
3. Consult the Brain and Canonical Registry.
4. Consult current Business Objects/readiness documents.
5. Recover existing work.
6. Confirm the correct branch.
7. Implement in the appropriate non-production path when risk warrants it.
8. Validate.
9. Document.
10. Commit.
11. Promote to production only when authorized.
