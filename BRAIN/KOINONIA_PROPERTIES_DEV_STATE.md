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
- Latest validated repository/runtime checkpoint: `4997c7a`
- Home runtime checkpoint: `b66d806`
- Home status: fully visually accepted on 2026-08-14.
- Owner Services route: `/owners`
- Owner Services status: content/SEO rewrite implemented and boundary-validated at `4997c7a`; refreshed Preview visual acceptance is still pending.
- Documentation-only commits may follow validated checkpoints; do not treat a later docs-only branch HEAD as a newly revalidated UI build unless focused runtime validation is rerun.
- Hosting state: temporary Vercel Preview; final public domain not yet attached.
- Current visually accepted Home Preview: `https://koinonia-properties-4hjjff4a5-koinonia3.vercel.app`
- Home Preview source branch head: `ff1f615`.
- That Home Preview contains validated runtime code through `b66d806` and predates the Owner Services rewrite at `4997c7a`.
- Preview deployment is non-production and must not use `--prod` unless explicitly approved.

Parallel-work guard:

- Another AI/agent may be working in this repository on a different branch.
- Do not merge, rebase, reset, stage, revert, clean up, or otherwise alter another branch or another agent's work unless explicitly authorized.
- Re-verify the exact Properties DEV branch/head before every write, validation, documentation sync, or deployment.

---

## Canonical Sources

Use these sources together before changing Koinonia Properties public website claims, structure, routing, or navigation:

1. `BRAIN/PRODUCT_BOUNDARIES.md`
2. `BRAIN/APPLICATION_CATALOG.md`
3. `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
4. `03_Knowledge/Website/koinonia_properties_production_spec.md`
5. `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`
6. `apps/properties-web/`

Shared Koinonia brand material may inform visual quality and voice, but it does not override Koinonia Properties identity or the canonical Property Management service definition.

---

## Canonical Property Management Positioning

Public positioning:

> Koinonia Properties provides property management built on clear communication, steady systems, and responsible care.

Primary audiences:

- Property Owners and Investors
- Prospective Renters / Rental Applicants
- Current Residents
- Existing Owner Clients when secure access is available
- Vendors as a supporting audience

Preferred owner entry point:

- Rental Analysis

Canonical public service categories, subject to property-specific scope and approved procedures:

- rental analysis and property review;
- rental marketing and leasing support;
- tenant screening coordination;
- lease administration;
- rent collection systems and payment-process coordination;
- maintenance coordination;
- owner communication, updates, and reporting;
- move-in and move-out coordination;
- vendor communication and coordination;
- ongoing property-management support.

These categories are not a promise that every property receives every service under every engagement. Property-specific responsibilities, exclusions, approval thresholds, costs, and procedures belong in the applicable agreement and approved operating policies.

The public website must not collect or imply collection of sensitive financial, identity, payment, screening, lease-account, or private-account data through ordinary public pages unless an approved private workflow has actually been implemented.

Final pricing and specific geographic coverage are not established by the canonical Property Management object. Do not invent packages, fees, cities, counties, service areas, guarantees, response times, statistics, ratings, reviews, or unfinished private-system capabilities.

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

A route does not need to appear as a peer-level navigation item to remain useful, indexable when launched, or internally linked.

---

## Approved Audience-First Information Architecture

Approved and implemented on 2026-08-13.

Core rule:

**Keep the routes. Reduce peer-level navigation choices. Organize by visitor intent.**

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

## Approved Header and Mobile Navigation

Shared Koinonia branding/favicon was validated at `6f30c7e` and visually accepted in the Preview sourced from `e82eb71`.

Header brand lockup:

- shared Koinonia `K` mark styling;
- `Koinonia Properties`;
- `Property Management` descriptor;
- Properties-owned local favicon/icon files;
- no runtime dependency on `apps/web`.

Desktop dropdown behavior was validated at `149d281` and behaviorally accepted in the Preview sourced from `c64ef77`:

- only one audience dropdown may be open at a time;
- opening another audience group closes the current group;
- clicking outside closes the open group;
- Escape closes the open group;
- logo, Contact, Request Rental Analysis, and destination links clear dropdown state;
- existing `<details>/<summary>` structure and styling are preserved.

Mobile navigation remains accepted:

- compact brand lockup plus hamburger;
- main navigation collapsed by default;
- Owners, Find a Home, and Residents remain expandable groups;
- Contact remains a direct link;
- Request Rental Analysis becomes a full-width mobile CTA;
- selecting a destination closes the menu;
- accessible expanded-state/open-close labels remain present.

---

## Approved Footer Direction

The Properties footer follows the same calm macro hierarchy as the approved Koinonia Transactions LIVE footer while retaining Properties identity, routes, CTA, and mobile navigation.

Desktop zones:

1. Brand / positioning
2. Explore
3. Start the Conversation
4. Faith-centered closing
5. Minimal copyright/legal line

Confirmed contact details:

- Email: `jeremiah@koinoniaadmin.com`
- Call: `(719) 745-8497` / `tel:+17197458497`
- Text: `(719) 745-8497` / `sms:+17197458497`

Social status:

- Facebook, Instagram, and TikTok controls may remain visible for build/visual purposes.
- Real URLs are not yet established.
- Until real destinations are approved, controls remain disabled/non-navigating.
- Do not substitute guessed usernames, generic social homepages, `#`, or fake destinations.

