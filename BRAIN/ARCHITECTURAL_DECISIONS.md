# Architectural Decisions

## Purpose

This file records major architectural decisions for Reynalds OS.

Future developers and AI sessions should review this file before changing architecture.

---

# ADR-0001 — Repository Is the Source of Truth

## Status

Accepted

## Decision

Conversations are temporary. The repository is permanent.

Important project knowledge must be promoted into the repository instead of relying on chat history.

## Consequences

- Future sessions should read the Brain before making recommendations.
- Session handoffs should be stored in the repository.
- Project state should be updated after meaningful work.

---

# ADR-0002 — BRAIN Is the Canonical Engineering Memory

## Status

Accepted

## Decision

The `BRAIN/` folder is the authoritative engineering and AI knowledge base for Reynalds OS.

## Consequences

- Architecture rules live in Brain.
- Development standards live in Brain.
- AI context lives in Brain.
- Session handoff lives in Brain.
- `docs/` is reserved for reports, audits, tickets, specifications, and generated artifacts.

---

# ADR-0003 — Object Engine First

## Status

Accepted

## Decision

`RosObject` is the universal object model.

New business concepts should first be evaluated as object types before creating standalone tables or isolated modules.

## Consequences

- Pages should act as views into objects.
- Modules should not create duplicate truth.
- The Brain should orchestrate objects, not bypass them.

---

# ADR-0004 — Brain as Orchestration Layer

## Status

Accepted

## Decision

The Brain is not a chatbot and not the data owner.

The Brain is the orchestration layer over objects, relationships, workflows, tasks, timelines, documents, notifications, finance, and AI agents.

## Consequences

- Brain development should strengthen the Object Engine.
- AI features should connect to existing platform data.
- Copilot functionality should evolve toward Brain functionality rather than becoming a separate system.

---

# ADR-0005 — Koinonia as First Production Workspace

## Status

Accepted

## Decision

Koinonia is the first production workspace running on Reynalds OS.

Koinonia website and business workflows should use shared platform capabilities without turning Koinonia into the platform itself.

## Consequences

- Koinonia may use the shared design system and platform services.
- Koinonia-specific business rules remain in the Koinonia domain.
- Future company domains may use the same platform pattern without sharing business truth.

---

# ADR-0006 — Company Domains Remain Semantically Separate

## Status

Accepted

## Decision

Koinonia Transactions, Koinonia Properties, Reynalds Brothers, and future companies remain distinct business domains even when hosted in the same Reynalds OS repository.

## Consequences

- Company-specific objects, records, workflows, communications, and operating rules belong with the company domain.
- Shared infrastructure must not be interpreted as shared business truth.
- Cross-company reuse should occur at platform/service boundaries rather than by copying business data or assumptions.
- Reynalds Brothers knowledge is anchored under `02_Companies/Reynalds_Brothers/`.

---

# ADR-0007 — Recovery Sources Are Evidence, Not Automatic Truth

## Status

Accepted

## Context

The 2026-08 Reynalds Brothers recovery audit found valuable historical implementation on `recovery/reynalds-brothers-main-workspace-20260731`, but also found files that would regress current behavior if replayed wholesale.

The recovery root page was one explicit example: replaying it would overwrite the current root behavior.

## Decision

Recovery branches and archived snapshots must be reconciled semantically against the current repository before promotion.

## Consequences

- Never wholesale replay a recovery branch solely because it is more feature-rich.
- Compare current implementation, tests, canonical docs, and recovery evidence file-by-file.
- Preserve unresolved recovery evidence until its outstanding parity questions are intentionally closed.
- The RB recovery branch remains preserved until seed parity is completed.

---

# ADR-0008 — Current Seed and Recovery Seed Are Different Authority Levels

## Status

Accepted

## Decision

`packages/database/prisma/seed.ts` on the active target is the canonical current seed.

The richer seed snapshot on the preserved RB recovery branch is historical/recovery evidence only until individual missing fields or records are intentionally reconciled.

## Consequences

- Historical changelog claims do not override the current seed file.
- Missing recovery fields such as `customerUpdateStatus`, `mediaStatus`, or `permitStatus` do not become current merely because they exist in recovery.
- Do not delete the preserved recovery branch before intentional seed-parity closure.

---

# ADR-0009 — Prisma Generation Is an Explicit CI Prerequisite

## Status

Accepted

## Context

CI repair work showed that dependency installation and tests could complete while the production build still failed because Prisma Client types had not been generated from the database workspace schema.

## Decision

The CI pipeline explicitly runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

while the current workspace architecture requires this ordering.

## Consequences

- Do not remove Prisma generation from CI without proving generation is reliably handled elsewhere.
- Web Vitest must run non-interactively in CI.
- Intentionally testless workspaces may use `--passWithNoTests`.
- CI run #41 validated the repair; run #42 validated the RB closure against the repaired target.

---

# ADR-0010 — Recovery Closure Does Not Change Production Priority

## Status

Accepted

## Decision

The 2026-08 Reynalds Brothers recovery/closure work is a continuity and stabilization milestone, not a mandate to keep expanding the RB domain.

After continuity documentation is synchronized, primary development attention returns to the Koinonia Transactions website unless a verified blocker or approved focused RB task requires otherwise.

## Consequences

- Avoid speculative RB feature growth.
- Seed parity remains a separately scoped future task.
- Platform expansion should not interrupt current Koinonia Transactions production work without a concrete reason.
