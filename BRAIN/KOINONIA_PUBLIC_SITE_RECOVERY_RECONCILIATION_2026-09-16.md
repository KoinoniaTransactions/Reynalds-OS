# Koinonia Public-Site Recovery Reconciliation — 2026-09-16

Owner: Koinonia / Jeremiah
Status: ACTIVE RECOVERY CONTROL
Branch: `koinonia-w6-reconciliation-recovery`

## Purpose

This document prevents newer commercial website work from accidentally deleting previously approved/live Koinonia website work.

The current repository has two materially diverged histories:

- `main` contains the newer September white-glove commercial model, W1–W5 website functionality, current pricing/detail logic, and unfinished W6 work.
- `koinonia-production` contains approved/live website architecture and several public-site features that are not present on `main`.

Do **not** treat either branch as a complete replacement for the other.

## Governing reconciliation rule

**Preserve approved design architecture. Recover approved live features. Keep newer commercial truth. Do not wholesale-merge legacy branches.**

The live/production site is the reference for established visual hierarchy, page rhythm, public routes, and completed user-facing features unless a later explicit owner decision superseded them.

`main` remains the reference for the newer September commercial model and W1–W5 functionality unless a canonical business document says otherwise.

## Keep from current `main`

- Current September white-glove commercial positioning.
- Five capability umbrellas:
  1. Transactions & Contracts
  2. Listing & Seller Support
  3. Licensed Field Coverage
  4. Marketing & Growth
  5. CRM & Business Operations
- Current approved commercial products and pricing:
  - Transaction Management — $450 per successful closing
  - Hand Us the Listing — $350 per standard listing
  - Licensed Field Coverage — from $75 per standard assignment
  - Professional Open House — $200 per standard event
  - Marketing Management — $750/month
  - Koinonia Partnership — $1,250/month
  - Custom Project — quoted before work begins
- W1 detail dialog/sheet behavior.
- W2 pricing-card scanability improvements where they do not conflict with the established visual system.
- W5 service-specific consultation preselection and current scheduler flow.
- Current Contact consultation behavior.
- Current canonical business scope and professional boundaries.

## Restore/reconcile from `koinonia-production`

### Homepage

Preserve the established live Home hierarchy and visual rhythm:

1. Hero
2. Positioning / behind-the-scenes value
3. Services overview
4. 40% Referral Partner Option callout
5. Who It Helps
6. How It Works
7. Shared CTA
8. Footer

The approved live hero uses the short headline structure `Real Estate Operations. Elevated.`. Newer positioning can be incorporated into supporting copy without turning the hero into an oversized multi-line editorial headline.

Restore the Home referral discovery block and `Who It Helps` section while updating service content to the current September commercial model.

### Referral Partner Option

Restore the separate 40% Referral Partner path as a distinct brokerage referral option, not as a Koinonia Transactions operations service.

Restore/reconcile:

- Home referral discovery callout.
- Services referral discovery callout.
- Contact referral discovery callout.
- `/referrals` public route.
- `KoinoniaReferrals` page assembly.
- `referrals.ts` content.
- referral-specific desktop/mobile hero assets.
- `/referrals` SEO metadata/public-route entry.

The referral program must remain clearly separated from operations support and must retain the formal-referral-document / qualifying-successful-closing conditions.

### Privacy

Restore:

- `/privacy` public route.
- Privacy footer navigation link.
- Existing privacy content unless later privacy/marketing work explicitly supersedes it.

### Header / portal continuity

The live Header includes public Portal navigation and portal-aware navigation behavior. Current `main` removed this behavior.

Portal expansion remains outside the immediate public-website completion scope, but existing live portal behavior must not be silently deleted during a future production promotion.

Before production promotion, either:

1. restore the existing live portal route/navigation behavior into the candidate release, or
2. obtain an explicit owner decision to retire/change it.

Do not invent a new portal architecture during W6.

### Footer / legal navigation

Preserve the live Privacy destination and do not remove existing public legal navigation without an explicit owner decision.

## Visual architecture rule

The existing shared Koinonia visual system remains the baseline:

- light/airy cream-and-white palette
- established serif/display hierarchy
- restrained section typography
- existing 48/52 full-bleed hero split
- existing hero image treatment
- established shared section/card vocabulary
- centered/light hierarchy where already solved
- premium spacing and negative space

Do not create page-specific CSS simply to compensate for overly long copy or a changed page architecture when the live design already solved the presentation.

## Services reconciliation

Current Services content is stronger and should remain current, but the page should be visually reconciled toward the established Koinonia design language rather than becoming a separate bespoke design system.

Keep:

- current capability/product/pricing content
- current product detail dialogs
- current service-specific consultation routing
- current pricing and commercial distinctions

Reconcile:

- heading scale
- centered vs left-aligned hierarchy
- section density
- card rhythm
- light/dark section cadence
- referral discovery path

The goal is **new commercial information inside the established Koinonia experience**, not a new visual architecture.

## Explicitly do not restore

- superseded old service/pricing architecture
- old standalone Contract & Document Support public pricing
- stale `/appointments` page (keep current redirect behavior)
- obsolete marketing instrumentation merely because it exists on production; marketing measurement is governed by Phase B of the launch checklist
- old branches wholesale

## About / Contact status

- About page assembly is already aligned between production and `main`; do not redesign it during this reconciliation.
- Contact structure is largely preserved on `main`; keep the newer consultation logic and restore the referral discovery block.

## W6 execution rule

The experimental branch `koinonia-w6-home-visual-density` is not the recovery source and must not be merged as-is.

All further W6 public-site work should occur from this reconciliation branch or a direct successor, using this document as the recovery control.

## Production safety

`koinonia-production` remains untouched until the normal owner gate is satisfied.

Do not promote this branch to production without explicit owner approval under W8/W9.