# Current Priorities

## Active Phase

Koinonia Production Website

---

# Primary Objective

Complete and launch the Koinonia website as the first production application built on Reynalds OS.

All development should support this objective unless a platform improvement directly accelerates website production.

---

# Repository Status

Current State:

Production website under active development.

Repository architecture is established.

Core Brain documentation is established.

GitHub workflow is established.

Component architecture is established.

Hero Image System is established.

Current emphasis is implementation, refinement, and launch.

---

# Current Production Milestones

## ✅ Completed

- Repository architecture established
- Brain documentation established
- Canonical Registry established
- Decision Log established
- Development Standards established
- Hero Composition Standard established
- Koinonia Image System established
- Shared content architecture established
- Component-first website architecture established
- Desktop and mobile hero system completed for:
  - Home
  - About
  - Services
  - Contact
- Hero imagery implemented in React
- Production build verified
- GitHub workflow established and verified

---

## Active Work

Current source focus:

Portal login production readiness for client and employee access has been advanced locally, but remains pre-live until Clerk production keys, staff MFA, database-backed invitation tests, and real provider user verification are complete.

Complete the production pages.

Current page order:

1. Home
2. Services
3. About
4. Contact
5. Pricing
6. FAQ
7. Launch QA

---

# Current Development Workflow

Every production task follows this sequence:

1. Understand the request.
2. Review existing implementation.
3. Recommend improvements if appropriate.
4. Explain planned work.
5. Wait for approval.
6. Implement.
7. Verify localhost.
8. Verify production build.
9. Commit.
10. Push to GitHub.
11. Update Brain only if a meaningful architectural discovery occurred.

---

# Development Philosophy

The repository should grow through refinement rather than reinvention.

Always:

- recover before reinventing
- reuse before replacing
- extend before creating

The existing architecture should be strengthened, not restarted.

---

# Platform Development Rule

Operating system work is now secondary.

Platform improvements should occur only when they:

- remove repeated work,
- solve an architectural limitation,
- accelerate Koinonia production, or
- improve long-term maintainability.

Do not interrupt website production for speculative platform development.

---

# Immediate Next Tasks

1. Refine Home page sections.
2. Complete Services page.
3. Complete About page.
4. Complete Contact page.
5. Build Pricing page.
6. Complete responsive polish.
7. QA every page.
8. Launch.

---

# Success Criteria

The current milestone is achieved when:

- Every public page is production quality.
- Desktop and mobile experiences are complete.
- All pages use the shared component architecture.
- Hero system is consistent across the site.
- Production build passes.
- Changes are committed and pushed to GitHub.

Only then should focus shift back toward broader Reynalds OS expansion.

---

# 2026-08-03 Portal Priority Update

## Active Portal Objective

Move the Koinonia client and employee portals from guarded source-backed workflows into verified production operation.

## Recently Completed

- Persisted playbook deadlines
- Centralized service-cue construction
- Persisted queue and risk metadata
- Persisted-playbook client service cues
- Playbook-driven client document requests
- Client dashboard playbook requests
- Live send-package visibility
- Live-record client billing services
- Live-record employee billing queues
- Pay-at-close billing watch
- Payment webhook URL verification
- Production portal environment-gate documentation
- Stripe webhook handling
- Cloudflare R2 document-storage readiness enforcement
- Pre-R2 malware scanning for document uploads and replacements
- Delivery-confirmation gating for sent, signature-monitoring, and completed document send packages
- Local production-provider configuration for Clerk, Stripe, and Cloudflare R2
- Local portal readiness verifier advanced past infrastructure/provider gates
- Local database seed restored approved portal roles, role permissions, Owner user, and staff MFA readiness

## Immediate Priorities

1. Create and accept one real client invite and one real staff invite in the Koinonia portal flow.
2. Record the six required launch proof records from `/employee/launch`.
3. Rerun `pnpm verify:portal` with local database access and confirm only real operational gates remain, or that the verifier passes.
4. Mirror the verified Clerk, Stripe, and Cloudflare R2 environment values into the production deployment provider through secret-management UI, not Git.
5. Verify Stripe webhook delivery with approved production configuration.
6. Reconcile webhook events into canonical billing and audit records.
7. Complete database-backed portal workflow testing.
8. Verify provider-backed client and employee identities.
9. Run controlled end-to-end testing for documents, assignments, billing, send-package delivery, and payment events.
10. Preserve focused commits and update the Brain at the end of each meaningful completed slice.

## Production Boundary

Do not describe the portal as production ready merely because source code, helper tests, or webhook routes exist.

Production readiness requires verified infrastructure, real provider configuration, live database behavior, controlled payment-event delivery, access isolation, and end-to-end operational evidence.

The active mission remains Koinonia production completion. Portal work should continue only as production-readiness work tied to real client/employee access and operational safety, not as speculative platform expansion.

---

# 2026-08-07 Portal Billing Priority Update

## Recently Completed

- Real provider-user production-readiness gate for active Clerk-linked client and staff identities.
- Direct runtime tests for provider-user database derivation.
- Canonical Object Engine schemas for `CustomerBillingProfile`.
- Canonical Object Engine schemas for `ServiceActivation`.

## Immediate Portal Billing Priority

1. Persist canonical billing profiles and service activations through live portal workflows with correct customer ownership.
2. Require explicit customer/client targeting for staff-created billing setup work.
3. Add the processor customer/payment-method reference layer.
4. Create the Stripe-hosted setup flow with Koinonia workspace/request metadata.
5. Verify real Stripe webhook delivery and database reconciliation.
6. Complete controlled client/staff billing QA before accepting live payment methods.

The Stripe account itself does not need to be recreated. Local Stripe configuration is already present; remaining work is application linkage, production deployment configuration, and live operational proof.

---

# 2026-08-07 Koinonia Production Release Priority

## Immediate Production Objective

Establish an isolated, cumulative Koinonia production release line before publishing the approved `/jeremiah` digital business card.

Verified production state:

- Live public Koinonia is still pinned by Vercel Instant Rollback to commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
- Current `main` is `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` and includes the approved digital business card, but `main` also includes unrelated repository work that must not be promoted as a Koinonia release.
- Koinonia portal development remains on `chatgpt/portal-access-status` and is pre-live. It must not be promoted directly to the public domain.

Approved next release sequence:

1. Create permanent branch `koinonia-production` from the currently live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
2. Add only the four approved business-card files.
3. Verify an isolated Vercel preview, including existing public routes and `/jeremiah`.
4. Stop for approval before changing production domain routing or undoing the existing rollback.
5. After approval, use `koinonia-production` as the permanent cumulative Koinonia release baseline.

Important status: `koinonia-production` is approved but has **not yet been created**. No live domain change has been made as part of this plan.

## Permanent Isolation Boundary

Koinonia production work is isolated. Do not include, merge, modify, or deploy Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work during Koinonia releases.

Future portal launch must be integrated into the then-current `koinonia-production` baseline so already-live public features, including the business card, remain present.

Canonical details: `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md` and decision `D-020` in `BRAIN/DECISION_LOG.md`.
