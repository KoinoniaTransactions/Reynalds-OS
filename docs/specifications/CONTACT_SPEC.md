# Contact Page Specification

Route: `/koinonia/contact`  
Status: Assembled  
Owner: Website System

## Purpose

Answer: "How do I get started?"

The Contact page should make the next step clear, calm, and low-pressure. It should not oversell. The visitor has already moved through Home, Services, and/or About; Contact exists to remove friction.

## Current Implementation

Source: `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`

Route file: `apps/web/app/koinonia/contact/page.tsx`

## Components Used

- `COMP-HERO-001` Primary Public Website Hero
- `MOD-004` Universal Content Card
- `COMP-FAQ-001` FAQ Objection Resolution
- `COMP-CTA-001` Final Call to Action
- `COMP-FOOTER-001` Koinonia Footer

## Contact Details

Active verified repository contact:

- Email: `hello@koinoniatransactions.com`

Not found in repository and therefore not invented:

- Final phone link
- Final SMS link

These remain launch QA items.

## Page Sections

1. Contact Hero
2. How to Reach Out
3. What Happens Next
4. Contact FAQ
5. Final CTA
6. Footer

## Launch QA Items

- Confirm final phone and SMS links.
- Decide whether to connect a production contact form or keep email-driven intake at launch.
- Verify mobile spacing and tap targets.
- Verify metadata and SEO title.


## v11.2.1 Contact Configuration Update

Canonical contact source: `apps/web/config/contact.config.ts`

Reusable contact component: `apps/web/components/site/ContactActions/ContactActions.tsx`

Current verified email: `hello@koinoniatransactions.com`

Phone and SMS are intentionally placeholders until production values are supplied.
