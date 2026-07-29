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

## 2026-07-29 — Portal Document Version Replacement Added

### Summary

Koinonia staff can now upload a replacement version for an existing portal document while preserving the prior document record for history, audit, and client-file continuity.

### Implemented

- Extended `Document` records with version number, version label, previous-document links, superseded-by links, replacement reason, and superseded timestamp fields.
- Added `/api/portal/documents/[id]/replacement` for staff-only replacement uploads.
- Replacement uploads reuse the private storage and malware-scan gate before any new document record is created.
- Replacing a document marks the old record `Superseded` and creates a new `In Review` record with the next version number.
- Replacement actions write audit history and related work-item timeline history when the document is tied to a work item.
- Added replacement controls to `/employee/documents` for live document records.
- Added focused tests for replacement validation, version-label helpers, and superseded status bucket behavior.

### Current Status

The replacement workflow compiles into the production build and is covered by focused tests. Live replacement verification still requires reachable database storage, configured private upload storage, configured malware scanning, and real provider-backed staff users. In-browser editing, e-signature routing, and final archive delivery remain separate production passes.

---

## 2026-07-29 — Portal Client Document Approval Added

### Summary

Koinonia clients can now respond to documents marked ready for review by approving them or requesting a revision, completing the first real back-and-forth document loop between staff and clients.

### Implemented

- Added safe client document approval validation for approve and revision-request actions.
- Added `/api/portal/documents/[id]/approval` for client-owned document responses.
- Client responses are limited to documents currently marked `Ready for Client Review`.
- Client approvals and revision requests update document status, requested action, timeline history, and audit history.
- Added approval/revision controls to `/client/documents` for live client review documents.
- Added focused tests for client approval validation and sensitive-note rejection.

### Current Status

The approval workflow compiles into the production build and appears in local preview fallback mode. Real saved approvals still require reachable production database storage. External e-signature delivery, document editing/version replacement, and final archive delivery remain separate production passes.

---

## 2026-07-29 — Portal Document Status Workflow Added

### Summary

Koinonia staff can now update uploaded portal documents through a controlled status workflow, giving the employee document workspace a real operating action beyond upload intake and protected downloads.

### Implemented

- Added safe document status-update validation for uploaded, in-review, client-review, revision-requested, approved, sent, and archived states.
- Added `/api/portal/documents/[id]/status` for staff-only document workflow updates.
- Status updates enforce the matching document-workspace permission for approval and sending steps.
- Document status updates write timeline history for related work items and audit events for the document record.
- Added a staff status form to `/employee/documents` for live document records.
- Extended document note filtering to reject payment-card and bank-account language along with credential and access-code language.
- Added focused tests for document status update validation.

### Current Status

The staff document workflow compiles into the production build and the local preview shows the status controls. Real saved updates still require reachable production database storage. Full document version replacement, in-browser editing, e-signature routing, and final archive delivery remain separate production passes.

---

## 2026-07-29 — Portal Work Detail Pages Added

### Summary

Koinonia clients and staff can now open scoped work-item detail pages from their dashboards, giving each active file a focused workspace for status, next action, documents, and timeline history.

### Implemented

- Added shared portal workspace helpers for safe work metadata, document cards, and timeline labels.
- Added `/client/work/[id]` for client-scoped work details.
- Added `/employee/work/[id]` for staff-scoped work details with assignment controls.
- Linked live client and employee dashboard work cards to their detail pages.
- Detail pages show attached documents through the existing protected download route when storage is configured.
- Detail pages show timeline summaries without dumping raw event payloads.
- Added focused tests for safe workspace summary/document/timeline mapping.

### Current Status

Work item detail pages now compile into the production build. Live route testing still needs a reachable production database with real client/staff work records.

---

## 2026-07-29 — Portal Work Assignment Updates Added

### Summary

Koinonia Operations can now assign live portal work items to a primary and backup staff member from the employee dashboard, closing a key production-readiness gap for staff workload routing.

### Implemented

- Added safe assignment validation for portal work item updates.
- Added `/api/portal/work-items/[id]/assignment` with staff-only permission checks.
- Assignment updates validate active same-workspace staff users before saving.
- Assignment changes write timeline and audit events.
- Updated `/employee/dashboard` to load live portal work items and active staff options when storage is reachable.
- Added assignment controls to live dashboard work cards and kept sample preview rows display-only.
- Added focused tests for assignment validation and unsafe note rejection.

### Current Status

Live assignment updates are ready once production storage is reachable. Local preview can still fall back to sample data when Postgres is unavailable.

---

## 2026-07-29 — Portal Launch Proof Recording Added

### Summary