Faith signature:

> Bear one another’s burdens. Work heartily, as for the Lord.
>
> Galatians 6:2 · Colossians 3:23

Key footer checkpoints:

- `405023e` — add isolated Properties footer CSS module
- `979cf97` — rebuild footer around Transactions-style hierarchy
- `186f717` — centered/larger social-control refinement
- `2f6f912` — action-area breathing-room refinement
- footer retained visual acceptance through the completed Home review.

---

## Public Website Completion State

### Home — Fully Visually Accepted

The core Home content/SEO production pass was validated at `d7a821e`.

The latest Home-specific validated runtime checkpoint is `b66d806`.

The Home page is fully visually accepted in the Preview sourced from `ff1f615`, including desktop, tablet, and mobile review.

Approved Home architecture:

**Hero → Three Audience Paths → Koinonia Approach → Property Management Services → Owner Relationship → Five-Step Management Process → Rental Analysis → FAQ → Closing CTA → Footer**

Approved hero:

- eyebrow: `Rental Property Management`
- H1: `Property Management. Elevated.`
- primary CTA: `Request Rental Analysis`
- secondary CTA: `View Available Homes`
- approved light/airy property-management hero image remains unchanged;
- page copy remains HTML/CSS, not baked into the image.

Approved audience routing:

1. Own a Rental Property → `/owners`
2. Looking for a Home → `/rentals`
3. Already a Resident → `/tenants`

Accepted Home refinements include:

- owner CTA centered at `bb38496`;
- process grid validated at `bd1a356` with 3/2 desktop, 2/2/1 tablet, single-column mobile;
- header interaction validated at `149d281`;
- audience CTA alignment and Services 2×2 desktop/tablet plus single-column mobile validated at `b66d806`;
- all final Home desktop/tablet/mobile visual checkpoints accepted.

Validated Home SEO:

- title: `Rental Property Management | Koinonia Properties`
- description: `Koinonia Properties provides organized rental property management with leasing support, maintenance coordination, owner communication, and responsible care.`
- Home-only `metadata.keywords` removed.
- Organization and Service structured-data layers use verified facts only and do not invent location, hours, ratings, reviews, pricing, or coverage.

No further Home visual work is pending. Do not reopen Home styling or copy unless a new issue, requirement, or approved change is identified.

### Owner Services — Code Validated, Preview Pending

Route:

- `/owners`

Owner Services was selected as the next page after Home because it is the primary bridge between the Home owner journey and Rental Analysis/Pricing/Standards.

The page was researched as a prospective-client decision page, not merely an artwork/layout exercise. Current owner needs evaluated included:

- service scope clarity;
- leasing and applicant coordination;
- screening coordination;
- lease administration;
- rent-process coordination;
- maintenance and vendor coordination;
- resident communication;
- owner updates and reporting;
- decision visibility;
- property care;
- multi-property/portfolio considerations;
- getting started and Rental Analysis.

The approved content direction is to make the page useful enough that a prospective owner can understand how Koinonia approaches management without relying on generic promises such as “hassle-free,” “maximize returns,” or “we handle everything.”

Implementation commits:

- `f5272ca` — `feat(properties): rebuild Owner Services content`
- `2813107` — `seo(properties): simplify Owner Services metadata input`
- `4997c7a` — `seo(properties): strengthen Owner Services metadata`

Primary implementation files:

- `apps/properties-web/components/site/PageAssemblies/KoinoniaPropertiesOwners.tsx`
- `apps/properties-web/app/owners/page.tsx`
- `apps/properties-web/config/seo.config.ts`

No shared design-system, Home, Pricing, Rental Analysis, header, footer, or shared `PropertiesInquiry` code was changed in this slice.

Owner Services now includes:

- owner-specific property-management hero;
- owner priorities around moving the property forward, decision visibility, and responsible care;
- expanded Property Management Services content;
- Leasing & Resident Placement section;
- Maintenance & Property Care section;
- Owner Communication section;
- canonical five-stage management process;
- owner-focused FAQ covering actual buying/evaluation questions;
- direct Rental Analysis closing path plus Management Standards link.

