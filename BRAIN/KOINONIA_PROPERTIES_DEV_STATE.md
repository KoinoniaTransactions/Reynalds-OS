# Koinonia Properties — DEV State

## Purpose

This file is the product-specific continuity package for the Koinonia Properties public website.

It tracks the current development state, approved website decisions, validated checkpoints, preview state, scope boundaries, and exact next work for Koinonia Properties only.

Koinonia Properties is a standalone company/public website and must not be merged conceptually or operationally with Koinonia Transactions, Koinonia Transactions DEV, Reynalds Brothers, or broader Reynalds OS work.

---

## Current Development Target

- Product: Koinonia Properties — DEV
- Repository: `KoinoniaTransactions/Reynalds-OS`
- Branch: `integration/koinonia-properties-web-20260812`
- Standalone public app: `apps/properties-web/`
- Home route: `/`
- Latest validated repository checkpoint: `c182239`
- Footer visual-refinement code now follows that validated checkpoint and is validation-pending.
- Hosting state: temporary Vercel preview; final public domain not yet attached.
- Current footer-review preview: `https://koinonia-properties-8wqwhg0du-koinonia3.vercel.app`
- That preview exposed a desktop footer layout issue and predates the current correction.
- Preview deployment is non-production and must not be deployed with `--prod` unless explicitly approved.

---

## Canonical Sources

Use these sources together before changing Koinonia Properties public website claims, structure, routing, or navigation:

1. `BRAIN/PRODUCT_BOUNDARIES.md`
2. `BRAIN/APPLICATION_CATALOG.md`
3. `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
4. `03_Knowledge/Website/koinonia_properties_production_spec.md`
5. `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`
6. `apps/properties-web/`

The shared Koinonia brand core may inform visual and voice consistency, but it does not override Koinonia Properties company identity or the Property Management service authority.

---

## Canonical Property Management Positioning

Public positioning:

> Koinonia Properties provides property management built on clear communication, steady systems, and responsible care.

Primary public audiences:

- Property Owners and Investors
- Prospective Renters / Rental Applicants
- Current Residents
- Existing Owner Clients when secure access is available
- Vendors as a supporting audience

Preferred owner entry point:

- Rental Analysis

The public website must not collect or imply collection of sensitive financial, identity, payment, screening, lease-account, or private-account data through ordinary public pages unless an approved private workflow has actually been implemented.

---

## Public Route Inventory

The standalone Properties site retains 14 public routes:

- `/`
- `/owners`
- `/tenants`
- `/rentals`
- `/portals`
- `/rental-analysis`
- `/pricing`
- `/service-areas`
- `/policies`
- `/apply`
- `/maintenance`
- `/vendors`
- `/standards`
- `/contact`

The route inventory is intentionally larger than the primary navigation. A page does not need to be a peer-level header item to remain useful, indexable when launched, or internally linked.

---

## Approved Audience-First Information Architecture

Approved and implemented on 2026-08-13.

Core rule:

**Keep the routes. Reduce the number of peer-level navigation choices. Organize by visitor intent.**

Primary customer journeys:

1. **Owners** — I own or invest in rental property.
2. **Find a Home** — I am looking for a rental and may become a resident.
3. **Residents** — I already live in a Koinonia-managed home.

Primary desktop header:

- Owners
- Find a Home
- Residents
- Contact
- Request Rental Analysis CTA

Owners group:

- Owner Services → `/owners`
- Rental Analysis → `/rental-analysis`
- Pricing & Scope → `/pricing`
- Service Areas → `/service-areas`
- Management Standards → `/standards`

Find a Home group:

- Available Homes → `/rentals`
- How to Apply → `/apply`
- Rental Policies & Criteria → `/policies`

Residents group:

- Resident Services → `/tenants`
- Maintenance Help → `/maintenance`
- Account & Portal Access → `/portals`
- Resident Policies → `/policies`
- Contact Support → `/contact`

Supporting navigation:

- Contact remains top-level because it serves multiple audiences.
- Vendors remain a footer/contact-path destination rather than a primary header item.
- Investors remain inside the Owners journey unless a future approved investor offering becomes meaningfully distinct.
- `Portals` is not treated as a major marketing category; public wording should prefer Account Access / Account & Portal Access.

---

## Approved Mobile Navigation

Approved and implemented on 2026-08-13.

Mobile behavior below the Properties mobile breakpoint:

- Header shows `Koinonia Properties` plus a hamburger button.
- Main navigation is collapsed by default.
- Hamburger toggles the navigation open and closed.
- Owners, Find a Home, and Residents remain independently expandable groups inside the mobile menu.
- Contact remains a direct link.
- Request Rental Analysis becomes a full-width mobile CTA.
- Selecting a navigation destination closes the mobile menu.
- The hamburger control includes accessible expanded-state and open/close labels.

Desktop audience-group navigation remains unchanged by the mobile-collapse behavior.

---

## Approved Footer Direction

Approved on 2026-08-13.

The footer is an intentional premium closing section rather than a second crowded header or flat sitemap.

Approved hierarchy:

1. Koinonia Properties brand and Property Management identity.
2. Canonical positioning: property management built on clear communication, steady systems, and responsible care.
3. Prominent Request Rental Analysis CTA.
4. Quiet Email, Call, and Text contact options.
5. Audience navigation using the same language as the approved IA: Owners, Find a Home, Residents, Koinonia.
6. Faith-centered closing signature.
7. Minimal copyright/legal line.

Desktop footer navigation should occupy its own full-width row beneath the brand/CTA row so the four audience groups have enough width and do not visually collide.

Mobile footer navigation collapses the four audience groups into accessible accordion sections so the footer does not become unnecessarily tall. Brand, CTA, contact methods, and faith signature remain visible.

Approved faith signature:

> Bear one another’s burdens. Work heartily, as for the Lord.
>
> Galatians 6:2 · Colossians 3:23

Do not create placeholder Privacy, Terms, or other legal links before real approved destinations exist.

Primary implementation:

- `apps/properties-web/components/site/Footer/Footer.tsx`
- `apps/properties-web/app/properties.css`

Canonical website authority:

- `03_Knowledge/Website/koinonia_properties_production_spec.md`

Validated repository checkpoint containing the first footer redesign:

- `c182239`

Current screenshot-driven visual refinement is validation-pending.

---

## Footer Screenshot Review — 2026-08-13

Desktop preview review at `https://koinonia-properties-8wqwhg0du-koinonia3.vercel.app` exposed two issues:

1. The Home assembly passed `supportLine="Property management support"`, overriding the approved canonical footer positioning and creating an oversized, awkward left-side text block.
2. The inherited shared footer grid still constrained the Properties footer layout, causing the four navigation groups to compress into narrow columns. `Residents` and `Koinonia` visually collided and several links wrapped excessively.

The scripture closing was visually strong and should remain essentially unchanged.

Approved correction:

- Home now renders `<Footer />` without the page-specific support-line override.
- Properties footer positioning returns to the canonical line: `Property management built on clear communication, steady systems, and responsible care.`
- The Properties footer wrapper explicitly uses one full-width grid column so its lead row and navigation row are not constrained by the shared footer grid.
- Desktop brand/positioning and CTA/contact remain a two-zone top row.
- Owners / Find a Home / Residents / Koinonia occupy a separate full-width four-column row below.
- Navigation group spacing was increased and heading weight slightly reduced.
- Mobile accordion behavior remains intact.
- Scripture and copyright treatment remain intact.

Current refinement commits:

- `4408b9e` — establish full-width footer row boundary
- `2d0bdf6` — keep footer layout ownership in Properties CSS
- `ce668f5` — remove Home support-line override and use canonical footer positioning
- `a0d83cc` — give footer navigation a true full-width desktop layout

These commits are not yet a validated checkpoint. Run focused Properties boundary verification and `git diff --check` before marking them validated.

---

## Public Website Completion State

### Home — Production Pass Complete

Completed on 2026-08-13.

Primary implementation:

- `apps/properties-web/components/site/PageAssemblies/KoinoniaProperties.tsx`
- `apps/properties-web/app/page.tsx`

The Home page is intentionally a decision-and-routing page rather than a duplicate of every downstream page.

### Home Hero — Corrected and Approved

The correct Home hero remains approved.

Current Home hero requirements remain locked:

- website eyebrow, H1, body copy, CTAs, and navigation are HTML/CSS, never baked into the image;
- left side preserves faded/text-safe negative space while still showing the residential environment;
- physical in-scene text may be realistic Properties branding/information;
- no Service Areas map/theme on Home;
- bright, light, airy, organized Koinonia Properties art direction;
- no hero changes are part of the current footer work.

---

## Recent Verified Checkpoints

Canonical service and website authority:

- `834c98c` — establish canonical Property Management service
- `284c373` — align standalone Properties website specification
- `ae0094d` — register Koinonia Properties authorities

Home / continuity:

- `9ed32a8` — complete Home production pass
- `eedae2c` — Home metadata alignment
- `fd482ab` — create Properties DEV continuity record
- `301b92e` — restore crisp hero imagery
- `4b86eb6` — restore correct Home hero

Audience-first IA:

- `e49cff1` — canonical spec adopts audience-first architecture
- `ac9bb13` — navigation implementation checkpoint
- `33f6544` — footer implementation checkpoint
- `c35d3ad` — Properties CSS / completed IA implementation checkpoint
- `c4fbc58` — align boundary verifier with the new direct Contact link

