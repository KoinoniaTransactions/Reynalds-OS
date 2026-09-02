# Koinonia DORA Prospect Universe Pipeline

Status: Active Prospecting Data Source  
Owner: Koinonia Transactions  
Effective: 2026-09-02

## Purpose

Build the Koinonia Realtor prospect universe from the official Colorado DORA licensed-real-estate dataset before contact enrichment, rather than relying on search-engine discovery one agent at a time.

Official dataset:

- [Colorado Information Marketplace — Licensed Real Estate Professionals in Colorado](https://data.colorado.gov/Regulations/Licensed-Real-Estate-Professionals-in-Colorado/4zse-6bnw)
- Dataset ID: `4zse-6bnw`

## Broker Universe Filter

Use active individual broker license prefixes that DORA identifies in its real-estate rosters:

- `FA` — associate broker
- `EA` — employing-level broker associate
- `IA` — independent-level broker associate
- `II` — independent individual proprietor
- `EI` — employing individual proprietor
- `IR` — independent responsible broker
- `ER` — employing responsible broker

Exclude mortgage loan originators, appraisers, HOA registrations/designated agents, inactive/expired brokers, and real-estate company/entity licenses from the individual prospect universe.

## Official Bulk Pull

[Download active Colorado individual broker universe as CSV](https://data.colorado.gov/resource/4zse-6bnw.csv?$limit=50000&$offset=0&$select=licenselastreneweddate%2Clicensefirstissuedate%2Cstate%2Czipcode%2Cmiddlename%2Cverifylicense%2Csuffix%2Clicensestatus%2Clicensetype%2Clicensenumber%2Ccity%2Centityname%2Clicenseexpirationdate%2Clicenseprefix%2Cfirstname%2Clastname&$where=licensestatus%3D%27Active%27%20AND%20licenseprefix%20in(%27FA%27%2C%27EA%27%2C%27IA%27%2C%27II%27%2C%27EI%27%2C%27IR%27%2C%27ER%27)&$order=city%2Clastname%2Cfirstname)

If the active individual broker universe exceeds 50,000 records, pull a second page by changing `$offset=50000` and preserve both raw files before filtering.

## Official City Counts

[Download active individual broker counts grouped by DORA city](https://data.colorado.gov/resource/4zse-6bnw.csv?$select=city%2Ccount(*)%20as%20active_brokers&$where=licensestatus%3D%27Active%27%20AND%20licenseprefix%20in(%27FA%27%2C%27EA%27%2C%27IA%27%2C%27II%27%2C%27EI%27%2C%27IR%27%2C%27ER%27)&$group=city&$order=active_brokers%20desc&$limit=5000)

## Front Range Corridor Filter

Use `BRAIN/KOINONIA_SERVICE_AREA.md` as the geography source of truth.

The operating corridor runs approximately Boulder/Broomfield south through Denver metro, Douglas County, the Pikes Peak/Colorado Springs market, and Pueblo.

Do not reduce the corridor to a brittle short city whitelist. Geography filtering should consider city, ZIP, county/metro context, and obvious adjacent corridor communities.

## Data Layers

### Layer 1 — DORA Universe

Official active broker record:

- first/middle/last name
- license number
- license prefix/type
- license status
- first issue date
- last renewed date
- expiration date
- DORA city/ZIP
- entity name when present
- verification URL

### Layer 2 — Koinonia Geography

Add:

- service-area eligible
- Koinonia routing segment
- city/ZIP normalization
- geography review flag for edge cases

### Layer 3 — Public Contact Enrichment

Only after universe creation, research:

- current brokerage/team
- public professional/business email
- business phone
- website/profile
- verified public commercial office address
- contact-source URL and checked date

Do not assume DORA's city or entity alone is the current marketing contact location when stronger current public brokerage evidence exists.

### Layer 4 — Qualification / Scoring

Prioritize evidence such as:

- active residential practice
- transaction volume / production signal
- team lead or brokerage leadership
- growing solo agent
- multiple service-area markets
- visible operational complexity
- likely showing/contract/transaction/admin capacity pain

### Layer 5 — Campaign / Engagement

Apply:

- campaign wave
- brokerage/team throttling
- suppression/DNC
- email validation
- engagement events
- notification state
- office-visit review state

## Privacy / Repository Rule

This GitHub repository is public. Do not commit the downloaded person-level broker dataset or enriched emails/phones/addresses to Git.

Store raw and enriched working data only in approved private storage, including the ignored local workspace path:

`.local/koinonia/marketing/prospects/`

The repo stores process, schemas, filters, source URLs, and campaign logic only.

## Refresh Rule

DORA is the upstream licensing source. Refresh the universe periodically before major campaign expansion so inactive/expired licensees and newly active brokers can be reconciled.

Contact enrichment has a separate freshness requirement because brokerage, email, phone, and office information can change independently of the DORA license record.
