# 10 — Go-To-Market Plan and Agreed Launch Site Map

Date: 2026-11-18 · Status: **owner-agreed in conversation** (dialogue phase, 2026-11-18) · not legally reviewed · not published.

This file records what the owner and Perplexity agreed in conversation after file 09 was written. **Where it conflicts with file 09, this file wins:** it replaces file 09 §3 (site map and navigation) and §9 (build order). File 09 still holds the page-by-page content notes, the owner FAQ bank, the asset list and the technical requirements.

Gates that still apply to everything here (file 05): Koinonia Properties LLC is proposed, not formed or licensed. The site may not claim licensed brokerage services, and no referral fee can be paid or promised as payable until a licensed brokerage pays it.

## 1. Go-to-market: homes that are not selling

### Target

1. **Listing agents** whose listings have been on the market 100+ days.
2. **Owners** whose homes have been listed 100+ days: a "plan B" to rent the home until the market turns, then sell.

### The pitch to owners

"If your home has been on the market a while, here's a plan B: rent it until the market turns, keep your tax break, and sell later. We'll work with your current agent, and when you're ready to sell, we'll send you back to them."

Supporting facts (verify before each use):

- The home-sale capital-gains exclusion requires living in the home 2 of the 5 years before the sale, so an owner who lived there 2+ years has roughly up to 3 years of renting before the exclusion is lost. Depreciation taken while renting is recaptured at sale ([IRS](https://www.irs.gov/faqs/capital-gains-losses-and-sale-of-home/property-basis-sale-of-home-etc/property-basis-sale-of-home-etc-5)). Not tax advice; owners should confirm with their tax professional.
- Rent will not cover the payment for many recent buyers. Example: Castle Rock median sold price ~$715k ([Realtor.com](https://www.realtor.com/local/market/colorado/douglas-county/castle-rock)) vs. roughly $3,000 rent. The "can rent cover my mortgage" calculator must show shortfalls honestly.

### How prospects are found (owner decision)

- **Owner names and mailing addresses come from county property records** (assessor sites — public records), cross-referenced with publicly visible listing status.
- **Do not build lists from realtor.com or other portals.** Realtor.com's terms limit use to personal, non-commercial purposes and prohibit compiling its content into lists or databases by any method ([realtor.com Terms of Use](https://www.realtor.com/terms-of-service)). Browsing public listings like any consumer to notice a stale listing is fine; copying them into a prospect list is not.
- If MLS data is ever used: REcolorado rules bind all subscribers, the data license limits use to the subscriber's own brokerage business, and sellers with **Withdrawn** status must never be contacted ([REcolorado MLS policy guide](https://recolorado.com/mls-policy-guide/)). Get a written answer from REcolorado compliance before using MLS data for outreach.
- **Channels:** mail first. Calls require scrubbing against the national and Colorado do-not-call lists. No texts without consent.
- **Never** encourage an owner to break or withdraw a listing early (interference-with-contract risk). Position rental as plan B, alongside the agent.

### The owner tells their agent

Every owner letter says Koinonia will pay their listing agent's brokerage a referral fee if the owner chooses Koinonia to lease and manage the home. The owner then raises the option with their own agent, which keeps the agent in the loop and makes it the client's choice.

## 2. Agent referral program (owner-approved terms)

| Term | Decision |
|---|---|
| Lease referral fee | **Flat fee equal to one month of the management fee**, paid brokerage to brokerage **after the first month's rent clears** |
| Sale steer-back | When the owner wants to sell, Koinonia tells them in writing that their original agent is ready to help and connects them. The owner keeps 100% of the choice of agent. |
| Sale fallback | If the owner chooses Koinonia for the sale, the original agent's brokerage receives **40% of Koinonia's side of the commission**, paid at closing |
| Term | **All protections last 24 months from the date the first lease is signed.** Renewals and later tenants do not restart the clock. |
| Agreement | Written **brokerage-to-brokerage referral and non-circumvention agreement**, signed by both employing brokers when the lease referral happens |
| Koinonia's commitments during the term | No soliciting the owner for the sale; notify the agent of key events (lease signed, renewal, move-out, management ending, owner mentions selling); steer-back in writing |
| Owner consent | Management agreement clause: "Owner authorizes Koinonia to share leasing status and sale intent with [agent]." Status only — never rent amounts or tenant details. |
| Tail clauses | The 40% does not stack on a commission the original agent is already owed under their listing contract's protection-period clause |
| Owner's rationale | The owner always decides. The agent is paid at lease-up and again if the home sells with Koinonia within two years. No one is paid if the home neither rents nor sells. |

Gates before launch:

1. Licensed brokerage in place to pay and receive referral fees ([DRE Chapter 3](https://dre.colorado.gov/sites/dre/files/documents/2026_CREM_Ch%2003.pdf)).
2. **Attorney review** of the two-way referral (lease referral in, sale referral back). Broker-to-broker real estate referral fees are generally permitted under RESPA, but the reciprocal structure touches a settlement service; see [DRE Commission Position 3](https://dre.colorado.gov/sites/dre/files/documents/Commission%20Position%2003%20-%20RESPA%20and%20Referral%20Fees.pdf).
3. Check the standard Colorado listing contract for leasing-compensation or no-lease clauses.

Context: the owner already pays agents 40% referral fees for clients they hand over, so the 40% fallback matches existing practice.

## 3. Agreed launch site map (20 pages)

Model: Grace Property Management's menu structure ([rentgrace.com](https://www.rentgrace.com/)), adapted. **One strong Owners page covering all services at launch** (owner decision); separate service pages are split out over the first 90 days based on search demand.

### Header

Owners ▾ · Home Not Selling · For Agents · Rentals ▾ · Residents ▾ · About ▾ · Login · **[Free Rental Analysis]**

- **Owners:** Owner Services · Pricing · Free Rental Analysis · Owner FAQ · Service Areas · Castle Rock · Parker
- **Rentals:** Available Homes · How to Apply · Rental Policies
- **Residents:** Resident Services · Maintenance Request · Portal Login · Policies
- **About:** About & Team · Buying & Selling · Vendors · Contact

### Pages

| # | Route | Page | Status | Content |
|---|---|---|---|---|
| 1 | `/` | Home | Rewrite | Who we serve, 10%/8% plans, guarantee, payout on the 10th, response standard, Castle Rock/Parker, rental analysis CTA, "home not selling?" and agent doors |
| 2 | `/owners` | Owner Services | Rewrite (absorbs `/standards` content) | All services: marketing and leasing, screening, rent collection and payouts, maintenance and $250 approval limit, inspections, accounting and statements, legal compliance, guarantees, response times |
| 3 | `/pricing` | Pricing | Update | Full fee table, included services, 10% markup, $0 setup/vacancy/termination, first-year cost calculator |
| 4 | `/owner-faq` | Owner FAQ | **New** | File 09 §5 question bank, FAQPage schema |
| 5 | `/rental-analysis` | Free Rental Analysis | Keep | RentCast estimate + request form |
| 6 | `/home-not-selling` | Home Not Selling | **New** | Rent now, sell later; "can rent cover my mortgage" calculator; 2-of-5-years tax point; "we work with your agent" |
| 7 | `/for-agents` | For Agents | **New** | Section 2 in plain language + referral form |
| 8 | `/service-areas` | Service Areas | Update | Corridor (Fountain → Boulder, east to Aurora, west-side major cities), Pueblo "coming later" |
| 9 | `/property-management/castle-rock` | Castle Rock | **New** | City page from a shared template |
| 10 | `/property-management/parker` | Parker | **New** | City page from the same template |
| 11 | `/rentals` | Available Homes | Keep | |
| 12 | `/apply` | How to Apply | Keep (fee wording) | $35 fee limited to actual cost |
| 13 | `/tenants` | Resident Services | Rewrite | Benefits, how to pay rent, resident FAQ |
| 14 | `/maintenance` | Maintenance Request | Update | Three response tiers and after-hours instructions (file 08) |
| 15 | `/portals` | Portal Login | Keep | |
| 16 | `/about` | About & Team | **New** | Founder story, licensing line, values; **team section is data-driven so new staff are added as one entry each** |
| 17 | `/contact` | Contact | Update | Business hours, 1-hour response standard |
| 18 | `/policies` | Policies | Update | After-hours and emergency summary, fair housing |
| 19 | `/vendors` | Vendors | Keep | |
| 20 | `/real-estate` | Buying & Selling | Keep | Links to the steer-back story |

`/standards` stays live for existing links but leaves the menu; its content is summarized on `/owners`.

Not on the About page: the Koinonia Transactions connection. The Properties boundary verifier (`apps/properties-web/scripts/verify-boundary.mjs`) blocks Transactions identity on the Properties site, consistent with `BRAIN/PRODUCT_BOUNDARIES.md`.

### Team page requirement (owner)

Just the owner at launch. The page must make it easy to add people later: each person is one entry (name, role, short bio, photo, areas, contact) in a single list, and the layout grows from one card to a grid without design changes.

## 4. Build order (replaces file 09 §9)

| Phase | Work | Gate |
|---|---|---|
| **Launch** | The 20 pages above, built on the November dev line (`integration/koinonia-properties-consolidated-2026-11-17` / commit `af7b28b`), not the August production build | Licensing language, owner copy approval, attorney review of guarantee and agent program |
| **First 90 days** | Split Owners into service pages (screening, maintenance, rent collection, accounting, marketing, guarantees); Rent-or-Sell full tool; more city pages (file 07 §6 order) | Search data from Google Search Console |
| **After first clients** | Reviews, dated metrics, blog and monthly market report (Bergan model), more team bios | First clients and data |

## 5. Build log

- 2026-11-18: site changes for the launch map started on branch `feat/properties-site-architecture-2026-11-18`, cut from the November dev line. Not merged, not deployed to production.
