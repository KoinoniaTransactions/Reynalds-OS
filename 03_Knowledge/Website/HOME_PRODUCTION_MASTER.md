# Koinonia Home Production Master

## Status

Live production baseline; continue only through deliberate refinement.

Last reconciled: 2026-08-15.

## Purpose

The Home page answers: **Can Koinonia help me?**

It should quickly communicate that Koinonia is a dependable real estate operations partner for Realtors who need support with transactions, contract/document work, licensed showing coverage, professional open houses, and recurring business operations.

The Home page introduces the business. It should not try to explain every detail or make the portal feel like the product.

## Canonical Sources

- `03_Knowledge/Website/PRODUCTION_INDEX.md`
- `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md`
- `03_Knowledge/Brand/koinonia_brand_core.md`
- approved Koinonia Brand & Marketing System
- `02_Companies/Koinonia/01_Services/`
- `02_Companies/Koinonia/02_Packages/`
- `apps/web/content/home.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`

Historical recovery snapshots are reference-only when current sources are insufficient.

## Core Messaging Principle

**Koinonia sells dependable real estate operations support. The portal is a delivery and communication tool, not the product.**

The Home page should lead with what the Realtor gains:

- more room for client-facing work,
- dependable operational follow-through,
- organized support behind the scenes,
- a clear way to get help without giving up the client relationship.

## Current Public Service Preview

The Home page should introduce five core service lanes:

1. Transaction Support / Contract-to-Close Coordination
2. Contract & Document Support
3. Licensed Showing Coverage
4. Professional Open House Coverage
5. Monthly Operations Partnership

The 40% Referral Partner Option should remain a discoverable secondary path rather than appearing as a sixth service.

## Approved Page Role

The Home page should remain:

- light,
- clear,
- navigational,
- outcome-focused,
- easy to scan.

Deeper scope, pricing, referral details, and process explanation belong on the Services and Referral Partner pages.

## Hero Direction

The Home hero should follow the canonical full-bleed Koinonia hero system:

- live HTML copy on the left,
- bright professional workspace visual on the right,
- page-specific desktop/mobile images where appropriate,
- cream-to-image blending,
- no embedded marketing copy inside the image.

Home imagery should generally emphasize the professional workspace and support environment rather than screens or dashboards.

Screen-forward imagery is reserved for pages where visible workflow materially strengthens the story.

## Service Overview Rule

Home service cards are previews, not full service specifications.

They should communicate the problem each lane solves and lead naturally into `/services`.

Use the approved balanced-five layout for five equivalent service cards:

- desktop: 3 + centered 2,
- medium: 2 + 2 + centered 1,
- mobile: 1 column.

## Referral Discovery Rule

The Home page may make the Referral Partner option visible enough that a Realtor immersed in Koinonia's work can discover it.

It should not compete visually or conceptually with the five core support services.

Preferred decision framing:

**Want to keep the client? We’ll help you carry the operation.**

**Don’t want to take the client? You may be able to refer the opportunity instead.**

## SEO

Home SEO should position Koinonia as real estate operations support for Realtors and may reference the five core service lanes.

Do not position Koinonia as a software platform or portal product.

## Implementation

Canonical current implementation:

- route: `/`
- content: `apps/web/content/home.ts`
- assembly: `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- shared Hero: `apps/web/components/site/Hero/Hero.tsx`
- shared layout utilities: `apps/web/styles/koinonia-layout.css`

Legacy `/koinonia` may remain as an alias but is not the primary Home route.

## Production Rule

The Home page should remain stable once approved. New sections or structural changes require a clear business reason and must follow the source hierarchy in `PRODUCTION_INDEX.md` before implementation.
