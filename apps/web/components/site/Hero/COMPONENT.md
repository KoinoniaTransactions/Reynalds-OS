# COMP-HERO-001 — Primary Public Website Hero

Owner: Website System  
Status: Canonical  
Source: `apps/web/components/site/Hero/Hero.tsx`
Last reconciled: 2026-08-15

## Purpose

Reusable page-opening hero for public Koinonia pages.

## Used By

Primary public use includes:

- `/`
- `/services`
- `/about`
- `/contact`
- `/referrals`

Legacy `/koinonia*` aliases may also render Koinonia page assemblies.

## Governance

This component is canonical. Reuse or extend it before creating a new component that duplicates the same page-opening role.

Website-level hero rules are also governed by:

- `03_Knowledge/Website/PRODUCTION_INDEX.md`
- `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md`

## Variant: Full Bleed

The `fullBleed` variant is the approved primary Koinonia public-page hero treatment when the page uses a wide image composition rather than a boxed visual card.

Use this variant when:

- the hero image should stretch across the right side of the viewport,
- the copy should remain live HTML on the left,
- a soft cream-to-image blend is appropriate,
- page-specific desktop/mobile images improve composition,
- the layout should visually belong to the established Koinonia hero family.

Approved production use includes Home, Services, About, Contact, and Referral Partner page assemblies where configured.

## Copy Rule

Marketing copy, headlines, CTA text, pricing claims, and page messaging must remain live HTML/CSS.

Do not bake page copy into hero imagery.

Realistic incidental object text inside a scene is acceptable when natural to the environment, but the image must not become the primary carrier of the marketing message.

## Art Direction

Koinonia hero imagery should generally feel:

- bright and airy,
- clean and calm,
- organized,
- premium without becoming dark or theatrical,
- realistic and professionally grounded,
- warm cream/white with soft natural light,
- warm wood with restrained black/gold accents,
- spacious enough to blend with live copy.

Avoid overly dark, cinematic, moody, generic-stock, or software-dashboard-first imagery.

## Screen-Visibility Rule

Brand consistency comes from the shared visual language, not identical computer orientation.

Most hero images should emphasize the physical professional workspace, documents, property/operations cues, and back/side views of technology when those best support the page story.

A front-facing computer screen is appropriate when seeing the workflow materially strengthens the service story.

The Referral Partner hero is the approved precedent: visible workflow can reinforce organized handoff and milestone visibility.

Do not respond to that precedent by making every future hero screen-forward. Front-facing screens should remain occasional so Koinonia does not begin to look like a software company.

**The service is the product. The portal/interface is a supporting delivery and communication tool.**

## Desktop / Mobile Image Rule

The Hero supports separate desktop and mobile image sources.

Use separate assets when the crop, composition, focal point, or negative-space needs differ materially by viewport.

Do not force one desktop composition into mobile when a purpose-built mobile image creates a cleaner presentation.

## Image-System Rule

New hero assets should remain within the canonical Koinonia visual family unless a deliberate art-direction change is approved and documented.

Page-to-page variation is encouraged when it supports the service story. Brand consistency should come from lighting, palette, environment, composition, and overall tone—not from repeating the exact same desk angle or computer orientation.
