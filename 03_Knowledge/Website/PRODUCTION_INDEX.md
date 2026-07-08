# Koinonia Website Production Index

## Purpose

This file is the public website implementation map for Koinonia.

The Brain defines architecture.
The Business Objects define services, packages, and pricing.
This index defines how the public website is recovered, implemented, verified, and released.

## Canonical Source Order

1. `02_Companies/Koinonia/` business objects
2. `03_Knowledge/Brand/koinonia_brand_core.md`
3. `03_Knowledge/Website/`
4. `docs/specifications/`
5. `RECOVERY_AUDIT/source_snapshots/v11_3_0_services_pricing/`
6. `apps/web/app/koinonia/`
7. `apps/web/components/site/`

## Current Public Routes

| Page | Route | Status |
|---|---|---|
| Home | `/koinonia` | Draft / needs production recovery |
| Services & Pricing | `/koinonia/services` | Draft / active recovery |
| About | `/koinonia/about` | Draft / needs production recovery |
| Contact | `/koinonia/contact` | Draft / needs production recovery |

## Production Recovery Rule

Do not invent new website structure before checking:

1. Business Objects
2. Brand Core
3. Website Knowledge
4. Page Specifications
5. Recovery Snapshots
6. Current React implementation

## Page Recovery Order

1. Services & Pricing
2. Home
3. Contact
4. About

## Services & Pricing Canonical Sources

- `03_Knowledge/Website/services_pricing_production_spec.md`
- `docs/specifications/SERVICES_SPEC.md`
- `02_Companies/Koinonia/01_Services/`
- `02_Companies/Koinonia/02_Packages/`
- `02_Companies/Koinonia/03_Pricing/`
- `RECOVERY_AUDIT/source_snapshots/v11_3_0_services_pricing/components_site/KOINONIA-SERVICES/index.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`

## Component Recovery Sources

| Component | Current Location | Recovery Source |
|---|---|---|
| Hero | `apps/web/components/site/Hero/Hero.tsx` | `RECOVERY_AUDIT/.../COMP-HERO-001/index.tsx` |
| UniversalCard | `apps/web/components/site/UniversalCard/UniversalCard.tsx` | `RECOVERY_AUDIT/.../COMP-CARD-004/index.tsx` |
| TrustPillars | `apps/web/components/site/TrustPillars/TrustPillars.tsx` | `RECOVERY_AUDIT/.../COMP-TRUST-001/index.tsx` |
| CTA | `apps/web/components/site/CTA/CTA.tsx` | `RECOVERY_AUDIT/.../COMP-CTA-001/index.tsx` |
| FAQ | `apps/web/components/site/FAQ/FAQ.tsx` | `RECOVERY_AUDIT/.../COMP-FAQ-001/index.tsx` |
| Footer | `apps/web/components/site/Footer/Footer.tsx` | `RECOVERY_AUDIT/.../COMP-FOOTER-001/index.tsx` |

## Release Gates

A page is production-ready only after:

1. Content matches canonical business objects.
2. Layout follows the approved page specification.
3. Components are canonical or documented variants.
4. Visual style matches Koinonia brand direction.
5. Desktop and mobile are reviewed.
6. SEO metadata is present.
7. Accessibility basics are verified.
8. Git commit records the completed page.
9. `website_status.md` is updated.

## Current Active Task

Recover and finalize the Services & Pricing page using the recovery snapshot layout, current business objects, and current React component architecture.
