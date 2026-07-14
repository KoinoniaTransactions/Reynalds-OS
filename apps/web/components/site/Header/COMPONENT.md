# COMP-HEADER-001 — Koinonia Site Header

Status: Active production implementation
Owner: Koinonia Website System
Version: 1.1

## Purpose

Provide the global public website header for Koinonia.

The header should feel modern, calm, premium, and app-ready while keeping navigation simple for Realtors.

## Current Behavior

- Shows Koinonia brand mark, name, and tagline
- Provides navigation to Home, Services, About, and Contact
- Provides a primary consultation CTA
- Uses a modern mobile navigation panel instead of a basic dropdown
- Keeps large mobile tap targets for easier use
- Uses a soft translucent header treatment that works with the light Koinonia hero system

## Used By

- Home
- Services
- About
- Contact

## Design Direction

The header should support both the public website and the future client portal visual language.

Avoid:

- Generic dropdown menu behavior
- Heavy/dark navigation
- Overly flashy animation
- Rebuilding the brand mark unless intentionally approved

## Accessibility Notes

- Mobile menu button uses aria-expanded
- Mobile menu is controlled by aria-controls
- Scrim button closes the menu
- Navigation remains keyboard accessible
