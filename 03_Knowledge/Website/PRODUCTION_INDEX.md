# Koinonia Website Production Index

## Status

Active canonical public-website implementation map.

Last reconciled with production: 2026-08-15.

## Purpose

This file is the public website implementation map for Koinonia Transactions.

The Brain defines architecture, product boundaries, and release governance.
The Business Objects define services, packages, pricing, and business rules.
The Brand sources define identity and art direction.
This Website Knowledge system defines how the public website is designed, implemented, verified, recovered, and maintained.

Before creating or materially changing Koinonia website documentation, check this index and the canonical source hierarchy below first.

## Canonical Source Order

For public website work, resolve conflicts in this order:

1. `02_Companies/Koinonia/` — business objects, services, packages, pricing, and operating truth
2. `03_Knowledge/Brand/koinonia_brand_core.md` and approved Koinonia brand system — brand identity and visual direction
3. `03_Knowledge/Website/` — public website implementation/design truth
4. `docs/specifications/` — detailed feature/page specifications where still current
5. `apps/web/content/` — current centralized public copy
6. `apps/web/components/site/` — current reusable components and page assemblies
7. `apps/web/app/` — route entry points
8. Recovery snapshots — historical reference only when current sources are incomplete

Release/deployment mechanics are governed separately by:

- `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`

Product separation is governed by:

- `BRAIN/PRODUCT_BOUNDARIES.md`

## Core Website Principle

Koinonia sells dependable real estate operations support.

The portal is not the product. The portal is a tool for communication, visibility, documents, billing, and completion of the work being delivered through Koinonia's services.

Public website copy and imagery must lead with the service outcome and partnership value, not software features.

## Current Canonical Public Routes

| Page | Route | Status |
|---|---|---|
| Home | `/` | Live |
| Services | `/services` | Live |
| About | `/about` | Live |
| Contact | `/contact` | Live |
| Referral Partner | `/referrals` | Live |
| Jeremiah Digital Business Card | `/jeremiah` | Live |

Legacy/alias Koinonia routes may remain available unless intentionally removed:

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

Do not treat the alias routes as the primary public information architecture.

## Current Public Service Architecture

Koinonia Transactions has five core public service lanes:

1. Transaction Support / Contract-to-Close Coordination
2. Contract & Document Support
3. Licensed Showing Coverage
4. Professional Open House Coverage
5. Monthly Operations Partnership

The **40% Referral Partner Option** is a separate secondary referral path and is not a sixth Koinonia Transactions service.

Public website work must preserve that distinction.

## Referral Public-Detail Boundary

The public site may clearly communicate the 40% referral benefit and the business situations where referral may make sense.

Do not publish detailed brokerage settlement mechanics, internal deductions, or brokerage-specific compensation mechanics on the public page. Complete brokerage, compensation, transaction, and referral terms belong in the formal referral documents before client handoff.

A Koinonia Transactions support relationship never becomes a brokerage referral unless the Realtor explicitly chooses to refer the client.

## Production Website Rules

Before inventing or materially changing website structure, check:

1. Business Objects
2. Brand Core / Brand Marketing System
3. this Website Knowledge directory
4. applicable page/component specifications
5. centralized content files
6. current React implementation
7. historical recovery sources only if necessary

Prefer updating the existing canonical source over creating a parallel source-of-truth document.

## Current Implementation Map

### Content

- Home: `apps/web/content/home.ts`
- Services: `apps/web/content/services.ts`
- Referral Partner: `apps/web/content/referrals.ts`
- Contact: `apps/web/content/contact.ts`
- Shared/brand content: `apps/web/content/`

### Page Assemblies

- Home: `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- Services: `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- Referral Partner: `apps/web/components/site/PageAssemblies/KoinoniaReferrals.tsx`
- About: `apps/web/components/site/PageAssemblies/`
- Contact: `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`

### Shared Visual System

- Hero: `apps/web/components/site/Hero/Hero.tsx`
- Hero governance: `apps/web/components/site/Hero/COMPONENT.md`
- Shared Koinonia styling: `packages/design-system/styles.css`
- Koinonia layout utilities: `apps/web/styles/koinonia-layout.css`

## Current Hero Art Direction

Koinonia public heroes should feel:

- light and airy
- clean, calm, and organized
- premium without becoming dark or theatrical
- realistic and professionally grounded
- warm cream/white with soft natural light and warm wood
- restrained black/gold brand accents
- spacious enough for live HTML copy

Marketing copy must remain live HTML/CSS rather than being baked into hero images.

Realistic object text inside a scene is acceptable when natural to the environment, but the image itself must not become the primary message.

### Screen-Visibility Rule

Brand consistency comes from the shared visual system, not identical computer orientation.

Most heroes should emphasize the physical professional workspace, documents, property/operations cues, and back/side views of technology.

A front-facing screen is appropriate when seeing the workflow materially strengthens the service story, such as referral handoff or operational visibility.

Front-facing screens should remain occasional rather than becoming the default so Koinonia never begins to look like a software company.

The Referral Partner hero is the approved precedent for this controlled exception.

## Layout Governance

The approved reusable five-card pattern is:

- desktop: 3 cards followed by a centered row of 2
- medium: 2 + 2 + centered 1
- mobile: 1 column

Use the shared `balanced-five` treatment rather than creating page-specific hacks when a section contains exactly five equivalent cards.

Spacing refinements should be reusable when the same visual relationship recurs, but narrowly scoped when the issue is unique to one section.

## Release Gates

A public page or material website change is release-ready only after:

1. Business content matches canonical business objects.
2. The page architecture follows current Website Knowledge and approved specifications.
3. Components are canonical or documented variants.
4. Visual style matches current Koinonia art direction.
5. Desktop and mobile presentation are reviewed.
6. SEO metadata is present and appropriate.
7. Accessibility basics are verified.
8. Relevant focused tests/build checks pass.
9. Git records the completed change.
10. `website_status.md` is updated for meaningful public-site milestones.
11. Production promotion follows `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`.

## Current Production Baseline

As of 2026-08-15, the live public website is based on:

- production branch: `koinonia-production`
- production commit: `56910eb48f04195ff0c9c11a5df914561006543c`
- `/jeremiah`: live and preserved
- `/referrals`: live
- five-service public architecture: live

The portal remains in development and must be reconciled with this cumulative public-site baseline before any future portal production promotion.
