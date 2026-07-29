# Development Log

This file is the chronological engineering journal for Reynalds OS.

Each development session should add a new entry with:

- Date
- Objective
- Changes completed
- Build status
- Commits created
- Known issues
- Recommended next step

---

# 2026-07-08 — Next.js Stabilization and Koinonia Content Architecture

## Objective

Stabilize the local Next.js development environment and continue converting the Koinonia marketing site to a content-driven architecture.

## Completed

- Upgraded Next.js from 15.5.4 to 15.5.20.
- Regenerated Prisma Client.
- Resolved recurring missing Next.js build artifacts.
- Verified production build from `apps/web`.
- Removed temporary Prisma workaround before committing.
- Centralized Koinonia shared content for:
  - CTA
  - Footer
  - Trust Pillars
  - Contact Actions
- Updated Brain handoff, project state, and current priorities.

## Build Status

Passing.

Verified from:

`apps/web`

using:

`pnpm build`

## Commits

- `0fa65b3` — move Koinonia CTA copy to shared content
- `13c3672` — move Koinonia footer copy to shared content
- `61eb7ff` — move Trust Pillars copy to shared content
- `760bd94` — move Contact Actions copy to shared content
- `6f0699b` — Update Brain after Next.js stabilization and Koinonia content architecture progress

## Known Issues

- Full root workspace build may require Prisma Client generation before running.
- Use `apps/web` for web production build verification unless intentionally testing the full workspace.

## Recommended Next Step

Migrate FAQ content into the shared content architecture.


---

# 2026-07-08 — Repository Recovery and Architecture Documentation Update

## Objective

Improve future AI continuity by updating existing architecture documentation instead of creating duplicate docs.

## Completed

- Confirmed existing architecture documentation already exists.
- Updated docs/ARCHITECTURE.md for current v11.3.1 structure.
- Confirmed canonical design system is packages/design-system.
- Confirmed Koinonia content architecture is apps/web/content.
- Preserved the rule: recover before reinventing.

## Known Issues

- START_HERE.md references missing BRAIN/ARCHITECTURE_PRINCIPLES.md.
- Root package.json may not match Brain version 11.3.1.
- Some older docs are historical and should not override current Brain documentation.

## Build Status

No build required. Documentation-only update.

## Recommended Next Step

Commit documentation update, then continue Koinonia website content architecture work.

---

# 2026-07-08 — Next.js Hybrid Routing Stability Fix

## Objective

Restore stable localhost rendering and production build behavior for the Koinonia website.

## Issue

Koinonia routes were loading blank in localhost because Next.js development assets were returning 404.

Observed symptoms included:

- Blank localhost pages.
- Missing `_next/static` development chunks.
- Missing `.next/server/pages-manifest.json`.
- Missing `.next/server/pages/_document.js`.
- Build failures after otherwise successful compilation.

## Cause

The app uses a hybrid Next.js structure:

- App Router: `apps/web/app`
- Pages Router fallback files: `apps/web/pages`

Because `apps/web/pages/_app.tsx` and `apps/web/pages/404.tsx` exist, Next.js expects a Pages Router document file.

## Fix

Added:

- `apps/web/pages/_document.tsx`

This restored stable Pages Router fallback generation while preserving App Router Koinonia routes.

## Build Status

Production build passes after adding `_document.tsx`.

## Important Future Note

Do not remove `apps/web/pages/_app.tsx`, `apps/web/pages/404.tsx`, or `apps/web/pages/_document.tsx` without intentionally migrating the project to App Router only and verifying all build/runtime behavior.

## 2026-07-09 — Koinonia Home Page Completion Checkpoint

### Summary

The Koinonia Home page has been visually polished, build-validated, committed, and pushed to GitHub.

### Confirmed Commits

- `e124ca6` — Align Koinonia home page content
- `85c907d` — Polish Koinonia home page presentation

### Confirmed Home Page State

- Hero headline: `Real Estate Operations. Elevated.`
- Hero layout: left-aligned copy with right-side visual image.
- Home body section headers are centered as a full group:
  - eyebrow
  - title
  - supporting lead text
- Visible process section label remains: `The Koinonia Experience`
- Internal production documentation now refers to the same section as `Koinonia Experience`.
- CTA primary button styling was corrected so `Schedule a Consultation` reads as the primary action.
- Footer remains unchanged.

### Build Verification

The web app build passed after running:

- `pnpm --filter @reynalds-os/database db:generate`
- `cd apps/web`
- `rm -rf .next`
- `pnpm build`

### Current Working Rule

Do not rework the Home page unless a launch-blocking issue is found.

The next production priority is the Koinonia Services page.

## 2026-07-09 — Koinonia Services Page Pass 1 Checkpoint

### Summary

The Koinonia Services page was differentiated from the Home page, build-validated, visually reviewed, committed, and pushed to GitHub.

### Confirmed Commit

- `058c0a5` — Differentiate Koinonia services page from home

### Confirmed Services Page Changes

- Removed the repeated Home `TrustPillars` section from the Services page.
- Added a second Services hero CTA:
  - `Schedule a Consultation`
  - `View Support Levels`
