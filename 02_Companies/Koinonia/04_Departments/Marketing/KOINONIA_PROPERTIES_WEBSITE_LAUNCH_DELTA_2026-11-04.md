# Koinonia Properties — Preservation-First Website Launch Audit

Date: 2026-11-04. Status: working implementation plan, not deployment approval.

## Owner directive
**Preserve the existing Koinonia Properties site. It needs targeted tweaks and additional information, not replacement or a wholesale redesign.** Main public website and business launch precede proprietary owner-portal/backend development. No third-party property-management platform selection is planned as the future foundation. Maintain secure interim operational records and appropriate accounting from the first client.

## Evidence inspected
Historical branch `integration/koinonia-properties-web-20260812`, not `main`: `apps/properties-web/` Next.js app, route directory, homepage, navigation, pricing, rental analysis, contact form, SEO config, contact config, plus `BRAIN/KOINONIA_PROPERTIES_DEV_STATE.md`, `03_Knowledge/Website/koinonia_properties_production_spec.md` and the canonical historical property management service object. Current approved positioning and fees on `main` govern new business decisions.

## What is already worth keeping
- The standalone `apps/properties-web/` application and its styling/components. Homepage and Owners pages were visually approved in August; avoid disturbing accepted layouts.
- Fourteen existing routes: `/`, `/owners`, `/tenants`, `/rentals`, `/portals`, `/rental-analysis`, `/pricing`, `/service-areas`, `/policies`, `/apply`, `/maintenance`, `/vendors`, `/standards`, `/contact`.
- Existing mobile/desktop navigation patterns, audience routes, SEO infrastructure, resident and owner informational pages.
- Keep existing route URLs wherever possible, avoiding broken links, route churn and unnecessary redesign.
- Do not assume historical branch's August preview state is live production state; independently verify Vercel production deployment/domain.

## Narrow changes necessary to align with current strategy
1. **Company positioning**: add equally prominent *residential sales* and *property management* discovery within the existing homepage and navigation. Small surgical additions first. A simple sales page with clear buyer/seller paths may be enough; no automatic multiroute rebuild.
2. **Sales content**: buyer/seller representation details and separate conversion paths, only once licensing/advertising claims are verified. Do not advertise nonexistent IDX/listings.
3. **Management content**: emphasize accessible communication, proactive owner updates, and follow-through—not the internal phrase 'communication is respect' as a slogan. Do not lead with SMS response time or unfinished portal features.
4. **Pricing page**: replace legacy `Leasing-Only`, `Full-Service Management`, `Portfolio Management` three-plan marketing with approved 8% owner-involved and 10% fully managed models; transparently disclose 10% markup on Koinonia-coordinated contractor work under both. Reflect 50% successful placement fee, $199 completed renewal, $99 midlease/additional inspections and $0 owner setup/vacancy. Applicant $35 fee may only be marketed subject to actual legal screening cost verification. Final agreement terms and collected-rent definitions need compliance review.
5. **Rental analysis**: current `KoinoniaPropertiesRentalAnalysis.tsx` links to an email inquiry; eventual immediate data-backed on-screen rental estimate requires commercial data/API and real comparables. Do not fabricate estimates. Can release accurate manual inquiry first if integration timing demands.
6. **Inquiries/conversion**: current `PropertiesInquiry.tsx` uses a `mailto:` link, not reliable online lead submission. Design working secure basic web intake, routing to owner-management versus buyer/seller leads, attribution, spam defense and notification. Do not collect sensitive screening, banking or account data publicly.
7. **Contact and SEO**: historical config uses `jeremiah@koinoniaadmin.com`, phone `(719) 745-8497`, management-only metadata; confirm correct Properties-specific identity and service area before changing claims. Preserve accepted visual brand elements, adjust metadata and structured data only to accurately reflect the dual-service business.

## Required business checks before promoting the revised site
- Verify Properties entity and Colorado real estate brokerage/employing-broker status, E&O, supervision, marketing claims and legal sales/management authority.
- Finalize lawful owner/property-management agreements, trust and security-deposit accounting, screening, maintenance/habitability escalation, insurance and fair-housing procedures.
- Verify actual local coverage, contact routes, mobile/tablet design, privacy/consent, inquiry notifications, production environment, canonical URLs, indexability and all existing route behavior.
- Do not imply secure owner portal, self-managed vendor directory, real-time account/activity feeds or instant valuations are live before implemented.
- The draft communication/integrity standard is pending PR #53, not merged business policy.

## Recommended execution order
1. Recover actual Vercel production source/deployment and compare against historical source.
2. Create a **file-by-file minimal-delta** map of precisely which accepted components need text/navigation additions.
3. Confirm legal/operating readiness for accurate public sales and management promises.
4. Implement targeted changes only on a fresh preview branch with preserved existing pages and responsive QA.
5. Test separate owner/buyer/seller inquiry and follow-up flows and minimum analytics.
6. Verify service readiness, then approve marketing/publication separately.
7. Build custom owner-portal/backend incrementally based on customer experience and tested operational workflows, not as a launch dependency.

## Explicit exclusions
No site rebuild, no abandonment of accepted design, no branch wholesale merge, no live deployment, no entity/licensing filing, no paid marketing and no custom portal implementation authorized by this document.
