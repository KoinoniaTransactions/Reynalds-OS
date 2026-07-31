# Reynalds OS Application Catalog

## Purpose

This document is the canonical inventory of the current products, websites, and operating systems connected to Reynalds OS.

It exists so future AI sessions and developers can quickly determine what they are working on, who it belongs to, whether it is public or internal, and where its business records belong.

This catalog must be read together with `BRAIN/PRODUCT_BOUNDARIES.md`.

---

# Catalog Rules

1. A company is not the same thing as its website.
2. A public website is not automatically part of the Reynalds OS application interface.
3. A company-specific operating system is not automatically the same product as Reynalds OS.
4. Shared packages and infrastructure do not erase product boundaries.
5. Business records may be stored in Reynalds OS even when the public or internal product is separate.
6. Unknown deployment, repository, or synchronization details must remain undecided until verified.

---

# Current Product Inventory

| Product | Product Type | Company / Owner | Primary Purpose | Audience | Public Website | Business Records | Current Status |
|---|---|---|---|---|---|---|---|
| Reynalds OS | Central operating system and Brain | Jeremiah Reynalds | Preserve knowledge, decisions, work, workflows, company records, and operational history across projects and companies | Internal | No | Reynalds OS is the central system of record | Active |
| Koinonia Transactions Website | Public company website | Koinonia Transactions | Present the company, services, brand, and public-facing business information | Public | Yes | Koinonia Transactions records are maintained in Reynalds OS | Active production work |
| Koinonia Properties Website | Public company website | Koinonia Properties | Present Koinonia Properties, its services, brand, and public-facing business information | Public | Yes | Koinonia Properties records are maintained in Reynalds OS | Planned / emerging product |
| Reynalds Brothers OS | Company-specific internal operating system | Reynalds Brothers | Support internal company operations, field activity, Walmart Tanks work, and related workflows | Internal company users | No public website currently planned | Reynalds Brothers operational records may integrate with or be preserved by Reynalds OS; exact synchronization boundaries must be verified before implementation | Active development |

---

# Product Profiles

## Reynalds OS

### Identity

Reynalds OS is the central Brain, knowledge system, and long-term operating record for Jeremiah Reynalds' work.

### Responsibilities

- preserve architectural and project memory,
- record business operations and history,
- maintain cross-company knowledge,
- support shared objects, workflows, services, and intelligence,
- provide authoritative context for future AI and human development sessions.

### Boundary

Reynalds OS is not itself the public website for Koinonia Transactions or Koinonia Properties.

It may contain records and knowledge for those companies without replacing their public products.

---

## Koinonia Transactions Website

### Identity

A public-facing website belonging to Koinonia Transactions.

### Responsibilities

- communicate the Koinonia Transactions brand,
- describe services and offers,
- support public discovery and contact,
- present approved company information.

### Boundary

The website is a separate product from Reynalds OS.

Its business decisions, knowledge, customer records, and operational history belong in Reynalds OS or in systems explicitly integrated with it.

---

## Koinonia Properties Website

### Identity

A public-facing website belonging to Koinonia Properties, a company separate from Koinonia Transactions.

### Responsibilities

- communicate the Koinonia Properties brand,
- describe its services and offers,
- support public discovery and contact,
- present approved company information.

### Boundary

Koinonia Properties must not be treated as a section, alias, or automatic extension of Koinonia Transactions merely because both use the Koinonia name.

Its public website and business records require their own company identity and product decisions.

---

## Reynalds Brothers OS

### Identity

A company-specific internal operating system belonging to Reynalds Brothers.

### Responsibilities

- support company operations,
- record field and service activity,
- support Walmart Tanks workflows and testing,
- provide internal tools for Reynalds Brothers users.

### Boundary

Reynalds Brothers OS is not a planned public website.

It is also not automatically the same user interface, deployment, or product as Reynalds OS, even when it reuses shared packages or sends records into Reynalds OS.

---

# Decision Checklist

Before changing architecture or code, answer all of the following:

1. Which cataloged product is being changed?
2. Which company owns or uses it?
3. Is the product public or internal?
4. Is the work part of the product interface, shared infrastructure, or a record inside Reynalds OS?
5. Does the change preserve the boundaries in `BRAIN/PRODUCT_BOUNDARIES.md`?
6. Are repository, hosting, deployment, and synchronization assumptions verified rather than inferred?

If any answer is unclear, inspect the Brain and repository before implementing.

---

# Maintenance Rule

Update this catalog when:

- a new product or website is approved,
- a product changes from planned to active,
- a public or internal audience changes,
- record ownership changes,
- deployment or repository boundaries become canonical,
- a product is retired or replaced.

Do not add speculative products merely because they may be useful in the future.
