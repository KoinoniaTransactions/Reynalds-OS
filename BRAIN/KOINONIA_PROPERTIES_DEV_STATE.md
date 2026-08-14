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
- Latest validated repository checkpoint: `bd1a356`
- The Home content/SEO production pass was established at `d7a821e`.
- The centered owner-CTA refinement was validated at `bb38496` and visually accepted in the Preview sourced from `8ed6382`.
- The five-step Home process layout refinement is included in the validated tree at `bd1a356`.
- Documentation-only commits may follow validated checkpoints; do not treat a later docs-only branch HEAD as a newly revalidated UI build unless focused runtime validation is rerun.
- Hosting state: temporary Vercel preview; final public domain not yet attached.
- Current reviewed Home preview: `https://koinonia-properties-d5wsdxegv-koinonia3.vercel.app`
- Source branch head at that deployment: `8ed6382`.
- That preview contains the Home content/SEO rewrite, the centered owner CTA, shared Koinonia branding/favicon, and the approved footer refinements.
- In that preview, the owner-focused section was visually accepted after the CTA was centered, and the dark Rental Analysis feature section was also judged balanced and intentional.
- The five-step process section in that preview still shows the old five-narrow-card desktop layout. That old presentation was not accepted visually.
- The new process-grid layout is validated in code at `bd1a356` but still requires a refreshed Vercel Preview review.
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

- Header shows the Koinonia mark plus `Koinonia Properties` / `Property Management`, together with a hamburger button.
- Main navigation is collapsed by default.
- Hamburger toggles the navigation open and closed.
- Owners, Find a Home, and Residents remain independently expandable groups inside the mobile menu.
- Contact remains a direct link.
- Request Rental Analysis becomes a full-width mobile CTA.
- Selecting a navigation destination closes the mobile menu.
- The hamburger control includes accessible expanded-state and open/close labels.

Desktop audience-group navigation remains unchanged by the mobile-collapse behavior.

---

## Shared Koinonia Branding and Favicons

Validated at `6f30c7e` on 2026-08-14 and visually accepted in the Vercel Preview sourced from `e82eb71`.

Koinonia Properties now uses the same Koinonia family branding treatment as Transactions without importing application code or assets from `apps/web` at runtime.

Header brand lockup:

- shared Koinonia `K` mark styling from the existing design system;
- brand text `Koinonia Properties`;
- descriptor `Property Management`;
- existing Properties audience navigation and mobile menu behavior remain intact.

Favicons:

- `apps/properties-web/app/icon.svg` is a local Properties-owned copy of the approved Transactions browser icon artwork;
- `apps/properties-web/app/apple-icon.svg` is a local Properties-owned copy of the approved Transactions Apple-touch icon artwork;
- `apps/properties-web/app/layout.tsx` explicitly registers `/icon.svg` and `/apple-icon.svg` in metadata;
- the local copies preserve Properties application isolation and avoid a runtime dependency on `apps/web`.

Implementation:

- `apps/properties-web/app/icon.svg`
- `apps/properties-web/app/apple-icon.svg`
- `apps/properties-web/app/layout.tsx`
- `apps/properties-web/components/site/PropertiesNav/PropertiesNav.tsx`
- shared Koinonia styling remains supplied by `@reynalds-os/design-system/styles.css`.

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
- Validated visual treatment at `186f717`: social controls are centered beneath the Rental Analysis CTA on desktop and centered across the CTA width on mobile.
- Validated visual sizing at `186f717`: social button circles are 40px and social glyphs are 18px with slightly increased horizontal spacing.
- Validated vertical rhythm at `2f6f912`: the Email / Call / Text row has 18px of separation before the CTA, and the CTA has 20px of separation before the social controls.
- The preview sourced from `e82eb71` was visually accepted with these footer refinements intact.

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

Latest footer-specific validated checkpoint:

- `2f6f912`

---

## Footer Visual Review History — 2026-08-13 to 2026-08-14

Earlier iterations established:

- Home-specific support-line override was removed.
- Canonical Properties positioning was restored.
- Mobile footer looked good and should be preserved.
- Scripture close consistently looked strong and should remain essentially unchanged.
- Desktop four-column audience navigation solved earlier collisions but later made the overall footer feel visually unlike Transactions.
- Compacting the desktop top row reduced height but created a large visual gap between the left brand block and right utility block.

Transactions-style direction established:

- Use the actual Transactions LIVE footer as the desktop macro-layout reference.
- Preserve Properties identity and Properties routes.
- Keep the footer visually related to Transactions without copying Transactions business copy.
- Keep social controls in the Start the Conversation area.
- Preserve the approved Properties mobile accordion structure.

The preview at `https://koinonia-properties-78w01rvuo-koinonia3.vercel.app` confirmed that the Transactions-style footer composition was working. The remaining visual issue was the social row: the controls read as left-attached beneath the CTA on desktop and mobile.

Validated social refinement:

- social controls are centered directly beneath the Rental Analysis CTA on desktop;
- social controls are centered across the full CTA width on mobile;
- social button circles increased from 34px to 40px;
- social glyphs increased from 16px to 18px;
- horizontal spacing increased slightly;
- Facebook, Instagram, and TikTok remain disabled/non-navigating until real URLs are approved;
- no other footer layout, copy, navigation, CTA, faith-signature, or mobile-accordion behavior changed.

The preview at `https://koinonia-properties-vnjbgn9we-koinonia3.vercel.app` confirmed that the social centering and sizing looked better. The remaining visual issue was vertical compression inside the Start the Conversation group: Email / Call / Text, the Rental Analysis CTA, and the social row were too tightly grouped on both desktop and mobile.

Validated breathing-room refinement at `2f6f912`:

- contact-pill row to CTA separation increased from 12px to 18px;
- CTA to social-row separation increased from 12px to 20px;
- existing centering, button sizes, copy, navigation, scripture, and responsive behavior remain unchanged.

The preview at `https://koinonia-properties-70f2w79ku-koinonia3.vercel.app` contains the breathing-room footer refinement and established the visual baseline before the shared-branding/favicon update.

The preview at `https://koinonia-properties-ncz25p511-koinonia3.vercel.app`, sourced from `e82eb71`, was visually accepted for the shared header branding/favicon and retained footer refinements before the Home content/SEO production pass began.

Validated rebuild/refinement commits:

- `405023e` — add isolated Properties footer CSS module
- `979cf97` — rebuild Properties footer around Transactions-style hierarchy
- `f265146` — update production spec for the new footer standard
- `66d7c28` — synchronized repository tree validated locally with the Transactions-style footer rebuild
- `e5f4aab` — group CTA and social controls for intentional centering
- `186f717` — validated centered/larger social-control refinement checkpoint
- `2f6f912` — validated footer action breathing-room refinement checkpoint

---

## Public Website Completion State

### Home — Content, SEO, and Current Visual Refinements Validated

The core Home content/SEO production pass was validated on 2026-08-14 at repository checkpoint `d7a821e`.

The latest validated Home repository checkpoint is `bd1a356`.

Primary implementation:

- `apps/properties-web/components/site/PageAssemblies/KoinoniaProperties.tsx`
- `apps/properties-web/app/page.tsx`
- `apps/properties-web/config/seo.config.ts`
- `apps/properties-web/app/properties.css`

The Home page remains a decision-and-routing page rather than a duplicate of every downstream page, but its customer-facing copy and SEO strategy now more directly reflect the Koinonia brand and professional rental-property-management search intent.

### Home positioning and hero

The approved Home hero image remains unchanged.

Current Home hero content:

- eyebrow: `Rental Property Management`
- H1: `Property Management. Elevated.`
- primary CTA: `Request Rental Analysis`
- secondary CTA: `View Available Homes`

The phrase `Property Management. Elevated.` intentionally relates Properties to the Koinonia family language used by Transactions while keeping the company and service distinct.

