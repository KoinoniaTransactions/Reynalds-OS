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
- Latest validated repository checkpoint: `66d7c28`
- The Transactions-style Properties footer rebuild is included in the validated tree at `66d7c28`.
- Documentation-only commits may follow validated checkpoints; do not treat a later docs-only branch HEAD as a newly revalidated UI build unless focused runtime validation is rerun.
- Hosting state: temporary Vercel preview; final public domain not yet attached.
- Current footer-review preview: `https://koinonia-properties-562ggb2uz-koinonia3.vercel.app`
- That preview predates the validated Transactions-style footer rebuild.
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

The route inventory is intentionally larger than the primary navigation and footer. A page does not need to be a peer-level navigation item to remain useful, indexable when launched, or internally linked.

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
- Vendors remain a supporting contact-path destination rather than a primary header item.
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

The Properties footer now follows the same calm macro hierarchy as the approved Koinonia Transactions LIVE footer while retaining Properties-specific content, routes, CTA, and mobile audience navigation.

### Desktop footer

Three primary zones:

1. **Brand / positioning**
   - Koinonia Properties mark and name.
   - Property Management identifier.
   - Canonical positioning line.
2. **Explore**
   - Owner Services
   - Rental Analysis
   - Available Homes
   - Resident Services
   - Maintenance Help
   - Service Areas
   - Contact
3. **Start the Conversation**
   - Email pill
   - Call pill
   - Text pill
   - Request Rental Analysis CTA
   - Facebook / Instagram / TikTok visual controls

This replaces the previous desktop four-audience-column footer presentation. The full Properties IA remains available in the header and page content; the footer is intentionally simpler and higher-intent.

### Mobile footer

The mobile direction previously approved remains intact:

- brand and positioning remain visible;
- Email / Call / Text and Rental Analysis CTA remain visible;
- social controls remain visible;
- Owners / Find a Home / Residents / Koinonia remain accessible accordion groups;
- faith signature remains visible and centered.

### Contact details

- Email: `jeremiah@koinoniaadmin.com`
- Call: `(719) 745-8497` / `tel:+17197458497`
- Text: `(719) 745-8497` / `sms:+17197458497`

### Social status

- Facebook, Instagram, and TikTok controls are approved for visual/build purposes.
- Real social profile URLs are not yet established.
- Until URLs are supplied and approved, social controls must remain disabled/non-navigating placeholders.
- Do not substitute guessed usernames, generic social homepages, `#`, or other fake destinations.

### Faith signature

> Bear one another’s burdens. Work heartily, as for the Lord.
>
> Galatians 6:2 · Colossians 3:23

### Implementation

- `apps/properties-web/components/site/Footer/Footer.tsx`
- `apps/properties-web/components/site/Footer/Footer.module.css`
- `apps/properties-web/config/contact.config.ts`

The rebuilt footer intentionally owns its styling in an isolated CSS module rather than continuing to depend on legacy Properties footer rules in `app/properties.css`.

Canonical website authority:

- `03_Knowledge/Website/koinonia_properties_production_spec.md`

Latest validated checkpoint:

- `66d7c28`

Visual acceptance of the Transactions-style rebuild remains pending a fresh desktop/mobile Vercel Preview review.

---

## Footer Visual Review History — 2026-08-13

Earlier iterations established:

- Home-specific support-line override was removed.
- Canonical Properties positioning was restored.
- Mobile footer looked good and should be preserved.
- Scripture close consistently looked strong and should remain essentially unchanged.
- Desktop four-column audience navigation solved earlier collisions but later made the overall footer feel visually unlike Transactions.
- Compacting the desktop top row reduced height but created a large visual gap between the left brand block and right utility block.

Latest user-approved direction:

- Use the actual Transactions LIVE footer as the desktop macro-layout reference.
- Preserve Properties identity and Properties routes.
- Keep the footer visually related to Transactions without copying Transactions business copy.
- Keep social controls in the Start the Conversation area.
- Preserve the approved Properties mobile accordion structure.

