# Koinonia Properties — Website Conversion & Go-To-Market Research

Research date: 2026-11-17
Status: **Research input — not owner-approved claims, pricing changes, or deployment authorization.**
Scope: Koinonia Properties (residential sales + property management), Douglas County / south Denver metro first (Castle Rock, Parker, Highlands Ranch, Lone Tree, Castle Pines, Centennial).
Does not apply to: Koinonia Transactions (`apps/web`).

## Why this exists

The owner asked for a study of the country's best-performing property management websites so the Koinonia Properties site (`apps/properties-web/`) can launch with patterns that are already proven to convert — from keywords and page structure to the exact information shown to owners and prospects — and so the business plan can absorb the strategy and sales findings.

## Governing documents (this research does not override them)

- Positioning: `../KOINONIA_PROPERTIES_POSITIONING_AND_LOCAL_DISCOVERY_2026-11-03.md`
- Pricing: `../../../03_Pricing/KOINONIA_PROPERTIES_MANAGEMENT_LEASING_FEES_2026-11-04.md`
- Product boundaries, public-claim rules, and release gates in `START_HERE.md` and `BRAIN/`

Where research suggests a change to an approved decision (for example, adding a guarantee), it is written as an **owner decision request**, never as a silent change.

## Files in this package

| # | File | Use it for |
|---|---|---|
| 01 | `01_COMPETITOR_TEARDOWN.md` | What 20+ national and local sites do, side by side, with sources |
| 02 | `02_KEYWORD_AND_SEO_BLUEPRINT.md` | Keyword tiers, local demand, and the exact page/title/H1 map for Koinonia |
| 03 | `03_OWNER_AND_PROSPECT_CONTENT_PLAYBOOK.md` | What to show owners, sellers/buyers and renters, page by page, with draft copy |
| 04 | `04_SALES_AND_CONVERSION_STRATEGY.md` | Funnel benchmarks, lead sources, speed-to-lead, follow-up, channel budget — **business-plan input** |
| 05 | `05_COMPLIANCE_GUARDRAILS.md` | Colorado and federal rules that constrain what the site may claim or charge |
| 06 | `06_IMPLEMENTATION_BACKLOG.md` | Prioritized, route-mapped work items for `apps/properties-web/` |
| 07 | `07_OWNER_DECISIONS_2026-11-17.md` | Owner decisions on guarantee, markup, payout, referral credits, service area and response standard — **business-plan input** |
| 08 | `08_AFTER_HOURS_AND_EMERGENCY_POLICY_DRAFT.md` | Draft after-hours, emergency and on-call policy built around Colorado's habitability deadlines |
| — | `source_data/` | Structured extractions of every page studied, plus a local Maps snapshot |

## Executive summary — the 12 things that matter most