Home hero requirements remain locked:

- website eyebrow, H1, body copy, CTAs, and navigation are HTML/CSS, never baked into the image;
- left side preserves faded/text-safe negative space while still showing the residential environment;
- physical in-scene text may be realistic Properties branding/information;
- no Service Areas map/theme on Home;
- bright, light, airy, organized Koinonia Properties art direction.

### Home audience routing

The old Quick Access strip was removed.

Home mirrors the approved customer journeys:

1. **Own a Rental Property** → Owner Services
2. **Looking for a Home** → Available Homes
3. **Already a Resident** → Resident Services

Real estate investors remain inside the owner journey rather than replacing the prospective-renter journey.

### Koinonia Approach

Home expresses the Properties-specific version of the broader Koinonia operating philosophy through three principles:

- Clear Communication
- Steady Systems
- Responsible Care

This is intended to differentiate Koinonia Properties from generic property-management marketing while remaining grounded in the canonical Property Management service definition.

### Home service vocabulary

The Home service summary uses clearer owner-facing and search-relevant language:

- Rental Analysis & Leasing
- Tenant Screening & Lease Administration
- Rent Collection & Owner Communication
- Maintenance & Property Care

These remain service categories rather than a promise that every property receives every item under every engagement.

### Owner relationship and visual acceptance

Home includes a dedicated owner-focused section emphasizing visibility, organized follow-through, leasing activity, resident communication, maintenance, vendors, and owner updates.

The earlier Preview showed that the section's centered eyebrow, heading, and body copy were visually strong, but the single `Request Rental Analysis` button was left-aligned and made the section feel unbalanced. The focused refinement at `bb38496` centered that CTA beneath the copy.

The refreshed Preview at `https://koinonia-properties-d5wsdxegv-koinonia3.vercel.app`, sourced from `8ed6382`, confirmed the correction. The owner section is now visually accepted: the centered CTA restores a balanced vertical composition without adding an unnecessary secondary action.

### Management process

The management process preserves the canonical five stages:

1. Understand the Property
2. Clarify the Management Plan
3. Coordinate Leasing or Onboarding
4. Manage the Ongoing Work
5. Keep the Owner Informed

The Preview sourced from `8ed6382` showed all five cards forced across a single desktop row. The resulting cards were too narrow: headings wrapped into several short lines, body copy became vertically dense, and the section felt more cramped than the calm Koinonia rhythm around it.

The approved solution preserves all process wording, numbering, card styling, and sequence while changing only the Properties-local layout.

Validated process-grid behavior at `bd1a356`:

- desktop: a six-column underlying grid with each card spanning two columns, producing three equal-width cards on the first row and steps 04–05 centered beneath them at matching width;
- tablet: a four-column underlying grid with each card spanning two columns, producing two cards per row with the fifth card centered on the final row;
- mobile: one full-width card per row;
- existing Koinonia 18px grid gap is preserved;
- no shared design-system CSS was changed;
- the layout is scoped through `properties-process-grid` in `apps/properties-web/app/properties.css`.

The process layout is code-validated at `bd1a356` but not yet visually accepted. A refreshed Preview is required.

Rental Analysis has its own prominent section and remains the preferred owner entry point.

### Rental Analysis feature section

The dark `Start With a Rental Analysis` feature section was reviewed in the Preview sourced from `8ed6382` and judged visually balanced and intentional. The centered gold CTA, dark band, headline, body copy, and spacing read as one coherent composition.

No further change is currently recommended for that section.

### Home FAQ strategy

Home uses owner-intent property-management questions covering:

- what a property management company handles;
- Koinonia Properties service scope;
- where rental property owners should start;
- maintenance coordination;
- owner communication and reporting;
- individual and multi-property investor needs.

The FAQs are intended primarily for useful topical coverage and customer clarity, not as a promise of special FAQ search-result presentation.

### Home SEO

Validated Home SEO title:

- `Rental Property Management | Koinonia Properties`

Validated Home/default description:

- `Koinonia Properties provides organized rental property management with leasing support, maintenance coordination, owner communication, and responsible care.`

The Home-only `metadata.keywords` array was removed. Search vocabulary is expressed through useful page content, headings, metadata, links, and structured data rather than an ignored meta-keywords list.

### Structured data

Home includes:

- an `Organization` JSON-LD identity layer using only verified Koinonia Properties name, URL when configured, icon/logo path, email, and phone;
- an updated `Service` JSON-LD object aligned with rental property management and approved service categories.

The structured data does not invent or publish unverified address, service area, hours, ratings, reviews, price range, or geographic coverage.

### Home visual acceptance

Code and boundary validation are complete at `bd1a356`.

Visual QA is still in progress. The owner-focused section and Rental Analysis feature section are visually accepted. The five-step process layout remains pending refreshed Preview review from a tree containing `bd1a356`.

Do not mark the entire Home page visually accepted until the remaining Home checkpoints are reviewed.

---

## Page-by-Page Content and SEO Workflow

Approved direction established on 2026-08-14.

The Properties website will be reviewed page by page, beginning with Home, to strengthen both Koinonia brand alignment and search effectiveness.

For each page:

1. Deep-dive relevant Koinonia/Transactions brand and operating language.
2. Review the current Properties page against canonical service and product boundaries.
3. Research current property-management website patterns and applicable current SEO guidance.
4. Define the page's user intent, search intent, content hierarchy, internal links, metadata, and structured-data opportunities.
5. Present the proposed copy/content blueprint before code changes.
6. Implement one cohesive page production pass after approval.
7. Run focused Properties validation.
8. Update this continuity record.
9. Review a Vercel Preview visually before moving to the next page when layout/content changes are material.

Competitor research is used to understand search vocabulary, information architecture, owner/resident expectations, and conversion patterns. Koinonia should not copy competitor wording or collapse into generic property-management claims.

The shared brand principle is:

- Transactions = organized operations behind the Realtor.
- Properties = organized care behind the rental property.

---

## Recent Verified Checkpoints

Canonical service and website authority:

- `834c98c` — establish canonical Property Management service
- `284c373` — align standalone Properties website specification
- `ae0094d` — register Koinonia Properties authorities

Home / continuity:

- `9ed32a8` — complete original Home production pass
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
- `186f717` — validated final social alignment/size refinement checkpoint
- `2f6f912` — validated footer action breathing-room refinement checkpoint

Shared Koinonia branding / favicon:

- `affd9a4` — add local Properties copy of the approved Koinonia browser favicon
- `2b0be5b` — add local Properties copy of the approved Koinonia Apple icon
- `3952eec` — apply the shared Koinonia brand lockup to the Properties header
- `6f30c7e` — register icons in Properties metadata and establish the validated branding/favicon repository checkpoint

Home content / SEO production pass and visual refinement:

- `4b804e7` — rewrite Home around Koinonia rental-property-management positioning
- `fb3664d` — remove the Home meta-keywords array
- `d7a821e` — strengthen Home/default metadata and establish the validated Home/SEO repository checkpoint
- `bb38496` — center the single Rental Analysis CTA in the owner-focused Home section
- `c885a9c` — replace the Home process inline grid rule with a Properties-local process-grid class
- `bd1a356` — add responsive 3/2 desktop, 2/2/1 tablet, and single-column mobile process layout and establish the latest validated Home checkpoint

Because GitHub contents writes are file-scoped, focused slices may span multiple sequential commits. Treat a repository tree as validated only after focused verification passes; documentation-only or intermediate branch HEADs do not imply runtime validation.

---

## Latest Validation

Focused validation completed locally at `bd1a356` on 2026-08-14.

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

This establishes `bd1a356` as the current validated repository checkpoint. It includes the Home content/SEO work, the accepted centered owner-CTA refinement, and the new Properties-local responsive five-step process layout. Visual acceptance of the new process layout remains separate and requires a refreshed Preview containing `bd1a356`.

