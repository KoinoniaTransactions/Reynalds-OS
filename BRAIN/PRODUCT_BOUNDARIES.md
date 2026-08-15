# Product and Company Boundaries

## Purpose

This document defines the canonical distinction between Reynalds OS, company operating systems, public websites, portals, and the companies they represent.

Future AI sessions and developers must use these boundaries before making architecture, routing, hosting, repository, or product decisions.

---

# Core Rule

A company, its public website, its service-delivery portal, and its internal operating system are separate concepts.

They may share data, packages, design standards, or infrastructure when appropriate, but they must not be treated as interchangeable products.

---

# Reynalds OS

Reynalds OS is Jeremiah Reynalds' central operating system and Brain.

Its purpose is to:

- preserve the collection of Jeremiah's work,
- hold authoritative project and business knowledge,
- record decisions, workflows, documents, and operational history,
- maintain business records for multiple companies and projects,
- serve as the long-term system of record and intelligence layer.

Reynalds OS is not a public company website.

It may contain records about a company without being that company's public website, client portal, or internal company-specific operating system.

---

# Koinonia Transactions

Koinonia Transactions is a separate company.

Its commercial product is dependable real estate operations support for Realtors.

The Koinonia public website explains, markets, and provides entry points into those services.

The Koinonia client/employee portal is a service-delivery, communication, visibility, document, billing, and work-completion tool. It is not the product being sold and should not be positioned as if Koinonia were primarily a software company.

Canonical principle:

**Koinonia sells the service. The portal is a tool used to communicate, coordinate, and complete the work.**

Business knowledge, decisions, and operational records for Koinonia Transactions are also recorded within Reynalds OS.

The company, public website, portal, and records held in Reynalds OS are related, but they are not the same product.

---

# Koinonia Production and Portal Release Boundary

The public Koinonia website currently uses `koinonia-production` as the canonical cumulative release line.

Portal-development branches are not alternate production branches and must not replace the production line wholesale.

Already-live public features are production requirements that must be preserved when portal functionality is eventually integrated. This includes, unless intentionally changed through a documented decision:

- the current public site,
- `/jeremiah`,
- `/referrals`,
- the current service architecture,
- approved public visual/hero treatments,
- and other changes already accepted into `koinonia-production`.

Portal promotion must occur through a controlled reconciliation/integration branch that combines approved portal work with the then-current production public-site state. Shared files and unrelated monorepo changes require deliberate review before release.

Production is the source of truth for what is live.

---

# Koinonia Properties

Koinonia Properties is a separate company from Koinonia Transactions.

Current work includes its own public-facing company website and its own company identity.

Business knowledge, decisions, and operational records for Koinonia Properties are also recorded within Reynalds OS.

Koinonia Properties must not be merged conceptually with Koinonia Transactions merely because both use the Koinonia name.

---

# Reynalds Brothers

Reynalds Brothers is a separate company.

Current work is focused on an internal Reynalds Brothers operating system for company operations, including field work and Walmart Tanks activity.

A public Reynalds Brothers website is not currently being built and should not be assumed in architecture or hosting plans.

The Reynalds Brothers operating system is a distinct product boundary even when it reuses shared packages, patterns, or infrastructure.

---

# Current Product Map

```text
Reynalds OS
├── Central Brain and knowledge system
├── Collection of Jeremiah's work
├── Cross-company records and history
├── Koinonia Transactions business records
├── Koinonia Properties business records
└── Other projects and companies

Public websites
├── Koinonia Transactions website
└── Koinonia Properties website

Koinonia service-delivery tooling
└── Koinonia client/employee portal
    └── Supports service communication, visibility, documents, billing, and work completion
    └── Not the commercial product itself

Separate internal company operating system
└── Reynalds Brothers OS
    └── No public website currently planned
```

---

# Architecture and Hosting Rules

Before creating routes, domains, deployments, workspaces, tenants, or registries, determine which concept is being represented:

1. the legal or operating company,
2. the company's public website,
3. a client/service-delivery portal,
4. a company-specific internal operating system,
5. or a record held inside Reynalds OS.

Do not use the terms company, workspace, tenant, website, portal, application, and operating system as synonyms.

Do not infer that every company requires a public website.

Do not infer that every public website is a workspace inside the Reynalds OS user interface.

Do not infer that every portal is the product being sold.

Do not infer that every internal company operating system must be deployed as part of the Reynalds OS application.

Hosting and repository boundaries should be chosen from actual product needs, while preserving reusable shared infrastructure where it provides clear value.

---

# Entity and Workspace Isolation Rule

Every company, project, workspace, company-specific operating system, portal, website, and other operational entity represented inside Reynalds OS is isolated by default.

Isolation applies even when entities share the same monorepo, database schema, application packages, infrastructure provider, developer machine, or deployment tooling.

Entity-specific data and runtime state must remain scoped to the intended entity. One entity must not accidentally inherit another entity's:

- Workspace or tenant identifier.
- Database records or fixture data.
- Authentication or mock-auth identity.
- Environment configuration.
- Secrets or processor configuration.
- Storage, files, queues, or workflow state.
- Test state or temporary development data.
- Deployment, domain, branch, or release state.

Shared infrastructure is not permission to share entity state.

Any cross-entity integration must be explicit, intentional, scoped, and auditable. If an operation is intended for one entity, the code or execution workflow must resolve and verify that entity before performing reads, writes, migrations, fixtures, tests, authentication setup, or deployment actions.

For local development, entity-specific runtime values should be supplied through isolated or process-scoped configuration when a shared environment value could cause one project to run against another project's workspace.

This is a framework invariant for Reynalds OS.

---

# Documentation Rule

When product boundaries change, update this document first, then update affected architecture, project-state, routing, hosting, and implementation documentation.

This document governs product identity and product separation. It does not, by itself, mandate a specific deployment provider, domain strategy, or monorepo structure.
