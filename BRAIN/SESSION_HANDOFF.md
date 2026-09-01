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


---

## Current Koinonia Website Checkpoint — Contact Page Body Polished

As of commit `5a796a2`, the Koinonia Contact page body has been polished and committed.

### Files Updated

- `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
- `apps/web/content/contact.ts`
- `packages/design-system/styles.css`

### Current Contact Page Flow

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

### Future Rule

The Contact page should remain clear, calm, low-pressure, and easy to act on. Do not hard-code contact details outside `contact.config.ts`.


---

## Current Koinonia Website Checkpoint — Full-Site QA Completed

As of commit `754330e`, the Koinonia four-page public website has completed a full local QA pass.

### Completed Public Site Pages

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

### Completed Sitewide Systems

- Approved production hero image system
- Shared Header with mobile hamburger menu
- Upgraded shared Footer
- Koinonia favicon and metadata
- Polished Home page body
- Polished Services page body
- Polished About page body
- Polished Contact page body

### QA Confirmed

- Build passes cleanly
- Route checks returned 200 for all four Koinonia pages
- Icon checks returned 200 for `/icon.svg` and `/apple-icon.svg`
- No temporary hero image references remain
- Final hero image paths are used in all page assemblies
- Git working tree clean after commit and push

### Future Rule

The Koinonia site is now in a complete first production-pass state. Next steps should be QA, launch preparation, deployment planning, SEO/accessibility checks, or carefully scoped content refinements. Do not rework approved header, footer, hero system, or page structure without a clear reason.


---

## Current Koinonia Website Checkpoint — Full-Site QA Completed

As of commit `754330e`, the Koinonia four-page public website has completed a full local QA pass.

### Completed Public Site Pages

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

### Completed Sitewide Systems

- Approved production hero image system
- Shared Header with mobile hamburger menu
- Upgraded shared Footer
- Koinonia favicon and metadata
- Polished Home page body
- Polished Services page body
- Polished About page body
- Polished Contact page body

### QA Confirmed

- Build passes cleanly
- Route checks returned 200 for all four Koinonia pages
- Icon checks returned 200 for `/icon.svg` and `/apple-icon.svg`
- No temporary hero image references remain
- Final hero image paths are used in all page assemblies
- Git working tree clean after commit and push

### Future Rule

The Koinonia site is now in a complete first production-pass state. Next steps should be QA, launch preparation, deployment planning, SEO/accessibility checks, or carefully scoped content refinements. Do not rework approved header, footer, hero system, or page structure without a clear reason.


---

## Current Koinonia Services Page Status

As of commit `5860f07`, the Koinonia Services page has been updated to match the approved Services & Pricing Blueprint.

### Current Services Page Structure

The page now includes:

- Core Service Paths
- Monthly Operations Partnership
- Pricing Snapshot
- When To Use Koinonia
- How It Works
- Professional Scope / Boundaries
- FAQ
- CTA
- Footer

### Approved Service Paths

- Transaction Support
- Contract & Document Support
- Licensed Showing Coverage
- Monthly Operations Partnership

### Monthly Tiers

- Starter — $299/month
- Growth — $599/month
- Partner — $999/month

### Pricing Snapshot

- Transaction Support — starting at $389
- Contract & Document Support — starting at $75
- Licensed Showing Coverage — starting at $50
- Monthly Operations Partnership — starting at $299/month

### Notes

Pricing badges were added to prevent awkward text wrapping in the monthly and pricing sections.

The page builds successfully and the working tree was clean after pushing commit `5860f07`.

### Future Work

Next suggested work:

- Refine Services page tone and copy
- Decide whether pricing should remain public or consultation-based
- Update Contact page intake language to include monthly support
- Review Home page wording to mention monthly support more clearly
- Make small visual edits only after content direction is stable


---

## Current Koinonia Contact Page Status

As of commit `17522d6`, the Koinonia Contact page has been aligned with the approved Services page structure.

### Current Contact Page Intake Paths

The Contact page now supports inquiries for:

- Transaction Support
- Contract & Document Support
- Licensed Showing Coverage
- Monthly Operations Partnership

### Notes

The Contact page was visually reviewed and approved before commit.

The page builds successfully and the working tree was clean after pushing commit `17522d6`.

### Future Work

Next suggested work:

- Refine Home page wording to mention monthly operations support more clearly
- Review Services page tone and pricing confidence
- Decide whether pricing should remain public or become consultation-based
- Continue small visual refinements only after business/service language is stable


---

## Current Koinonia Home Page Status

As of commit `6943c67`, the Home page service cards are aligned with the approved Koinonia service model.

### Current Home Service Paths

- Transaction Management
- Contract Preparation & Writing
- Licensed Showing Coverage
- Monthly Operations Partnership

### Notes

The Home page intentionally remains light and high-level. It should guide visitors toward Services and Contact without becoming a pricing or package-detail page.

### Future Work

If service language changes again, update Home only lightly. Detailed service explanations, pricing, tiers, and professional boundaries belong on the Services page.


---

## Aligned Koinonia Public Pages QA Status

As of commit `b2abf3d`, the Home, Services, and Contact pages have been aligned around the approved Koinonia service model and passed a focused local QA check.

### Pages Verified

- `/koinonia`
- `/koinonia/services`
- `/koinonia/contact`

### Service Model Alignment

The current public-facing service model includes:

- Transaction Support
- Contract & Document Support
- Licensed Showing Coverage
- Monthly Operations Partnership

### QA Results

- Production build passed
- Home monthly support wording verified
- Services tone/pricing wording verified
- Contact intake paths verified
- Local route checks returned 200 for Home, Services, and Contact
- Working tree clean after QA

### Recommended Next Work

Next work should focus on small visual refinements, pricing confidence, final service-boundary decisions, or launch-readiness planning. Avoid major redesign unless a specific issue is identified.


---

## Koinonia Services Scope Notes

The Services page now includes a public-facing "How Scope Works" section after the pricing snapshot.

### Current Public Scope Notes

- Monthly support has a rhythm
- Rush work depends on availability
- Showing coverage is confirmed first
- Document support follows Realtor direction

### Important Boundary

Do not publish the detailed internal service-boundary rules unless intentionally approved later. Keep detailed rush premiums, showing radius, additional hourly rates, and exception formulas inside the Brain for now.


---

## Koinonia Root Link Migration

Public Koinonia navigation and CTA links now use clean root launch paths.

### Current Public Paths

- `/`
- `/services`
- `/about`
- `/contact`

### Alias Paths Still Working

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

### Internal Dashboard

The internal dashboard has been preserved at `/dashboard`.

### Future Rule

For public website links, prefer root paths. Do not remove `/koinonia` aliases unless intentionally approved later.


---

## Launch Platform Decision Recorded

The platform decision has been recorded.

### Approved Decision

Launch the current custom Next.js Koinonia site. Do not rebuild the site in Squarespace before launch.

### Current Launch Direction

- Public Koinonia website uses root paths:
  - `/`
  - `/services`
  - `/about`
  - `/contact`
- Reynalds OS is preserved at `/dashboard`
- Existing `/koinonia` routes remain as aliases
- Use a deployment path such as Vercel
- Complete SEO launch essentials before going live

### Next Launch Work

When the user says the platform decision has been recorded, proceed with:

- Per-page metadata
- Sitemap
- Robots file
- Open Graph/social preview metadata
- Domain/deployment readiness
- Search Console
- Analytics
- Google Business Profile review

Do not suggest rebuilding in Squarespace unless the user explicitly asks to reconsider the platform strategy.


---

## Koinonia Core SEO Metadata

The first core SEO launch-readiness layer has been added to the current Next.js Koinonia site.

### Current SEO Additions

- Shared SEO config: `apps/web/config/seo.config.ts`
- Global metadata updated in `apps/web/app/layout.tsx`
- Page metadata added for:
  - `/`
  - `/services`
  - `/about`
  - `/contact`
- Sitemap added at `/sitemap.xml`
- Robots file added at `/robots.txt`

### Verified

- Production build passed
- Sitemap and robots routes returned 200
- HTML metadata checks passed for public root pages

### Next SEO Work

Recommended next SEO steps:

- Add Open Graph/social preview image support
- Add manifest if needed
- Review local/service keyword copy
- Prepare Search Console and analytics setup
- Confirm final production domain before deployment


---

## Koinonia Social Preview Metadata

Social preview metadata has been added for the public Koinonia site.

### Current Social Preview Asset

- `apps/web/public/assets/images/koinonia/social-preview.png`
- Size: 1200x630
- Source: approved Koinonia home hero source artwork

### Current Coverage

The social preview image is included in Open Graph and Twitter metadata for:

- `/`
- `/services`
- `/about`
- `/contact`

### Verified

- Production build passed
- Social image route returned 200
- Public pages include `og:image`
- Public pages include `twitter:image`
- Public pages include `summary_large_image`


---

## Koinonia Web Manifest

A web manifest has been added for the public Koinonia site.

### Current Manifest Route

- `/manifest.webmanifest`

### Files

- `apps/web/app/manifest.ts`
- `apps/web/app/layout.tsx`

### Verified

- Production build passed
- Manifest route returned 200
- Public HTML includes the manifest link
- Manifest includes Koinonia Transactions, Koinonia, icons, and standalone display behavior


---

## Koinonia Local SEO Copy Refinement

Public Koinonia copy has been lightly refined for local/service SEO.

### Current SEO Copy Direction

Use natural language around:

- Colorado Realtors
- Real estate operations support
- Transaction coordination
- Contract and document support
- Licensed showing coverage
- Monthly real estate operations support

### Important Rule

Do not stuff keywords or add exaggerated SEO claims. Keep the tone calm, professional, and service-based.


---

## Koinonia Deployment Readiness Plan

The Koinonia deployment readiness plan has been documented.

### Current Deployment Direction

- Launch the current Next.js site
- Use a Vercel-style deployment path
- Deployable app is apps/web
- Public routes are /, /services, /about, /contact
- Reynalds OS remains available at /dashboard
- /koinonia routes remain as aliases
- Do not rebuild in Squarespace before launch

### Recommended Vercel Settings

- Root Directory: apps/web
- Install Command: cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @reynalds-os/database db:generate
- Build Command: pnpm build

### Required Launch Follow-Up

- Add production environment variables
- Confirm NEXT_PUBLIC_SITE_URL
- Deploy preview
- Verify public routes and SEO routes
- Connect domain
- Add Google Search Console
- Add analytics
- Review Google Business Profile

---

## Koinonia Header Consultation Footer Modernization

A public-site modernization batch has been completed.

### Current State

- Header and mobile navigation have been modernized
- Mobile nav now uses a floating panel with larger link rows and a consultation CTA
- Contact page now includes a real Schedule a Consultation section at /contact#schedule-consultation
- Consultation options include Transaction Support, Contract & Document Support, Licensed Showing Coverage, Monthly Operations Partnership, and Not Sure Yet
- Consultation availability is currently Monday-Friday, 9:00 AM-5:00 PM
- Schedule a Consultation CTAs should point to /contact#schedule-consultation
- Footer Email, Call, and Text links are styled as clickable pill actions
- Footer verse, verse reference, and copyright are centered

### Next Recommended Visual Step

Modernize the below-hero section and card system so the body of the site feels as current as the header and footer.

---

## Koinonia Body Card Modernization

The first below-hero body modernization pass has been completed.

### Current State

- Body sections and cards now use a softer, more modern visual system
- Card surfaces, spacing, borders, shadows, and hover states have been improved
- Existing content and page structure were preserved
- The extra decorative gold card/section lines were removed after visual review
- Body/card modernization notes live at docs/specifications/KOINONIA_BODY_CARD_MODERNIZATION.md

### Design Rule

Do not reintroduce repeated gold top lines on cards or section headings. Use gold accents sparingly and intentionally.

### Next Recommended Step

Review the site end-to-end on desktop and mobile, then decide whether to start the client portal foundation or continue page-specific visual refinements.

---

## Koinonia Compact Consultation Scheduler

The Contact page consultation flow now uses a compact CTA block and popup scheduler instead of large consultation cards.

### Current State

- `/contact#schedule-consultation` remains the anchor used by Schedule a Consultation links
- The Contact page shows one compact scheduler CTA
- The popup contains the support-type dropdown
- The popup collects name, email, phone, requested weekday date, requested time window, and notes
- Submission route is `/api/koinonia/consultation`
- Default email recipient is jeremiah@koinoniaadmin.com
- Email delivery is prepared for Resend

