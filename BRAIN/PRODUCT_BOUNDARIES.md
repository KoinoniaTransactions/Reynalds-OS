# Product and Company Boundaries

## Purpose

This document defines the canonical distinction between Reynalds OS, company operating systems, public websites, and the companies they represent.

Future AI sessions and developers must use these boundaries before making architecture, routing, hosting, repository, or product decisions.

---

# Core Rule

A company, its public website, and its internal operating system are separate concepts.

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

It may contain records about a company without being that company's public website or internal company-specific operating system.

---

# Koinonia Transactions

Koinonia Transactions is a separate company.

Current work includes its public-facing company website.

Business knowledge, decisions, and operational records for Koinonia Transactions are also recorded within Reynalds OS.

The public website and the records held in Reynalds OS are related, but they are not the same product.

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

Separate internal company operating system
└── Reynalds Brothers OS
    └── No public website currently planned
```

---

<!-- PERSONAL FINANCE PRODUCT BOUNDARY 2026-08-07 -->
# Private Household Applications

A private household application is a distinct product category from a public website, a company-specific operating system, the central Reynalds OS, and a record stored inside Reynalds OS.

## J&M Reynalds Finances

J&M Reynalds Finances is the approved first private household application in this repository.

Its purpose is to support Jeremiah and his wife in managing their shared household finances.

Its boundary rules are:

- it is not a Koinonia Transactions product;
- it is not a Koinonia Properties product;
- it is not Reynalds Brothers OS;
- it is not the Reynalds OS central Brain itself;
- sharing a monorepo or infrastructure does not erase its independent product identity;
- local-first development does not mean permanently local-only deployment;
- future hosted access remains private and authenticated rather than public;
- household financial records belong to the J&M household ownership boundary;
- exact hosting and infrastructure vendors remain separate architectural decisions.

Before executable product-registry changes are made, the registry type contract must explicitly support this product category rather than forcing J&M Finances into an inaccurate existing classification.

---

# Architecture and Hosting Rules

Before creating routes, domains, deployments, workspaces, tenants, or registries, determine which concept is being represented:

1. the legal or operating company,
2. the company's public website,
3. a company-specific internal operating system,
4. or a record held inside Reynalds OS.

Do not use the terms company, workspace, tenant, website, application, and operating system as synonyms.

Do not infer that every company requires a public website.

Do not infer that every public website is a workspace inside the Reynalds OS user interface.

Do not infer that every internal company operating system must be deployed as part of the Reynalds OS application.

Hosting and repository boundaries should be chosen from actual product needs, while preserving reusable shared infrastructure where it provides clear value.

---

# Documentation Rule

When product boundaries change, update this document first, then update affected architecture, project-state, routing, hosting, and implementation documentation.

This document governs product identity and product separation. It does not, by itself, mandate a specific deployment provider, domain strategy, or monorepo structure.
