# Koinonia Properties Production Spec

## Status

Active Development — Koinonia Properties DEV

## Purpose

This document defines the public website structure for Koinonia Properties, a company and public website separate from Koinonia Transactions.

Koinonia Properties business records are maintained inside Reynalds OS for continuity, but the company, its public website, and Reynalds OS are separate concepts.

Canonical business object:

- `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`

Canonical product identity:

- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`

Canonical brand source:

- `03_Knowledge/Brand/koinonia_brand_core.md`

Standalone public application:

- `apps/properties-web/`

## Public Route Model

Koinonia Properties is a standalone public website. Its Home page is rooted at `/`.

Do not model Koinonia Properties as `/properties` inside the Koinonia Transactions website, and do not route Properties users through the Transactions public website or Transactions client portal.

A final public domain is a separate launch decision. The current temporary Vercel deployment is a development deployment.

## Site Positioning

Koinonia Properties provides property management built on clear communication, steady systems, and responsible care.

The site should make property management obvious in the hero, metadata, service descriptions, and calls to action.

Public page copy should speak to customers. Internal build-plan or development instructions belong in project documentation, not customer-facing sections.

## Primary Audiences

Property owners and investors:

- Need confidence, clarity, service scope, process, pricing factors, service availability, management standards, and communication expectations.
- Rental Analysis is the preferred public entry point for an owner considering management.
- Investors are served within the owner journey unless a future approved investor offering becomes meaningfully different.

Prospective renters and rental applicants:

- Need available homes, application guidance, rental criteria and policies, and a clear next step.
- They should not have to navigate resident-maintenance or account-access content to understand how to become a resident.

Current residents:

- Need maintenance direction, account-access guidance, resident policies, and support contact paths.
- Public-facing navigation should prefer the word `Residents` where it improves clarity, while existing route URLs may remain stable.

Existing owner clients:

- Need a clear secure-access path when an approved private property-management system provides those capabilities.

Vendors:

- Need a clear communication and coordination path.
- Vendor information is supporting navigation rather than a primary marketing journey.

## Information Architecture

The website should organize public content by visitor intent rather than presenting every public page as an equal top-level navigation choice.

Primary customer journeys:

1. Owners — I own or invest in rental property.
2. Find a Home — I am looking for a rental and may become a resident.
3. Residents — I already live in a Koinonia-managed home.

Primary desktop navigation:

- Owners
- Find a Home
- Residents
- Contact
- Persistent CTA: Request Rental Analysis

The Owners, Find a Home, and Residents items may use grouped dropdown navigation on desktop and expandable groups on mobile.

Do not expose Pricing, Service Areas, Portals, Standards, Policies, Maintenance, Apply, or Vendors as peer-level primary navigation items when those destinations can be placed in the appropriate audience journey.

### Owners navigation group

- Owner Services: `/owners`
- Rental Analysis: `/rental-analysis`
- Pricing & Scope: `/pricing`
- Service Areas: `/service-areas`
- Management Standards: `/standards`

### Find a Home navigation group

- Available Homes: `/rentals`
- How to Apply: `/apply`
- Rental Policies & Criteria: `/policies`

### Residents navigation group

- Resident Services: `/tenants`
- Maintenance Help: `/maintenance`
- Account & Portal Access: `/portals`
- Resident Policies: `/policies`
- Contact Support: `/contact`

### Supporting navigation

- Contact: `/contact`
- Vendor Information: `/vendors`

Vendor Information belongs in the footer and appropriate contact paths rather than the primary header.

When approved owner and resident private systems are live, small utility links such as Owner Login and Resident Login may be added separately from the marketing navigation. Do not imply those destinations are live before they are implemented and approved.

## Sitemap

Current public routes remain available:

- Home: `/`
- Owner Services: `/owners`
- Resident Services: `/tenants`
- Available Homes / Rentals: `/rentals`
- Account & Portal Access: `/portals`
- Rental Analysis: `/rental-analysis`
- Pricing & Scope: `/pricing`
- Service Areas / Availability: `/service-areas`
- Policies: `/policies`
- How to Apply: `/apply`
- Maintenance Help: `/maintenance`
- Vendors: `/vendors`
- Management Standards: `/standards`
- Contact: `/contact`

The existence of a public route does not require that route to appear in the primary header. Supporting routes should remain indexable and internally linked where appropriate.

Future pages may include:

- Individual rental listing pages.
- City-specific service-area pages after coverage is verified.

## Homepage Structure

The Home page is a decision-and-routing page, not a duplicate of every downstream page.

Hero:

- H1: Koinonia Properties
- Supporting line: Property management built on clear communication, steady systems, and responsible care.
- Primary CTA: Request Rental Analysis
- Secondary CTA: View Rentals
- Visual direction: communicate property management, owners, residents, properties, maintenance coordination, and professional care without presenting the company as an internal operating-system product.

Primary audience routing immediately below or near the hero should make three paths obvious:

- I own a rental property.
- I am looking for a home.
- I am a current resident.

Recommended destination behavior:

Owner path:

- Explore Owner Services.
- Request Rental Analysis.

Prospective renter path:

- View Available Homes.
- How to Apply.

Resident path:

- Resident Services.
- Maintenance Help.

Inquiry pattern:

- Use the reusable Properties Inquiry component where appropriate.
- Use an approved low-risk handoff until private backend workflows are finalized.
- Do not collect sensitive applicant, tenant, owner, payment, identity, or private account data through ordinary public-site intake.

Owner lead path:

- Rental Analysis
- Clear Scope
- Appropriate Next Step

Property-management overview:

- Rental analysis and property review.
- Rental marketing and leasing support.
- Tenant screening coordination.
- Lease administration.
- Rent collection systems and payment-process coordination.
- Maintenance coordination.
- Owner updates and reporting.
- Move-in and move-out coordination.
- Vendor communication.
- Ongoing property-management support.

Home should summarize these areas and route visitors deeper instead of repeating the full content of Owner Services, Resident Services, Pricing, Rentals, Account Access, or Standards.

Process:

1. Review the property and owner goals.
2. Prepare the management plan and clarify responsibilities.
3. Coordinate leasing or onboarding as applicable.
4. Manage the approved rent, maintenance, communication, and reporting workflows.
5. Deliver organized owner updates and ongoing support.

## Owner Services Page

Purpose:

Help property owners understand the service and take the appropriate next step.

Core subjects:

- Property management service scope.
- Leasing and tenant placement support.
- Rent collection systems and payment-process coordination.
- Maintenance coordination.
- Owner updates and reporting through approved systems.
- Property inspections when included in the approved service scope.
- Communication standards.
- Getting started.
- Portfolio-aware considerations for investment-property owners when applicable.

Primary CTA:

- Request Rental Analysis or Schedule Owner Consultation using the approved intake path.

## Resident Services Page

Public-facing label:

- Resident Services

Current stable route:

- `/tenants`

Purpose:

Support current residents while routing private activity to approved secure systems.

Core subjects:

- Rent-payment direction through the approved system.
- Maintenance guidance and request routing.
- Move-in expectations.
- Resident responsibilities.
- Policy guidance.
- Contact support.
- Account-access direction when applicable.

Available rentals and application guidance belong primarily in the Find a Home journey, though Resident Services may link back to them when useful.

Do not imply that payment, application, maintenance-record, or private-account functionality is hosted directly inside the public website unless that capability is actually implemented and approved.

## Available Rentals Page

Public-facing navigation label:

- Available Homes

Route:

- `/rentals`

Purpose:

Show current rental availability and provide the appropriate next action.

Empty-state copy:

No current vacancies. Check back soon or contact us about upcoming availability.

Listing standards when active inventory exists:

- Current availability and pricing.
- Property photos and key features.
- Bedrooms, bathrooms, parking, utilities, and pet policy where applicable.
- Apply or schedule-tour path on every listing.
- Verified application-criteria and required policy links.

## Apply Page

Public-facing navigation label:

- How to Apply

Route:

- `/apply`

Purpose:

Explain the rental-application path and route sensitive application activity to the approved system.

Do not collect or imply collection of sensitive identity, screening, or payment information on the ordinary public website unless that workflow is explicitly approved and implemented.

## Policies Page

Route:

- `/policies`

Purpose:

Provide a stable public destination for applicable rental, application, and resident policies.

Navigation behavior:

- Prospective renters may reach this page through the label Rental Policies & Criteria.
- Current residents may reach this page through the label Resident Policies.
- The page does not need to appear as a peer-level primary header item.

If policy content later becomes too large or materially different by audience, separate applicant-criteria and resident-resource pages may be evaluated. Do not add those routes solely to mirror the navigation labels.

## Pricing / Management Scope Page

Purpose:

Explain pricing factors and service scope clearly without presenting proposed packages as finalized offers.

Until approved package and pricing objects exist, public copy should explain that pricing depends on factors such as:

- Property type.
- Requested service scope.
- Occupancy or leasing status.
- Property condition and timing.
- Portfolio size or complexity.

Leasing-only service, full-service management, and portfolio management may be evaluated as future service structures, but they are not canonical packages or guaranteed offers until explicitly approved and recorded.

## Portal / Account Access Strategy

Preferred public-facing label:

- Account & Portal Access

Public site role:

- Route owners and residents to the correct approved public or secure next step.
- Avoid presenting `Portals` as a major marketing category.

Private property-management systems may handle:

- Payments.
- Applications.
- Maintenance records.
- Owner statements.
- Lease documents.
- Private account history.

Do not build or imply custom private portal behavior inside the public website until the corresponding system is selected, approved, and implemented.

## Contact Page

Inquiry paths:

- I own a rental property.
- I am looking for a rental.
- I am a current tenant or resident.
- I am a vendor.
- Other property-management question.

Contact remains directly available from the primary navigation because it serves multiple audiences.

## Footer Structure

The footer is an intentional closing section rather than a second crowded header or a flat sitemap.

Primary hierarchy:

1. Koinonia Properties brand and property-management positioning.
2. Prominent Request Rental Analysis CTA.
3. Quiet direct contact options for Email, Call, and Text.
4. Audience-group navigation.
5. Faith-centered closing signature.
6. Minimal copyright/legal line.

Desktop audience groups:

Owners:

- Owner Services
- Rental Analysis
- Pricing & Scope
- Service Areas
- Management Standards

Find a Home:

- Available Homes
- How to Apply
- Rental Policies & Criteria

Residents:

- Resident Services
- Maintenance Help
- Account & Portal Access
- Resident Policies

Koinonia:

- Contact
- Vendor Information
- Future legal/privacy links only when real destinations exist

Mobile footer behavior:

- Brand, positioning, Rental Analysis CTA, contact methods, and faith signature remain visible.
- Owners, Find a Home, Residents, and Koinonia navigation groups collapse into accessible accordion sections to avoid an unnecessarily tall footer.

Approved faith signature:

- `Bear one another’s burdens. Work heartily, as for the Lord.`
- `Galatians 6:2 · Colossians 3:23`

The faith signature should be visually distinct but restrained, with the scripture references subordinate to the statement.

Do not create placeholder Privacy, Terms, or legal links before those destinations and policies actually exist.

## SEO Requirements

Primary phrases may include:

- Koinonia Properties.
- Property management.
- Rental property management.
- Owner services.
- Resident services.
- Tenant services.
- Available rentals.
- Homes for rent.
- Rental application.
- Rental analysis.
- Property management pricing.
- Owner portal.
- Tenant portal.
- Resident portal.
- Maintenance requests.
- Property management service areas.

Metadata should make the service category clear even when the page title or navigation label uses shorter customer-facing language.

SEO copy rules:

- Add useful public copy around the search intent of each page.
- Keep city and market claims generic until service areas are approved.
- Use structured data only for facts established for Koinonia Properties.
- Do not invent address, pricing, reviews, coverage, guarantees, or statistics.
- Do not keyword-stuff repeated phrases in a way that weakens the Koinonia Properties voice.
- A route does not have to appear in the primary header to remain indexable, internally linked, and useful as an SEO landing page.

## Launch Requirements

Before public launch or before publishing specific operating promises, confirm the applicable approved business rules, policies, service areas, private-system workflows, and customer-facing disclosures.

Internal verification notes should remain internal rather than appearing as customer-facing marketing copy.

## Public-Site Principles

The Koinonia Properties website should separate high-intent audiences quickly:

- Prospective owners need owner services, pricing/scope, trust signals, service availability, management standards, and a rental-analysis path.
- Prospective renters need available homes, application guidance, and rental-policy clarity.
- Current residents need maintenance direction, account-access guidance, policies, and support.
- Existing owner clients need a clear secure-access path when the approved private system provides those capabilities.
- Visitors should not have to understand the internal page inventory before knowing which path applies to them.
- Listings should be current, mobile-friendly, photo-forward, and include direct next actions when inventory is available.
- Local SEO should be built around verified service areas.
- Keep the primary navigation calm and audience-centered even when the total route count grows.

## Canonical Alignment Rule

This specification governs the Koinonia Properties public website experience and page structure.

Property-management service scope is governed by:

- `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`

Product identity and company separation are governed by:

- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`

If website copy conflicts with those sources, resolve the conflict against the canonical business and product-boundary sources before expanding the public claim.
