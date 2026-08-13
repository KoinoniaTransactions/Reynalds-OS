# Version History

## Purpose

This document records major architectural and engineering milestones for Reynalds OS.

Unlike release notes, this file describes the evolution and stabilization of the repository itself.

---

# v11.3.1 — Recovery, Foundation, and Continuity Stabilization

**Status:** Active working baseline

## Foundation Established

- Established `BRAIN/` as the canonical engineering knowledge base.
- Established repository-first execution and continuity rules.
- Established the shared Object Engine and core application modules.
- Established shared Next.js, TypeScript, Prisma, PostgreSQL, pnpm workspace architecture.
- Established Koinonia as the first production workspace/public-site focus.

## Koinonia Production Milestones

- Component-first public website architecture established.
- Shared Koinonia content architecture established.
- Home, Services, About, and Contact production pages completed and refined.
- Shared header/footer/hero systems established.
- SEO metadata, social preview metadata, sitemap, robots, and manifest added.
- Consultation scheduler and Resend email delivery established.
- Koinonia public website launch verified on the production domain in 2026-07.

## Reynalds Brothers Milestones

- Reynalds Brothers established as a separate first-class company domain.
- Work Item established as the primary operating object.
- Communication object activated for operational evidence.
- Dedicated `/reynalds-brothers` workspace established.
- WalMart Tanks Gmail parser/intake/review/backfill workflow established.
- Gmail archive evidence preserved under the company communications folder.
- 2026-08 recovery audit completed against the preserved RB recovery branch.
- Unsafe wholesale recovery replay rejected.
- Dedicated workspace closure reconciled and merged through PR #14.
- Current RB target checkpoint after closure: `e84b4e610e6075f6f54907f277714a94b24dd7e6`.

## CI Stabilization — 2026-08

PR #15 repaired repository CI by:

- removing duplicate pnpm version setup,
- making web Vitest non-interactive,
- allowing intentionally testless packages to pass cleanly,
- explicitly generating Prisma Client before tests/build.

Validation:

- local Prisma generation passed,
- full repository tests passed,
- full repository production build passed,
- GitHub Actions run #41 passed,
- GitHub Actions run #42 passed after RB closure was tested against the repaired target.

## Unresolved / Preserved Recovery Item

Seed parity for Reynalds Brothers remains intentionally unresolved.

Preserve:

`recovery/reynalds-brothers-main-workspace-20260731`

Recovery checkpoint:

`b8f48e1892ff11d7e4179fa3a5daa755e5571a4b`

The recovery branch contains richer historical seed evidence. It is not the canonical current seed and must not be deleted until seed parity is intentionally reviewed and closed.

## Current Objective

With the RB recovery/closure and CI stabilization complete, active production attention returns to the Koinonia Transactions website.

Do not create a new OS version solely for documentation synchronization. Future version changes should correspond to meaningful product or architectural release milestones.

---

# Future Releases

Future version numbers should be assigned only when meaningful implementation/release work justifies them.

Potential future platform work may include Brain orchestration, object relationship improvements, search, workflow intelligence, and additional company workspaces, but such work remains secondary to approved production priorities.

---

# Long-Term Vision

Reynalds OS will evolve as a shared operating platform capable of supporting multiple businesses and workflows through a common technical foundation while preserving strict semantic boundaries between company domains.
