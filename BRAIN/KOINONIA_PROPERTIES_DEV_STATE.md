# Koinonia Properties — DEV State

## Purpose

This file tracks the current public-website development state for Koinonia Properties only.

Koinonia Properties is a standalone company/public website and must not be merged conceptually or operationally with Koinonia Transactions, Koinonia Transactions DEV, or Reynalds Brothers.

---

## Current Development Target

- Product: Koinonia Properties — DEV
- Repository: `KoinoniaTransactions/Reynalds-OS`
- Branch: `integration/koinonia-properties-web-20260812`
- Standalone public app: `apps/properties-web/`
- Home route: `/`
- Hosting state: temporary Vercel development deployment; final public domain not yet attached

---

## Canonical Sources

Use these sources together before changing Koinonia Properties public website claims or structure:

1. `BRAIN/PRODUCT_BOUNDARIES.md`
2. `BRAIN/APPLICATION_CATALOG.md`
3. `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`
4. `03_Knowledge/Website/koinonia_properties_production_spec.md`
5. `apps/properties-web/`

The shared Koinonia brand core may inform visual and voice consistency, but it does not override Koinonia Properties company identity or Property Management service authority.

---

## Public Website Completion State

### Home — Production Pass Complete

Completed on 2026-08-13.

Primary implementation:

- `apps/properties-web/components/site/PageAssemblies/KoinoniaProperties.tsx`
- `apps/properties-web/app/page.tsx`

The Home page is now intentionally a decision-and-routing page rather than a duplicate of every downstream page.

Current Home structure:

1. Koinonia Properties property-management hero
2. Quick access for owners, rentals, residents, and secure-access guidance
3. Audience routing for owners, residents/applicants, and real estate investors
4. Canonical Property Management service overview
5. Four-step management-start process
6. Focused FAQ
7. Owner/rental closing calls to action
8. Footer

The production pass removed or avoided:

- internal build-plan and development language;
- unapproved management-plan/package claims;
- unsupported city/state service-area claims in Home copy and metadata;
- language that presents unfinished payment, portal, application, work-order, or private-account functions as live public-site capabilities;
- internal `Property OS` framing and specific unverified operating-status promises on the Home hero;
- duplicate listing, portal, standards, and pricing detail that belongs on dedicated downstream pages.

Home public claims now stay inside the canonical Property Management service object and Properties website specification.

---

## Current Website Rule

Complete the Koinonia Properties public website page by page.

For each page:

1. Confirm its role against the Properties production specification.
2. Use the Property Management service object for business/service claims.
3. Keep customer-facing copy separate from internal build instructions.
4. Do not imply unfinished private systems are live.
5. Do not publish unverified pricing, guarantees, or geographic coverage.
6. Keep page-specific detail on the appropriate downstream route rather than duplicating it across Home.
7. Validate the focused Properties app before marking the page complete.
8. Record completion here when the page production pass lands.

---

## Next Recommended Page

Review and complete the **Owner Services** page at `/owners` as the next Koinonia Properties public website production pass.

The Owner Services page should convert property-owner interest into a clear rental-analysis or consultation path while staying within the approved Property Management service scope.

---

## Scope Guard

This development record does not authorize changes to:

- Koinonia Transactions — LIVE;
- Koinonia Transactions — DEV;
- Transactions digital business card or client portal work;
- Reynalds Brothers;
- private Koinonia Properties owner/tenant platform development;
- broad Reynalds OS redesign or architecture work unrelated to a verified Properties blocker.