### Important Production Note

Email delivery will not work live until `RESEND_API_KEY` is configured. The intended provider for this first version is Resend.

### Design Rule

Keep the Contact page scheduler area compact. Do not reintroduce the five large consultation cards or bulky availability header. Keep support-type selection inside the popup.

---

## 2026-07-27 — Koinonia Resend Email Delivery Checkpoint

The Koinonia consultation scheduler has been connected to Resend for outgoing email delivery.

Verified status:

- Resend domain `koinoniatransactions.com` is verified.
- Squarespace DNS contains the required Resend sending records.
- Receiving records were intentionally not enabled because the website only needs outbound consultation-form email.
- Local `.env.local` contains the Resend environment variables and is ignored by Git.
- Live local API test returned success.
- Test email was received at `jeremiah@koinoniaadmin.com`.

Do not commit or expose the Resend API key.

Production deployment note:

Add these environment variables to the hosting platform before testing the deployed consultation form:

- `RESEND_API_KEY`
- `CONTACT_INTAKE_TO_EMAIL`
- `CONTACT_INTAKE_FROM_EMAIL`

---

## 2026-07-27 — Koinonia Public Site Visual Approval

The Koinonia public website has been visually reviewed and approved locally after Resend email setup.

Approved local preview areas:

- Home
- Services
- About
- Contact
- Contact scheduler
- Desktop layout
- Mobile layout

