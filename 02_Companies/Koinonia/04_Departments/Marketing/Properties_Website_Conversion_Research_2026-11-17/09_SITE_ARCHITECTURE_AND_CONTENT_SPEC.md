# 09 — Site Architecture & Content Spec

Date: 2026-11-17 · Status: recommended build spec for `apps/properties-web` (consolidated integration branch). Built from files 01–08 and the owner decisions in 07/08. Copy still needs owner approval; licensing and legal gates in file 05 still apply.

## 1. The core idea

A competitive property management site answers every question an owner has **before** the first call, and makes the next step obvious on every page. The leaders do this with:

1. A **local, intent-matched page** for each search (city pages, pricing, rent-or-sell).
2. **Everything published:** fees, what's included, guarantees with conditions, the process, response standards, sample documents.
3. **One primary action:** a free rental analysis that starts with just an address.
4. **Separate doors** for owners, buyers/sellers, renters and current residents, so nobody wades through someone else's content.
5. **Proof** that grows over time: standards first, then reviews, then dated metrics.

Koinonia's edge over the local competitors is being the **only one built around both sides of the decision** — rent it or sell it — with fully published terms and a written 1-hour response standard.

## 2. Audiences and what each one needs

| Audience | Main question | Must find within one click | Primary action |
|---|---|---|---|
| **Rental owner** (accidental landlord, relocating, investor, unhappy with current manager) | "What will it rent for, what will it cost me, and can I trust you with it?" | Rent estimate, full fee table, first-year cost, guarantee, process, response standard, sample agreement, service area | Free rental analysis → consultation |
| **Undecided homeowner** | "Should I rent or sell?" | Side-by-side rent vs sale numbers | Rent-or-Sell analysis |
| **Seller / buyer** | "Who will help me, and how does it work?" | Process, local market data, broker info | Home value / consult |
| **Investor** | "Will this property cash-flow, and who'll run it?" | Rent comps, cost of management, buy-and-manage path | Investor consult |
| **Renter (prospect)** | "Is it available, what does it really cost, can I qualify?" | Listings with total monthly cost, rental criteria, application fee and what it covers | Apply / schedule showing |
| **Current resident** | "How do I pay, fix something, or reach someone?" | Portal login, maintenance request, emergency line | Portal / request |
| **Vendor / agent partner** | "How do I work with you?" | Vendor standards, referral program | Vendor or partner form |

## 3. Site map

Existing routes are kept where possible (marked ✓). New routes are marked **new**.

```
/                                   Home ✓
│
├── OWNERS
│   ├── /owners                      Property management overview ✓ (rebuild)
│   ├── /pricing                     Fees, plans, calculator ✓ (rebuild)
│   ├── /rental-analysis             Free rent estimate ✓
│   ├── /rent-or-sell                Rent vs sell analysis (new)
│   ├── /how-it-works                Onboarding → leasing → management (new)
│   ├── /guarantees                  12-month tenant guarantee + other promises (new)
│   ├── /switching-managers          How to switch to Koinonia (new)
│   ├── /owner-resources             Guides, sample docs, landlord-law updates (new)
│   └── /property-management/[city]  City pages (new) — Castle Rock, Parker first
│
├── BUY & SELL
│   ├── /real-estate                 Overview ✓ (rebuild)
│   ├── /real-estate/sell            Selling (new)
│   ├── /real-estate/buy             Buying (new)
│   └── /real-estate/investors       Buy-and-manage path (new)
│
├── RENTALS
│   ├── /rentals                     Available homes ✓
│   ├── /rentals/[listing]           Listing detail (new, when listings exist)
│   └── /apply                       Rental criteria + application ✓ (expand)
│
├── RESIDENTS
│   ├── /tenants                     Resident hub ✓ (label "Residents" in nav)
│   ├── /portals                     Owner + resident portal login ✓
│   ├── /maintenance                 Request + emergency instructions ✓ (expand)
│   └── /emergency                   After-hours and emergency policy (new)
│
├── COMPANY
│   ├── /about                       Who we are, team, local roots, licensing (new)
│   ├── /standards                   Response, inspection, screening, vendor standards ✓
│   ├── /reviews                     Verified reviews (new, after first reviews)
│   ├── /service-areas               Corridor hub + map ✓ (rebuild)
│   ├── /faq                         All FAQs, grouped (new)
│   ├── /blog                        Articles and quarterly rent report (new)
│   ├── /partners                    Agent referral + vendor info (new; folds in /vendors ✓)
│   ├── /contact                     Phone, hours, forms, emergency line ✓
│   └── /policies                    Privacy, Fair Housing, accessibility, terms ✓
```

### Navigation