- Updated the Services hero to use the full-bleed hero variant for better consistency with Home.
- Expanded the four service category cards so Services provides more detail than the Home preview cards.
- Added a new `Where Support Helps` section.
- Reworked `How It Works` so the process applies to transactions, contracts, showing coverage, and business operations.
- Kept `Support Levels` as support-fit guidance rather than a pricing table.
- Centralized Services page section copy in `apps/web/content/services.ts`.
- Updated `03_Knowledge/Website/services_pricing_production_spec.md` to match implementation.

### Build Verification

The web app build passed after running:

- `pnpm --filter @reynalds-os/database db:generate`
- `cd apps/web`
- `rm -rf .next`
- `pnpm build`

### Recovery Note

An accidental commit, `f9e1435`, briefly staged a large repository delete. It was recovered correctly.

The active branch was reset and force-updated with `--force-with-lease` so the active Services commit is now the correct 3-file commit:

- `058c0a5` — Differentiate Koinonia services page from home

Do not restore or reuse `f9e1435`.

### Current Working Rule

Do not make Services a duplicate of Home.

Services should explain practical support fit, service detail, process, and support levels.

## 2026-07-09 — Koinonia About Page Pass 1 Checkpoint

### Summary

The Koinonia About page completed Pass 1 and was committed and pushed to GitHub.

### Confirmed Commit

- `3129da4` — Complete Koinonia about page pass one

### Confirmed About Page Changes

- Added hero CTAs:
  - `Schedule a Consultation`
  - `View Services`
- Updated About hero to use the full-bleed hero variant for consistency with Home and Services.
- Removed the repeated shared Home `TrustPillars` section from About.
- Added About-specific trust content focused on why Realtors can trust Koinonia.
- Strengthened the Jeremiah founder section while keeping it professional and concise.
- Added a service foundation section focused on:
  - Clear Communication
  - Organized Support
  - Dependable Follow-Through
- Updated `docs/specifications/ABOUT_SPEC.md` to match the production direction.

### Recovery Note

During the About pass, the staged-delete issue appeared again. It was corrected before commit by running `git reset`.

The final About commit was clean and changed only these files:

- `apps/web/content/about.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`
- `docs/specifications/ABOUT_SPEC.md`

### Current Working Rule

Do not turn About into a long personal biography.

About should answer: `Can I trust Koinonia?`

## 2026-07-09 — Koinonia Contact Page Pass 1 Checkpoint

### Summary

The Koinonia Contact page completed Pass 1 and was committed and pushed to GitHub.

### Confirmed Commit

- `89238e9` — Complete Koinonia contact page pass one

### Confirmed Contact Page Changes

- Replaced placeholder contact values with production contact values.
- Updated canonical contact configuration:
  - Email: `jeremiah@koinoniaadmin.com`
  - Phone: `(719) 745-8497`
  - Text: `(719) 745-8497`
- Removed launch placeholder behavior for phone and SMS.
- Updated Contact hero to use the full-bleed hero variant for consistency with Home, Services, and About.
- Updated Contact copy to focus on a clear, low-pressure first step.
- Strengthened the intake flow:
  - You share the need
  - Koinonia clarifies the fit
  - You get a clear next step
- Updated ContactActions documentation to active production implementation.
- Updated `docs/specifications/CONTACT_SPEC.md` to active production implementation.

### Build Verification

Production build passed before commit.

### Final Contact Pass 1 Files Changed