Current status:

- Website routes pass local QA.
- Consultation scheduler works locally.
- Resend email delivery has been tested and received.
- `.env.local` is ignored and must not be committed.
- GitHub was current at the Resend verification checkpoint before this documentation update.

Recommended next step:

Move into launch preparation, final contact/legal/copy review, or deployment prep. Do not start client portal work until the public website launch path is fully confirmed.

---

## 2026-07-27 — Koinonia Launch Contact Values

Public launch contact values are now set in `apps/web/content/brand.ts`.

- Phone: `719-745-8497`
- Text: `719-745-8497`
- Email: `jeremiah@koinoniaadmin.com`
- Website: `https://koinoniatransactions.com`

The active SEO config file is `apps/web/config/seo.config.ts`, not `apps/web/lib/seo.config.ts`.

Before deployment, make sure production environment variables are set on the host and do not commit `.env.local`.

---

## 2026-07-27 — Koinonia Public Launch Verified

The Koinonia public website is live and verified.

### Live URLs

- Primary: `https://www.koinoniatransactions.com`
- Apex redirect: `https://koinoniatransactions.com`
- Scheduler: `https://www.koinoniatransactions.com/contact#schedule-consultation`

### Confirmed Working

- Public pages load on the real domain.
- Apex domain redirects to `www`.
- Scheduler form works on the real domain.
- Resend email delivery from the real domain was confirmed by receipt in `jeremiah@koinoniaadmin.com`.

