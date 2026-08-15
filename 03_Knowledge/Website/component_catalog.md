# Component Catalog — Koinonia Public Website

## Canonical Location

`apps/web/components/site/`

## Purpose

Catalog the reusable public-site components that should be checked before creating page-specific UI.

For overall website source hierarchy, begin with:

- `03_Knowledge/Website/PRODUCTION_INDEX.md`

## Components

| ID | Name | Source | Status |
|---|---|---|---|
| COMP-HEADER-001 | Koinonia Public Header | `Header/Header.tsx` | Canonical |
| COMP-HERO-001 | Primary Public Website Hero | `Hero/Hero.tsx` | Canonical |
| COMP-TRUST-001 | Trust Pillars | `TrustPillars/TrustPillars.tsx` | Canonical |
| MOD-004 | Universal Content Card | `UniversalCard/UniversalCard.tsx` | Canonical |
| COMP-CTA-001 | Final Call to Action | `CTA/CTA.tsx` | Canonical |
| COMP-FAQ-001 | FAQ Objection Resolution | `FAQ/FAQ.tsx` | Canonical |
| COMP-FOOTER-001 | Koinonia Footer | `Footer/Footer.tsx` | Canonical |

## Shared Layout Support

The public component system also relies on shared layout/style layers:

- `packages/design-system/styles.css`
- `apps/web/styles/koinonia-layout.css`

The `balanced-five` utility is the approved reusable layout for exactly five equivalent cards.

## Hero Governance

Hero-specific visual and screen-visibility rules are documented in:

- `apps/web/components/site/Hero/COMPONENT.md`

Do not create a new hero component merely to support a different image orientation or page-specific image. Prefer the canonical Hero props/variants unless the interaction or structural role is genuinely different.

## Rule

Reuse or extend canonical components before creating a new component with the same role.

If a new component or variant is required, document why the existing component cannot reasonably support the need and update this catalog when the new pattern becomes canonical.