- `apps/web/config/contact.config.ts`
- `apps/web/content/contact.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
- `apps/web/components/site/ContactActions/COMPONENT.md`
- `docs/specifications/CONTACT_SPEC.md`

### Current Working Rule

Contact should answer: `How do I get started?`

Contact should feel calm, direct, low-pressure, and conversion-focused.

---

## 2026-07-10 — Koinonia Production Hero Image System Finalized

Commit: a12e03c  
Branch: feature/app-shell-foundation  
Commit Message: Refresh Koinonia production hero imagery

The approved Koinonia production hero image system has been finalized, committed, pushed to GitHub, and verified locally.

### Pages Updated

- Home desktop hero
- Home mobile hero
- Services desktop hero
- Services mobile hero
- About desktop hero
- About mobile hero
- Contact desktop hero
- Contact mobile hero
- Shared hero/mobile CSS refinement

### Approved Hero Direction

The final approved hero imagery direction is:

- Light, airy, clean, calm, and premium
- Cream/white office environment with soft natural lighting
- Black/gold Koinonia brand cues
- Consistent Koinonia office setup across all pages
- Page-specific desk props and visual story
- Desktop and mobile versions of each page must match the same page story
- No baked-in marketing headlines or sales copy inside the images
- Page text must remain HTML/content-driven, not embedded inside artwork

### Approved Shared Visual System

Each page hero should feel like the same Koinonia workspace, using a consistent setup:

- Cream/beige wall
- Window with soft curtains
- Gold-framed integrity poster
- Koinonia laptop
- Black Koinonia mug
- Gold desk lamp
- Potted plant
- Books
- Gold desk object
- Organized paperwork/notebooks relevant to the page

### Page-Specific Hero Notes

Home:
- Relationship-focused operations story
- Desk materials include planning, partnership, relationship, and next-step cues

Services:
- Service-support story
- Desk materials communicate transaction management, contract preparation, showing coverage, and business support

About:
- Trust and purpose story
- Desk materials communicate mission, values, purpose, integrity, and stewardship

Contact:
- Consultation and next-step story
- Desk materials include consultation notes, next steps, and phone/contact cues

### Important Future Rule

Do not replace or regenerate the approved production hero system unless the user explicitly requests a new hero system. Future improvements should preserve this visual direction and page-specific story structure.


---

## 2026-07-10 — Koinonia Site Header Added

The Koinonia public website header has been added and verified across the Home, Services, About, and Contact pages.

### Header Scope

- Added shared Header component
- Exported Header through the site component index
- Added Header to all public Koinonia page assemblies
- Added desktop navigation
- Added mobile hamburger menu
- Added Header component documentation
- Added shared header styling in the design system

### Approved Header Behavior

Desktop:
- Koinonia brand mark and name
- Main navigation links
- Schedule a Consultation CTA

Mobile:
- Koinonia brand mark and name
- Hamburger menu button
- Expandable/collapsible navigation menu
- Menu includes Home, Services, About, Contact, and Schedule a Consultation

### Important Future Rule

The Koinonia header is now a shared sitewide component. Future navigation changes should be made in the shared Header component, not separately page by page.


---

## 2026-07-10 — Koinonia Site Footer Upgraded

The existing canonical Koinonia Footer component was upgraded and verified across the Home, Services, About, and Contact pages.

### Footer Scope

- Upgraded the shared Footer component
- Updated Footer component documentation
- Expanded shared footer content
- Added footer styling in the design system
- Preserved the shared footer pattern already used by all Koinonia pages

### Approved Footer Structure

The approved footer includes:

- Koinonia brand mark, name, and tagline
- Short company description
- Footer navigation
- Email, call, and text actions
- Schedule a Consultation CTA
- Faith/value line
- Copyright/legal line

### Approved Footer Direction

The footer should match the approved Koinonia visual system:

- Clean, premium, and intentional
- Black/gold brand cues
- Clear contact actions
- Mobile-friendly stacked layout
- Faith/value identity without overwhelming the page

### Important Future Rule

The Koinonia footer is a shared sitewide component. Future footer changes should be made in the shared Footer component and shared content files, not separately page by page.


---

## 2026-07-10 — Koinonia Favicon and Metadata Added

Commit: 8eb196a  
Branch: feature/app-shell-foundation  
Commit Message: Add Koinonia favicon and metadata

The Koinonia public site now has branded favicon/icon support and updated metadata.

### Scope

- Added Koinonia `icon.svg`
- Added Koinonia `apple-icon.svg`
- Added public Apple icon fallback
- Updated root metadata title and description

### Approved Direction

The favicon uses the Koinonia brand mark direction:

- Black base
- Gold K
- Simple premium mark
- Consistent with the header/footer Koinonia mark

### Metadata

The public-facing metadata now uses:

- Title: Koinonia
- Description: Real estate operations support for Realtors.

### Important Future Rule

Do not revert the public site metadata back to generic Reynalds OS wording for the Koinonia public website experience.


---

## 2026-07-10 — Koinonia Home Page Body Polished

Commit: d4d1d6a  
Branch: feature/app-shell-foundation  
Commit Message: Polish Koinonia home page body

The Koinonia Home page body has been refined below the approved hero system.

### Scope

- Updated Home page body structure
- Added a clearer positioning section
- Added a more intentional services overview section
- Added a focused “Who It Helps” section
- Updated the process section wording
- Removed TrustPillars from the Home page to reduce repetition
- Added Home-specific body styling in the shared design system

### Approved Home Page Flow

The approved Home page flow is now:

- Header
- Hero
- Behind-the-Scenes Support
- Services Built Around Realtor Operations
- Who It Helps
- How It Works
- CTA
- Footer

### Important Future Rule

The Home page should stay clear, direct, and premium. Avoid adding repetitive credibility sections or over-explaining the service. Trust-focused content can be used more intentionally on the About page or other supporting pages.


---

## 2026-07-10 — Koinonia Services Page Body Polished

Commit: 2b154ba  
Branch: feature/app-shell-foundation  
Commit Message: Polish Koinonia services page body

The Koinonia Services page body has been refined below the approved hero system.

### Scope

- Updated Services page body structure
- Clarified section labels
- Center-aligned key section headers
- Added a process lead paragraph
- Added Services-specific body styling in the shared design system
- Preserved the existing Services page structure without overbuilding

### Approved Services Page Flow

The approved Services page flow is now:

- Header
- Hero
- Core Services
- When To Use Koinonia
- How It Works
- Support Levels
- FAQ
- CTA
- Footer

### Expert Review

The Services page is intentionally longer than the Home page because it is the main detail/conversion page. The sections are not considered repetitive because each serves a distinct purpose:

- Core Services explains what Koinonia offers
- When To Use Koinonia explains real-world support situations
- How It Works explains process
- Support Levels helps visitors understand the buying/support structure
- FAQ handles objections and clarification

### Important Future Rule

Do not shorten the Services page simply because it is longer than Home. Services should remain the page where visitors can understand the full scope of support before contacting Koinonia.


---

## 2026-07-10 — Koinonia About Page Body Polished

Commit: 65762fb  
Branch: feature/app-shell-foundation  
Commit Message: Polish Koinonia about page body

The Koinonia About page body has been refined below the approved hero system.

### Scope

- Updated About page body structure
- Center-aligned key section headers
- Added About-specific section classes
- Added About-specific body styling in the shared design system
- Added a lead paragraph to the “How Koinonia Serves” section
- Preserved the approved trust-focused About page journey

### Approved About Page Flow

The approved About page flow is now:

- Header
- Hero
- The Meaning Behind the Name
- Why Realtors Can Trust Koinonia
- Meet Jeremiah
- How Koinonia Serves
- CTA
- Footer

### Expert Review

The About page is not considered too biography-heavy. Only one body section directly focuses on Jeremiah, and that section remains business-relevant by explaining licensed Colorado Realtor experience, operational mindset, and service foundation.

### Important Future Rule

Do not turn the About page into a long personal biography. The page should continue to answer the visitor’s trust question: “Can I trust Koinonia to support my business and clients?”


---

## 2026-07-10 — Koinonia Contact Page Body Polished

Commit: 5a796a2  
Branch: feature/app-shell-foundation  
Commit Message: Polish Koinonia contact page body

The Koinonia Contact page body has been refined below the approved hero system.

### Scope

- Updated Contact page body structure
- Added Contact-specific section classes
- Center-aligned key section headers
- Added numbered next-step cards
- Added a helpful-details section for first outreach
- Improved response time / availability presentation
- Added Contact-specific body styling in the shared design system
- Preserved centralized contact values in `contact.config.ts`

### Approved Contact Page Flow

The approved Contact page flow is now:

- Header
- Hero
- How to Reach Out
- Contact actions
- Response Time / Availability
- Helpful details to include
- What Happens Next
- Contact FAQ
- CTA
- Footer

### Expert Review

The Contact page is clear, low-pressure, and not too busy. Each section answers a distinct visitor question:

- How to Reach Out explains what to do first
- Contact actions provide email, call, and text options
- Response Time / Availability sets expectations
- Helpful details helps the visitor send a useful first message
- What Happens Next explains the intake process
- FAQ removes hesitation before reaching out

### Important Future Rule

Keep the Contact page concise and conversion-focused. Contact values should remain centralized in `apps/web/config/contact.config.ts`; do not hard-code email, phone, or SMS values directly inside page assemblies.


---

## 2026-07-10 — Koinonia Full-Site QA Pass Completed

Commit: 754330e  
Branch: feature/app-shell-foundation  
Commit Message: Fix CSS alignment warnings

A full-site QA pass was completed after the four-page Koinonia public website production pass.

### QA Scope

Verified:

- Home page
- Services page
- About page
- Contact page
- Header
- Mobile hamburger menu
- Footer
- Hero image references
- Favicon/icon routes
- Contact links
- Build status
- Git status

### QA Results

- Visual inspection passed on desktop
- Visual inspection passed on mobile
- `/koinonia` returned 200
- `/koinonia/services` returned 200
- `/koinonia/about` returned 200
- `/koinonia/contact` returned 200
- `/icon.svg` returned 200
- `/apple-icon.svg` returned 200
- No temporary hero image references found
- All page assemblies point to final production hero image paths
- Production build completed successfully
- CSS alignment warnings were resolved
- Working tree clean after commit and push

### Important Future Rule

Before adding new features or expanding the site, preserve the completed production foundation and avoid redesigning already-approved systems unless the user explicitly requests it.


---

## 2026-07-10 — Koinonia Full-Site QA Pass Completed

Commit: 754330e  
Branch: feature/app-shell-foundation  
Commit Message: Fix CSS alignment warnings

A full-site QA pass was completed after the four-page Koinonia public website production pass.

### QA Scope

Verified:

- Home page
- Services page
- About page
- Contact page
- Header
- Mobile hamburger menu
- Footer
- Hero image references
- Favicon/icon routes
- Contact links
- Build status
- Git status

### QA Results

- Visual inspection passed on desktop
- Visual inspection passed on mobile
- `/koinonia` returned 200
- `/koinonia/services` returned 200
- `/koinonia/about` returned 200
- `/koinonia/contact` returned 200
- `/icon.svg` returned 200
- `/apple-icon.svg` returned 200
- No temporary hero image references found
- All page assemblies point to final production hero image paths
- Production build completed successfully
- CSS alignment warnings were resolved
- Working tree clean after commit and push

### Important Future Rule

Before adding new features or expanding the site, preserve the completed production foundation and avoid redesigning already-approved systems unless the user explicitly requests it.


---

## 2026-07-11 — Koinonia Services Offer Structure Implemented

Commit: 5860f07  
Branch: feature/app-shell-foundation  
Commit Message: Update Koinonia services offer structure

The Koinonia Services page was updated to reflect the approved Services & Pricing Blueprint.

### Implemented Offer Structure

The Services page now presents four clear service paths:

- Transaction Support
- Contract & Document Support
- Licensed Showing Coverage
- Monthly Operations Partnership

### Monthly Services

Monthly Operations Partnership is now treated as a major offer instead of a minor business-support mention.

Monthly tiers added:

- Starter — $299/month
- Growth — $599/month
- Partner — $999/month

### Pricing Snapshot

A light pricing snapshot was added to help Realtors quickly understand starting points:

- Transaction Support — starting at $389
- Contract & Document Support — starting at $75
- Licensed Showing Coverage — starting at $50
- Monthly Operations Partnership — starting at $299/month

### Professional Boundaries

A Professional Scope section was added to clarify what Koinonia supports and what remains with the Realtor and brokerage.

### Design Fix

Pricing labels were converted into proper price badges so the gold background wraps cleanly around monthly and starting-price values.

### Build Status

Production build passed after the Services page update.

### Future Rule

Future Services page edits should preserve the four-path offer structure unless the business model changes. Monthly Operations Partnership should remain a visible major offer.


---

## 2026-07-11 — Koinonia Contact Intake Aligned With Services

Commit: 17522d6  
Branch: feature/app-shell-foundation  
Commit Message: Align Koinonia contact intake with services

The Koinonia Contact page was updated to align with the approved Services & Pricing Blueprint and the implemented Services page offer structure.

### Purpose

The Contact page now gives Realtors a clearer way to reach out based on the approved support paths instead of using generic business-support language.

### Intake Alignment

The Contact page now supports inquiries for:

- Transaction Support
- Contract & Document Support
- Licensed Showing Coverage
- Monthly Operations Partnership

### Contact Page Improvements

Updated Contact page language to reference monthly support more clearly and help visitors understand what kind of information to include when reaching out.

A Support Intake section was added so Realtors can identify the type of support they are asking about without needing to understand the full service model before contacting Koinonia.

### Build Status

Production build passed before commit.

### Future Rule

Future Contact page edits should preserve the clear intake path for Monthly Operations Partnership. Monthly support should remain visible as a major offer, not hidden under generic business workflow language.


---

## 2026-07-13 — Koinonia Home Services Aligned With Monthly Support

Commit: 6943c67  
Branch: feature/app-shell-foundation  
Commit Message: Align Koinonia home services with monthly support

The Koinonia Home page service card language was updated to align with the approved Services & Pricing Blueprint and the implemented Services/Contact page structure.

### Change Made

The Home page service card formerly titled:

- Business Operations Support

was updated to:

- Monthly Operations Partnership

### Purpose

This keeps the Home page aligned with the current Koinonia service model while preserving Home as a light, high-level, navigational page.

### Scope

Only `apps/web/content/home.ts` was changed.

No new sections, CSS, pricing cards, component changes, or layout changes were added.

### Build Status

Production build passed before commit.

### Future Rule

The Home page should continue to mention Monthly Operations Partnership at a high level, but detailed pricing, support tiers, boundaries, and service explanations should remain on the Services page.


---

## 2026-07-13 — Koinonia Aligned Pages QA Checkpoint

Branch: feature/app-shell-foundation  
Latest Verified Commit: b2abf3d  
Checkpoint Scope: Home, Services, and Contact alignment after Services/Pricing Blueprint implementation

A short QA pass was completed after aligning the Koinonia public pages around the approved service model.

### Verified Content

Home page:

- Monthly Operations Partnership is present
- Recurring support language is present
- Business follow-through language is present

Services page:

- Monthly support tone was refined
- Pricing remains framed as starting points
- Professional responsibility boundaries remain clear

Contact page:

- Transaction Support intake path is present
- Contract & Document Support intake path is present
- Licensed Showing Coverage intake path is present
- Monthly Operations Partnership intake path is present

### Verified Build

Production build passed successfully.

### Verified Routes

The following routes returned 200 locally:

- `/koinonia`
- `/koinonia/services`
- `/koinonia/contact`

### Git Status

Working tree was clean after QA. Branch was synced with GitHub.

### Future Rule

Home should remain light and navigational. Services should carry pricing, tiers, scope, and professional boundaries. Contact should stay simple while clearly supporting the four approved intake paths.


---

## 2026-07-13 — Koinonia Services Scope Notes

Branch: feature/app-shell-foundation

Added a light public-facing "How Scope Works" section to the Koinonia Services page after the pricing snapshot.

### Purpose

The section communicates service expectations without exposing detailed internal business rules.

### Public Notes Added

- Monthly support has a rhythm
- Rush work depends on availability
- Showing coverage is confirmed first
- Document support follows Realtor direction

### Direction

The public website should explain scope calmly and professionally while keeping detailed exception rules, rush pricing, distance formulas, and internal operating details inside the Brain.


---

## 2026-07-13 — Koinonia Root Link Migration

Branch: feature/app-shell-foundation

Public-facing Koinonia navigation and CTA links were migrated from nested `/koinonia` paths to clean root launch paths.

### Public Launch Paths

- `/`
- `/services`
- `/about`
- `/contact`

### Backward-Compatible Alias Paths

The existing nested Koinonia routes remain available:

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

### Internal Dashboard

The internal Reynalds OS dashboard remains preserved at:

- `/dashboard`

### Direction

Use root paths for public Koinonia navigation going forward. Keep `/koinonia` routes available for continuity unless a future cleanup decision removes them intentionally.


---

## 2026-07-13 — Koinonia Launch Platform Decision

Branch: feature/app-shell-foundation

A launch platform decision was approved and documented.

### Decision

Koinonia should launch using the current custom Next.js site rather than rebuilding the site in Squarespace before launch.

### Approved Direction

- Keep the current Next.js website
- Deploy using a platform such as Vercel
- Keep public Koinonia pages on root paths
- Preserve Reynalds OS at `/dashboard`
- Keep `/koinonia` aliases available
- Add SEO launch essentials before going live

### Future Rule

When launch planning resumes, do not reopen the Squarespace migration question unless intentionally requested. Continue from the recorded decision and move into SEO, deployment, domain, analytics, and launch readiness.


---

## 2026-07-13 — Koinonia Core SEO Metadata

Branch: feature/app-shell-foundation

Added the first core SEO launch-readiness layer for the Koinonia public website.

### Added

- Shared SEO configuration
- Improved global metadata
- Per-page metadata for:
  - `/`
  - `/services`
  - `/about`
  - `/contact`
- Canonical URLs
- Open Graph metadata
- Twitter metadata
- Sitemap route
- Robots route

### Verified

- Production build passed
- `/sitemap.xml` returned 200
- `/robots.txt` returned 200
- Public page metadata checks passed for Home, Services, About, and Contact

### Direction

Continue launch SEO work from the current Next.js site. Do not reopen the Squarespace migration decision unless intentionally requested.


---

## 2026-07-13 — Koinonia Social Preview Metadata

Branch: feature/app-shell-foundation

Added social preview metadata for public Koinonia pages.

### Added

- Dedicated social preview image:
  - `apps/web/public/assets/images/koinonia/social-preview.png`
- Open Graph image metadata
- Twitter image metadata
- Shared social image settings in SEO config

### Verified

- Social preview image generated at 1200x630
- Production build passed
- Public routes returned 200
- Social preview image route returned 200
- `og:image` present on Home, Services, About, and Contact
- `twitter:image` present on Home, Services, About, and Contact
- `summary_large_image` present on Home, Services, About, and Contact

### Direction

Use the dedicated social preview image for public link sharing until a future branded campaign-specific preview image is intentionally approved.


---

## 2026-07-13 — Koinonia Web Manifest

Branch: feature/app-shell-foundation

Added a web manifest for the Koinonia public site.

### Added

- `apps/web/app/manifest.ts`
- Manifest metadata for site name, short name, description, start URL, scope, display behavior, theme color, background color, icons, and business/productivity categories
- Manifest reference in global layout metadata

### Verified

- Production build passed
- `/manifest.webmanifest` returned 200
- Manifest link was present in public HTML
- Manifest included Koinonia name, icons, and standalone display behavior


---

## 2026-07-13 — Koinonia Local SEO Copy Refinement

Branch: feature/app-shell-foundation

Refined public-facing copy and SEO descriptions to improve local and service keyword clarity without keyword stuffing.

### Updated Language

- Added light Colorado Realtor language to Home and Contact
- Added transaction coordination language to Services
- Clarified real estate transaction coordination in the Transaction Support card
- Updated SEO descriptions with Colorado Realtors, transaction coordination, showing coverage, contract support, and monthly real estate operations support

### Verified

- Production build passed
- Public routes returned 200
- Local SEO copy checks passed
- Spam/overuse check remained clean

### Direction

Keep SEO language natural and service-focused. Avoid keyword stuffing, exaggerated claims, or “best/guaranteed ranking” language.


---

## 2026-07-13 — Koinonia Deployment Readiness Plan

Branch: feature/app-shell-foundation

A deployment readiness plan was documented for the Koinonia public website.

### Decision

Launch the current custom Next.js Koinonia site using a Vercel-style deployment path.

### Deployment Direction

- Repository: KoinoniaTransactions/Reynalds-OS
- Deployable app: apps/web
- Public site root: /
- Internal dashboard: /dashboard
- Public domain target: https://koinoniatransactions.com
- Do not rebuild in Squarespace before launch

### Verified Build Path

- pnpm install --frozen-lockfile
- pnpm --filter @reynalds-os/database db:generate
- cd apps/web
- pnpm build

### Direction

Use the deployment readiness document before attempting launch. Do not commit production secrets. Confirm environment variables and domain settings before production deployment.

---

## 2026-07-13 — Koinonia Header Consultation Footer Modernization

Branch: feature/app-shell-foundation

Completed a public-site visual and consultation-flow modernization batch.

### Updated

- Modernized the Koinonia header and mobile navigation panel
- Added a detailed Schedule a Consultation section to the Contact page
- Added consultation types for transaction support, contract/document support, licensed showing coverage, monthly operations partnership, and unsure/general needs
- Set consultation availability language to Monday-Friday, 9:00 AM-5:00 PM
- Updated Schedule a Consultation CTAs to point to /contact#schedule-consultation
- Updated the footer consultation CTA destination
- Polished footer Email, Call, and Text actions so they read as clickable controls
- Centered the footer Bible verse, verse reference, and copyright

### Verified

- Production build passed
- Public routes returned 200
- Schedule a Consultation anchors point to /contact#schedule-consultation
- Consultation section HTML checks passed
- Footer alignment was visually approved

### Direction

Keep the modern header/mobile navigation direction. Keep the Contact page consultation section as the current scheduling destination until a calendar scheduler or client portal intake flow is added.

---

## 2026-07-13 — Koinonia Body Card Modernization

Branch: feature/app-shell-foundation

Completed the first below-hero body modernization pass for the public Koinonia website.

### Updated

- Modernized global section, card, button, band, pricing, and consultation-card styling
- Improved card surface depth, spacing, border treatment, and hover polish
- Preserved existing content and page structure
- Removed the extra decorative gold card/section lines after visual review
- Added body/card modernization notes under docs/specifications

### Verified

- Production build passed
- Public routes returned 200
- Body/card visual direction was reviewed and approved after removing the extra gold line treatment

### Direction

Keep the softer modern card system, but avoid extra decorative gold lines across cards or section headers. Continue using restrained gold accents only where they support the brand without feeling repetitive.

---

## 2026-07-14 — Koinonia Compact Consultation Scheduler

Branch: feature/app-shell-foundation

Replaced consultation-card email behavior with a compact on-page scheduler CTA and popup intake form.

### Updated

- Added a ConsultationIntake popup component
- Added a `/api/koinonia/consultation` route prepared for Resend email delivery
- Set the default consultation recipient to jeremiah@koinoniaadmin.com
- Replaced consultation-card `mailto` behavior with on-site popup form behavior
- Moved support-type selection into the popup
- Reduced the Contact page scheduler area to a compact CTA block
- Removed the five large consultation cards from the visible Contact page
- Removed the bulky availability/header treatment
- Kept availability visible as Monday-Friday, 9:00 AM-5:00 PM
- Added requested weekday date and time-window selection
- Added form validation and client confirmation/error states
- Added consultation intake documentation

### Verified

- Production build passed
- `/contact` returned 200
- `/koinonia/contact` returned 200
- Contact page now imports and renders ConsultationSchedulerButton
- Old ConsultationSchedulerSelector wiring was removed from the Contact page assembly
- Popup scheduler was visually reviewed and approved

### Production Requirement

Live email delivery requires `RESEND_API_KEY` before production launch. Optional environment variables are `CONTACT_INTAKE_TO_EMAIL` and `CONTACT_INTAKE_FROM_EMAIL`.

---

## 2026-07-27 — Koinonia Consultation Email Delivery Verified

### Summary

The Koinonia consultation scheduler email delivery path was configured and verified locally using Resend.

### Completed

- Added Resend DNS sending records for `koinoniatransactions.com` through Squarespace DNS.
- Verified the domain in Resend.
- Added local-only environment variables in `apps/web/.env.local`.
- Confirmed `apps/web/.env.local` is ignored by Git.
- Ran a live POST test against `/api/koinonia/consultation`.
- Confirmed the API returned success.
- Confirmed the test consultation email was received at `jeremiah@koinoniaadmin.com`.

### Security Notes

- The Resend API key must never be committed to GitHub.
- The local API key lives only in `apps/web/.env.local`.
- Production deployment will require adding the same environment variable names inside the hosting platform environment settings.

### Required Production Environment Variables

- `RESEND_API_KEY`
- `CONTACT_INTAKE_TO_EMAIL`
- `CONTACT_INTAKE_FROM_EMAIL`

### Current Status

Koinonia consultation email delivery is locally verified and ready for production environment setup during deployment.

---

## 2026-07-27 — Koinonia Public Website Visual Approval Checkpoint

### Summary

The Koinonia public website was visually reviewed locally after the consultation scheduler and Resend email delivery setup.

### Reviewed Locally

- Home page
- Services page
- About page
- Contact page
- Contact scheduler anchor
- Desktop preview
- Mobile preview

### Verified Before Approval

- Public routes returned successful responses.
- Contact scheduler loaded at `/contact#schedule-consultation`.
- Consultation API guard behavior remained correct.
- Resend live email delivery was tested successfully.
- Test consultation email was received at `jeremiah@koinoniaadmin.com`.
- `.env.local` remained ignored by Git.
- No Resend API key pattern was found in tracked source files.
- GitHub was current after the Resend documentation commit.

