# AI Handoff — Koinonia Commercial Model + Unfinished Website Implementation

Date: 2026-09-05  
Owner: Koinonia  
Repository: `KoinoniaTransactions/Reynalds-OS`  
Status: **UNFINISHED WORKING CHECKPOINT — PREVIEW ONLY — NOT PRODUCTION APPROVED**

---

# 1. Purpose of This Handoff

This handoff preserves the full commercial/product-definition and public-website work completed in the September 3–4 Koinonia workstream so a new AI/developer can resume without reconstructing the prior conversation.

The user’s mission was:

> redefine Koinonia's services so they can be presented and sold to Realtors through the website, then update the actual public website only after the product/pricing model is coherent.

That product-definition phase is now substantially complete.

The website implementation has started and is present on `main`, but it has **not** received final visual/owner approval and has **not** been promoted to the dedicated production branch.

Do not confuse controlled-launch approval of a product with approval of the current website design.

---

# 2. Mandatory Release / Safety Rule

**DO NOT PROMOTE THE CURRENT WEBSITE WORK TO `koinonia-production` WITHOUT EXPLICIT OWNER APPROVAL.**

Current branch roles at this checkpoint:

- `main` — current active working/non-production repository state containing the newer commercial architecture and unfinished website implementation.
- `koinonia-production` — dedicated live-production branch. It remains intentionally behind the current `main` website work.
- `develop` — legacy/stale branch and not the current website review path.
- `koinonia-marketing-readiness` — separate older marketing-instrumentation prototype branch; do not merge wholesale.

The live domain can therefore continue to show the older production site while `main` contains newer unfinished work.

A successful Vercel preview/build is not equivalent to owner visual approval.

Required sequence:

1. review preview;
2. refine content/layout/CTAs/mobile presentation;
3. validate build and routes;
4. obtain Jeremiah's explicit approval;
5. only then prepare/promote the approved state to `koinonia-production`.

---

# 3. Commercial Positioning — Current Direction

Koinonia is no longer being positioned primarily as a transaction coordinator with add-ons.

Current white-glove positioning:

> **You focus on your clients. We'll keep the business running.**

Supporting language:

> **One relationship. More of your business covered.**

Customer-intake concept:

> **Bring Koinonia the need. We help get it handled.**

Tagline / brand line:

> **Real Estate Operations. Elevated.**

The commercial differentiator is breadth + continuity + accountability through one support relationship, not simply higher pricing.

---

# 4. Five Public Capability Areas

The public website should organize Koinonia’s breadth into these five client-facing areas:

1. **Transactions & Contracts**
2. **Listing & Seller Support**
3. **Licensed Field Coverage**
4. **Marketing & Growth**
5. **CRM & Business Operations**

These are discovery umbrellas, not necessarily separate SKUs.

Canonical master service catalog:

`02_Companies/Koinonia/00_Master_Objects/OBJ-00000001_Service_Catalog.md`

---

# 5. Current Commercial Products + Pricing

Current working launch pricing:

1. **Transaction Management — $450 per successful closing**
2. **Hand Us the Listing — $350 per standard listing**
3. **Licensed Field Coverage — from $75 per standard assignment**
4. **Professional Open House — $200 per standard event**
5. **Marketing Management — $750/month**
6. **Koinonia Partnership — $1,250/month**
7. **Custom Project — quoted before work begins**

Pricing philosophy:

> **Simple Koinonia service fee. Variable outside costs only when the work requires them. No task-by-task nickel-and-diming.**

Canonical pricing catalog:

`02_Companies/Koinonia/03_Pricing/OBJ-00000010_Pricing_Rules_Catalog.md`

Important gate:

Standalone Contract & Document Support does **not** currently have an approved public standalone price. Do not restore the historical `$75` public contract/document price without satisfying the compensation/brokerage operating-model gate.

---

# 6. Product / Capability Readiness Status

## Transaction Management

Status: **Production Certified**

Current price:

- $450 per successful closing;
- no successful closing, no standard Transaction Management coordination fee.

## Hand Us the Listing / Listing & Seller Support

Status: **Controlled Launch Approved**

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/HAND_US_THE_LISTING_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

Core promise:

> You win the listing. Koinonia manages the operational work around it through accepted-offer handoff.

Key boundaries:

- Koinonia is not the listing brokerage;
- MLS work must use approved direct-access or broker-submit workflow;
- no shared Realtor/MLS credentials as standard operating model;
- pricing strategy, CMA conclusions, negotiation, disclosure/material-fact judgment and brokerage approvals remain with Realtor/brokerage;
- base listing marketing is included;
- licensed field labor is separate;
- accepted offer hands into Transaction Management without duplicate setup/intake.

## Licensed Field Coverage

Status: **Controlled Launch Approved**

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/LICENSED_FIELD_COVERAGE_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

Launch pricing:

- from $75 per standard assignment;
- $200 per standard professional open-house event.

Approved standard public assignment types include:

- buyer showing coverage;
- approved multi-property tours;
- professional open-house hosting;
- inspection/appraisal/media/stager/vendor/contractor access;
- approved property/access tasks.

Do not market field coverage as substitute brokerage representation.

Negotiation, contract work, final-walk-through representation, closing/document-review coverage, disputes, and professional property-condition conclusions remain gated/outside standard product.

## Marketing Management / Marketing & Growth

Status: **Controlled Launch Approved**

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/MARKETING_MANAGEMENT_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

Price:

- $750/month.

Approved recurring scope includes:

- monthly marketing priorities/planning;
- social/content production;
- captions/copy and branded assets;
- efficient faceless/templated short-form content where appropriate;
- approved channel publishing/scheduling;
- recurring email/newsletter marketing;
- database/review/referral marketing support;
- listing/open-house lifecycle integration;
- routine online-presence support;
- concise monthly reporting.

Important boundaries:

- paid advertising is campaign-specific/conditional;
- ad/media spend is separate;
- SMS marketing is not part of standard launch promise until separate consent/compliance workflow is approved;
- professional media/print/specialty production are outside costs when used and approved;
- no guaranteed lead/reach/ranking/appointment/closing claims.

## Koinonia Partnership / CRM & Business Operations

Status: **Controlled Launch Approved**

Canonical readiness:

`02_Companies/Koinonia/04_Departments/Operations/KOINONIA_PARTNERSHIP_PUBLIC_CLAIM_AND_FULFILLMENT_READINESS_2026-09-03.md`

Price:

- $1,250/month.

Core distinction:

> Marketing Management owns what the market sees. Koinonia Partnership helps manage both what the market sees and the recurring business operations behind it.

Partnership includes the core Marketing Management relationship plus an agreed recurring layer of:

- CRM/pipeline maintenance;
- next-action/follow-up tracking;
- task/calendar support;
- past-client/review/referral workflows;
- vendor/business coordination;
- checklist/template/SOP upkeep;
- approved workflow/automation administration;
- recurring operations visibility/review.

Partnership does not automatically include unlimited:

- Transaction Management;
- Hand Us the Listing;
- Field Coverage;
- Open Houses;
- major custom projects;
- outside expenses.

---

# 7. Product Scope / “What Do I Get?” Sales Layer

A website-ready working sales document was created specifically to answer:

> **“What do I actually get for that price?”**

Canonical working sales copy:

`02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_PRODUCT_DETAIL_SALES_COPY_2026-09-03.md`

For each product it defines:

- what the Realtor hands Koinonia;
- what Koinonia handles;
- what is included in the fee;
- what may be separate;
- what remains with the Realtor;
- a practical real-world example;
- a CTA.

Presentation decision:

- pricing cards answer **what does it cost?**;
- detail sections answer **what do I actually get?**;
- the user should not have to leave the Services & Pricing page merely to understand the standard scope;
- use `See everything included` jump/expand behavior on the same page;
- separate SEO product pages can be created later if useful without redefining products.

---

# 8. Website Sales Architecture

Source blueprint:

`02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_CLIENT_FACING_WEBSITE_SALES_ARCHITECTURE_2026-09-03.md`

Intended Services & Pricing page flow:

1. hero;
2. breadth / one-partner message;
3. five capability umbrellas;
4. white-glove differentiation;
5. products/pricing;
6. Marketing Management vs Koinonia Partnership comparison;
7. popular solutions/use cases;
8. outside-expense explanation;
9. full “what do I get?” detail sections;
10. how it works;
11. professional-scope language;
12. CTA.

Primary hero direction:

Eyebrow:

> **REAL ESTATE OPERATIONS. ELEVATED.**

Headline:

> **One support partner for more of your real estate business.**

Primary CTA:

> **Tell Us What You Need**

Secondary CTA:

> **See Services & Pricing**

---

# 9. Website Code Already Implemented on `main` — UNFINISHED

The following changes exist in the repository and should be treated as **unfinished preview code**, not production-approved design.

## Services & Pricing

Files:

- `apps/web/content/services.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`

Relevant commits:

- `1b166db28583c64d133f9bf116ab05be25a73100` — Replace legacy services content with current white-glove product architecture
- `153eb78f95a4947e1d333080935117df5a85c756` — Rebuild services page for current Koinonia product architecture

Current working page includes:

- new one-partner hero;
- five capability areas;
- differentiation section;
- six buying/pricing cards including Custom Project;
- current pricing;
- Marketing vs Partnership comparison;
- common use cases;
- outside-expense explanation;
- full detail sections for each commercial buying path;
- CTA links;
- professional-scope section.

Legacy working-page content removed/replaced:

- old `$389` transaction price;
- old `$75` document-support price;
- old `$50` showing price;
- old `$299/month` entry point;
- old `$299/$599/$999` monthly hourly tiers;
- old four-service architecture.

## Homepage

Files:

