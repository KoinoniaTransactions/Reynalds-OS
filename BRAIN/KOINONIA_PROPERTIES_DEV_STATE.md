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
- Current validated branch HEAD: `ffb10e7`
- Hosting state: temporary Vercel preview; final public domain not yet attached
- Current preview: `https://koinonia-properties-gxc8xwqhu-koinonia3.vercel.app`
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

The standalone Properties site currently retains 14 public routes:

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

The canonical website specification was updated before the navigation implementation so the code follows documented authority rather than creating a competing structure.

---

## Approved Mobile Navigation

Approved and implemented on 2026-08-13 after mobile visual review showed the expanded navigation was too exposed.

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

## Public Website Completion State

### Home — Production Pass Complete

Completed on 2026-08-13.

Primary implementation:

- `apps/properties-web/components/site/PageAssemblies/KoinoniaProperties.tsx`
- `apps/properties-web/app/page.tsx`

The Home page is intentionally a decision-and-routing page rather than a duplicate of every downstream page.

Current Home structure:

1. Koinonia Properties property-management hero
2. Audience routing / quick access
3. Property Management service overview
4. Management-start process
5. Focused FAQ
6. Owner/rental closing calls to action
7. Footer

The production pass removed or avoided:

- internal build-plan and development language;
- unapproved management-plan/package claims;
- unsupported city/state service-area claims in Home copy and metadata;
- language that presents unfinished payment, portal, application, work-order, or private-account functions as live public-site capabilities;
- internal `Property OS` framing and unverified operating-status promises;
- duplicate listing, portal, standards, and pricing detail that belongs on dedicated downstream pages.

### Home Hero — Corrected and Approved

The correct Home hero was restored before the IA work.

Current Home hero requirements remain locked:

- website eyebrow, H1, body copy, CTAs, and navigation are HTML/CSS, never baked into the image;
- left side preserves faded/text-safe negative space while still showing the residential environment;
- physical in-scene text may be realistic Properties branding/information;
- no Service Areas map/theme on Home;
- bright, light, airy, organized Koinonia Properties art direction;
- no hero changes are part of the current IA/mobile-nav work.

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

Because the GitHub contents API writes one file at a time, some focused slices span more than one sequential commit. Treat the final validated slice HEAD as the checkpoint rather than assuming every slice is represented by one commit.

---

## Latest Validation

Validated locally at `ffb10e7` on 2026-08-13:

- all 14 standalone route pages exist with matching metadata paths;
- SEO registry contains only the 14 standalone Properties routes;
- all 14 Properties page assemblies remain isolated;
- no Transactions, client-login, auth, database, legacy route, or internal-launch boundary crossed into `properties-web`;
- package dependency boundary remains public-site only;
- TypeScript alias remains isolated from `apps/web`;
- Contact remains a Properties-local `/contact` route with Properties-only inquiry paths;
- unconfigured preview deployments remain non-indexable;
- `git diff --check` passed;
- worktree was clean and aligned with origin.

Focused verifier:

- `apps/properties-web/scripts/verify-boundary.mjs`

A stale verifier assertion was corrected at `c4fbc58`; the navigation itself already pointed Contact directly to `/contact`.

---

## Current Preview State

Validated mobile-navigation preview:

- `https://koinonia-properties-gxc8xwqhu-koinonia3.vercel.app`
- Source commit: `ffb10e7`
- Deployment mode: Vercel Preview only

Current visual-QA focus:

- hamburger is visible on mobile;
- menu is collapsed on initial load;
- open/close behavior is clean;
- audience groups expand clearly;
- Contact remains easy to reach;
- Rental Analysis CTA is not cramped;
- opening the navigation does not create undesirable hero/layout movement.

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

### First: Mobile Navigation Visual QA

Use the current preview to approve or refine the hamburger/mobile navigation behavior.

Do not begin a broader page-content rewrite until the mobile IA shell is visually accepted.

### After Mobile IA Acceptance: Owner Services Production Pass

Review and complete the **Owner Services** page at `/owners` as the next page-level production pass.

The Owner Services page should convert property-owner interest into a clear Rental Analysis or consultation path while staying within the approved Property Management service scope.

Known downstream content cleanup still required later includes stale/internal wording on Owners, Residents/Tenants, Rentals, Pricing, Portals, Rental Analysis, Contact, Apply, Maintenance, Vendors, Standards, and Policies. Work those pages deliberately rather than changing them opportunistically during unrelated slices.

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
