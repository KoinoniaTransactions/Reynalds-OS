# Services & Pricing Production Specification

## Status

Active production implementation.

This file records the approved strategy for the Koinonia Services & Pricing page and must stay aligned with the repository implementation.

## Mission

Help Realtors understand Koinonia as a long-term operational partner, not merely a transaction coordination vendor.

The Services page should do more than repeat the Home page. Home introduces the brand and service categories. Services explains what Koinonia can actually do, where support fits, how the process works, and which level of support may fit the Realtor's business.

## Page Journey

1. Hero — Create immediate clarity and offer direct next steps.
2. Service Categories — Show the four operational support categories with more detail than Home.
3. Where Support Helps — Explain practical situations where Koinonia support fits.
4. How It Works — Make the process feel simple.
5. Support Levels — Present support fit before price comparison.
6. FAQ — Remove final hesitation.
7. CTA — Make the next step easy.

## Approved Sections

### Hero

Purpose: make a Realtor keep reading and understand that this page explains service fit.

Approved formula:

- eyebrow
- concise headline
- short supporting paragraph
- primary CTA
- secondary CTA
- approved professional workspace/computer image when used

Approved hero CTAs:

- Schedule a Consultation
- View Support Levels

### Service Categories

Purpose: answer "What can Koinonia help with?"

Approved categories:

- Transaction Management
- Contract Preparation & Writing
- Licensed Showing Coverage
- Business Operations Support

Rule:
The Services page cards should be more detailed than the Home page preview cards. They should describe the practical operational support included in each category.

### Where Support Helps

Purpose: answer "When would I actually use this?"

Approved practical support situations:

- Active files need structure.
- Paperwork needs to move quickly.
- Clients need access.
- Daily operations need follow-through.

### How It Works

Purpose: remove uncertainty.

Messaging rule:
Write from the Realtor's perspective using clear support language. The process should work for transactions, contract preparation, showing coverage, and business operations, not only contract-to-close files.

### Support Levels

Purpose: help Realtors identify the support that fits their business.

Presentation rule:
Lead with business need and support fit. Pricing supports the decision rather than driving it.

Approved support levels:

- Transaction Support
- Expanded Realtor Support
- Operations Partner

### FAQ

Purpose: remove final hesitation.

Rule:
A question belongs in the FAQ only if answering it increases the likelihood of contacting Koinonia.

### Final CTA

Purpose: remove friction.

Tone:
Calm confidence; no urgency pressure.

Brand feeling:
"When you're ready, we're ready."

## Implementation Rules

- Do not repeat the Home TrustPillars section on Services unless there is a specific reason.
- Do not make Services feel like a duplicate of Home.
- Do not turn Services into a pricing table until the pricing strategy is intentionally approved.
- Keep copy centralized in `apps/web/content/services.ts`.
- Keep page assembly in `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`.
- Keep shared components reusable.
- Do not mark this page complete until the repository implementation passes the release readiness checklist.
