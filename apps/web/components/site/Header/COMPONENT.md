# COMP-HEADER-001 — Koinonia Header

Source: `apps/web/components/site/Header/Header.tsx`

## Purpose

Provides the shared public Koinonia website header and primary navigation.

## Usage

Used at the top of all public Koinonia page assemblies:

- Home
- Services
- About
- Contact

## Content Sources

Uses `apps/web/content/brand.ts` for:

- Company name
- Company tagline
- Navigation links
- Primary CTA label

## Current Navigation

- Home
- Services
- About
- Contact
- Schedule a Consultation CTA

## Design Notes

The header should remain light, clean, premium, and consistent with the approved Koinonia hero system.

The first version intentionally avoids JavaScript and mobile drawer behavior. Mobile layout uses responsive wrapping so the site remains stable and accessible before adding more interactive navigation.
