# Koinonia Image System

## Status

Canonical v1.1

---

# Purpose

The Koinonia Image System defines the standards for creating, organizing, implementing, and maintaining imagery throughout the Koinonia website.

Images are not decorative elements.

They exist to reinforce trust, professionalism, organization, and consistency while allowing HTML to communicate the marketing message.

This document is the canonical source for all future Koinonia imagery.

---

# Governing Principles

This document works together with:

- Koinonia Brand Core
- Website Production Framework
- Reynalds OS Decision Log
- Reynalds OS Canonical Registry

If conflicts exist, the Decision Log takes precedence.

---

# Core Philosophy

Visitors should immediately feel:

- organized
- calm
- premium
- trustworthy
- intentional
- professional

before reading a single headline.

Images support that feeling.

HTML communicates the message.

---

# HTML Owns Communication

Marketing copy should never be baked into hero imagery.

Do not place:

- headlines
- subheadings
- body copy
- CTA buttons
- marketing statements

inside production images.

Instead:

Images create atmosphere.

HTML delivers communication.

This keeps messaging:

- editable
- accessible
- SEO friendly
- reusable

---

# One Office Philosophy

The Koinonia website represents one business.

Therefore the imagery should feel like it belongs to one consistent office.

Different pages may represent different work.

They should not represent different companies.

Consistency includes:

- lighting
- furniture
- materials
- color palette
- overall atmosphere

The goal is that visitors subconsciously recognize they are still inside the same Koinonia office as they move from page to page.

---

# Desktop Hero Composition Standard

Every desktop hero follows the same composition.

This is an architectural requirement, not a design preference.

## Left 40–45%

Reserved exclusively for HTML.

Characteristics:

- cream wall
- soft architectural background
- window light
- negative space
- no meaningful objects
- no competing focal points
- no baked-in text

This area exists specifically for:

- page headline
- supporting copy
- CTA buttons

The photograph is composed around the HTML.

---

## Right 55–60%

The storytelling environment.

Contains:

- the Koinonia workspace
- page-specific objects
- subtle Koinonia branding
- natural object text where appropriate

The right side tells the story.

The left side communicates through HTML.

---

# Mobile Hero Standard

Mobile heroes are independent compositions.

Never crop desktop heroes.

Instead:

- compose specifically for portrait viewing
- preserve the same office
- preserve the same page story
- simplify the composition for smaller screens

Because HTML appears beneath the image, no large negative space is required.

---

# Permanent Office Anchors

These elements should remain visually consistent throughout the website whenever practical.

- Excellence & Integrity artwork
- same office
- same desk
- same window
- same bookshelf
- same lamp
- same plant
- same lighting
- same overall color palette

The visitor should feel that every page was photographed in the same office during the same professional photo session.

---

# Laptop Screen Rule

Laptop screens reinforce professionalism.

They are not miniature webpages.

Avoid:

- paragraphs
- dashboards
- tiny unreadable interfaces
- dense information

Preferred content:

- subtle Koinonia branding
- elegant minimal interface
- restrained visual detail

The laptop supports the scene.

It never competes with the HTML.

---

# Object Storytelling

Objects communicate page context.

## Home

Purpose:

Operational excellence.

Typical objects:

- laptop
- notebook
- coffee
- planner
- plant

---

## Services

Purpose:

Active transaction work.

Typical objects:

- purchase agreement
- transaction file
- checklist
- folder
- amendments
- pen

---

## About

Purpose:

Mission, values, and intentional leadership.

Typical objects:

- journal
- mission notebook
- business reading
- coffee
- thoughtful workspace

---

## Contact

Purpose:

Prepared and responsive communication.

Typical objects:

- client file
- calendar
- communication notes
- follow-up list
- notebook

---

## Pricing

Purpose:

Organization and planning.

Typical objects:

- proposal
- pricing guide
- calculator
- organized folders

---

# Asset Organization

Production assets:

`apps/web/public/assets/images/koinonia/`

Source assets:

`apps/web/public/assets/images/koinonia/source/`

Desktop and mobile assets are preserved independently.

---

# Naming Convention

Production

- page-hero-desktop.png
- page-hero-mobile.png

Source

- page-hero-desktop-source.png
- page-hero-mobile-source.png

---

# Production Workflow

1. Design concept.
2. Review.
3. Approve.
4. Generate desktop composition.
5. Generate mobile composition.
6. Save source assets.
7. Copy production assets.
8. Implement in React.
9. Verify localhost.
10. Run production build.
11. Commit.
12. Update the Brain only if a meaningful architectural discovery occurred.

---

# Hero Validation Workflow

Before generating any hero:

1. Restate what is understood.
2. Identify the governing standards.
3. Explain any recommended improvement.
4. Explain exactly what will be generated.
5. Wait for approval.
6. Generate.
7. Compare the result against this document before proceeding.

---

# Hero Validation Checklist

## Desktop

✓ Left HTML composition zone maintained.

✓ Right storytelling workspace maintained.

✓ Same office.

✓ Same lighting.

✓ Same permanent anchor elements.

✓ Page-specific objects only.

✓ Objects appear naturally used.

✓ No marketing copy inside the image.

---

## Mobile

✓ Independent composition.

✓ Same office.

✓ Same visual language.

✓ Same story.

✓ Designed for HTML below the image.

---

# Future AI Rule

Before creating any new Koinonia imagery:

1. Read this document.
2. Review previously approved heroes.
3. Confirm the page specification.
4. Confirm the Brand Core.
5. Extend the existing visual language.

Never reinvent an approved visual system.

Evolve it.