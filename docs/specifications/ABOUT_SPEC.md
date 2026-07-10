# About Page Specification

Route: `/koinonia/about`  
Status: Active production implementation  
Owner: Website System

## Purpose

Answer: "Can I trust Koinonia?"

The About page should build confidence in Koinonia as a trustworthy real estate operations partner. It should explain the meaning behind the name, why the business exists, Jeremiah's licensed real estate perspective, and the service values that guide the work.

## Page Journey

1. Hero — Establish trust and invite the visitor to continue.
2. Meaning Behind the Name — Explain Koinonia as partnership, shared purpose, and service.
3. Why Realtors Can Trust Koinonia — Build About-specific credibility without repeating the Home trust section.
4. Meet Jeremiah — Explain the licensed Colorado Realtor perspective.
5. How Koinonia Serves — Reinforce communication, organization, and follow-through.
6. CTA — Make the next step easy.
7. Footer — Provide standard navigation and brand close.

## Core Messages

- Koinonia reflects partnership, service, and shared purpose.
- Jeremiah is a licensed Colorado Realtor since 2020.
- Koinonia is a real estate operations partner, not merely a paperwork company.
- The business is built around organization, communication, reliability, and service.
- Support should feel calm, clear, professional, and dependable.

## Approved Hero

Eyebrow:
About Koinonia

Headline:
Built on trust, service, and organized support.

Primary CTA:
Schedule a Consultation

Secondary CTA:
View Services

## Implementation Rules

- Do not repeat the shared Home `TrustPillars` section on About.
- Do not turn About into a long personal biography.
- Do not add service pricing detail to About.
- Keep About trust-building, professional, and concise.
- Keep copy centralized in `apps/web/content/about.ts`.
- Keep page assembly in `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`.
- Use the approved Koinonia hero image system.
- Use canonical shared components where appropriate.

## Components Used

- `Hero`
- `UniversalCard`
- `CTA`
- `Footer`