Koinonia staff can now record manual launch proof from the protected launch checklist, so service workflow QA and dry-run checks can move from manual reminder to auditable evidence.

### Implemented

- Added safe launch-proof validation that rejects credentials, access codes, card data, bank details, API keys, and private login details.
- Added `/api/portal/launch-proof` for staff-only proof list/create workflows.
- Launch proof records are stored as portal work objects with timeline and audit events.
- Updated `/employee/launch` with a proof form and latest-proof display for manual checklist items.
- Completed proof now marks manual launch checks ready; follow-up proof marks them as needing attention.
- Added focused tests for proof validation, stored proof display normalization, and checklist proof status mapping.

### Current Status

Manual proof can now be recorded once production storage is reachable. Local preview still cannot persist proof because local Postgres is not running.

---

## 2026-07-29 — Portal Launch Checklist Live Status Added

### Summary

The portal launch checklist now pulls from the same live readiness report as `/employee/readiness`, so staff can distinguish automated Ready, Needs Attention, Blocked, and Manual Proof Needed launch items.

### Implemented

- Extracted current portal readiness loading into a shared server helper.
- Updated `/employee/readiness` and `/employee/launch` to use the same readiness source.
- Added live status mapping for provider, database, document storage, billing/payment, social login, and AI gates.
- Kept service workflow QA, full verifier proof, and end-to-end dry-run proof as manual staff evidence.
- Added focused tests for live status mapping and blocked readiness propagation.

### Current Status

The checklist is now a better oversight surface for testing, but production launch still requires real environment configuration and staff-recorded proof for dry runs and service workflow validation.

---

## 2026-07-29 — Portal Launch Checklist Added

### Summary

Koinonia staff now have a protected launch checklist that translates the production login, service workflow, document, billing, optional social-login, optional AI, and live-verification requirements into one review surface.

### Implemented

- Added a shared portal launch checklist model with required and optional launch gates.
- Added `/employee/launch` as a protected staff-only launch checklist page.
- Linked the checklist from the employee entry, employee dashboard, and readiness view.
- Added checklist coverage for Transaction Support, Contract & Document Support, Licensed Showing Coverage, and Monthly Operations Partnership workflows.
- Added focused tests for required verifier coverage, optional AI/social gates, service workflow coverage, and summary counts.
- Updated the auth production-readiness specification and robots exclusions.

### Current Status

This gives staff a clearer launch runbook, but production launch still depends on real Clerk configuration, production database verification, private document storage, processor-hosted payment capture, accepted client/staff invites, and an end-to-end dry run.

---

## 2026-07-29 — Reynalds Brothers Job Controls Expanded

### Summary

The Reynalds Brothers job detail update form now exposes the operational fields staff need to manage ACC, UCO, and Pressure Washing work without editing raw data.

### Implemented

- Added editable controls for approval, approved-by, Lucernex link, PO number/status, permit status/dates, tank status, oil-removal status, CompanyCam link, pressure-washing vendors, completion date, billing approval, customer update, and next action.
- Preserved existing Work Item data when saving targeted updates.
- Added validation coverage for expanded job-control update fields.
- Updated the Reynalds Brothers Work Item object documentation.

### Current Status

This gives staff a broader manual control surface. The next production pass should add field-level audit history and stronger workflow permissions for approval and billing status changes.

---

## 2026-07-29 — Reynalds Brothers Smart Checklist Automation Added

### Summary

Reynalds Brothers checklist completion can now update related operational status fields so checked work reduces manual double-entry and clears matching red flags.

### Implemented

- Added checklist automation for PO, permit, tank, oil-removal, pressure-washing vendor, media, completion, billing, and phase status fields.
- Updated checklist toggles to save automated Work Item data and status.
- Strengthened red-flag rules so completed checklist evidence can clear matching blockers.
- Added focused tests for automated UCO, Pressure Washing, billing, and checklist status behavior.
- Updated the Reynalds Brothers Work Item object documentation and changelog.

### Current Status

This is a useful operational helper, but production use should still add timeline/audit events for checklist changes and staff ownership on each checklist item.

---

## 2026-07-29 — AI Review Launch Controls Added

### Summary

Koinonia AI review now has explicit readiness controls so staff-assistive AI cannot be marked ready without provider configuration, approved prompts, privacy rules, citations, audit logging, and human approval.

### Implemented

- Added AI review launch-control fields to the shared portal readiness report.
- Updated `/employee/readiness` to read AI control flags from production environment settings.
- Updated `pnpm verify:portal` so optional AI review stays non-blocking when off, but blocks if enabled without required safeguards.
- Added readiness tests for blocked and ready AI review states.
- Updated the auth production-readiness specification.

### Current Status

