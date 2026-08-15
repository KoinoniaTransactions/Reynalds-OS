# Koinonia Website Production Framework

## Status

Active canonical website production standard.

Last reconciled: 2026-08-15.

## Purpose

This document defines the production standards for the Koinonia Transactions public website.

It serves as the bridge between:

- Business Objects
- Brand Standards
- Website Knowledge
- Page Specifications
- Centralized Content
- React Components
- Production Implementation

Every public page must conform to this framework unless a documented exception is approved.

For the public website source-of-truth map, begin with:

- `03_Knowledge/Website/PRODUCTION_INDEX.md`

---

# 1. Website Mission

The Koinonia website exists to:

- clearly explain Koinonia's services,
- build trust with Realtors and brokerages,
- demonstrate operational excellence,
- help Realtors understand where support fits,
- generate qualified consultations,
- make the separate Referral Partner option discoverable without allowing it to compete with the core support services,
- reflect the professionalism, calm, and dependability of the Koinonia brand.

The website is a client-acquisition and trust-building surface. It is not a software-product marketing site.

---

# 2. Core Product Principle

**Koinonia sells the service. The portal is a tool used to communicate, provide visibility, exchange documents, manage billing, and complete the work.**

Website messaging must therefore follow this hierarchy:

1. outcome and business value,
2. service mechanism,
3. professional boundaries,
4. tools/portal only when useful to explain delivery.

Do not lead public marketing with portal features, dashboards, or software language.

---

# 3. Canonical Source Hierarchy

Before creating or changing website content or structure, use this order:

1. Business Objects
2. Brand Core / approved Koinonia brand system
3. `03_Knowledge/Website/PRODUCTION_INDEX.md`
4. applicable Website Knowledge/page specification
5. centralized content files
6. current React component/page implementation
7. recovery snapshots only as historical reference when current sources are incomplete

Never create a competing source-of-truth document before checking the existing canonical index for the domain.

---

# 4. Brand Personality

The website should feel:

- professional,
- organized,
- calm,
- dependable,
- premium without being flashy,
- approachable,
- service-centered,
- trustworthy.

Avoid hype, clutter, exaggerated urgency, generic SaaS language, and unnecessary complexity.

---

# 5. Editorial Standards

Write for busy real estate professionals.

Content should be:

- clear,
- direct,
- useful,
- easy to scan,
- professional,
- grounded in practical business situations.

Marketing hierarchy:

**Outcome first → mechanism second → boundaries third.**

Service copy should help a Realtor quickly answer:

- What problem does this solve?
- What does Koinonia own?
- What do I still own?
- What is the next step?

---

# 6. Current Service Architecture

The public website should represent five core Koinonia Transactions service lanes:

1. Transaction Support / Contract-to-Close Coordination
2. Contract & Document Support
3. Licensed Showing Coverage
4. Professional Open House Coverage
5. Monthly Operations Partnership

The 40% Referral Partner Option is separate from the five-service architecture.

It should be obvious enough to discover during immersion in Koinonia's work, but it must remain a secondary alternative for situations where the Realtor does not want to personally carry the client relationship.

---

# 7. Design Standards

Every primary public page should use:

- a strong hero,
- clear supporting sections,
- deliberate visual hierarchy,
- generous spacing,
- clear CTA paths,
- consistent Header/Footer treatment,
- reusable card/layout systems where appropriate.

The design should feel intentional rather than template-driven.

Avoid dense walls of cards, cramped transitions, and page-specific layout hacks when an approved reusable pattern already exists.

---

# 8. Hero System

The canonical Hero component is:

- `apps/web/components/site/Hero/Hero.tsx`

Hero governance is documented in:

- `apps/web/components/site/Hero/COMPONENT.md`

## Full-Bleed Direction

The approved Koinonia full-bleed hero system uses:

- live HTML copy on the left,
- a wide page-specific image on the right,
- cream-to-image visual blending,
- bright/light professional workspace imagery,
- desktop and mobile image variants where needed.

Marketing copy must not be baked into the hero image.

## Image Art Direction

Hero imagery should generally include:

- light cream/white environments,
- soft natural daylight,
- warm wood,
- organized documents/workspace cues,
- restrained black/gold accents,
- realistic professional environments,
- useful negative space.

Avoid overly dark, cinematic, moody, or generic stock-photography treatments.

## Screen-Visibility Rule

Brand consistency comes from the shared visual system, not identical laptop orientation.

Most heroes should emphasize the physical workspace and use back/side views of technology when that best supports the composition.

Front-facing screens are allowed when seeing a workflow materially strengthens the service story.

The approved Referral Partner hero is the precedent: a front-facing screen can support a story about organized referral handoff and visibility.

Front-facing screens should remain occasional so Koinonia does not begin to look like a software company.

The service remains the product; the interface remains a supporting delivery cue.

---

# 9. Layout Standards

## Five-Card Pattern

For exactly five equivalent cards, use the approved balanced-five layout:

- desktop: 3 + centered 2,
- medium: 2 + 2 + centered 1,
- mobile: single column.

Use the shared implementation in `apps/web/styles/koinonia-layout.css` rather than creating custom page-specific alignment rules.

## Spacing

Feature cards, banners, and supporting grids should have enough visual separation to read as intentional sections.

If a spacing problem reflects a reusable relationship, prefer a reusable utility/class. If it is unique to one section, scope the rule narrowly.

---

# 10. Component Standards

Approved reusable public-site components include:

- Header
- Hero
- TrustPillars
- UniversalCard
- FAQ
- CTA
- Footer

Reuse or extend canonical components before creating a new component that duplicates their role.

Page-specific assemblies belong under:

- `apps/web/components/site/PageAssemblies/`

Centralized page copy belongs under:

- `apps/web/content/`

---

# 11. Referral Public-Detail Rule

The Referral Partner page may publicly communicate:

- that the option exists,
- the 40% referral benefit,
- when referral may make business sense,
- the high-level handoff process,
- milestone-level visibility,
- client relationship protection.

Do not publicly disclose detailed brokerage-specific settlement mechanics, internal deductions, or other compensation mechanics that belong in formal referral documents.

A Koinonia support engagement never becomes a referral by default.

---

# 12. SEO Standards

Every public page should include:

- one H1,
- logical H2 hierarchy,
- meta title,
- meta description,
- internal links where useful,
- canonical URL,
- appropriate social metadata where supported.

SEO should describe Koinonia as real estate operations support, not as a software platform.

---

# 13. Accessibility Standards

Pages should support:

- semantic headings,
- keyboard navigation,
- descriptive links,
- accessible contrast,
- useful image alt text,
- responsive behavior across desktop/mobile.

---

# 14. Production Checklist

Before a page or material website change is complete:

- Business Objects verified
- Brand direction verified
- Website Knowledge verified
- applicable specifications verified
- desktop reviewed
- mobile reviewed
- SEO reviewed
- accessibility basics reviewed
- canonical components used or documented
- focused tests/build verification completed
- Git commit recorded
- `website_status.md` updated for meaningful milestones
- production release follows `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`

---

# 15. Change-Control Rule

When a new website design or implementation decision becomes canonical:

1. check `PRODUCTION_INDEX.md` first,
2. update the existing Website Knowledge/framework/component document that owns the rule,
3. update Brain documentation only when the decision also affects architecture, product boundaries, or release governance,
4. avoid creating parallel documents that restate the same rule without a clear ownership reason.