### Current Status

The public Koinonia website is visually approved locally and ready for launch-preparation work.

---

## 2026-07-27 — Koinonia Launch Contact Values Finalized

### Summary

Public launch contact values were added to the shared Koinonia brand content.

### Public Contact Values

- Phone: `719-745-8497`
- Text: `719-745-8497`
- Email: `jeremiah@koinoniaadmin.com`
- Website: `https://koinoniatransactions.com`

### SEO Path Clarification

The active SEO configuration file is `apps/web/config/seo.config.ts`.

### Current Status

The public site now has launch-ready call, text, email, and website contact values in shared brand content.

---

## 2026-07-27 — Koinonia Public Website Launch Verified

### Summary

Koinonia public website deployment was verified on the real production domain.

### Verified Production URLs

- `https://www.koinoniatransactions.com`
- `https://koinoniatransactions.com` redirects to `https://www.koinoniatransactions.com`
- `https://www.koinoniatransactions.com/contact#schedule-consultation`

### Deployment Platform

- Host: Vercel
- Project: `reynalds-os-web`
- Production branch: `main`
- Approved launch commit: `ebb9fb8`
- Launch commit message: `Finalize Koinonia launch contact values`

### Email Delivery

The real-domain consultation scheduler was tested from the live public domain. The scheduler request was delivered successfully to `jeremiah@koinoniaadmin.com`.

