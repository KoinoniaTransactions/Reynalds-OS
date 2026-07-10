# Reynalds OS Session Handoff

## Purpose

This document provides the operational state of the repository at the conclusion of the most recent development session.

Historical information belongs in:

- DEVELOPMENT_LOG.md
- VERSION_HISTORY.md
- DECISION_LOG.md

This document should describe only the current repository state and the immediate next work.

---

# Repository Status

Repository:

Reynalds_OS_v11_3_1_Work

Primary Workspace:

Koinonia ERP

Current Branch:

feature/app-shell-foundation

GitHub Status:

Local branch synchronized with origin.

Working Tree:

Clean.

Production Build:

Passing.

---

# Repository Maturity

Reynalds OS is an actively developed production repository.

It contains substantial existing architecture, reusable components, business logic, documentation, content systems, design standards, and operating rules.

Future development should assume the repository is significantly more complete than it initially appears.

Never assume something is missing until the repository has been inspected.

---

# Mandatory Startup Workflow

Before recommending, creating, replacing, or redesigning anything:

1. Read START_HERE.md.
2. Read BRAIN/README.md.
3. Read BRAIN/CANONICAL_REGISTRY.md.
4. Read BRAIN/CURRENT_PRIORITIES.md.
5. Read BRAIN/DEVELOPMENT_STANDARDS.md.
6. Read BRAIN/DECISION_LOG.md.
7. Inspect the repository structure.
8. Search for existing implementations.
9. Identify the governing canonical source.
10. Only then recommend implementation.

Repository inspection is mandatory.

Conversation history is never a substitute for repository inspection.

---

# Current Development Phase

Launch preparation for the Koinonia production website.

Platform work should occur only when it directly accelerates website completion.

---

# Major Milestones Completed

- Repository-first workflow established.
- GitHub workflow established and verified.
- Hero Image System established.
- Hero Composition Standard established.
- Shared content architecture established.
- Component-first page architecture established.
- Desktop/mobile hero system completed for:
  - Home
  - About
  - Services
  - Contact
- Hero imagery integrated into React.
- Production assets and source assets committed.
- Production build verified.
- All work committed and pushed to GitHub.

---

# Immediate Next Task

Continue implementation of the Koinonia production website.

Next work begins immediately below the Home page hero.

Recommended order:

1. Refine Home page sections.
2. Complete Services page.
3. Complete About page.
4. Complete Contact page.
5. Pricing.
6. QA.
7. Launch.

Do not begin new operating system initiatives unless they directly accelerate these objectives.

---

# Pre-Execution Rule

Before every meaningful implementation:

1. Restate understanding.
2. Identify governing standards.
3. Recommend a better approach if one exists.
4. Explain exactly what will be created.
5. Wait for approval.
6. Execute.
7. Validate.
8. Commit.
9. Push.

---

# Final Reminder

Progress is measured by production completion, not by architectural expansion.

The repository already contains far more capability than is immediately visible.

Recover before reinventing.

Extend before creating.

Inspect before recommending.

## 2026-07-09 — Koinonia Home Completion Handoff

### Current Status

The Koinonia Home page is approved, build-passing, committed, and pushed.

Latest confirmed commits:

- `e124ca6` — Align Koinonia home page content
- `85c907d` — Polish Koinonia home page presentation

### Approved Home Design Rules

- Hero remains a split composition:
  - copy on the left
  - visual image on the right
- Home body section headers are centered as a complete header group.
- Eyebrow, heading, and lead paragraph should align together.
- The visible process section label is `The Koinonia Experience`.
- The internal documentation label is `Koinonia Experience`.
- CTA primary button should visually stand out as the primary action.
- Footer remains unchanged.

### Important Continuity Note

Do not restart or redesign the Home page in the next session.

The Home page is complete unless the user identifies a specific launch-blocking issue.

### Recommended Next Step

Begin the Koinonia Services page production pass using the existing content architecture and shared site components.

Before editing Services, review:

1. `START_HERE.md`
2. `BRAIN/SESSION_HANDOFF.md`
3. `BRAIN/DEVELOPMENT_LOG.md`
4. `03_Knowledge/Website/WEBSITE_PRODUCTION_FRAMEWORK.md`
5. Existing Services page files under `apps/web`

## 2026-07-09 — Koinonia Services Pass 1 Handoff

### Current Status

The Koinonia Services page has completed Pass 1 and is approved, build-passing, committed, and pushed.

Latest confirmed Services commit:

- `058c0a5` — Differentiate Koinonia services page from home

### Approved Services Direction

Services should not repeat the Home page.

Home introduces Koinonia.

Services explains:

- what Koinonia can do
- where support fits
- how the process works
- which support level may fit the Realtor's business