The Staff Review Center remains rules-based. AI review should stay disabled until Koinonia has approved prompts, privacy boundaries, source citations, audit events, and human approval policy for staff-facing recommendations.

---

## 2026-07-29 — Reynalds Brothers Job Checklists Added

### Summary

Reynalds Brothers work items now have job-specific checklists so required ACC, UCO, and Pressure Washing steps can be tracked directly on the operations dashboard.

### Implemented

- Added checklist templates for ACC Level 1, ACC Level 2, ACC Tank Replacement, DIY Only, UCO Tank Replacement, and Pressure Washing.
- Added checklist completion storage on Work Item data.
- Added checklist progress and open-item red flags to the Work Item engine.
- Added saveable checklist toggles to the Reynalds Brothers dashboard.
- Updated Reynalds Brothers object documentation and changelog.
- Added focused tests for checklist selection, progress, and phase-track mapping.

### Current Status

This is still local application state backed by Work Item data. The next production pass should add staff ownership, due dates, audit events for checklist changes, and a clearer approval workflow before checklist completion is used for billing release.

---

## 2026-07-29 — Social Login Readiness Gate Added

### Summary

Koinonia can support Google or Microsoft social login through Clerk, but enabled OAuth providers now require explicit invite-matching verification before launch.

### Implemented

- Added approved-provider and invite-matching checks to the live readiness page.
- Updated `pnpm verify:portal` so optional social login stays non-blocking when off, but becomes blocking if enabled without approved providers or tested invite matching.
- Added readiness tests for half-configured social login and verified social login.
- Documented the required social-login environment flags.

### Current Status

Social login is still appropriate for Realtor clients and staff, but it should stay off until Clerk OAuth setup is complete and one invited client plus one invited staff user have tested social sign-in.

---

## 2026-07-29 — Portal Invite Acceptance Gate Added

### Summary

Koinonia login readiness now requires proof that both client and staff invitation paths have worked with real accepted invites.

### Implemented

- Added accepted client and accepted staff invitation counts to the live readiness page.
- Added an invite acceptance readiness gate to the Data group on `/employee/readiness`.
- Updated `pnpm verify:portal` to fail full production verification until one client invite and one staff invite have been accepted.
- Added a readiness test for missing staff invite acceptance.
- Updated auth production-readiness documentation.

### Current Status

This keeps the portal from being called login-ready based only on environment variables and seeded roles. A production launch still needs real Clerk invite emails accepted by one client test user and one staff test user.

---

## 2026-07-29 — Payment Processor Readiness Gate Added

### Summary

Koinonia portal readiness now treats payment setup as blocked until an approved processor, public HTTPS setup URL, and webhook secret are configured.

### Implemented

- Added a Billing group to `/employee/readiness`.
- Added readiness checks for `KOINONIA_PAYMENT_PROCESSOR_PROVIDER`, `KOINONIA_PAYMENT_SETUP_URL`, and `KOINONIA_PAYMENT_WEBHOOK_SECRET`.
- Updated `pnpm verify:portal` to enforce payment processor setup readiness.
- Added tests for missing payment setup and non-public setup URLs.
- Updated auth readiness and billing/payment specifications.

### Current Status

The portal still stores only billing setup metadata. Live payment method collection and payment status should remain processor-hosted and webhook-verified before real billing operations are treated as production-ready.

---

## 2026-07-29 — Portal Upload Storage Path Hardened

### Summary

Koinonia document uploads now require an absolute private storage path before live upload controls are treated as configured.

### Implemented

- Added shared validation for `PORTAL_DOCUMENT_UPLOAD_DIR`.
- Updated the document upload API to reject missing or relative upload roots.
- Updated client and employee document workspaces to use the same storage readiness check.
- Updated the live readiness page and `pnpm verify:portal` to require an absolute upload directory.
- Added tests for document upload root validation and readiness blocking.

### Current Status

Document uploads still require a real private storage location and malware scanner on the production host before Koinonia should accept real client files.

---

## 2026-07-29 — Clerk Production Key Readiness Hardened

### Summary

Koinonia portal readiness now rejects placeholder, example, fake, or test-shaped Clerk keys instead of treating any non-empty value as production-ready.

### Implemented

- Updated the live readiness view to require production-shaped Clerk keys.
- Updated `pnpm verify:portal` to fail placeholder or non-production Clerk keys.
- Added readiness tests for placeholder/test key blocking.
- Documented the production key expectation in the auth readiness specification.

### Current Status

This makes the login checklist safer, but real Clerk production keys still need to be configured in the deployment environment and verified with live invite acceptance.

---

## 2026-07-29 — Portal Role Permission Seed Hardened

### Summary