### DNS Status

Website DNS was pointed from Squarespace website defaults to Vercel.

Current known website records:

- `www` CNAME points to Vercel DNS.
- Apex/root domain points to Vercel and redirects to `www`.

Important: Squarespace remains part of the current DNS management path until DNS/registrar records are intentionally migrated later. Do not cancel Squarespace until Vercel website records, Resend records, and email/security records are fully inventoried and recreated wherever DNS will live long-term.

---

## 2026-07-28 — Koinonia Portal Auth Foundation Scaffolded

### Summary

The Koinonia client and employee portal preview routes were moved behind an authentication and permission boundary. The public `/client` and `/employee` entry pages remain visible, while dashboard, document, and billing preview routes now require the appropriate client or employee portal permission before rendering.

### Implemented

- Added `/sign-in` secure login entry.
- Replaced synchronous mock-only web auth with async provider-aware session lookup.
- Added Clerk-ready user mapping for provider metadata.
- Added route-level portal permission guards.
- Updated portal APIs to await session-backed permission checks.
- Added role normalization, typed permission denial, and provider-user construction helpers.
- Added auth tests for provider role mapping and unknown role downgrade.
- Documented production auth setup in `docs/specifications/KOINONIA_AUTH_PRODUCTION_READINESS.md`.

### Current Status