### Current Deployment

- Vercel project: `reynalds-os-web`
- Production branch: `main`
- Approved launch commit: `ebb9fb8`
- Feature branch also contains the approved launch work: `feature/app-shell-foundation`

### DNS / Squarespace Warning

Squarespace DNS was used for the launch DNS changes and should not be canceled yet. Before discontinuing Squarespace, inventory and migrate all needed DNS records:

- Vercel website records
- Resend DKIM/SPF/MX sending records
- DMARC/security records
- Any remaining domain connection or registrar records

Do not remove Resend records during any future DNS migration.

---

## 2026-09-01 — Koinonia GA4 Implementation Checkpoint

Google Analytics 4 support has been added to the `koinonia-production` branch for the public
Koinonia website only.

### Implementation

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` controls whether Analytics loads.
- The shared Koinonia Header loads the GA4 tag only on public pages when the environment value
  is a valid `G-...` measurement ID.
- Internal Reynalds OS and secure portal routes are excluded.
- A successful consultation request emits `generate_lead` with only the submission method and
  selected service type.
- No consultation-form personal information is transmitted to GA4.

### Verification

- Production build passes.
- With a test measurement ID, public Koinonia routes contain the GA4 tag.
- `/dashboard` does not contain the GA4 tag.
- The production client bundle contains the expected `generate_lead` event.

### Production Activation Completed

- GA4 web stream created for `https://www.koinoniatransactions.com`.
- Measurement ID `G-CNMN80KHQE` configured only in Vercel Production.
- Production deployment `dpl_DHHeV1EgXd2vfezxQx2jeTtDQ1Gd` reached `READY`.
- The live public website exposes the GA4 tag; runtime error scan was clean.
- GA4 data collection is pending Google's initial processing window.

### 2026-09-01 — Stage 1 Marketing Reconciliation

Isolated branch:

`feature/koinonia-stage1-marketing-reconciliation`

The public-site attribution model now preserves original first touch, latest attributable touch,
and conversion touch across campaign visits. Legacy single-session attribution migrates into the
new model. Consultation CRM persistence accepts the richer structure while retaining legacy
compatibility, and `generate_lead` continues to exclude personal information.

Focused validation: 12 attribution/relationship tests pass.

Remaining before Stage 2:

- review and release the attribution correction to `koinonia-production`
- run a controlled live UTM consultation and verify CRM, notification, and GA4 Realtime/DebugView
- configure Facebook, Instagram, and TikTok profiles with the approved tracked destinations
- confirm the named owner for website leads and social comments/DMs
- establish the first weekly marketing dashboard baseline

Do not activate organic publishing, outbound email, brokerage outreach, Meta spend, TikTok paid,
or promotional SMS as part of this Stage 1 reconciliation.