Koinonia portal role seed data now stores each approved role's permission list, and readiness checks can flag roles that exist without permissions.

### Implemented

- Updated the database seed to write permissions from the shared auth package.
- Added the auth package as the database package's local workspace dependency.
- Strengthened `pnpm verify:portal` to check seeded role permission lists.
- Extended the live readiness view and tests to report missing role permissions.

### Current Status

This improves production verification for role-based access. A real database seed and full verifier run are still required in the production environment before live portal login.

---

## 2026-07-29 — Koinonia Staff Review Center Added

### Summary

Koinonia staff now have a protected review center for spotting the operational gaps that AI should eventually help summarize: missing assignments, missing client links, missing next actions, document review/storage gaps, billing consent issues, delegated access needs, showing authorization, and stale work.

### Implemented

- Added `/employee/review` as a staff-only review workspace.
- Added `employee-portal:reviews:view` to the permission model for Owner, Operations, Transaction Coordinator, Contract Support, and Customer Success.
- Added a shared `buildStaffReviewReport` helper with critical, attention, monitor, and clear statuses.
- Added unit tests for review rules covering assignments, showings, billing setup, documents, and clear work.
- Linked the Staff Review Center from the employee portal entry and employee dashboard.
- Updated the readiness view so rules-based staff review is separate from future AI-provider readiness.
- Updated the employee portal spec, auth readiness notes, module map, and robots exclusions.

### Current Status

The Staff Review Center is rules-based and safe for preview. A future AI layer should summarize and prioritize these findings only after production privacy controls, citations, audit events, and human approval gates are verified.

---

## 2026-07-29 — Koinonia Portal Readiness View Added

### Summary

Koinonia staff now have a protected live readiness view for monitoring portal production progress across login, database, document handling, workflow safety, social login readiness, and AI review gates.

### Implemented

- Added `/employee/readiness` as a staff-only portal oversight page.
- Added a shared readiness report builder with ready, attention, and blocked status groups.
- Added current environment and database readiness checks without exposing secret values.
- Added social login guidance as an invitation-gated Clerk configuration gate.
- Added AI review guidance that keeps Copilot read-only until privacy, citation, audit, and approval safeguards are verified.
- Added unit tests for readiness status logic.
- Linked the readiness page from the employee portal entry and module map.

### Current Status

The readiness view is a live source-and-environment oversight surface. True production readiness still requires real Clerk production keys, OAuth provider setup, full database verifier pass, private document storage, malware scanner configuration, real client/staff invite testing, and AI checklist reviewer implementation.

---

# 2026-07-29 — Reynalds Brothers Operations Workspace

## Objective

Promote Reynalds Brothers from a simple dashboard concept into a distinct company operations workspace inside Reynalds OS, separate from Koinonia.

## Completed

- Added a dedicated Reynalds Brothers route at `/reynalds-brothers`.
- Added a dedicated Work Item API at `/api/reynalds-brothers/work-items`.
- Added Work Item create/update actions and timeline events for company-scoped Work Items.
- Added Work Item intake and selected-item update controls to the Reynalds Brothers workspace.
- Added email intake classification for filing emails under Work Items, creating new Work Items from email, or holding ambiguous emails for review.
- Added Communication object documentation and email intake API/UI.
- Added a Work Item engine helper for lanes, metrics, location formatting, crew readiness, and documentation readiness.
- Added focused tests for the Work Item engine.
- Updated the Reynalds OS workspace registry to point Reynalds Brothers to its own company route.
- Updated the Reynalds Brothers company Brain, README, object spec, and changelog.

## Known Issues

- This is the first operations workspace slice. Gmail/Outlook ingestion, media uploads, document storage, task assignment, and billing closeout actions still need live workflows.
- The repository had unrelated active Koinonia portal changes during this work; avoid mixing those changes into a Reynalds Brothers commit unless intentionally bundling a larger checkpoint.

## Recommended Next Step

Connect Gmail or Outlook ingestion to `/api/reynalds-brothers/email-intake`, then add monitoring for stale email threads, unanswered customer/vendor questions, and Work Items stuck in planning.

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

---

## 2026-07-29 — Portal Invitation API Scaffolded

### Summary

An internal API route was added for creating and reviewing Koinonia portal invitation records before the Clerk email-sending integration is connected.

### Implemented

- Added `/api/portal/invitations`.
- `GET` lists invitation records for the current workspace.
- `POST` creates invitation records for approved Koinonia role names.
- Duplicate pending invitations for the same email are blocked.
- Optional client object links are checked against the current workspace.
- Invitation creation writes an `AuditEvent`.

### Current Status

The route creates the Koinonia invitation record only. It does not yet create or send the Clerk invitation, enforce staff MFA, or complete client onboarding.

