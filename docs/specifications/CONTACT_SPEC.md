# Contact Page Specification

Route: `/koinonia/contact`  
Status: Active production implementation  
Owner: Website System

## Purpose

Answer: "How do I get started?"

The Contact page should make the next step clear, calm, and low-pressure. It should not oversell. The visitor has already moved through Home, Services, and/or About; Contact exists to remove friction and make the first conversation easy.

## Current Implementation

Source: `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`

Route file: `apps/web/app/koinonia/contact/page.tsx`

Canonical contact source:

`apps/web/config/contact.config.ts`

Reusable contact component:

`apps/web/components/site/ContactActions/ContactActions.tsx`

## Components Used

- `Hero`
- `ContactActions`
- `UniversalCard`
- `FAQ`
- `CTA`
- `Footer`

## Production Contact Details

Email:

- `jeremiah@koinoniaadmin.com`

Phone:

- `(719) 745-8497`

Text:

- `(719) 745-8497`

## Page Sections

1. Contact Hero
2. How to Reach Out
3. Contact Actions
4. What Happens Next
5. Contact FAQ
6. Final CTA
7. Footer

## Approved Hero

Eyebrow:

Contact Koinonia

Headline:

Start with a clear next step.

Supporting copy:

Reach out when you need dependable real estate operations support for a transaction, contract, showing conflict, or business workflow. Koinonia will help clarify the need and identify the right path forward.

Primary CTA:

Email Koinonia

Secondary CTA:

View Services

## Core Messages

- Contact should feel calm, direct, and low-pressure.
- The visitor should know exactly how to reach Koinonia.
- Email, phone, and text are all production-ready contact options.
- The first contact is not a commitment.
- The first response should help clarify fit and next steps.
- Contact should function as the final conversion step after Home, Services, or About.

## Implementation Rules

- Keep contact values centralized in `apps/web/config/contact.config.ts`.
- Do not hard-code email, phone, or SMS values directly inside page assemblies.
- Do not reintroduce placeholder phone or SMS labels unless the production values change.
- Keep Contact concise and conversion-focused.
- Use the approved Koinonia hero image system.
- Use the full-bleed hero style for consistency with Home, Services, and About.
- Verify mobile tap targets before launch.

## Launch QA Items

- Verify phone link opens a call prompt on mobile.
- Verify SMS link opens a text prompt on mobile.
- Verify email link opens the correct address and subject.
- Verify mobile spacing and tap targets.
- Verify metadata and SEO title.