The old page-specific patterns were removed from `/owners`:

- `View Management Plans` CTA;
- thin generic `PropertiesSeoContent` Owners band;
- internal-sounding `Before We Launch` section;
- shared `PropertiesInquiry kind="owner"` rendering on the Owners page.

Owner Services does not present leasing-only/full-service/portfolio structures as established packages.

Validated Owner Services SEO:

- title: `Rental Property Management for Owners | Koinonia Properties`
- description: `Koinonia Properties helps rental property owners organize leasing, resident communication, rent processes, maintenance coordination, owner updates, and responsible property care.`
- Owners-page `metadata.keywords` array removed.

Owner Services visual acceptance is still pending a refreshed Preview containing `4997c7a`.

---

## Known Follow-Up Issues Outside the Owner Services Slice

These items were intentionally not bundled into the Owner Services implementation:

- `PropertiesInquiry.tsx` still contains the owner prompt `Leasing-only, full-service, or unsure` for pages that continue to render `kind="owner"`.
- The current Pricing page still presents `Leasing-Only`, `Full-Service Management`, and `Portfolio Management` as three starting points even though those are not canonical packages yet.
- These should be corrected when Pricing is reviewed or in a separately approved canonical cleanup; do not silently broaden the Owner Services slice.
- `apps/properties-web/config/contact.config.ts` has historically contained a stale Colorado-oriented service-area string; geographic claims remain unapproved until verified.
- Do not publish unsupported city/county/state SEO merely to compete with local property-management websites.

---

## Page-by-Page Content and SEO Workflow

Approved direction established on 2026-08-14.

For each page:

1. Deep-dive relevant Koinonia/Transactions brand and operating language.
2. Review the current Properties page against canonical service/product boundaries.
3. Research current property-management competitor patterns and applicable current SEO/search guidance.
4. Evaluate the page from the prospective customer's current information needs, not only artwork and layout.
5. Define user intent, search intent, content hierarchy, internal links, metadata, and structured-data opportunities.
6. Present a Content + SEO Blueprint before code changes.
7. Present an exact implementation map before code changes.
8. Implement one cohesive page production pass after approval.
9. Run focused Properties validation.
10. Update this continuity record.
11. Review a Vercel Preview visually before moving to the next page when layout/content changes are material.

Competitor research is used to understand current vocabulary, information architecture, customer expectations, and conversion patterns. Koinonia should not copy competitor wording or collapse into generic property-management claims.

Shared brand translation:

- Transactions = organized operations behind the Realtor.
- Properties = organized care behind the rental property.

---

## Recent Verified Checkpoints

Canonical service / website authority:

- `834c98c` — establish canonical Property Management service
- `284c373` — align standalone Properties website specification
- `ae0094d` — register Koinonia Properties authorities

Audience-first IA / navigation:

- `e49cff1` — canonical spec adopts audience-first architecture
- `ac9bb13` — navigation implementation checkpoint
- `c4fbc58` — align boundary verifier with direct Contact link
- `1ae05d6` — add client-side mobile navigation toggle
- `ffb10e7` — collapse and style mobile navigation
- `149d281` — coordinate header dropdown interaction; behaviorally accepted

Shared branding / favicon:

- `affd9a4` — approved Koinonia browser icon copy
- `2b0be5b` — approved Apple icon copy
- `3952eec` — shared Koinonia brand lockup in Properties header
- `6f30c7e` — validated branding/favicon repository checkpoint

Footer:

- `405023e` — isolated footer CSS module
- `979cf97` — Transactions-style footer hierarchy
- `186f717` — final social alignment/size refinement checkpoint
- `2f6f912` — footer action breathing-room checkpoint

Home:

- `4b804e7` — rewrite Home around Koinonia rental-property-management positioning
- `fb3664d` — remove Home meta-keywords array
- `d7a821e` — validated Home/SEO repository checkpoint
- `bb38496` — center owner Home CTA
- `bd1a356` — responsive Home process layout
- `149d281` — coordinated header interaction
- `254b9eb` — Home audience/services layout hooks
- `b66d806` — final Home card refinements; Home runtime checkpoint and fully visually accepted

Owner Services:

- `f5272ca` — rebuild Owner Services content
- `2813107` — remove Owners-page meta-keywords input
- `4997c7a` — strengthen Owner Services metadata; latest validated Properties runtime checkpoint

Because GitHub contents writes are file-scoped, focused slices may span several sequential commits. Treat a repository tree as validated only after the focused verifier and diff checks pass; documentation-only or intermediate branch heads do not imply runtime validation.