Validated rebuild commits:

- `405023e` — add isolated Properties footer CSS module
- `979cf97` — rebuild Properties footer around Transactions-style hierarchy
- `f265146` — update production spec for the new footer standard
- `66d7c28` — synchronized repository tree validated locally with the Transactions-style footer rebuild

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

Footer redesign and refinement:

- `a502ee9` — redesign public footer structure
- `1840f55` — refine premium footer styling and responsive behavior
- `d57a6a8` — document canonical footer experience
- `c182239` — validated repository tree containing the first footer redesign and synchronized documentation
- `18b94eb` — validated screenshot-driven footer refinement checkpoint
- `67d84e2` — add real contact details and visual social placeholders
- `9a075fc` — compact desktop footer and social/contact layout
- `beb8df4` — validated compact footer/contact/social repository checkpoint
- `66d7c28` — validated Transactions-style Properties footer rebuild checkpoint

Because GitHub contents writes are file-scoped, focused slices may span multiple sequential commits. Treat a repository tree as validated only after focused verification passes; documentation-only or intermediate branch HEADs do not imply runtime validation.

---

## Latest Validation

Focused validation completed locally at `66d7c28` on 2026-08-13.

Exact successful checks:

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
- final worktree status was clean and aligned with `origin/integration/koinonia-properties-web-20260812`.

Focused verifier:

- `apps/properties-web/scripts/verify-boundary.mjs`

This establishes `66d7c28` as the current validated repository checkpoint for the Transactions-style Properties footer rebuild. Visual acceptance remains separate and requires a fresh desktop/mobile preview review.

---

## Current Preview State

Current footer-review preview:

- `https://koinonia-properties-562ggb2uz-koinonia3.vercel.app`
- Source branch head at deployment: `58587ff`
- Deployment mode: Vercel Preview only
- This preview contains the previous compact footer, not the validated Transactions-style rebuild.

The next preview should be refreshed from the current Properties DEV branch after this documentation sync and deployed with Vercel Preview only.

Next visual-QA focus:

- desktop footer reads as one coherent three-zone composition;
- brand/positioning, Explore, and Start the Conversation feel intentionally aligned;
- Email / Call / Text read as compact pill actions;
- Request Rental Analysis remains the strongest action;
- social icons sit naturally beneath the conversation actions and remain non-live;
- mobile retains the previously approved accordion feel;
- faith signature remains centered and strong;
- Properties feels visually related to Transactions without losing its separate business identity.

---

## Current Website Rule

Complete the Koinonia Properties public website page by page.

For each meaningful slice:

1. Confirm the product, exact branch, and exact files before editing.
2. Confirm the page/feature role against the Properties production specification.
3. Use the Property Management service object for business/service claims.
4. Keep customer-facing copy separate from internal build instructions.
5. Do not imply unfinished private systems are live.
6. Do not publish unverified pricing, guarantees, statistics, geographic coverage, or social destinations.
7. Keep page-specific detail on the appropriate downstream route rather than duplicating it across Home.
8. Run focused Properties validation before marking the slice complete.
9. Update the canonical website specification when durable structure or public behavior changes materially.
10. Update this continuity package after every meaningful Properties change.
11. Add or update the Brain Decision Log when a durable architectural/product decision is made.
12. Keep `BRAIN/CURRENT_PRIORITIES.md` aligned when the active Properties priority materially changes.
13. Commit/push the focused slice before moving on.
14. Use Vercel Preview only unless production deployment is explicitly approved.

Temporary visual placeholders belong in this DEV continuity record until they become real public capabilities; do not promote them into canonical public claims prematurely.

---

## Immediate Next Work

### First: Deploy Transactions-Style Footer Preview

Refresh the dedicated preview worktree from the current Properties DEV branch and deploy Vercel Preview only.

Review desktop and mobile against the current visual-QA criteria above.

Do not mark the footer visually accepted until the refreshed preview is reviewed.

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
