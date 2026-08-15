# Koinonia Properties — DEV State

## Purpose

This file is the product-specific continuity package for the Koinonia Properties public website.

It records the clean resume point, validated checkpoints, accepted pages, current preview state, scope boundaries, and known follow-up work for Koinonia Properties only.

Koinonia Properties is a standalone company/public website and must not be merged conceptually or operationally with Koinonia Transactions, Koinonia Transactions DEV, Reynalds Brothers, or broader Reynalds OS work.

---

## Current State — Paused / Resume-Ready

- Product: Koinonia Properties — DEV
- Repository: `KoinoniaTransactions/Reynalds-OS`
- Branch: `integration/koinonia-properties-web-20260812`
- Standalone public app: `apps/properties-web/`
- Development status: active-development lifecycle, intentionally paused as of 2026-08-14.
- Latest validated Properties website runtime checkpoint: `ce97310`
- Home runtime checkpoint: `b66d806`
- Home status: fully visually accepted.
- Owner Services `/owners` status: fully visually accepted.
- Latest accepted Owner Services Preview: `https://koinonia-properties-qp2efp8cz-koinonia3.vercel.app`
- Accepted Owner Services Preview source/docs head: `036c243`
- That Preview contains the validated Owner Services runtime through `ce97310`.
- Hosting remains Vercel Preview only; final public domain is not attached.
- Do not use `--prod` without explicit approval.

Documentation or registry commits after `ce97310` do not replace `ce97310` as the validated Properties website runtime checkpoint unless the Properties boundary verifier is rerun against a later runtime tree.

Parallel-work guard:

- Another AI/agent may be working in this repository on a different branch.
- Do not merge, rebase, reset, stage, revert, clean up, or otherwise alter another branch or another agent's work unless explicitly authorized.
- Re-verify the exact Properties DEV branch/head before every future write, validation, documentation sync, or deployment.

---

## Canonical Sources

Use these sources together before resuming Koinonia Properties work:

1. `BRAIN/PRODUCT_BOUNDARIES.md`
2. `BRAIN/APPLICATION_CATALOG.md`
3. `BRAIN/CURRENT_PRIORITIES.md`
4. `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
5. `03_Knowledge/Website/koinonia_properties_production_spec.md`
6. `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`
7. `apps/properties-web/`

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

These categories are not a promise that every property receives every service under every engagement.

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

---

## Accepted Shared Experience

Header/mobile navigation:

- shared Koinonia brand lockup and local Properties-owned favicons;
- one desktop audience dropdown open at a time;
- outside click and Escape close dropdowns;
- destination actions clear dropdown state;
- accessible mobile hamburger navigation;
- Owners, Find a Home, and Residents remain expandable mobile groups.

Footer:

- Transactions-family macro hierarchy with Properties identity and routes;
- Email: `jeremiah@koinoniaadmin.com`;
- Call/Text: `(719) 745-8497`;
- Facebook, Instagram, and TikTok remain disabled/non-navigating until real URLs are approved;
- faith signature remains:

> Bear one another’s burdens. Work heartily, as for the Lord.
>
> Galatians 6:2 · Colossians 3:23

---

## Completed Page — Home

Home is fully visually accepted across desktop, tablet, and mobile.

Latest Home-specific validated runtime checkpoint:

- `b66d806`

Accepted Home Preview source:

- `ff1f615`

Approved Home architecture:

**Hero → Three Audience Paths → Koinonia Approach → Property Management Services → Owner Relationship → Five-Step Management Process → Rental Analysis → FAQ → Closing CTA → Footer**

Approved hero:

- eyebrow: `Rental Property Management`
- H1: `Property Management. Elevated.`
- primary CTA: `Request Rental Analysis`
- secondary CTA: `View Available Homes`

Validated Home SEO:

- title: `Rental Property Management | Koinonia Properties`
- description: `Koinonia Properties provides organized rental property management with leasing support, maintenance coordination, owner communication, and responsible care.`

No further Home work is pending unless a new requirement or issue is identified.

---

## Completed Page — Owner Services

Route:

- `/owners`

Owner Services is fully visually accepted as of 2026-08-14.

Validated runtime checkpoint:

- `ce97310`

Accepted Preview:

- `https://koinonia-properties-qp2efp8cz-koinonia3.vercel.app`
- source/docs head: `036c243`
- deployment mode: Vercel Preview only

Core implementation checkpoints:

- `f5272ca` — rebuild Owner Services content
- `2813107` — remove Owners-page meta-keywords input
- `4997c7a` — strengthen Owner Services metadata
- `ce97310` — refine Owner Services presentation and prospect-facing language

Accepted Owner Services content includes:

- owner-specific property-management hero;
- `What Owners Need` three-card section;
- six-card Property Management Services section;
- Leasing & Resident Placement;
- Maintenance & Property Care;
- Owner Communication;
- canonical five-stage management process;
- six-question owner FAQ;
- Rental Analysis / Management Standards closing CTA.

Accepted refinement at `ce97310`:

- Leasing and Maintenance use a balanced two-column desktop composition with a restrained step panel;
- responsive stacking remains appropriate for smaller screens;
- FAQ is an even six-card composition rather than seven cards with an orphan;
- multi-property/portfolio context remains inside the pricing/scope FAQ;
- prospect-facing copy uses natural language such as `agreed scope`, `agreed marketing approach`, and `management process` instead of repeated internal-sounding `approved` phrasing.

Validated Owner Services SEO:

- title: `Rental Property Management for Owners | Koinonia Properties`
- description: `Koinonia Properties helps rental property owners organize leasing, resident communication, rent processes, maintenance coordination, owner updates, and responsible property care.`

No further Owner Services work is pending unless a new requirement or issue is identified.

---

## Registry and Priority Cleanup — 2026-08-14

The closeout pass corrected stale product-state references:

- `BRAIN/CURRENT_PRIORITIES.md` no longer presents old mobile-nav QA or Owner Services implementation as active next work; Properties DEV is explicitly paused / resume-ready.
- `BRAIN/APPLICATION_CATALOG.md` no longer labels Koinonia Properties Website as planned/emerging; it is active development, currently paused / resume-ready.
- `apps/web/lib/productRegistry.ts` no longer marks `koinonia-properties-website` as `planned`; its lifecycle status is `active-development`.

A temporary pause is represented in project/priority documentation, not by inventing a new executable product lifecycle type.

---

## Known Resume-Time Issues

These items are deliberately preserved as future work rather than hidden or mislabeled as complete:

- `KoinoniaPropertiesRentalAnalysis.tsx` contains unapproved leasing-only/full-service language and should be corrected when Rental Analysis is selected for its page pass.
- `KoinoniaPropertiesPricing.tsx` presents Leasing-Only, Full-Service Management, and Portfolio Management as starting packages even though those are not canonical packages yet.
- shared `PropertiesInquiry.tsx` still contains `Leasing-only, full-service, or unsure` for pages that render the owner inquiry.
- `apps/properties-web/config/contact.config.ts` has historically contained a stale Colorado-oriented service-area string; geography remains unverified.
- do not publish unsupported city/county/state SEO, pricing, package, guarantee, portal, rating, review, or service-area claims.

These are resume-time issues, not active tasks while Properties DEV is paused.

---

## Latest Properties Website Validation

Focused Properties validation completed locally at `ce97310` on 2026-08-14.

Successful checks:

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

---

## Resume Workflow

When Properties DEV is intentionally resumed:

1. Re-read the canonical sources listed above.
2. Verify the exact repository branch/head and parallel-agent state.
3. Deliberately select the next page with the user.
4. Audit the current page against canonical service boundaries.
5. Perform current competitor/property-management and SEO research.
6. Evaluate what the prospective customer needs to understand now, not artwork/layout alone.
7. Present a Content + SEO Blueprint before code changes.
8. Present the exact implementation map before code changes.
9. Implement one cohesive page slice after approval.
10. Run focused Properties validation.
11. Sync Brain documentation separately.
12. Use Vercel Preview for visual acceptance.

Rental Analysis is the logical next candidate because it is the preferred owner entry point, but it is not authorized work while this project is paused.

---

## Scope Guard

This development record does not authorize changes to:

- Koinonia Transactions — LIVE;
- Koinonia Transactions — DEV;
- Transactions digital business card or client portal work;
- Reynalds Brothers;
- private Koinonia Properties owner/resident platform development;
- broad Reynalds OS redesign or architecture work unrelated to a verified Properties blocker;
- any other AI/agent branch or parallel repository work unless explicitly authorized.

When active work is Koinonia Properties DEV, do not infer that older generic `Koinonia` priorities refer to this product. Use this file together with Product Boundaries, Application Catalog, the Property Management service object, and the Properties production specification.
