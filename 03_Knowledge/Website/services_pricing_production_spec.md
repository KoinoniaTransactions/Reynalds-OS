# Services & Pricing Production Specification

## Status

Live production baseline; continue through deliberate refinement only.

Last reconciled: 2026-08-15.

This file records the approved strategy for the Koinonia Services page and must stay aligned with the repository implementation.

## Mission

Help Realtors understand Koinonia as a real estate operations partner, not merely a transaction coordination vendor and not a software platform.

The Services page should do more than repeat Home. Home introduces the brand and service lanes. Services explains what Koinonia can actually do, where support fits, how responsibility is divided, how pricing works, and which service path may fit the Realtor's business.

## Core Product Principle

**Koinonia sells the service. The portal is a delivery and communication tool, not the product.**

Services copy should lead with the operational outcome and the support Koinonia owns. Portal/tool references are secondary and should appear only when they help explain delivery.

## Page Journey

1. Hero — Create immediate clarity and offer direct next steps.
2. Core Service Lanes — Show the five operational support categories.
3. Practical Fit / Where Support Helps — Explain when each lane is useful.
4. Scope / Responsibility — Clarify what Koinonia owns and what the Realtor retains.
5. Pricing Snapshot — Support the service decision without making price the brand.
6. Referral Discovery — Present the separate referral path without making it a sixth service.
7. FAQ — Remove meaningful hesitation.
8. CTA — Make the next step easy.

## Approved Core Service Lanes

1. Transaction Support / Contract-to-Close Coordination
2. Contract & Document Support
3. Licensed Showing Coverage
4. Professional Open House Coverage
5. Monthly Operations Partnership

The **40% Referral Partner Option is separate** and must not appear as a sixth Koinonia Transactions service.

## Service Positioning

### Transaction Support / Contract-to-Close Coordination

Customer buys:

**Someone owning operational coordination from contract to close.**

Koinonia owns operational coordination. The Realtor retains the client relationship, advice, negotiation, brokerage compliance, professional judgment, and final decisions.

Current pricing direction:

- $389 prepaid
- $599 pay at successful close

The higher pay-at-close amount reflects Koinonia assuming closing/payment risk under the approved structure.

### Contract & Document Support

Positioning:

**You make the decision. We turn that decision into an organized, review-ready document workflow.**

The Realtor provides the business terms, professional decisions, and direction. Koinonia supports the preparation workflow, completeness review, missing-information follow-up, revisions, and organized draft delivery. The Realtor approves the final document.

### Licensed Showing Coverage

Professional licensed backup when a client needs access and the Realtor cannot be in two places.

Koinonia handles the agreed showing/access role. The Realtor retains representation, advice, negotiation, strategy, and the client relationship.

### Professional Open House Coverage

Positioning:

**Your listing. Professionally prepared, promoted, and hosted.**

Approved public pricing structure:

- standalone: $200 for up to a 3-hour session
- one included open house with an applicable $599 pay-at-successful-close Transaction Support engagement
- additional qualifying sessions under that engagement: $100 each, up to 3 hours
- the $389 prepaid Transaction Support option does not include an open house

Professional coverage may include the approved flyer, signage setup/takedown using available approved signage, digital promotion through approved channels, licensed hosting, and post-event notes/summary.

### Monthly Operations Partnership

Recurring support may include CRM organization, pipeline visibility, follow-up tracking, recurring tasks, checklists, client communication support, calendar/task coordination, templates, workflow documents, and operational cleanup.

Boundary:

**This is not unlimited assistant access.**

Current public tiers:

- Starter — $299/month, up to 3 hours
- Growth — $599/month, up to 7 hours
- Partner — $999/month, up to 12 hours

Any discount language must be supported by an approved documented pricing rule before publication. Do not invent undocumented discount terms.

## Referral Discovery

Purpose: make the separate referral path discoverable for Realtors who do not want to personally carry the client relationship.

Preferred framing:

**Want to keep the client? We’ll help you carry the operation.**

**Don’t want to take the client? You may be able to refer the opportunity instead.**

The Services page may point to `/referrals`, but detailed referral explanation belongs on the dedicated Referral Partner page.

## Public Referral Detail Boundary

The public website may state the 40% referral benefit and explain high-level fit/process.

Do not publish detailed brokerage settlement mechanics, internal deductions, or brokerage-specific compensation mechanics. Complete terms belong in the formal referral documents before client handoff.

A Koinonia support relationship never becomes a referral unless the Realtor explicitly chooses the referral path.

## Hero

Purpose: make a Realtor understand that this page explains service fit and practical support.

Use the canonical Koinonia full-bleed hero system where appropriate:

- live HTML copy,
- bright/light professional workspace imagery,
- page-specific desktop/mobile imagery,
- no embedded marketing copy inside the image.

A front-facing screen is not required merely for consistency. Screen visibility should follow the rule in `WEBSITE_PRODUCTION_FRAMEWORK.md` and the Hero component documentation.

## Layout Rules

Five equivalent service/scope/fit/pricing card groups should use the approved balanced-five layout:

- desktop: 3 + centered 2,
- medium: 2 + 2 + centered 1,
- mobile: single column.

Do not solve repeated five-card geometry with one-off page-specific positioning.

## Pricing Presentation Rule

Pricing supports the service decision rather than driving the brand.

Lead with business need, outcome, scope, and support fit. Use pricing to make the next decision clear.

Do not market Koinonia as the cheapest, fastest, unlimited, or “we do everything” option.

## FAQ

A question belongs in the FAQ when answering it materially improves clarity, trust, or the likelihood of an appropriate inquiry.

## Final CTA

Tone:

Calm confidence; no artificial urgency.

The first engagement should be sized to solve the current problem and earn the next engagement through dependable delivery.

## Implementation Rules

- Keep copy centralized in `apps/web/content/services.ts`.
- Keep page assembly in `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`.
- Keep shared components reusable.
- Follow `03_Knowledge/Website/PRODUCTION_INDEX.md` before structural changes.
- Do not mark a material Services change complete until the repository implementation passes the applicable release-readiness checks.
