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

Owners:

- Need confidence, clarity, service scope, process, pricing factors, and communication expectations.

Tenants and rental applicants:

- Need rentals, application guidance, maintenance direction, policy clarity, contact paths, and secure account access when available.

Investors:

- Need leasing support, management consistency, maintenance coordination, communication, and portfolio-aware operations.

Vendors:

- Need a clear communication and coordination path.

## Sitemap

Current public pages:

- Home: `/`
- Owner Services: `/owners`
- Tenant Services: `/tenants`
- Available Rentals: `/rentals`
- Portals / Secure Access: `/portals`
- Rental Analysis: `/rental-analysis`
- Pricing and Scope: `/pricing`
- Service Areas / Availability: `/service-areas`
- Policies: `/policies`
- Apply: `/apply`
- Maintenance: `/maintenance`
- Vendors: `/vendors`
- Operating Standards: `/standards`
- Contact: `/contact`

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

Top navigation:

- Owners
- Rentals
- Tenants
- Pricing
- Areas
- Portals
- Standards
- Policies
- Contact

Quick access:

- Owner Inquiry
- Available Rentals
- Tenant / Resident Help
- Secure Portal Access

Inquiry pattern:

- Use the reusable Properties Inquiry component where appropriate.
- Use an approved low-risk handoff until private backend workflows are finalized.
- Do not collect sensitive applicant, tenant, owner, payment, identity, or private account data through ordinary public-site intake.

Audience paths:

- For Property Owners
- For Tenants / Residents
- For Investors

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

Home should summarize these areas and route visitors deeper instead of repeating the full content of Owner Services, Tenant Services, Pricing, Rentals, Portals, or Standards.

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

Primary CTA:

- Request Rental Analysis or Schedule Owner Consultation using the approved intake path.

## Tenant Services Page

Purpose:

Support residents and applicants while routing private activity to approved secure systems.

Core subjects:

- Available rentals.
- Application guidance.
- Rent-payment direction through the approved system.
- Maintenance guidance and request routing.
- Move-in expectations.
- Resident responsibilities.
- Contact support.

Do not imply that payment, application, maintenance-record, or private-account functionality is hosted directly inside the public website unless that capability is actually implemented and approved.

## Available Rentals Page

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

## Portal Strategy

Public site role:

- Route owners, tenants, applicants, and vendors to the correct public or secure next step.

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

## SEO Requirements

Primary phrases may include:

- Koinonia Properties.
- Property management.
- Rental property management.
- Owner services.
- Tenant services.
- Available rentals.
- Rental application.
- Rental analysis.
- Property management pricing.
- Owner portal.
- Tenant portal.
- Maintenance requests.
- Property management service areas.

Metadata should make the service category clear even when the page title uses the shorter brand name.

SEO copy rules:

- Add useful public copy around the search intent of each page.
- Keep city and market claims generic until service areas are approved.
- Use structured data only for facts established for Koinonia Properties.
- Do not invent address, pricing, reviews, coverage, guarantees, or statistics.
- Do not keyword-stuff repeated phrases in a way that weakens the Koinonia Properties voice.

## Launch Requirements

Before public launch or before publishing specific operating promises, confirm the applicable approved business rules, policies, service areas, private-system workflows, and customer-facing disclosures.

Internal verification notes should remain internal rather than appearing as customer-facing marketing copy.

## Public-Site Principles

The Koinonia Properties website should separate high-intent audiences quickly:

- Prospective owners need owner services, pricing/scope, trust signals, service availability, and a rental-analysis path.
- Tenants need available rentals, application guidance, maintenance direction, and secure account-access guidance.
- Existing owner clients need a clear secure-access path when the approved private system provides those capabilities.
- Listings should be current, mobile-friendly, photo-forward, and include direct next actions when inventory is available.
- Local SEO should be built around verified service areas.

## Canonical Alignment Rule

This specification governs the Koinonia Properties public website experience and page structure.

Property-management service scope is governed by:

- `02_Companies/Koinonia/01_Services/OBJ-00000014_Property_Management_Service.md`

Product identity and company separation are governed by:

- `BRAIN/PRODUCT_BOUNDARIES.md`
- `BRAIN/APPLICATION_CATALOG.md`

If website copy conflicts with those sources, resolve the conflict against the canonical business and product-boundary sources before expanding the public claim.