### Verification Note

The local Docker daemon was not running, so Postgres could not be started for full create/list verification. The route was verified to compile and to return clean 503 responses when invitation storage is unavailable.

---

## 2026-07-29 — Employee Access Workspace Preview Added

### Summary

A protected employee access workspace preview was added so Koinonia staff have a clear future place to review portal invitations, staff MFA readiness, client portal readiness, and access guardrails.

### Implemented

- Added `/employee/access`.
- Protected the route with `employee-portal:assignments:update`, limiting access to Owner and Operations roles.
- Added sample invitation, staff access, client readiness, setup flow, and access rule views.
- Linked the access workspace from the employee entry page and employee dashboard.

### Current Status

The page is sample data only. Real invite sending, staff MFA verification, provider invitation creation, and live database-backed access changes still remain before production portal login can accept real clients or staff.

---

## 2026-07-29 — Portal API Auth Errors Standardized

### Summary

Portal API auth and configuration failures now return clear JSON responses instead of relying on generic route errors.

### Implemented

- Added a shared API auth error response helper.
- Updated `/api/me` to use the shared helper while preserving its `{ user: null, error }` response shape.
- Updated `/api/portal/invitations` so missing authentication or auth-provider configuration problems return clean JSON status responses.
- Added unit coverage for the shared API auth response helper.

### Current Status

Invitation creation still requires a live database and the future managed-provider invitation-sending integration before it can be used for real client or staff onboarding.

---

## 2026-07-29 — Clerk Provider Invitation Handoff Scaffolded

### Summary

The portal invitation API can now bridge an approved Koinonia invitation record to Clerk's invitation email flow when explicitly requested.

### Implemented

- Added provider invitation payload construction with Koinonia role, workspace, client object, and service metadata.
- Added optional `sendProviderInvitation` support to `/api/portal/invitations`.
- Kept the Koinonia invitation record as the first source of truth before attempting provider email delivery.
- Added provider sent and provider error audit events.
- Marked invitations as `provider_pending`, provider status, or `provider_error` depending on the send outcome.
- Added unit coverage for provider invitation payloads and expanded invitation validation.

### Current Status

The provider handoff compiles and is covered at the payload/validation level. It still needs live Clerk keys and a running database before a real invitation email can be sent end to end.

---

## 2026-07-29 — Invitation Acceptance Bridge Added

### Summary

Managed-provider sign-in can now bridge a matching Koinonia invitation into an active portal user record on first login.

### Implemented

- When a Clerk user has no existing Koinonia user record, auth checks for a pending, provider-pending, or accepted invitation with the same email.
- Matching invitations can create the Koinonia `User`, attach the approved workspace role, require MFA for staff roles, and mark the invitation accepted.
- Missing workspace roles are created from the approved Koinonia role permission map.
- Invitation acceptance writes an `AuditEvent`.

### Current Status

This bridge compiles, but it still needs a running database and live Clerk user acceptance test before production login is marked ready.

---

## 2026-07-29 — Pending Clerk Sessions Treated as Signed Out

### Summary

Server-side Clerk auth now explicitly treats pending sessions as signed out, supporting production Clerk tasks such as required MFA setup.

### Implemented

- Updated server auth lookup to pass `treatPendingAsSignedOut: true`.
- Documented that staff MFA still must be configured in Clerk before real employee portal access is enabled.

### Current Status

The source is ready to respect pending-session blocking, but real MFA enforcement still depends on Clerk production policy configuration and live verification.

---

## 2026-07-29 — Koinonia Portal Roles Seeded

### Summary

The database seed now creates the approved Koinonia role names used by portal invitations and first-login user acceptance.

### Implemented

- Added seed records for Owner, Operations, Transaction Coordinator, Contract Support, Showing Provider, Customer Success, Finance, Viewer, and Client.
- Kept live permission behavior in the auth package; the seed provides stable role records for database assignment.

### Current Status

The seed compiles. It still needs to be run against a live database once the local or production Postgres environment is available.

---

## 2026-07-29 — Provider Email Matching Hardened

### Summary

Provider-backed portal access now fails closed when Clerk does not expose an email address, and invitation acceptance no longer creates users from already-accepted invitation records.

### Implemented

- Removed the `unknown@example.com` fallback from Clerk user mapping.
- Required a real provider email before database user matching or invitation acceptance.
- Limited first-login invitation acceptance to pending and provider-pending invitations.

### Current Status

This prevents unsafe invitation matching, but live provider-user testing is still required before production portal login is marked ready.

---

## 2026-07-29 — Portal Production Readiness Verifier Added

### Summary

A repeatable portal readiness command was added so production login can be checked against real environment variables and database state before client or staff data is accepted.

