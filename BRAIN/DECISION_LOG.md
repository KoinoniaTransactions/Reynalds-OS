# Decision Log

## D-001 — Use Shared Object Engine

Decision: Use `RosObject` as the central registry for business records.

Reason: Prevents disconnected module data and supports cross-module intelligence.

## D-002 — Use Timeline Events

Decision: Meaningful changes create timeline events.

Reason: Supports auditability, troubleshooting, and AI grounding.

## D-003 — Use Read-Only Copilot First

Decision: Copilot starts read-only.

Reason: Builds trust before allowing AI actions.

## D-004 — Use Workflow Engine as Long-Term Automation Core

Decision: Future automation should flow through workflow definitions and workflow runs.

Reason: Prevents each module from creating separate automation logic.

## D-005 — Move Away From Incremental Static App Shells

Decision: v7.2 static app shell should be considered superseded by the production Next.js app.

Reason: The project now needs a real running software workflow, not separate static prototype files.

## D-006 — Keep Brain Inside Repository

Decision: Store core architecture and development rules in `BRAIN/`.

Reason: Future development should start from repository truth, not memory.

## D-007 — Repository-First Completion Standard

Decision: Do not claim implementation, lock, completion, or release unless actual repository files were inspected, modified, documented, versioned, and packaged as required for that scope.

Reason: Prevents conceptual work from being mistaken for production work.

## D-008 — Continuity Package Required

Decision: Meaningful releases and architectural milestones require continuity documentation that enables future chats/developers to resume accurately.

Reason: Reynalds OS must preserve context across conversations without relying on memory.

## D-009 — Koinonia Website Built Component-First

Decision: Koinonia website pages should be assembled from canonical components wherever possible.

Reason: Improves consistency, reduces duplicate code, and accelerates production work.

## D-010 — Launch / Production Work First

Decision: Active Koinonia production work takes priority over speculative Reynalds OS expansion unless a platform improvement directly removes a verified blocker.

Reason: Prevents feature creep and keeps production work moving.

## D-011 — AI Sessions Must Execute Repository Preflight

Decision: Repository AI sessions begin with the established repository inspection/preflight workflow before implementation.

Reason: Discovers canonical governance documents, identifies the active business domain, and standardizes AI startup behavior.

## D-012 — Keep Company Domains Separate

Decision: Koinonia Transactions, Koinonia Properties, and Reynalds Brothers are separate business domains even when they share Reynalds OS infrastructure.

Reason: Shared platform code must not cause business rules, records, workflows, or assumptions from one company to leak into another.

## D-013 — Recovery Evidence Is Not Automatically Canonical

Decision: Recovery branches, archived snapshots, and historical changelog statements are evidence to reconcile against the current repository, not automatic sources of current truth.

Reason: The 2026-08 Reynalds Brothers audit proved that wholesale replay could overwrite newer valid behavior, including root routing and current integrations.

## D-014 — Preserve the Reynalds Brothers Recovery Branch Until Seed Parity Is Closed

Decision: Keep `recovery/reynalds-brothers-main-workspace-20260731` until an intentional seed-parity review is completed and documented.

Reason: The preserved recovery seed contains richer historical fields and records that are not all represented in the current seed. Deleting the branch before parity review could destroy useful recovery evidence.

## D-015 — Explicitly Generate Prisma Client in CI

Decision: CI must run `pnpm db:generate` after dependency installation and before tests/build while the current workspace/schema arrangement requires it.

Reason: CI run #40 showed that tests could pass while the production build failed because Prisma Client types had not been generated. CI runs #41 and #42 passed after explicit generation was added.

## D-016 — Keep Recursive Tests Deterministic in CI

Decision: Web Vitest runs non-interactively, and intentionally testless packages may use `--passWithNoTests`.

Reason: Recursive CI must terminate deterministically and should not fail merely because a workspace intentionally has no test files.

## D-017 — Reynalds Brothers Recovery Closure Does Not Reopen RB Expansion

Decision: After the 2026-08 recovery/closure milestone, active development priority returns to the Koinonia Transactions website. RB seed parity or feature expansion is reopened only by an approved focused task or a verified blocker.

Reason: Recovery completion should preserve continuity without displacing the primary production objective.
