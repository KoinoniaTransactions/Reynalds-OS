# COMP-HERO-001 — Primary Public Website Hero

Owner: Website System  
Status: Canonical v1.0  
Source: `apps/web/components/site/Hero/Hero.tsx`

## Purpose

Reusable page-opening hero for public Koinonia pages.

## Used By

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

## Governance

This component is canonical. Reuse or extend it before creating a new component.

## Variant: Full Bleed

The `fullBleed` variant is used for the Koinonia Home hero when the page needs a wide visual composition rather than a boxed visual card.

Use this variant when:
- the hero image should stretch across the right side of the viewport,
- the copy should remain live HTML on the left,
- a soft cream-to-image gradient blend is needed,
- the layout should visually resemble the approved Koinonia hero composition.

Current production use:
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`

Do not use this variant to introduce a new office environment. It should continue using the canonical Koinonia office image system.