### Implemented

- Added `pnpm verify:portal`.
- Verifies `AUTH_PROVIDER=clerk`, required Clerk keys, `DATABASE_URL`, and that mock auth is not enabled.
- Verifies database connectivity, Koinonia workspace presence, and approved portal role seed records when database access is available.
- Added a `--skip-database` mode for source-only verification.

### Current Status

The command is ready, but local Docker/Postgres access is still blocked in this sandbox. Run the full command against a reachable local or production database before marking login production-ready.

---

## 2026-07-29 — Portal Invitation Revocation API Added

### Summary

Koinonia can now revoke unaccepted portal invitation records through a protected API route before an invited user receives active access.

### Implemented

- Added `/api/portal/invitations/:id/revoke`.
- Limited revocation to pending, provider-pending, and provider-error invitations.
- Prevented accepted invitations from being revoked through the invitation endpoint; accepted users should be deactivated through user access controls instead.
- Added invitation revocation audit logging.
- Added unit coverage for revokable invitation statuses.

### Current Status

The route compiles and the status logic is covered. Live database verification still requires reachable Postgres.

---

## 2026-07-29 — Portal User Deactivation API Added

### Summary

Koinonia can now deactivate accepted portal users through a protected API route, giving the login system a revocation path after invitation acceptance.

### Implemented

- Added `/api/portal/users/:id/deactivate`.
- Sets user `status` to inactive, `portalAccessStatus` to deactivated, and records `deactivatedAt`.
- Blocks self-deactivation.
- Returns already-inactive users idempotently.
- Writes a `portal.user.deactivated` audit event.
- Added unit coverage for deactivation guard behavior.

### Current Status

The route compiles and guard behavior is covered. Live database verification still requires reachable Postgres.

---

## 2026-07-29 — Portal User Listing API Added

### Summary

A protected portal user listing API was added so operations staff can review user access status before deactivation or audit review.

### Implemented

- Added `/api/portal/users`.
- Requires `employee-portal:staff:view`.
- Returns safe user access fields, MFA requirement, login timing, deactivation timing, and role name.
- Supports optional `status` and `portalAccessStatus` filters.

### Current Status

The route compiles. Live database verification still requires reachable Postgres.

---

## 2026-07-29 — Portal Auth Environment Template Clarified

### Summary

The environment template and deployment readiness notes now make the mock-auth production boundary explicit.

### Implemented

- Added `ROS_ALLOW_MOCK_AUTH=false` to `.env.example`.
- Added local mock user identity variables to `.env.example`.
- Updated portal auth and deployment readiness notes to require mock auth disabled before real portal access.
- Added `pnpm verify:portal` to deployment readiness notes.

### Current Status

Environment templates are clearer. Real deployment variables still need to be set in the deployment host.

---

## 2026-07-29 — Clerk MFA Task Route Added

### Summary

Koinonia now hosts Clerk's `setup-mfa` session task route so staff can complete required multi-factor setup inside the app before entering protected portal areas.

### Implemented

- Added Clerk `taskUrls` configuration for `setup-mfa`.
- Added `/session-tasks/setup-mfa`.
- Rendered Clerk's `TaskSetupMFA` component when the publishable key is configured.
- Added a safe fallback when Clerk keys are absent.

### Current Status

The task route compiles. Clerk production policy must still require staff MFA and live testing must confirm pending sessions are routed through this page.

---

## 2026-07-29 — Employee Access Workspace Connected To Portal Records

### Summary

The employee access workspace now has a live-data path for portal users, invitations, staff MFA readiness, and client access readiness.

### Implemented

- Added tested access-status helpers for portal user and invitation summaries.
- Connected `/employee/access` to Koinonia portal users and portal invitation records.
- Added live summary counts for pending invites, MFA-required staff, active access, and blocked records.
- Added live staff access and client readiness rows.
- Kept a safe sample-data fallback when production storage is unavailable in preview.

### Current Status

The access workspace compiles and remains protected by `employee-portal:assignments:update`. Live database verification is still blocked until the local or deployed database is reachable.

---

## 2026-07-29 — Employee Portal Invitation Form Added

### Summary

The employee access workspace now includes a protected invitation form so approved staff can create portal invitations from the workspace instead of calling the API manually.

### Implemented

- Added a client-side invitation form to `/employee/access`.
- Captures name, email, role, client/team label, service package, billing readiness, and whether to send the managed login invite immediately.
- Sends invitation requests to `/api/portal/invitations`.
- Refreshes the access workspace after a successful invite.
- Disables the form when production storage is unavailable in preview.

### Current Status

The form compiles and uses the existing protected invitation API. Live send testing still requires reachable database storage and configured Clerk provider keys.