- **Header (desktop):** Logo · Owners ▾ · Buy & Sell ▾ · Rentals · Residents ▾ · About ▾ · phone number · **[Free Rental Analysis]** button.
- **Owners menu:** Property Management · Pricing · How It Works · Guarantees · Rent or Sell? · Switching Managers · Service Areas · Owner Resources.
- **Residents menu:** Pay Rent / Portal · Maintenance Request · Emergency · Resident FAQ.
- **Mobile:** sticky bottom bar with **Call · Text · Rental Analysis** (62.4% of property management site traffic is mobile — [CUFinder](https://cufinder.io/blog/benchmarks/property-management/)).
- **Footer:** all service-area cities (links to city pages as they launch), business hours, emergency line, brokerage name and license info, Equal Housing Opportunity logo, policies, portal login.

## 4. Page-by-page content

Each page below lists its search target (file 02), the sections in order, and the content that must exist before it can go live.

### Home `/`

Target: "property management [Front Range / Castle Rock / Parker]" + brand.

1. **Hero:** "Property management and real estate from Denver to Colorado Springs" (final wording TBD) · address field → rental analysis · secondary "Buying or selling?" link · phone.
2. **Four doors:** Rent out my home · Sell or buy · Find a rental · I'm a resident.
3. **Why Koinonia (4 promises):** every fee published · 12-month tenant guarantee · next steps within 1 hour during business hours · no termination penalty.
4. **Plans at a glance:** Managed for You 10% · Managed With You 8% → /pricing.
5. **Rent or sell?** teaser with the analysis CTA.
6. **How it works:** 4 steps → /how-it-works.
7. **Service area:** corridor map + city links.
8. **Proof:** standards now → reviews and dated metrics later.
9. **Owner FAQ (5 questions)** → /faq.
10. **Closing CTA** + footer.

### Owners `/owners`

Target: "rental property management [corridor]". Structure from file 03 §2: hero with analysis → trust strip → two plans → included at no charge → process → maintenance and approvals ($250 routine threshold, $1,000 emergency cap, 10% disclosed markup) → screening standard → owner portal and statements (what owners see each month) → payout rule (10th; 5 business days after receipt if rent is late) → guarantees → Koinonia vs self-managing → FAQ → CTA.

### Pricing `/pricing`

Target: "property management fees [Colorado / Castle Rock]".

1. Two-plan cards with who each fits.
2. Full fee table (file 03 §3a, including guarantee and payout rows).
3. "Included at no charge" list.
4. **First-year cost calculator** (rent input → both plans, year 1 and year 2).
5. Worked example at $2,800 rent (file 03 §3c).
6. Market comparison, factual and sourced (national averages, Denver ranges).
7. What isn't included / when extra fees apply (mid-lease inspection $99, extra visits $99, separately quoted projects).
8. Tenant-side fees disclosure (application fee = actual screening cost; total-price disclosure under HB25-1090).
9. Pricing FAQ (FAQPage schema).
10. CTA.

### Rental Analysis `/rental-analysis` (exists)

Address → instant RentCast estimate (budget-guarded) → step 2 qualifiers (units, plan interest, timeline, situation) → "Get the full report and a call within 1 business hour." Show data source and date on the estimate.

### Rent or Sell `/rent-or-sell` (new — Koinonia's signature tool)

Inputs: address, mortgage balance, rate/payment (optional), expected repairs. Outputs side by side:
- **Rent:** estimated rent, management cost on each plan, estimated monthly cash flow, equity build.
- **Sell:** estimated value range, estimated selling costs, net proceeds.
- Plain-language summary + "Talk through your numbers" CTA. Value estimates must be labeled as estimates and, once licensed, prepared under the brokerage.

### How It Works `/how-it-works`

1. Free rental analysis and consultation → 2. Agreement and onboarding ($0 setup; what we need from you: keys, HOA rules, warranties, utility info) → 3. Make-ready and initial assessment (included) → 4. Marketing, showings, screening, lease → 5. Move-in inspection (included) → 6. Monthly management: rent collection, payout on the 10th, statements, maintenance → 7. Mid-lease inspection ($99), renewal ($199), move-out inspection (included). Each step lists who does what and typical timing.

### Guarantees `/guarantees`

- **12-month tenant guarantee** with plain-language exclusions (owner-caused departures, lawful tenant termination rights) and what still costs money (turnover repairs, legal costs).
- **No termination penalty.**
- **Response standard** (business hours: next steps within 1 hour; work begins same or next business day; emergencies 24/7).
- **Payout promise** (10th / 5 business days after late rent is received).
- **Transparent markup** (10%, itemized).
- Link to the sample management agreement where each promise is written.

### Switching Managers `/switching-managers`

Why owners switch (communication, service decline, transparency — [Buildium](https://www.buildium.com/blog/how-rental-owners-evaluate-a-property-managers-performance/)) · what Koinonia handles in the transfer (tenant notice, deposits, lease and records transfer, keys, portal setup) · checklist of what to ask the current manager · timeline · CTA.

### City pages `/property-management/[city]`

Template in file 02 §4: local H1 + analysis form, dated local rent snapshot, neighborhoods, local rules (licensing, HOAs, short-term rentals), pricing summary, local FAQ, local reviews and listings, CTA. Launch order in file 07 §6. Never publish a city page without genuine local content.

### Owner Resources `/owner-resources`

Douglas County / Front Range Landlord Guide (email-gated PDF), sample management agreement, sample owner statement, sample inspection report, rental criteria, Colorado landlord-law summary (dated), seasonal maintenance calendar, quarterly rent report sign-up.

### Real Estate `/real-estate`, `/sell`, `/buy`, `/investors`

- **Overview:** two paths + investor path; brokerage of record named.
- **Sell:** process, timeline, pricing/valuation approach, marketing plan, home value request, **"thinking of renting instead?"** link to /rent-or-sell.
- **Buy:** process, first-time buyer guidance, local market data, consult.
- **Investors:** how to evaluate a rental (rent comps, Castle Rock prices vs rents — honest that many homes don't cash-flow at today's prices), buy → lease → manage path, consult.

### Rentals `/rentals` and `/rentals/[listing]`

Listing card: photo, address area, rent, **total monthly cost** (rent + any required fees), beds/baths, availability date, pets. Detail: full photos, features, HOA notes, utilities, showing scheduler, apply link, Fair Housing statement. Empty state: "No homes available right now — get alerts."

### Apply `/apply`

Written rental criteria (applied equally), application fee and what it covers (actual cost), portable screening report acceptance, documents needed, timeline to decision, deposit rules (HB25-1249), Fair Housing and reasonable-accommodation statement, apply link.

### Residents `/tenants`, `/maintenance`, `/emergency`

- **Hub:** pay rent, request maintenance, emergency, move-in/move-out guides, renters insurance, resident FAQ.
- **Maintenance:** request form with photos; three tiers with response times (file 08 §2); what to try first (file 08 §4).
- **Emergency:** 911 first; 24/7 emergency line; what counts as an emergency; urgent requests answered within 24 hours every day.

### About `/about`, `/standards`, `/reviews`

- **About:** founder story and photo, why "Koinonia," local roots, team and roles, who answers the phone, license and brokerage information, connection to Koinonia Transactions.
- **Standards (exists):** response, inspection schedule, screening, vendor qualifications and insurance, owner communication cadence, payout rule.
- **Reviews:** verified reviews only, with the date; launch when there are at least 5.

### Service Areas `/service-areas`

Corridor map (Boulder → Fountain; east to Aurora; west to the major cities within ~50 miles of Parker), county list, city list linking to city pages, "Pueblo coming later," and "Not sure if we cover you? Enter your address."

### FAQ `/faq`

All FAQs grouped: Fees · Plans · Leasing & screening · Maintenance & emergencies · Payouts & statements · Guarantees · Contracts & switching · Colorado law · Selling/buying · Residents. Each page also shows its own 5–8 FAQs with FAQPage schema.

### Contact `/contact`

Phone and text, email, business hours, emergency line, service area statement (no street address shown), short form, booking link.

## 5. Owner FAQ bank (answer all of these on the site)

Fees and contract
1. How much does property management cost?
2. What's the difference between the 10% and 8% plans?
3. Is the fee charged on rent collected or rent due?
4. Do you charge when the home is vacant? (No)
5. Is there a setup fee? (No)
6. What does placement cost, and when is it charged?
7. What does a lease renewal cost?
8. Do you mark up repairs? (10%, itemized, both plans)
9. Can I cancel? Is there a termination fee? (No penalty)
10. How long is the agreement?

Leasing and tenants
11. How do you set the rent?
12. How long does it usually take to rent a home here?
13. How do you screen tenants? What are your criteria?
14. Do you allow pets?
15. What is the 12-month tenant guarantee, and what's excluded?
16. Who holds the security deposit?
17. What happens if a tenant doesn't pay?
18. How do evictions work in Colorado now?

Money and reporting
19. When do I get paid? (10th; 5 business days after late rent is received)
20. What will I see in my monthly statement?
21. Do you provide year-end tax documents?
22. Do I need a reserve balance?

Maintenance
23. When do you need my approval for repairs? ($250 routine; emergencies up to $1,000 without waiting)
24. Can I use my own vendors?
25. How do you handle emergencies after hours?
26. How often do you inspect?
27. Who pays for HOA violations?

Getting started
28. What areas do you serve?
29. What do you need from me to start?
30. I'm moving out of state — can you still manage it?
31. I have a manager now — how do I switch?
32. Should I rent or sell?
33. Are you licensed? (State the brokerage of record once confirmed.)

## 6. Content and assets the business must produce

The site is only as complete as the business behind it. Build these before or alongside the pages:

| Asset | Used on | Status |
|---|---|---|
| Brokerage of record, license numbers, entity status | Footer, /about, /contact | **Blocking** (file 05) |
| Business phone + text number, 24/7 emergency line | Header, /contact, /emergency | Needed |
| Property management software choice (portal, payments, statements) | /portals, /owners, /tenants | **Decision needed** — sets what portal and statement screenshots show |
| Sample management agreement (with guarantee, payout, markup, emergency cap) | /guarantees, /owner-resources | Attorney draft needed |
| Sample owner statement + inspection report | /owners, /owner-resources | Create once software is chosen |
| Written rental criteria + application fee cost basis | /apply | Needed |
| Lease addenda (pets, HOA, utilities, renters insurance) | /apply, /tenants | Attorney review |
| Move-in sheet (shutoffs, utility emergency numbers, how to report) | /tenants, /emergency | Draft in file 08 §4 |
| 24/7 vendor list by region | Operations | Needed (file 08 §10) |
| Real photos: founder, team, local homes, neighborhoods | Every page | Needed — no stock "team" photos |
| Local content per city (neighborhoods, HOA notes, rent snapshot) | City pages | Write for Castle Rock and Parker first |
| Landlord Guide PDF, rent report template | /owner-resources | Write |
| Review request process | /reviews, GBP | Set up at first client |
| Google Business Profile (service-area, hidden address, 20 areas) | Maps | After licensing (file 07 §6) |

## 7. Conversion system behind the pages

- **One primary CTA everywhere:** Free Rental Analysis (address first). Secondary: call/text, book a consultation.
- **Two-step form** (file 04 §3): address/name/email/phone → units, plan, timeline, situation.
- **Speed to lead:** automatic text and email within 5 minutes, 24/7; person follows up within 1 business hour.
- **Follow-up cadence:** immediate → day 2 → day 7 → day 14 → monthly rent report.
- **Lead routing tags:** owner / seller / buyer / investor / renter / resident / vendor, plus city.
- **Tracking:** analytics events for every CTA and form step; call tracking; monthly dashboard (file 04 §6).

## 8. Technical requirements

- Title/H1/description per page from file 02; one intent per page.
- JSON-LD: `RealEstateAgent` (or `LocalBusiness`) with `areaServed`, hours and phone; `Service` per plan; `FAQPage` on FAQ blocks; `BreadcrumbList`; `Offer` for listings later.
- `llms.txt` summarizing services, areas, fees, hours, guarantees.
- Sitemap includes city pages and listings; canonical URLs; no duplicate city text.
- Server-rendered content and numbers; fast mobile pages; accessible forms (WCAG 2.1 AA target).
- Equal Housing Opportunity logo sitewide; Fair Housing review of all rental and neighborhood copy.

## 9. Build order

| Phase | Pages and work | Gate |
|---|---|---|
| **1 — Foundation** | Navigation and footer, Home, Owners, Pricing (with calculator), Rental Analysis + two-step form + lead routing, Service Areas, Contact, Emergency, Standards, About, Policies | Licensing language, phone/emergency line, owner copy approval |
| **2 — Local and trust** | Castle Rock and Parker city pages, How It Works, Guarantees, Switching Managers, FAQ, Apply expansion, Residents hub, schema, `llms.txt` | Sample agreement drafted; rental criteria written |
| **3 — Signature and sales** | Rent or Sell tool, Real Estate sell/buy/investors pages, Owner Resources + Landlord Guide, Partners | Valuation approach approved under the brokerage |
| **4 — Growth** | Reviews page, dated metrics, blog + quarterly rent report, more city pages (file 07 §6 order), listing detail pages, Google Ads landing pages | First clients and data |

## 10. Definition of "competitive" at launch

The site is ready to compete locally when an owner can, without calling:

- [ ] Get a rent estimate for their address.
- [ ] See every fee, both plans and a first-year total.
- [ ] Read the guarantee, payout rule, response standard and termination terms in plain language and in a sample agreement.
- [ ] Understand the process from first call to first payout.
- [ ] Confirm Koinonia serves their city and see local knowledge.
- [ ] See who they'd work with, the license behind the business, and how to reach someone after hours.
- [ ] Book a consultation or get a call within 1 business hour.

Bergan publishes local pricing and neighborhood detail ([Bergan & Co](https://www.berganco.com/areas-we-serve/parker-colorado)); Grace publishes guarantees and dated metrics ([Grace Property Management](https://www.rentgrace.com/Castle-Rock-property-management)). Meeting this checklist matches them on information, and the Rent-or-Sell tool, published response standard and dual sales/management model go beyond them.