### Confirmed Services Implementation

Services Pass 1 changed only these files:

- `apps/web/content/services.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- `03_Knowledge/Website/services_pricing_production_spec.md`

### Important Recovery Note

A bad commit, `f9e1435`, briefly included a massive repository delete. It was replaced with the correct Services-only commit using `git push --force-with-lease`.

Do not pull, restore, cherry-pick, or rely on `f9e1435`.

The correct Services Pass 1 commit is:

- `058c0a5`

### Recommended Next Step

Continue the Koinonia website production pass.

Likely next options:

1. Polish Services page further if the user identifies visual or content issues.
2. Begin About page production pass.
3. Begin Contact page production pass.

Before editing the next page, inspect the existing page assembly, content file, production spec, and related Brain docs.

## 2026-07-09 — Koinonia About Pass 1 Handoff

### Current Status

The Koinonia About page has completed Pass 1 and is committed and pushed.

Latest confirmed About commit:

- `3129da4` — Complete Koinonia about page pass one

### Approved About Direction

About should answer:

`Can I trust Koinonia?`

The page should build confidence in Koinonia as a trustworthy real estate operations partner. It should explain the meaning behind the name, Jeremiah's licensed real estate perspective, and the service values that guide the work.

### Confirmed About Implementation

About Pass 1 changed only these files:

- `apps/web/content/about.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`
- `docs/specifications/ABOUT_SPEC.md`

### Important Continuity Note

Do not re-add the shared Home `TrustPillars` section to About unless there is a specific approved reason.

Do not turn About into a long personal biography.

### Recommended Next Step

Begin the Koinonia Contact page production pass.

Before editing Contact, inspect:

1. `apps/web/content/contact.ts`
2. `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
3. `apps/web/app/koinonia/contact/page.tsx`
4. `docs/specifications/CONTACT_SPEC.md`
5. Existing shared contact/action components

## 2026-07-09 — Koinonia Contact Pass 1 Handoff

### Current Status

The Koinonia Contact page has completed Pass 1 and is committed and pushed.

Latest confirmed Contact commit:

- `89238e9` — Complete Koinonia contact page pass one

### Approved Contact Direction

Contact should answer:

`How do I get started?`

The page should make the first step clear, calm, and low-pressure.

### Production Contact Values

Canonical source:

- `apps/web/config/contact.config.ts`

Confirmed production values:

- Email: `jeremiah@koinoniaadmin.com`
- Phone: `(719) 745-8497`
- Text: `(719) 745-8497`

### Confirmed Contact Implementation

Contact Pass 1 changed these files:

- `apps/web/config/contact.config.ts`
- `apps/web/content/contact.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
- `apps/web/components/site/ContactActions/COMPONENT.md`
- `docs/specifications/CONTACT_SPEC.md`

### Important Continuity Notes

Do not reintroduce `Phone coming soon` or `Text coming soon` placeholders unless production values change.

Do not hard-code email, phone, or SMS values inside page assemblies. Keep contact values centralized in `apps/web/config/contact.config.ts`.

### Recommended Next Step

Run a final full-site QA pass across:

1. `/koinonia`
2. `/koinonia/services`
3. `/koinonia/about`
4. `/koinonia/contact`

QA should verify:

- Desktop layout
- Mobile layout
- CTA links
- Email link
- Phone link
- SMS link
- Footer contact links
- Page-to-page navigation
- Build status

---

## Current Koinonia Website Checkpoint — Production Hero System Approved

As of commit `a12e03c`, the Koinonia production hero image system is complete, committed, pushed, and locally verified.

### Current Status

- Branch: `feature/app-shell-foundation`
- Latest hero commit: `a12e03c`
- Working tree was clean after push
- Local preview may require restarting the Next server if the site cannot be reached

### Approved Hero Standard

The approved Koinonia hero system is light, airy, premium, and consistent across the Koinonia website. It uses the same branded office environment across Home, Services, About, and Contact, with page-specific desk props and messaging cues.

Do not revert to dark/moody hero images. Do not generate unrelated hero images. Do not embed marketing copy inside hero artwork.

### Approved Page Hero Files

Home:
- `apps/web/public/assets/images/koinonia/home/home-hero-desktop.png`
- `apps/web/public/assets/images/koinonia/home/home-hero-mobile.png`

Services:
- `apps/web/public/assets/images/koinonia/services/services-hero-desktop.png`
- `apps/web/public/assets/images/koinonia/services/services-hero-mobile.png`

About:
- `apps/web/public/assets/images/koinonia/about/about-hero-desktop.png`
- `apps/web/public/assets/images/koinonia/about/about-hero-mobile.png`

Contact:
- `apps/web/public/assets/images/koinonia/contact/contact-hero-desktop.png`
- `apps/web/public/assets/images/koinonia/contact/contact-hero-mobile.png`

Shared styling:
- `packages/design-system/styles.css`

### Preview Commands

Use the standard build/start flow:

cd ~/Desktop/Reynalds_OS_v11_3_1_Work
pnpm --filter @reynalds-os/database db:generate

cd apps/web
rm -rf .next
pnpm build

lsof -ti :3000 | xargs kill -9 2>/dev/null || true
pnpm exec next start -H 0.0.0.0 -p 3000

Desktop preview:
- `http://localhost:3000/koinonia`
- `http://localhost:3000/koinonia/services`
- `http://localhost:3000/koinonia/about`
- `http://localhost:3000/koinonia/contact`

