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

# ADR-0005 — Koinonia Transactions Website Is the First Production Product on Shared Infrastructure

## Status

Accepted and clarified

## Decision

The Koinonia Transactions public website is the first production product built using Reynalds OS shared infrastructure, design-system assets, and business knowledge.

The website remains a separate public product from the Reynalds OS internal application interface. Shared packages, records, or infrastructure do not make the public website the same product as Reynalds OS or a generic internal workspace.

## Consequences

- The Koinonia Transactions website should use approved shared infrastructure where doing so preserves product boundaries.
- Public website routes, branding, deployment, and audience must remain distinct from the Reynalds OS internal interface.
- Koinonia lead and contact workflows may create records, tasks, notifications, and CRM activity inside Reynalds OS through verified integration.
- Future companies and products may reuse shared infrastructure without losing their independent identity.
- Product meaning and boundaries must remain aligned with `BRAIN/PRODUCT_BOUNDARIES.md` and `BRAIN/APPLICATION_CATALOG.md`.

---

# ADR-0006 — Product Identity Uses a Brain Catalog and Typed Executable Registry

## Status

Accepted

## Decision

Canonical product identity is maintained in two aligned forms:

1. `BRAIN/APPLICATION_CATALOG.md` defines product meaning, ownership, audience, status, record authority, and boundaries.
2. `apps/web/lib/productRegistry.ts` provides typed product metadata for application code.

Workspace navigation and future product-aware application behavior should consume the executable registry instead of creating competing product lists or repeating classification rules.

## Consequences

- Product identifiers must be unique and stable.
- Product metadata changes must preserve alignment between the Brain catalog and executable registry.
- Registry contract tests should protect product lookup, classification helpers, and registry-driven workspace navigation.
- A new product must not be added to code without first confirming that it is approved and documented in the Brain.
- Architectural product changes require a Brain update in the same focused slice or immediate follow-up commit.

---

# ADR-0007 - J&M Reynalds Finances Is Local-First With a Secure Hosted Destination

## Status

Accepted

## Decision

J&M Reynalds Finances will remain local-first during current development but is not permanently local-only.

Its approved destination is a private authenticated household financial application that Jeremiah and his wife can securely access remotely.

Current localhost/private-network restrictions remain development safety controls and must not simply be weakened to create public access.

## Consequences

- current development continues with synthetic data and local SQLite;
- production hosting requires explicit authentication, household authorization, managed persistence, HTTPS, secrets, monitoring, backups, and tested recovery;
- real household data must not enter hosted production before the production security gate and final Clean reset;
- exact hosting, database, authentication, and domain vendors remain deferred decisions.

---

# ADR-0008 - Household Is the Personal Finance Ownership and Authorization Boundary

## Status

Accepted

## Decision

Production Personal Finance data belongs to an explicit J&M household boundary rather than an implicit single-user database.

Jeremiah and his wife authenticate as separate users. Protected Personal Finance operations must validate both authenticated identity and active household membership before accessing household resources.

## Consequences

- authentication alone is not authorization;
- financial entities require explicit or safely inherited household ownership;
- client-provided household identifiers are never sufficient authorization;
- both protected reads and writes require household authorization;
- unnecessary enterprise tenancy or complex RBAC should not be introduced without an actual household requirement.

---

# ADR-0009 - Financial Providers Are Adapters, Not the Personal Finance Domain

## Status

Accepted

## Decision

Manual financial records remain first-class, and external financial-data providers are integrated behind server-side provider boundaries.

Plaid is the preferred first provider candidate to evaluate, but core Personal Finance objects must remain provider-neutral.

Canonical provenance categories are `manual`, `demo`, `statement_import`, `provider`, and `calculated`. Provider-backed records identify the provider separately from provenance category.

## Consequences

- provider IDs do not become canonical Personal Finance primary keys;
- provider credentials remain server-side;
- synchronization must be idempotent and retry-safe;
- provider observations do not automatically classify, review, reconcile, or allocate transactions;
- manual workflows remain available when provider coverage is incomplete;
- provider implementation begins only after the household, provenance, authorization, and adapter foundations are ready.