1. **Google is the owner-lead channel.** In a 35-company study, Google Search + the Map Pack produced 50.6% of owner leads and Google's local ecosystem overall 86.2% ([Nolan citing GoGoodJuju](https://getnolan.ai/resources/property-management-leads/); [Clienvora](https://www.clienvora.com/blog/property-management-seo/)). The Google Business Profile and city pages come before paid ads.
2. **Service + city keywords convert best.** "[city] property management" terms are identified as the highest-converting owner-acquisition tier; "near me" terms are won in the Map Pack, not by the website ([Your Firm Growth](https://yourfirmgrowth.com/property-management-keywords/)). The current Koinonia build has **no city names in any title or H1** — this is the single largest SEO gap.
3. **The local Map Pack is winnable.** In a 2026-11-17 snapshot, Castle Rock property-management listings had small review counts (e.g., TMMC 83 reviews at 3.8, Zimmerman 9 at 2.9, Mycasa 15 at 4.7); Parker's top PM listing (PMI Parker) had 48 reviews ([local snapshot](source_data/local_maps_snapshot_2026-11-17.json)). A steady review engine can compete within months. Verify in live Google before planning around it.
4. **Lead with an instant rental analysis.** Every top site uses a rent estimate as the primary owner CTA — "Free rent estimate in 2 minutes" ([Doorstead](https://www.doorstead.com/rent-estimate)), "Get a Free Rental Analysis in Seconds" ([Grace PM, Castle Rock page](https://www.rentgrace.com/Castle-Rock-property-management)), "instant rent estimate emailed in under 60 seconds" ([Bergan & Co, Parker page](https://www.berganco.com/areas-we-serve/parker-colorado)). Koinonia's RentCast tool already matches this pattern; it should be the hero CTA on every owner page.
5. **Publish the fees.** Only 22.5% of 111 audited PM sites published a specific management fee ([Clienvora audit](https://www.clienvora.com/blog/property-management-seo/)). Local competitor Bergan publishes 10% / 50% leasing / free renewals / no upfront fees ([Bergan](https://www.berganco.com/areas-we-serve/parker-colorado)). Koinonia's approved 10%/8% model is market-normal and should be published plainly once the release gates allow it.
6. **Communication is the #1 reason owners fire managers (57%)** and response time is the #1 metric they judge on ([Buildium 2026 Rental Owners' Survey](https://www.buildium.com/blog/how-rental-owners-evaluate-a-property-managers-performance/)). This validates Koinonia's "clear communication" positioning — but it must be made concrete (a published response standard), not abstract.
7. **Proof beats adjectives.** Winners show dated, defined operating numbers: Grace shows units managed, vacancy, median days on market, homes leased, with definitions and a date ([Grace](https://www.rentgrace.com/Castle-Rock-property-management)); Colorado RPM shows days on market, showings to lease, email response hours, renewal rate ([Colorado RPM](https://www.coloradorpm.com/castle-rock-property-management/)). Koinonia has no portfolio yet, so it should publish **standards and commitments** now and swap in **measured results** as they accumulate — never invented numbers.
8. **Local competitors use guarantees as conversion tools.** Douglas County competitors advertise 12-month tenant placement guarantees, cancel-anytime agreements, and eviction-fee coverage ([Bergan](https://www.berganco.com/areas-we-serve/parker-colorado); [Grace](https://www.rentgrace.com/Castle-Rock-property-management)). Koinonia's approved pricing explicitly declines a free tenant-replacement guarantee — flagged as an **owner decision request** in file 03.
9. **Koinonia's dual-service model is a real differentiator.** Evernest, Keyrenter, PMI, Grace and Green Residential all cross-link sales and management, and Grace offers a "Rent/Sell Calculator" ([Grace](https://www.rentgrace.com/Castle-Rock-property-management)). With Castle Rock homes taking a median 57 days to sell ([Realtor.com](https://www.realtor.com/local/market/colorado/douglas-county/castle-rock)), a **"Rent or Sell?" analysis** is the strongest unique hook available to a company that does both.
10. **Speed-to-lead decides the sale.** Contacting a web lead in 5 minutes versus 30 makes qualification about 21× more likely (MIT/InsideSales, via [LetHub](https://www.lethub.co/blog/rental-lead-follow-up-automation)). The inquiry pipeline must route owner leads to a phone within minutes.
11. **Realistic funnel for planning:** ~2.3% visitor→lead, ~15% lead→appointment, ~35% appointment→contract (vendor benchmark, [CUFinder](https://cufinder.io/blog/benchmarks/property-management/)); paid owner leads roughly $109–$459 each on Google Ads ([BrandRocket](https://www.brandrocket.net/resources/property-management-lead-generation-google-ads-manual-bidding)). File 04 converts this into door-growth math for the business plan.
12. **Colorado law shapes the copy.** Property management for compensation requires a real estate license ([Colorado DRE](https://dre.colorado.gov/working-licensed-real-estate-professionals)); HB25-1090 requires total-price disclosure in pricing ads ([Colorado General Assembly](http://leg.colorado.gov/bills/hb25-1090)); application fees are limited to actual cost and portable screening reports must be accepted ([HB23-1099](https://leg.colorado.gov/bills/hb23-1099)). File 05 lists the guardrails.

## Method

- Pages from 20+ companies were fetched and analyzed with a fixed extraction schema (hero, CTAs, audience paths, pricing, guarantees, trust signals, lead magnets, forms, section order, SEO signals, FAQs, portal features, notable copy). Structured results are in `source_data/`.
- National set: Evernest, Mynd, Belong, Doorstead, Bay Property Management Group, Real Property Management, PMI, Keyrenter, Green Residential, TurboTenant PM, PURE HomeRiver.
- Local set (Douglas County / south metro): Colorado Realty & Property Management, Grace Property Management, Bergan & Co, RENTit Colorado, Zimmerman & Associates, Integrity Realty & Management, plus a Maps snapshot for Castle Rock, Parker and Highlands Ranch.
- Strategy sources: Buildium 2026 owner survey, GoGoodJuju lead-source study (via Clienvora/Nolan), Clienvora 111-site audit, keyword research publishers, Google Ads cost analyses, speed-to-lead studies, Colorado statutes and DRE guidance.
- Limitations: some pages blocked automated reading (Mynd pricing, Belong pricing, BMG guarantees); third-party marketing benchmarks are vendor-published and directional; the Maps snapshot is not live Google ranking data. Keyword volumes are national; Douglas County volumes must be pulled from Google Keyword Planner before ad budgeting.