- `apps/web/content/home.ts`
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`

Relevant commits:

- `6e1b26be0517c615d73f1745e59c53733ab936fc` — Reposition homepage around white-glove one-partner model
- `fc63ddffef4fcc98a8f77d275de1b100d7893d9c` — Rebuild homepage around current Koinonia offers

Working homepage direction:

> **You focus on your clients. We'll keep the business running.**

It broadens the visible offer beyond TC/document/showing into:

- transaction support;
- listings;
- field coverage;
- marketing;
- CRM/business operations;
- recurring relationship options.

## SEO

File:

- `apps/web/config/seo.config.ts`

Relevant commit:

- `973f0dff568a87e0ddcce89ca340fe586709d187` — Update public SEO copy for current Koinonia services

The working SEO copy now reflects the broader commercial model.

---

# 10. Current Production / Preview Reality

The owner specifically called out a workflow issue after being given the production URL and seeing the old site.

Important clarification for the next AI:

- The live production site is expected to remain old until approved code is promoted to `koinonia-production`.
- The newer work exists in non-production `main` / preview state.
- Do not tell the owner production has been updated merely because `main` changed or a Vercel preview built successfully.
- Do not use the production domain as proof of preview work.
- When sharing a preview, identify it explicitly as a non-production Vercel preview.

The prior preview-link confusion is a known process correction. Do not repeat it.

---

# 11. Known Remaining Website Work

The new public model is implemented structurally, but visual/product presentation is not considered done.

Next review should focus on:

1. whether the Services page feels premium/white-glove rather than text-heavy;
2. card density and hierarchy;
3. whether the long “everything included” detail sections need accordion/collapsible treatment or stronger visual grouping;
4. desktop spacing;
5. mobile spacing and readability;
6. CTA consistency and destination behavior;
7. whether Homepage and Services duplicate one another too much;
8. whether the new homepage still preserves the approved light/airy hero system;
9. whether pricing is easy to scan;
10. whether Marketing vs Partnership distinction is obvious;
11. whether public compliance/boundary language is present without dominating the sales message;
12. route/navigation behavior;
13. SEO metadata;
14. full build/typecheck/test state.

The user has not yet approved the finished visual result.

---

# 12. Relationship to Separate Marketing-Readiness Work

A separate current handoff exists:

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`

That work covers:

- GA4;
- UTM/click-ID attribution;
- Meta/TikTok pixels;
- privacy/consent;
- CRM attribution persistence;
- paid-social landing page;
- email campaign readiness.

Important integration rule:

The old `koinonia-marketing-readiness` branch was based on an older production baseline. Do **not** merge it wholesale into current `main`.

If marketing technical work resumes, create a fresh integration branch from current `main` and selectively port/reimplement the verified marketing-readiness capabilities.

This commercial/website handoff and the marketing-readiness handoff are complementary, not competing.

---

# 13. Hard Rules for the Next AI / Developer

- Read `START_HERE.md` and repository Brain files before changing code.
- Treat repository truth as authoritative over chat memory.
- Do not reopen the entire commercial model unless a real inconsistency is discovered.
- Do not restore legacy prices or monthly tiers.
- Do not invent a standalone public contract/document price.
- Do not market Licensed Field Coverage as substitute brokerage representation.
- Do not promise guaranteed marketing results.
- Do not treat Partnership as unlimited assistant access.
- Do not double-charge standard listing marketing when the client also has Marketing Management.
- Do not auto-discount core per-file/field products for Partnership clients at launch.
- Keep outside expenses separate and pre-approved when required.
- Do not promote current website work to `koinonia-production` without explicit owner approval.
- Do not claim production changed until the production branch/domain actually reflects the reviewed release.
- Preserve the existing approved hero/image system unless the owner explicitly reopens it.
- Keep portal/internal-platform expansion parked unless it directly supports public website completion.

---

# 14. Recommended Resume Sequence

For a new AI taking over the current website work:

1. Read `START_HERE.md`.
2. Read `BRAIN/CURRENT_PRIORITIES.md`.
3. Read this handoff.
4. Read `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md` if campaign/analytics work is also in scope.
5. Inspect current `main` versions of:
   - `apps/web/content/services.ts`
   - `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
   - `apps/web/content/home.ts`
   - `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
   - `apps/web/config/seo.config.ts`
   - shared Header/Hero/CTA/Footer components;
   - design-system styles.
6. Inspect the current non-production preview.
7. Perform visual/content QA before adding more architecture.
8. Refine only what is necessary to make the current commercial model clear, premium, and usable.
9. Validate desktop/mobile + CTA/routes + build.
10. Present preview to Jeremiah.
11. Obtain explicit owner approval.
12. Only then prepare the production promotion into `koinonia-production`.

---

# 15. Immediate Next Decision

The next AI should **not** begin with more product ideation.

The immediate decision is:

> Does the current non-production Homepage + Services & Pricing implementation visually and commercially present the approved Koinonia model well enough to release?

If no: refine the preview.

If yes and owner expressly approves: prepare the controlled production promotion.