---

## 2026-07-29 — Employee Access Actions Added

### Summary

The employee access workspace now exposes protected revoke and deactivate actions for access operations that already exist in the portal API.

### Implemented

- Added reusable client action button for protected portal access operations.
- Added revoke controls for unaccepted invitation records.
- Added deactivate controls for active staff portal users.
- Hid self-deactivation in the UI while keeping the API-level guard.
- Refreshed the access workspace after successful access changes.

### Current Status

The UI action layer compiles and calls the existing protected APIs. Live mutation verification still requires reachable database storage.

---

## 2026-07-29 — Portal Access Audit Trail Added

### Summary

Koinonia now exposes recent portal access history through a protected audit API and displays the latest access events in the employee access workspace.

### Implemented

- Added `/api/portal/audit`.
- Limited audit results to portal access actions.
- Added tested audit helper functions for action filtering, limit handling, and display labels.
- Added a recent access history panel to `/employee/access`.
- Kept a safe preview fallback when storage is unavailable.

### Current Status

The audit API and access history panel compile. Live audit verification still requires reachable database storage.

---

## 2026-07-29 — Portal Readiness Verifier Strengthened

### Summary

The production readiness verifier now checks the database for the minimum owner and staff MFA conditions required before portal login is treated as ready for real client data.

### Implemented

- Updated the seed owner to require MFA and remain portal-active.
- Added verifier check for at least one active Owner portal user.
- Added verifier check that active staff portal users require MFA.
- Updated production readiness notes.

### Current Status

The new database checks run when `pnpm verify:portal` is executed without `--skip-database`. Live verification still requires reachable database storage.

---

## 2026-07-29 — Portal Verifier Added To CI

### Summary

CI now runs the portal readiness verifier in source-only mode so changes that break the verifier fail before merge.

### Implemented

- Added `pnpm verify:portal -- --skip-database` to the GitHub Actions workflow.
- Used placeholder Clerk and database environment values in CI.
- Kept live database checks out of CI because production database verification must run against the target environment.

### Current Status

CI now covers the verifier command shape. Production readiness still requires running `pnpm verify:portal` without `--skip-database` against real deployment configuration.

---

## 2026-07-29 — Portal Showing Request Workflow Added

### Summary

Koinonia now has a protected showing request workflow for client scheduling and licensed showing coverage requests.

### Implemented

- Added dedicated client showing permissions.
- Added `/api/portal/showing-requests`.
- Stores showing requests as `ShowingRequest` objects with timeline and audit history.
- Added validation that blocks private access secrets in general request notes.
- Added a client showing request form to `/client/dashboard`.
- Connected the client showing list to live request records with sample fallback.
- Added employee dashboard visibility for the showing request queue, limited to assigned-work roles.

### Current Status

The showing request workflow compiles and is covered by helper tests. Live mutation verification still requires reachable database storage and real provider-backed users.

---

## 2026-07-29 — Portal Document Upload Intake Added

### Summary

Koinonia now has a guarded document upload intake path for client-submitted transaction documents and staff review.

### Implemented

- Extended document records with owner, uploader, storage, file metadata, requested action, notes, access level, update, and archive fields.
- Added `/api/portal/documents`.
- Added upload validation for allowed document/image types, 25 MB size limit, generated storage names, and credential-note rejection.
- Added a client document upload form to `/client/documents`.
- Connected client recent uploads and employee upload intake queue to live document records with sample fallback.
- Updated the production readiness verifier to require `PORTAL_DOCUMENT_UPLOAD_DIR` for live document uploads.

### Current Status

The first document intake slice is source-backed and guarded. Live upload verification still requires reachable database storage, a configured upload directory, and real provider-backed users. Secure download handlers, malware scanning, version replacement, draft approval, send-package routing, and final archive delivery remain future production slices.

---

## 2026-07-29 — Portal External Access Requests Added

### Summary

Koinonia now has a protected external access request workflow that records what access is needed without turning the portal into a credential vault.

### Implemented

- Added client permission to submit access request updates.
- Added `/api/portal/access-requests`.
- Stores access requests as `AccessRequest` objects with timeline and audit history.
- Added validation that rejects passwords, usernames, passcodes, recovery codes, and private login details in access notes.
- Added a safe access update form and live/fallback access list to `/client/dashboard`.
- Added an external access request queue to `/employee/access`.

### Current Status

The access request workflow compiles and is covered by helper and permission tests. Live mutation verification still requires reachable database storage and real provider-backed users. This workflow stores metadata and status only; it intentionally does not store third-party credentials.

---

## 2026-07-29 — Portal Billing Setup Requests Added

### Summary

