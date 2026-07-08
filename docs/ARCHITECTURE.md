# Reynalds OS Architecture

## Status

Current for Reynalds OS v11.3.1.

## Core Principle

The repository is the source of truth. Conversation history may contain plans, but work is only complete when it exists in repository files.

## Architecture Layers

1. Governance Layer — START_HERE.md and BRAIN/
2. Platform Layer — packages/* and apps/web/lib
3. Application Layer — apps/web/app and apps/web/components
4. Workspace Layer — Koinonia ERP as the first production workspace
5. Content Layer — apps/web/content

## Canonical Sources

- Brain and governance: BRAIN/
- Application: apps/web/
- Shared packages: packages/
- Design system: packages/design-system/
- Database schema: packages/database/prisma/schema.prisma
- Koinonia content: apps/web/content/

## Current Koinonia Website Routes

- /koinonia
- /koinonia/services
- /koinonia/about
- /koinonia/contact

## Content Architecture

Reusable Koinonia website copy should live in apps/web/content.

Currently centralized:

- Home
- Services
- About
- Contact
- CTA
- Footer
- Trust Pillars
- Contact Actions
- FAQ
- Brand constants
- Hero default CTA values

## Design System

The canonical design system is packages/design-system.

Do not create a second theme system unless explicitly approved.

## Development Workflow

Use this workflow for meaningful changes:

1. Inspect existing files.
2. Identify the canonical source.
3. Explain the proposed change.
4. Wait for approval when direction or architecture may change.
5. Implement the smallest working slice.
6. Run validation.
7. Commit focused changes.
8. Update Brain documentation when architecture, workflow, or continuity changes.

## Known Issues

- START_HERE.md references BRAIN/ARCHITECTURE_PRINCIPLES.md, but that file does not currently exist.
- Root package.json may not match the Brain version 11.3.1.
- Some older docs are historical and should not override current Brain documentation.

## Future AI Rule

Do not reinvent systems that already exist. Search BRAIN, docs, 03_Knowledge, 01_Platform, apps/web, and packages before creating new architecture.
