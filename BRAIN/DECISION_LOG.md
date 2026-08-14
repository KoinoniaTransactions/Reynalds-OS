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

Decision: Do not claim implementation, lock, completion, or release unless actual repository files were inspected, modified, documented, versioned, and packaged.

Reason: Prevents conceptual work from being mistaken for production work.

## D-008 — Continuity Package Required

Decision: Every release must include a continuity package that enables future chats/developers to resume accurately.

Reason: Reynalds OS must preserve context across conversations without relying on memory.

## D-009 — Koinonia Website Built Component-First

Decision: Koinonia website pages should be assembled from canonical components wherever possible.

Reason: Improves consistency, reduces duplicate code, and accelerates launch.

## D-010 — Launch First

Decision: Website launch work takes priority over future Reynalds OS expansion unless an architectural improvement directly accelerates the website.

Reason: Prevents feature creep and keeps Koinonia moving toward publication.

## D-011 — Koinonia Consultations Use Diagnose-First Interview System

Decision: Koinonia client consultations use a 20–30 minute diagnose-first interview structure. Koinonia does not lead with services, pricing, software, or a generic transaction-coordination pitch. The prospect's operating model, primary pressure, consequence, desired capacity, and trust requirements are understood before Koinonia is presented.

Canonical source: `BRAIN/KOINONIA_CONSULTATION_INTERVIEW_SYSTEM.md`

Reason: Koinonia sells an operating partnership and prescribed support, not a generic menu of tasks. Diagnosing first improves fit, protects the brand from commodity price comparison, and creates a repeatable consultation process that can later be trained and measured.