Mobile navigation:

- `1ae05d6` — add client-side mobile navigation toggle
- `ffb10e7` — collapse and style mobile navigation

Footer redesign:

- `a502ee9` — redesign public footer structure
- `1840f55` — refine premium footer styling and responsive behavior
- `d57a6a8` — document canonical footer experience
- `c182239` — validated repository tree containing the first footer redesign and synchronized documentation

Because GitHub contents writes are file-scoped, focused slices may span multiple sequential commits. Treat a repository tree as validated only after focused verification passes; documentation-only or intermediate branch HEADs do not imply runtime validation.

---

## Latest Validation

Latest completed focused validation remains `c182239` from 2026-08-13.

Exact successful checks at that checkpoint:

- all 14 standalone route pages exist with matching metadata paths;
- SEO registry contains only the 14 standalone Properties routes;
- all 14 Koinonia Properties page assemblies are isolated;
- no Transactions, client-login, auth, database, legacy route, or internal-launch boundary crossed into `properties-web`;
- package dependency boundary is public-site only;
- TypeScript alias is isolated from `apps/web`;
- Contact is a Properties-local `/contact` route with Properties-only inquiry paths;
- unconfigured preview deployments remain non-indexable;
- Koinonia Properties standalone application boundary verified;
- `git diff --check` passed with no output;
- final worktree status was clean and aligned with origin.

Focused verifier:

- `apps/properties-web/scripts/verify-boundary.mjs`

The screenshot-driven footer refinement must pass the same focused validation before it becomes the next validated repository checkpoint.

---

## Current Preview State

Current footer-review preview:

- `https://koinonia-properties-8wqwhg0du-koinonia3.vercel.app`
- Source branch head at deployment: `8c4ffce`
- Deployment mode: Vercel Preview only
- This preview contains the first footer redesign but not the screenshot-driven full-width correction.

Next preview should be created only after the footer refinement passes focused local validation.

Next visual-QA focus:

- canonical positioning appears instead of `Property management support`;
- brand/positioning and CTA/contact form a balanced two-zone top row;
- Owners / Find a Home / Residents / Koinonia have a full-width row with no heading collision;
- links wrap naturally rather than into narrow strips;
- mobile accordion behavior remains intact;
- faith signature hierarchy and readability remain unchanged;
- copyright spacing remains understated;
- overall footer height and transition from page content remain balanced.

---

## Current Website Rule

Complete the Koinonia Properties public website page by page.

For each meaningful slice:

1. Confirm the product, exact branch, and exact files before editing.
2. Confirm the page/feature role against the Properties production specification.
3. Use the Property Management service object for business/service claims.
4. Keep customer-facing copy separate from internal build instructions.
5. Do not imply unfinished private systems are live.
6. Do not publish unverified pricing, guarantees, statistics, or geographic coverage.
7. Keep page-specific detail on the appropriate downstream route rather than duplicating it across Home.
8. Run focused Properties validation before marking the slice complete.
9. Update the canonical website specification when structure or public behavior changes materially.
10. Update this continuity package after every meaningful Properties change.
11. Add or update the Brain Decision Log when a durable architectural/product decision is made.
12. Keep `BRAIN/CURRENT_PRIORITIES.md` aligned when the active Properties priority materially changes.
13. Commit/push the focused slice before moving on.
14. Use Vercel Preview only unless production deployment is explicitly approved.

This documentation sequence is part of the repository completion standard, not optional cleanup after the fact.

---

## Immediate Next Work

### First: Validate Screenshot-Driven Footer Refinement

Fast-forward the dedicated Properties DEV worktree to current branch HEAD and run:

- `apps/properties-web/scripts/verify-boundary.mjs`
- `git diff --check`
- clean branch/worktree confirmation

Do not mark the refinement validated until those checks pass.

### Second: Deploy New Footer Preview

After validation, refresh the dedicated preview worktree and deploy Vercel Preview only.

Review desktop and mobile against the screenshot-derived criteria above.

### After Footer Acceptance: Owner Services Production Pass

Review and complete the **Owner Services** page at `/owners` as the next page-level production pass.

The Owner Services page should convert property-owner interest into a clear Rental Analysis or consultation path while staying within the approved Property Management service scope.

---

## Scope Guard

This development record does not authorize changes to:

- Koinonia Transactions — LIVE;
- Koinonia Transactions — DEV;
- Transactions digital business card or client portal work;
- Reynalds Brothers;
- private Koinonia Properties owner/resident platform development;
- broad Reynalds OS redesign or architecture work unrelated to a verified Properties blocker.

When active work is Koinonia Properties DEV, do not infer that older generic `Koinonia` priorities or handoff sections refer to this product. Use this file together with Product Boundaries, Application Catalog, the Property Management service object, and the Properties production specification.