If mobile preview fails, confirm the Mac IP with:

ipconfig getifaddr en0

Then use:

http://<MAC-IP>:3000/koinonia


---

## Current Koinonia Website Checkpoint — Header Added

The Koinonia public website now has a shared sitewide Header component.

### Files Added / Updated

- `apps/web/components/site/Header/Header.tsx`
- `apps/web/components/site/Header/COMPONENT.md`
- `apps/web/components/site/index.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
- `packages/design-system/styles.css`

### Header Standard

Desktop header shows the Koinonia brand, main navigation, and Schedule a Consultation CTA.

Mobile header uses a hamburger menu. Do not revert mobile navigation back to always-visible stacked links unless the user explicitly requests that design.

### Future Rule

Header/navigation edits should be handled through the shared Header component, not duplicated inside individual page assemblies.


---

## Current Koinonia Website Checkpoint — Footer Upgraded

The Koinonia public website footer has been upgraded using the existing canonical Footer component.

### Files Updated

- `apps/web/components/site/Footer/Footer.tsx`
- `apps/web/components/site/Footer/COMPONENT.md`
- `apps/web/content/shared.ts`
- `packages/design-system/styles.css`

### Footer Standard

The approved footer includes:

- Koinonia brand block
- Footer navigation
- Email, call, and text actions
- Schedule a Consultation CTA
- Faith/value line
- Legal/copyright line

The footer should remain shared across Home, Services, About, and Contact.

### Future Rule

Do not create duplicate page-specific footers. Footer/navigation/contact edits should be handled through the shared Footer component and shared content.


---

## Current Koinonia Website Checkpoint — Favicon and Metadata Added

As of commit `8eb196a`, the Koinonia public website has branded favicon/icon support and updated metadata.

### Files Added / Updated

- `apps/web/app/icon.svg`
- `apps/web/app/apple-icon.svg`
- `apps/web/public/apple-icon.svg`
- `apps/web/app/layout.tsx`

### Current Standard

The public site should display Koinonia branding in the browser title and favicon/icon system. The metadata should remain public-site appropriate, not generic Reynalds OS wording.


---

## Current Koinonia Website Checkpoint — Home Page Body Polished

As of commit `d4d1d6a`, the Koinonia Home page body has been polished and committed.

### Files Updated

- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- `apps/web/content/home.ts`
- `packages/design-system/styles.css`

### Current Home Page Flow

- Header
- Hero
- Behind-the-Scenes Support
- Services Built Around Realtor Operations
- Who It Helps
- How It Works
- CTA
- Footer

### Future Rule

Do not re-add TrustPillars to the Home page unless the user explicitly asks. The Home page was intentionally tightened to avoid feeling repetitive or overly long.


---

## Current Koinonia Website Checkpoint — Services Page Body Polished

As of commit `2b154ba`, the Koinonia Services page body has been polished and committed.

### Files Updated

- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- `apps/web/content/services.ts`
- `packages/design-system/styles.css`

### Current Services Page Flow

- Header
- Hero
- Core Services
- When To Use Koinonia
- How It Works
- Support Levels
- FAQ
- CTA
- Footer

### Future Rule

The Services page is allowed to be more detailed than Home. Do not remove useful Services sections merely to make it shorter. Keep each section purposeful and avoid adding new sections unless they answer a clear visitor question.


---

## Current Koinonia Website Checkpoint — About Page Body Polished

As of commit `65762fb`, the Koinonia About page body has been polished and committed.

### Files Updated

- `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`
- `apps/web/content/about.ts`
- `packages/design-system/styles.css`

### Current About Page Flow

- Header
- Hero
- The Meaning Behind the Name
- Why Realtors Can Trust Koinonia
- Meet Jeremiah
- How Koinonia Serves
- CTA
- Footer

### Future Rule

The About page should stay trust-focused and professional. It should include Jeremiah’s licensed Realtor perspective, but should not become a long personal biography.

