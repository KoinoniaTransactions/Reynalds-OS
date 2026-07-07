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

The BRAIN folder is the authoritative engineering and AI knowledge base for Reynalds OS.

## Consequences

- Architecture rules live in BRAIN.
- Development standards live in BRAIN.
- AI context lives in BRAIN.
- Session handoff lives in BRAIN.
- docs is reserved for reports, audits, tickets, specifications, and generated artifacts.

---

# ADR-0003 — Object Engine First

## Status

Accepted

## Decision

RosObject is the universal object model.

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

The Koinonia website and business workflows should be built on the shared platform rather than treated as a separate one-off project.

## Consequences

- Koinonia website should use the shared design system.
- Koinonia lead/contact workflows should eventually create objects, tasks, notifications, and CRM records.
- Future companies should follow the same workspace pattern.