---

## Current Preview State

Current reviewed Home preview:

- `https://koinonia-properties-d5wsdxegv-koinonia3.vercel.app`
- Source branch head at deployment: `8ed6382`
- Deployment mode: Vercel Preview only
- This preview contains the rewritten Home, Home SEO changes, centered owner CTA, shared Koinonia branding/favicon, and the previously approved footer refinements.
- The owner-focused `Know what is happening with your property—and what comes next.` section is visually accepted in this preview.
- The dark `Start With a Rental Analysis` feature section is visually accepted in this preview.
- The five-step `How Property Management Begins` process section is not visually accepted in this preview because the old five-across desktop layout makes the cards too narrow and text-heavy.
- The focused process-layout fix is validated at `bd1a356` but is not present in this preview yet.

The next preview should be refreshed from the current Properties DEV branch after this documentation sync and deployed with Vercel Preview only.

Next Home visual-QA focus:

- confirm the five-step process uses three equal-width cards on the first desktop row with steps 04–05 centered beneath them at matching width;
- confirm process headings wrap naturally and no longer feel cramped;
- confirm the body copy has comfortable line lengths and the section no longer reads as five narrow columns;
- confirm tablet behavior becomes two columns with the fifth card centered;
- confirm mobile behavior is one full-width card per row;
- confirm the transition from the process section into the dark Rental Analysis band has comfortable breathing room;
- continue checking the remaining Home sections for repetition, density, spacing, and responsive regressions;
- confirm the previously accepted owner section, Rental Analysis feature section, header branding/favicon, Home hero image, footer, social controls, mobile navigation, and faith signature show no regressions.

Do not mark the entire rewritten Home visually accepted until the refreshed Preview is reviewed through the remaining checkpoints.

---

## Current Website Rule

Complete the Koinonia Properties public website page by page with a combined brand/content/SEO review before each page is treated as production-ready.

For each meaningful slice:

1. Confirm the product, exact branch, and exact files before editing.
2. Confirm the page/feature role against the Properties production specification.
3. Use the Property Management service object for business/service claims.
4. Ground Koinonia voice and operating philosophy in approved Transactions/brand sources without merging the two companies.
5. Use current external research when evaluating SEO vocabulary, competitor patterns, and search intent.
6. Keep customer-facing copy separate from internal build instructions.
7. Do not imply unfinished private systems are live.
8. Do not publish unverified pricing, guarantees, statistics, geographic coverage, social destinations, ratings, or reviews.
9. Keep page-specific detail on the appropriate downstream route rather than duplicating it across Home.
10. Run focused Properties validation before marking the slice complete.
11. Update the canonical website specification when durable structure or public behavior changes materially.
12. Update this continuity package after every meaningful Properties change.
13. Add or update the Brain Decision Log when a durable architectural/product decision is made.
14. Keep `BRAIN/CURRENT_PRIORITIES.md` aligned when the active Properties priority materially changes.
15. Commit/push the focused slice before moving on.
16. Use Vercel Preview only unless production deployment is explicitly approved.

Temporary visual placeholders belong in this DEV continuity record until they become real public capabilities; do not promote them into canonical public claims prematurely.

---

## Immediate Next Work

### First: Deploy Responsive Process-Grid Preview

Refresh the dedicated preview worktree from the current Properties DEV branch after this documentation sync and deploy Vercel Preview only.

Review the `How Property Management Begins` section first. Confirm that the desktop 3/2 composition solves the narrow-card problem while preserving the five approved stages, and then continue the Home visual review from that refreshed preview.

Do not mark the Home visually accepted until the remaining Home checkpoints are reviewed.

### After Home Visual Acceptance: Choose the Next Page

Continue the approved page-by-page content and SEO workflow.

Do not automatically jump to Owner Services. The next page should be selected deliberately after the Home review so the site can be worked through in the user's preferred page-by-page order.

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
