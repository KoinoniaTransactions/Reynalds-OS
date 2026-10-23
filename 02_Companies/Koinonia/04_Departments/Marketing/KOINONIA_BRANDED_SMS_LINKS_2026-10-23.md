# Koinonia Campaign 2 — Branded SMS links (PREVIEW ONLY)

## Purpose
Offer recognizable links on the primary business domain for the 30 Campaign 2 agent records K-031 through K-060. This is an extension of the existing marketing attribution workflow, not a separate analytics service.

## Architecture
- Public URL: `https://koinoniatransactions.com/go/K031` through `/go/K060`.
- Dynamic App Router handler: `apps/web/app/go/[code]/route.ts`.
- Shared validation/UTM mapping: `apps/web/lib/koinonia-sms-links.ts`.
- Validation tests: `apps/web/lib/koinonia-sms-links.test.ts`.
- Destination: public site homepage with `utm_source=direct_outreach`, `utm_medium=sms`, `utm_campaign=agent_intro_pilot2`, `utm_content=K-031` through `K-060`.
- Invalid codes return HTTP 404. Valid codes return HTTP 307 with no-store and noindex. No database or secrets required.
- This route does NOT set cookies or record an identity. The landing page's existing consent-gated GA4 and first/latest-touch logic is responsible for subsequent measurement, where enabled.
- `utm_content` carries an opaque sales-tracker ID, not names, email addresses, or phone numbers. Tagged visits are not proof of who actually clicked.
- These links are *not live on production* until separately approved, merged, built and deployed.

## Campaign operations
Canonical lead list and hand-send drafts: native Google Sheet `koinonia_sales_tracker_readable_autofill`, tabs `Campaign 2 — Outreach Plan` and `Campaign 2 — Scripts`. All 30 contacts remain HOLD pending DNC checks, legal permission basis, number-type verification, and explicit owner authorization. Do not publish/send or imply compliance from DNC checking alone.

## Acceptance and production gate
1. CI unit test for boundary codes, unknown codes and UTM fields.
2. Preview requests `/go/K031`, `/go/K060`, `/go/garbage` respond with expected 307/307/404. Check Location and no-store headers.
3. On consented public landing session, confirm the UTM attributes appear in GA4 and, where applicable, subsequent accepted consultation's CRM record. Never log raw contact PII to analytics.
4. Check Koinonia public domain path route is wired to the newly deployed app, without breaking `/contact`, `/services`, portals or auth routes.
5. After separate production promotion approval, confirm links work on public domain *before* sending any SMS.
6. Stop/DNC and replies must be handled manually in the tracker; this feature doesn't automate communication or certify delivery.

## Continuity / rollback
Feature branch: `feature/koinonia-branded-sms-links-2026-10-23`, based on `koinonia-marketing-integration-2026-09-16`. No production promotion. Revert only this feature's route, mapping and tests to remove the links. The campaign tracker retains drafts on HOLD.
