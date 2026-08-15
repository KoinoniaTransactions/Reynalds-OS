# Koinonia Website Status

## Status

Live public-site baseline verified 2026-08-15.

Production-over-portal reconciliation completed and preview-verified on 2026-08-15. This does not promote the portal or CRM to production.

## Current Canonical Public Routes

| Page | Route | Status |
|---|---|---|
| Home | `/` | Live |
| Services | `/services` | Live |
| About | `/about` | Live |
| Contact | `/contact` | Live |
| Referral Partner | `/referrals` | Live |
| Jeremiah Digital Business Card | `/jeremiah` | Live |

Legacy `/koinonia*` routes may remain available as aliases but are not the primary public information architecture.

## Current Production Baseline

- Branch: `koinonia-production`
- Commit: `56910eb48f04195ff0c9c11a5df914561006543c`
- Vercel production deployment: `dpl_7eLwcVgfSiNyop1QihqxgccnN9y6`
- `/referrals`: verified HTTP 200
- `/jeremiah`: verified HTTP 200

The live production branch remains authoritative for public Koinonia behavior. No production branch or domain change occurred during portal reconciliation.

## Current Public Service Architecture

Five core Koinonia Transactions service lanes are represented publicly:

1. Transaction Support / Contract-to-Close Coordination
2. Contract & Document Support
3. Licensed Showing Coverage
4. Professional Open House Coverage
5. Monthly Operations Partnership

The 40% Referral Partner Option is a separate secondary referral path, not a sixth service.

## Current Visual System

- Full-bleed Koinonia hero system is active across approved public pages.
- Hero copy remains live HTML/CSS.
- Page-specific desktop/mobile imagery is supported.
- Bright, light, organized professional workspace art direction is canonical.
- Front-facing screens are allowed selectively when workflow visibility materially supports the service story.
- The Referral Partner hero is the approved current precedent for selective screen visibility.
- Balanced-five layout is the reusable pattern for exactly five equivalent cards.

## Portal / CRM Reconciliation Status

The client/employee portal remains pre-live development work.

Current reconciliation branch:

- `integration/koinonia-portal-production-sync-20260815`

Reconciliation implementation direction is intentionally:

1. Keep the portal-development line as the working substrate.
2. Treat `koinonia-production` as the authority for all already-live public behavior.
3. Overlay/reconcile the current production public-site surfaces onto the integration branch.
4. Preserve compatible portal, authentication, CRM, and Koinonia service-delivery functionality underneath the public site.
5. Verify the combined application in a non-production deployment.
6. Advance `koinonia-production` only through a later controlled Koinonia-only release after explicit approval.

Do not reverse this into a wholesale portal-over-production replacement. Production public behavior wins on public surfaces; portal-specific functionality is preserved through deliberate shared-file merges.

### 2026-08-15 Reconciliation Checkpoint

The previously incomplete production overlay was completed on the integration branch.

Public surfaces reconciled from the live production line include:

- Home content and page assembly.
- Services content and page assembly.
- Contact content and page assembly.
- Referral Partner content, route, page assembly, SEO, and approved hero assets.
- Jeremiah digital business card route, styling, vCard, and QR asset.
- Balanced-five public layout refinements.
- Shared site exports required by the public Referral page.

Shared surfaces were merged rather than blindly replaced:

- Root layout preserves the portal `AuthProvider` while also loading the live Koinonia public layout refinements.
- SEO preserves development-only metadata helpers while adding the live public Referral/Open House metadata.
- The CRM Relationship Center and consultation-to-CRM write-through remain intact.

Verified combined application commit:

- `ddc9fdc5a567ed46c08aa8e204e78aa16d9f4a28`

Verified Vercel preview deployment:

- `dpl_HEvTAdXkiSBTE9HRWfLcrZUNdFoc`
- Ready state: `READY`
- Target: Preview / non-production

Build verification:

- Next.js production compilation succeeded.
- Type validation completed successfully.
- 48 static pages generated successfully.
- Build route table includes `/`, `/services`, `/about`, `/contact`, `/referrals`, `/jeremiah`, `/crm`, `/client`, `/employee`, and `/api/koinonia/consultation` in the same build.
- Preview URL is protected by Vercel preview authentication, so unauthenticated HTTP probing may redirect to Vercel SSO; that redirect is not an application-route failure.

### Release Isolation Still Required

The integration branch contains broader development work because it descends from the portal-development line. Reconciliation completion does not mean the branch can be promoted wholesale.

Any eventual Koinonia Transactions production release must still exclude unrelated Reynalds Brothers, Personal Finance, Koinonia Properties, and other non-approved repository work. The release must preserve the verified public website and include only the approved Koinonia Transactions portal/CRM feature set.

## Documentation Rule

For public website work, begin with:

- `03_Knowledge/Website/PRODUCTION_INDEX.md`

Then follow the source hierarchy defined there before creating new website documentation or implementation structure.

## Next Website Governance Step

Maintain the live public site conservatively. Continue portal/CRM development only from the reconciled integration state, and do not advance `koinonia-production` until a controlled Koinonia-only release candidate is explicitly reviewed and approved.