The login boundary is scaffolded and guarded, but login is not production-complete. The managed auth package still needs to be installed, deployment variables must be configured, staff MFA must be enabled, and portal routes must be verified with real provider users before real client data is accepted.

---

## 2026-07-29 — Koinonia Managed Auth Provider Wired

### Summary

The Koinonia portal auth scaffold was advanced from provider-ready to provider-wired. Clerk is now a web app dependency, the root layout includes a conditional Clerk provider wrapper, middleware is present, and the sign-in route uses Clerk's catch-all route shape.

### Implemented

- Installed `@clerk/nextjs` in the web app dependency graph.
- Patched React and React DOM to `19.0.3` to satisfy Clerk's current peer range.
- Added `apps/web/components/auth/AuthProvider.tsx`.
- Added `apps/web/middleware.ts` with Clerk middleware enabled only when Clerk keys are configured.
- Moved `/sign-in` to `/sign-in/[[...sign-in]]`.
- Rendered Clerk's `SignIn` component when a publishable key is configured.
- Kept the safe request-access fallback when Clerk keys are absent.
- Tightened protected portal pages to redirect to sign-in instead of showing a generic server error when production auth is not configured.

### Verified

- Auth package tests passed.
- Web production build passed.
- Production preview with mock preview allowed returned 200 for secure login, client billing, employee dashboard, and `/api/me`.
- Production preview with mock preview disabled redirected protected client billing to `/sign-in` and returned 503 from `/api/me`.

### Current Status

Source scaffolding for managed auth is wired. Login is still not production-ready until Clerk production keys are configured, staff MFA is enforced, invitation/onboarding flows exist, and real client/staff users are tested.

---

## 2026-07-29 — Portal Identity Schema Added

### Summary

The database schema was extended so managed portal login can map provider users to Koinonia users, invitations, roles, and audit history.

### Implemented

- Added user fields for `authProvider`, `authProviderUserId`, `mfaRequired`, `portalAccessStatus`, `lastLoginAt`, `invitedAt`, and `deactivatedAt`.
- Added `PortalInvitation` for client and staff invite tracking.
- Added `AuditEvent` for sensitive auth and portal access events.
- Added migration `20260729062200_portal_auth_identity`.

### Verified

- Prisma schema formatted.
- Prisma client generated.
- Database package build passed.
- Web production build passed.

### Current Status

The schema foundation exists, but invitation APIs, Clerk invitation creation, staff MFA enforcement, and real-provider user testing still remain before production login can accept real client or staff access.
