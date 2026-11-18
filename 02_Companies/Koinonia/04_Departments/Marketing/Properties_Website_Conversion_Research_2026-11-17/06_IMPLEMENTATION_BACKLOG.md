# 06 — Implementation Backlog for `apps/properties-web`

Research date: 2026-11-17 · Target branch: build on `integration/koinonia-properties-consolidated-2026-11-17` (the app is not on `main`). No deploys, merges or new Vercel projects without owner approval.

Priority: **P0** = before public launch · **P1** = launch window · **P2** = after first data.

## P0 — Gates and foundations

| # | Item | Files / routes | Depends on |
|---|---|---|---|
| 0.1 | Confirm brokerage of record and licensing language; add license/brokerage footer | `components/site/*Footer*`, `/policies` | Owner + attorney (file 05) |
| 0.2 | Service area set to the corridor (decided 2026-11-17, file 07 §6); choose the 20 GBP service areas and `areaServed` list; settle straight-line vs driving for the 50-mile west line | `config/seo.config.ts`, `/service-areas` | Owner (edge towns) |
| 0.3 | Put the 2026-11-17 decisions on the site: 12-month placement guarantee (after terms are confirmed), 10% markup disclosure, fixed payout day, 1-hour response standard with business hours and emergency line, referral credit program (after DRE check) | `/pricing`, `/owners`, `/standards`, `/contact` | Owner confirms guarantee terms, payout day, business hours, credit amount |
| 0.4 | Replace placeholder address with service-area language (home address hidden) | `config/seo.config.ts`, `/contact` | — |
| 0.5 | Equal Housing Opportunity logo + statement sitewide | layout/footer | — |

## P1 — SEO and content

| # | Item | Files / routes |
|---|---|---|
| 1.1 | City-and-county titles, descriptions and H1s (file 02 §3) | `config/seo.config.ts`, page assemblies |
| 1.2 | `RealEstateAgent`/`LocalBusiness` JSON-LD with `areaServed`, phone, hours, `priceRange` | `config/seo.config.ts` / JSON-LD component |
| 1.3 | `FAQPage` JSON-LD on `/owners`, `/pricing`, city pages | FAQ component |
| 1.4 | City pages `/property-management/castle-rock` and `/parker` using the file 02 §4 template; corridor hub at `/service-areas` (map + county list per file 07 §6) | new `app/property-management/[city]/page.tsx` + content data file |
| 1.5 | `/pricing`: full fee table, "included at no charge," first-year calculator, total-price disclosure note | `KoinoniaPropertiesPricing*.tsx` |
| 1.6 | `/owners` rebuilt in the file 03 §2 order; response standard; maintenance approvals; screening standard | `KoinoniaPropertiesOwners*.tsx` |
| 1.7 | "Koinonia vs self-managing" comparison and "Switching managers" section | `/owners` |
| 1.8 | `llms.txt` (services, areas, fees, contact); confirm `robots.ts` doesn't block AI crawlers | `public/llms.txt`, `app/robots.ts` |
| 1.9 | `sitemap.ts` includes city pages | `app/sitemap.ts` |
| 1.10 | `/apply`: screening criteria, fee = actual cost explanation, portable screening reports | `/apply` |

## P1 — Conversion

| # | Item | Files |
|---|---|---|
| 2.1 | Hero address field → RentCast estimate on `/`, `/owners`, city pages (reuse `RentalEstimateTool.tsx`, keep `lib/rentcast-budget.ts` guard) | page assemblies |
| 2.2 | Two-step lead form: step 1 address/name/email/phone (phone required, SMS consent); step 2 units, plan interest, timeline, situation | `PropertiesInquiry/PropertiesLeadForm.tsx`, `app/api/inquiries` schema |
| 2.3 | Lead routing: instant email + text to owner on new inquiry; auto-acknowledgment to lead within 5 minutes | `app/api/inquiries` + notification provider (owner to choose) |
| 2.4 | Booking link for consultations after form submit | thank-you state |
| 2.5 | Sticky mobile CTA bar (Call / Text / Rental analysis) | layout |
| 2.6 | Owners link in primary nav on every page; tenant links grouped under "Residents" | header |
| 2.7 | Analytics events: estimate started/completed, form step 1/2, call/text clicks, booking | analytics util |

## P2 — Growth

| # | Item |
|---|---|
| 3.1 | `/rent-or-sell` analysis (RentCast rent + sales value range + net comparison) |
| 3.2 | Douglas County Landlord Guide PDF (email-gated) |
| 3.3 | Quarterly Castle Rock & Parker rent report |
| 3.4 | Blog with the file 02 §6 article list |
| 3.5 | Reviews display (only verified) + review request automation |
| 3.6 | Dated performance metrics block with definitions (after ≥10 leases or 6 months) |
| 3.7 | Additional city pages in the file 07 §6 order (Highlands Ranch/Lone Tree/Castle Pines, Aurora, Denver, Colorado Springs/Monument, Lakewood/Golden/Evergreen, Boulder/Broomfield) once each has real local content; Pueblo after expansion |
| 3.8 | Realtor partner page and referral form (after DRE review) |
| 3.9 | Google Ads landing pages per city (owner-only language) |

## Acceptance checks per release

- Every page title/H1 matches one intent from file 02; no duplicate city content.
- Lighthouse mobile performance and accessibility checked on the preview.
- Rich Results test passes for LocalBusiness and FAQPage.
- Every fee shown matches the approved pricing memo; all claims pass the file 05 checklist.
- Test inquiry reaches the owner in under 5 minutes.