Koinonia now has a protected billing setup request workflow that records billing intent, service billing model, consent status, and next action without turning the portal into a card data vault.

### Implemented

- Added `/api/portal/billing-setup-requests`.
- Stores billing setup requests as `BillingSetupRequest` objects with timeline and audit history.
- Added validation that rejects card numbers, CVV/CVC, bank details, routing numbers, account numbers, payment passwords, processor secrets, and API keys in billing notes.
- Added a client billing setup request form to `/client/billing`.
- Connected the client billing setup list to live request records with sample fallback.
- Added an employee billing setup request queue to `/employee/billing`.
- Updated portal specifications, auth readiness notes, and the module map for the metadata-only billing setup slice.

### Current Status

The billing setup request workflow compiles and is covered by helper tests. Live mutation verification still requires reachable database storage and real provider-backed users. This workflow stores billing setup metadata only; card collection, saved payment methods, invoice payment, charge capture, refunds, disputes, and processor webhooks still require an approved payment processor integration.

---

## 2026-07-29 — Portal Document Downloads Added

### Summary

Koinonia now has an authorized document download path so uploaded portal files can be served through the application instead of exposing private storage directly.

### Implemented

- Added `/api/portal/documents/[id]/download`.
- Requires client document view or document-workspace permission before serving a file.
- Limits client downloads to documents owned by that signed-in client.
- Limits staff downloads to documents in the staff user's workspace.
- Validates storage keys to reject missing, absolute, traversal, or malformed file references.
- Serves files from `PORTAL_DOCUMENT_UPLOAD_DIR` only, with private no-store response headers.
- Records a `portal.document.downloaded` audit event.
- Added client and employee document page links when storage is configured and a document has a stored file key.

### Current Status

Authorized downloads compile and are covered by helper tests. Live verification still requires reachable database storage, configured upload storage, and real provider-backed users. Malware scanning, document replacement/versioning, approval records, e-signature delivery, and final archive delivery remain future production slices.

---

## 2026-07-29 — Portal Document Malware Scan Gate Added

### Summary

Koinonia document uploads now fail closed unless an approved malware scanner command is configured, preventing the portal from accepting live transaction files into private storage without a scan step.

### Implemented

- Added `PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND` as a production upload requirement.
- Requires the scanner command to be an absolute executable path.
- Runs the configured scanner command against the stored upload before creating the document record.
- Removes the stored file if scanning, database persistence, or audit creation fails before the document is persisted.
- Keeps the client upload form disabled until both private storage and malware scanning are configured.
- Updated the production readiness verifier to check the scanner command in live verification mode.
- Updated client portal, auth readiness, and document workspace specifications.

### Current Status

Scanner-gated uploads compile and are covered by helper tests. Live verification still requires a configured scanner executable, reachable database storage, configured upload storage, and real provider-backed users. Document replacement/versioning, approval records, e-signature delivery, and final archive delivery remain future production slices.

---

## 2026-07-29 — Client Dashboard Work Items Connected

### Summary

The client dashboard current-work list now has a live read path for client-owned work records instead of relying only on sample support cards.

### Implemented

- Added client-facing work item display helpers for object type labels, status buckets, due labels, and summary counts.
- Added helper tests for work item labels, status buckets, due labels, and dashboard summary counts.
- Connected `/client/dashboard` current support cards to owned `RosObject` work records when database storage is reachable.
- Kept sample fallback when storage is unavailable.
- Updated dashboard copy, module map, client portal specification, and auth readiness notes.

### Current Status

Client dashboard work-item reads compile and are covered by helper tests. Live verification still requires reachable database storage and real provider-backed users with client-owned work objects. Work-item detail pages, client-visible history, staff assignment mutation, and employee assignment queue persistence remain future production slices.

---

## 2026-07-29 — RosObject Portal Assignment Fields Added

### Summary

Koinonia work records now have explicit fields for client visibility and staff assignment, reducing the risk of one generic owner field being used for both client access and internal responsibility.

### Implemented

- Added `clientUserId`, `clientObjectId`, `assignedStaffUserId`, and `backupStaffUserId` to `RosObject`.
- Added database migration indexes for client visibility and staff assignment lookups.
- Updated object create/update validation and object creation to pass assignment fields.
- Updated showing, access, and billing setup request APIs to populate `clientUserId` for client-created records and `assignedStaffUserId` for staff-created records.
- Updated client-facing portal reads to use `clientUserId` with backward-compatible `ownerId` fallback.
- Updated client, employee, and auth readiness specifications.

### Current Status

The assignment fields compile after Prisma client generation and are covered by validation tests. Employee assignment mutation, assignment history, staff capacity logic, and client account ownership screens remain future production slices.
