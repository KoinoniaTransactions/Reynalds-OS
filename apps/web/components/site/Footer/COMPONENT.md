# COMP-FOOTER-001 — Koinonia Footer

Owner: Website System  
Status: Canonical v2.0  
Source: `apps/web/components/site/Footer/Footer.tsx`

## Purpose

Provides the shared public Koinonia website footer, closing navigation, contact actions, and faith/value statement.

## Used By

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

## Content Sources

Uses:

- `apps/web/content/shared.ts`
- `apps/web/config/contact.config.ts`

## Current Footer Structure

- Koinonia brand mark, name, and tagline
- Short company description
- Footer navigation
- Email, call, and text actions
- Schedule a Consultation CTA
- Verse/value line
- Copyright/legal line

## Design Notes

The footer should match the approved Koinonia visual system:

- Light, clean, premium
- Black/gold brand cues
- Calm spacing
- Mobile-friendly stacked layout
- Clear contact actions

## Governance

This component is canonical. Reuse or extend it before creating a new component.

Footer/navigation edits should be made here rather than separately inside individual page assemblies.