---

## Latest Validation

Focused Properties validation completed locally at `4997c7a` on 2026-08-14.

Validation worktree:

- `/private/tmp/koinonia-properties-preview`
- detached from `origin/integration/koinonia-properties-web-20260812`
- verified HEAD: `4997c7a`
- `git status -sb` showed clean detached HEAD state.

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
- `git diff --check` passed with no output.

Focused verifier:

- `apps/properties-web/scripts/verify-boundary.mjs`

This establishes `4997c7a` as the current validated repository/runtime checkpoint. It contains the previously accepted Home state plus the new Owner Services content and SEO rewrite.

Owner Services is code/boundary validated but must not be marked visually accepted until a refreshed Preview containing `4997c7a` is reviewed.

---

## Current Preview State

Current visually accepted Home Preview:

- `https://koinonia-properties-4hjjff4a5-koinonia3.vercel.app`
- source branch head at deployment: `ff1f615`
- runtime code contained: validated Properties runtime through `b66d806`
- deployment mode: Vercel Preview only
- Home is fully visually accepted in this Preview.

This Preview **does not contain** the Owner Services rewrite at `4997c7a`.

No Owner Services visual judgment should be made from the old Preview.

The next Preview must be refreshed from the current Properties DEV branch after this documentation sync and deployed with Vercel Preview only.

---

## Current Website Rule

Complete the Koinonia Properties public website page by page with a combined brand/content/SEO/prospective-customer review before each page is treated as production-ready.

For each meaningful slice:

1. Confirm the product, exact branch, and exact files before editing.
2. Confirm the page/feature role against the Properties production specification.
3. Use the Property Management service object for business/service claims.
4. Ground Koinonia voice and operating philosophy in approved brand/Transactions sources without merging the two companies.
5. Use current external research when evaluating modern customer expectations, SEO vocabulary, competitor patterns, and search intent.
6. Keep customer-facing copy separate from internal build instructions.
7. Do not imply unfinished private systems are live.
8. Do not publish unverified pricing, guarantees, statistics, geographic coverage, social destinations, ratings, or reviews.
9. Keep page-specific detail on the appropriate downstream route rather than duplicating everything across Home.
10. Run focused Properties validation before marking a code slice complete.
11. Update the canonical website specification when durable structure/public behavior changes materially.
12. Update this continuity package after meaningful Properties changes.
13. Add/update a Brain Decision Log when a durable architectural/product decision is made.
14. Keep `BRAIN/CURRENT_PRIORITIES.md` aligned when the active Properties priority materially changes.
15. Commit/push the focused slice before moving on.
16. Use Vercel Preview only unless production deployment is explicitly approved.
17. Re-verify the exact Properties branch/head around parallel AI work before every write, validation, docs sync, or deployment.

---

## Immediate Next Work

### First: Refresh Preview for Owner Services

Create a new Vercel Preview from the current Properties DEV branch after this documentation sync.

Do not deploy Production.

Owner Services visual QA should review:

- hero title/lead length and desktop balance;
- `What Owners Need` three-card row;
- six-card Property Management Services section and heading wraps;
- Leasing & Resident Placement split section;
- Maintenance & Property Care split section;
- Owner Communication cards;
- five-step management-process layout;
- Owner FAQ density/readability;
- final Rental Analysis / Management Standards CTA block;
- overall page length and visual rhythm;
- tablet behavior;
- mobile stacking, CTA sizing, text density, header/menu, and footer.

### Then: Record Owner Services Visual Acceptance or Make a Focused Refinement

If the Preview is accepted, record that acceptance in this Brain file as a separate docs-only step.

If a visual issue is found, diagnose it first and implement only a scoped Owner Services refinement after approval.

### After Owner Services

Select the next public page deliberately and repeat the approved research → blueprint → implementation map → implementation → validation → docs → Preview workflow.

Rental Analysis is a logical next candidate because it is the preferred owner entry point, but do not automatically edit it without the page-selection/approval step.

---

## Scope Guard

This development record does not authorize changes to:

- Koinonia Transactions — LIVE;
- Koinonia Transactions — DEV;
- Transactions digital business card or client portal work;
- Reynalds Brothers;
- private Koinonia Properties owner/resident platform development;
- broad Reynalds OS redesign or architecture work unrelated to a verified Properties blocker;
- any other AI/agent branch or parallel repository work unless the user explicitly authorizes integration.

When active work is Koinonia Properties DEV, do not infer that older generic `Koinonia` priorities or handoff sections refer to this product. Use this file together with Product Boundaries, Application Catalog, the Property Management service object, and the Properties production specification.
