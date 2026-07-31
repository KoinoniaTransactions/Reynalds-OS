# Reynalds OS Application Catalog

## Purpose

This document is the canonical inventory of the current products, websites, and operating systems connected to Reynalds OS.

It exists so future AI sessions and developers can quickly determine what they are working on, who it belongs to, whether it is public or internal, and where its business records belong.

This catalog must be read together with `BRAIN/PRODUCT_BOUNDARIES.md`.

The executable counterpart to this catalog is `apps/web/lib/productRegistry.ts`. The Brain defines the meaning and boundaries; the registry provides typed application metadata for code.

---

# Catalog Rules

1. A company is not the same thing as its website.
2. A public website is not automatically part of the Reynalds OS application interface.
3. A company-specific operating system is not automatically the same product as Reynalds OS.
4. Shared packages and infrastructure do not erase product boundaries.
5. Business records may be stored in Reynalds OS even when the public or internal product is separate.
6. Unknown deployment, repository, or synchronization details must remain undecided until verified.
7. Code that classifies, filters, navigates to, or grants access to products should use the canonical product registry instead of duplicating product identity rules.
8. Public websites must remain public products and must not expose internal workspace navigation metadata.
9. Internal operating systems must remain internal products and must not claim a public website identity.

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

# Executable Registry Contract

`apps/web/lib/productRegistry.ts` is the typed application manifest for cataloged products.

It currently provides:

- canonical product identifiers derived directly from registered product entries,
- product ownership and purpose,
- product type and audience,
- product status,
- record-authority metadata,
- optional workspace navigation metadata,
- explicit workspace navigation ordering,
- centralized queries for internal products, public websites, workspace products, ordered workspace navigation entries, and active products,
- discriminated product definitions that enforce public and internal boundary rules at compile time.

Consumers should use registry helpers such as `getProductById`, `getInternalProducts`, `getPublicWebsites`, `getWorkspaceProducts`, `getWorkspaceNavigationEntries`, and `getActiveProducts` rather than repeating classification or navigation-order logic.

Product identifiers must not be maintained in a separate manual union that can drift from the registry. The registry entries define the canonical identifier set, and the exported `ProductId` type is derived from those entries.

Workspace order is product metadata, not an accidental result of array position. Each product workspace entry must declare an explicit `order`, while navigation consumers receive only the presentation fields they need.

The executable type contract now prevents invalid boundary combinations:

- `public-website` products must use audience `public`, must declare `hasPublicWebsite: true`, and cannot define internal `workspaceEntry` metadata;
- `central-operating-system` and `company-operating-system` products must use audience `internal` and must declare `hasPublicWebsite: false`;
- workspace navigation remains optional and available only to internal products.

The registry does not replace this Brain document. When product meaning, ownership, status, audience, records, boundaries, identifiers, or workspace placement change, update the Brain first or in the same focused change, then keep the executable registry aligned.

## Registry Verification

`apps/web/lib/productRegistry.test.ts` protects the executable registry contract.

The focused tests verify that:

- canonical product identifiers remain unique,
- every registered product resolves through `getProductById`,
- public websites carry public audience and public website metadata without internal workspace entries,
- internal operating systems carry internal audience and no public website identity,
- query helpers stay aligned with audience, type, website, and status metadata,
- workspace navigation entries are produced in explicit registry order,
- internal ordering metadata is not leaked into navigation presentation objects,
- workspace navigation continues to derive product entries from the registry,
- registry-backed workspace routes are not duplicated in navigation.

When the registry contract changes, update these tests and this Brain section together. Tests protect code behavior; the Brain remains authoritative for product meaning and architectural intent.

---

# Decision Checklist

Before changing architecture or code, answer all of the following:

1. Which cataloged product is being changed?
2. Which company owns or uses it?
3. Is the product public or internal?
4. Is the work part of the product interface, shared infrastructure, or a record inside Reynalds OS?
5. Does the change preserve the boundaries in `BRAIN/PRODUCT_BOUNDARIES.md`?
6. Are repository, hosting, deployment, and synchronization assumptions verified rather than inferred?
7. Does the executable registry remain aligned with this catalog?
8. Does this architectural change require a Brain update before the slice is considered complete?
9. Do registry contract tests remain aligned with both the code and the Brain?
10. If workspace placement changed, is the order explicit rather than dependent on registry array position?
11. If a product identifier changed, is the type still derived from the registry rather than duplicated manually?
12. Does the product definition satisfy the correct public or internal discriminated type contract?

If any answer is unclear, inspect the Brain and repository before implementing.

---

# Maintenance Rule

Update this catalog when:

- a new product or website is approved,
- a product identifier changes,
- a product changes from planned to active,
- a public or internal audience changes,
- record ownership changes,
- deployment or repository boundaries become canonical,
- a product is retired or replaced,
- registry structure changes how product identity, navigation, access, ordering, or classification is represented in code,
- registry verification changes which architectural guarantees are enforced by tests.

Architectural work should document the Brain frequently. A focused code slice that changes canonical product behavior should include a Brain update in the same slice or in the immediate follow-up commit before moving to unrelated work.

Do not add speculative products merely because they may be useful in the future.
