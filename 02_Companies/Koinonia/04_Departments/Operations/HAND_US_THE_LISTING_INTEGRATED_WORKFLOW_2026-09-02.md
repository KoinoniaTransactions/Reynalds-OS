# Hand Us the Listing — Integrated White-Glove Workflow

Date: 2026-09-02  
Status: Design Blueprint / Pre-Certification  
Owner: Koinonia  
Department: Operations  
Related strategic direction: `OWNER_DIRECTION_WHITE_GLOVE_ONE_STOP_SUPPORT_2026-09-02.md`  
Related capability catalog: `realtor_capability_catalog_working_master_2026-09-02.md`  
Related marketing design: `REALTOR_MARKETING_SERVICE_DESIGN_2026-09-02.md`

> This blueprint defines the intended end-to-end client experience for Koinonia's signature "Hand Us the Listing" solution. It does not, by itself, certify new service claims, pricing, MLS authority, licensed field activity, advertising authority, brokerage compliance, or vendor arrangements. Each underlying capability must be production-approved before launch.

---

# 1. Client Promise

## Core promise

> **Got the listing? Hand it to Koinonia.**

Koinonia becomes the operational control point from listing intake through launch, active-listing management, marketing, field support, accepted-offer handoff, transaction management, closing, and post-close follow-through.

The Realtor should remain focused on the work that most benefits from the Realtor personally:

- winning the listing;
- pricing/strategy;
- seller relationship and advice;
- negotiation;
- market judgment;
- business development;
- high-value client interaction.

Koinonia should absorb or coordinate the repeatable operational work around those responsibilities.

## What makes this different

The Realtor should not need to separately manage:

- a listing coordinator;
- a transaction coordinator;
- a social-media freelancer;
- a photographer;
- a sign/lockbox runner;
- an open-house host;
- a showing-coverage service;
- a printing vendor;
- a CRM assistant;
- a review/referral system;
- separate project trackers for each.

Koinonia owns the coordinated support experience while transparently using direct staff, licensed coverage, and approved specialists when appropriate.

---

# 2. End-to-End Lifecycle

**New Listing Request**  
→ **Seller / Property Intake**  
→ **Authority / Scope Check**  
→ **Listing Launch Plan**  
→ **Media / Vendor Coordination**  
→ **Listing Documents / MLS Preparation**  
→ **Marketing Production**  
→ **Listing Live**  
→ **Open House / Field / Active Listing Support**  
→ **Offer Accepted**  
→ **Transaction Management Handoff**  
→ **Closing / Possession**  
→ **Sold Marketing / Review / Referral / Past-Client Nurture**

The Realtor should experience this as **one Koinonia engagement**, even though multiple internal workstreams may run underneath it.

---

# 3. Stage 0 — Realtor Relationship Setup

This stage should happen once at initial Koinonia onboarding, not separately for every listing.

## Required saved profile

- Realtor name and license/brokerage information
- brokerage/company name
- primary contact methods
- billing method / card on file where applicable
- approved service area
- brokerage office-policy requirements supplied by Realtor
- MLS/system permissions available to Koinonia
- CTM / transaction-system permissions where applicable
- saved signatures/disclaimer requirements where allowed
- marketing brand profile
- headshot/logo/brand assets
- colors/fonts/style preferences
- approved social accounts
- approved email platform / sender identity
- advertising disclaimers / brokerage requirements
- preferred photographer/media vendors, if any
- preferred title/lender/vendor relationships, if any
- default seller communication preferences
- default marketing permissions
- default open-house preferences
- default field-coverage preferences
- approval rules: what requires explicit Realtor approval versus standing authorization

## Goal

Once onboarded, a Realtor should be able to send a new listing with minimal repeat data entry.

---

# 4. Stage 1 — New Listing Request

## Client-facing portal action

Primary quick action:

> **New Listing — Hand It to Koinonia**

The first screen should feel simple enough to complete from a phone.

## Minimum required intake

- property address
- seller/client names
- target listing date
- signed listing agreement status: signed / pending / not yet
- list price or "not final"
- occupancy status
- seller contact permission / communication rules
- preferred photographer/media option or "Koinonia coordinate"
- sign/lockbox needed? yes/no
- open house planned? yes/no/maybe
- special property/seller instructions
- upload or forward available listing documents

## Optional quick input

- voice note
- photos/screenshots
- seller-provided feature notes
- preferred go-live timeline
- marketing goal / special audience

## System output

Create a **Listing Engagement** record linked to:

- Realtor account
- seller/client
- property
- billing relationship
- tasks
- documents
- marketing work orders
- field requests
- vendors
- future transaction object

Status:

`INTAKE_RECEIVED`

---

# 5. Stage 2 — Intake Validation & Authority Check

Before operational execution, Koinonia confirms what it has authority and information to do.

## Validation checklist

- listing agreement status
- seller names/contact data
- property address and parcel/MLS data if available
- brokerage requirements supplied
- signed disclosures / missing disclosures
- marketing permission / coming-soon restrictions
- MLS access/permission model
- seller property-access permissions
- photography/access permission
- sign/lockbox authorization
- occupied/vacant status
- showing/open-house instructions
- HOA/community requirements if relevant
- target launch date
- any special confidentiality/safety requirements

## Decision paths

**Ready** → launch planning.

**Missing client/Realtor information** → create concise missing-items request.

**Requires Realtor/broker judgment** → pause only that decision; continue independent allowable work.

**Requires capability not yet production-certified** → offer approved alternative or disclose limitation.

Status examples:

- `WAITING_ON_AGENT`
- `WAITING_ON_SELLER`
- `WAITING_ON_BROKERAGE`
- `READY_FOR_LAUNCH_PLAN`

---

# 6. Stage 3 — Listing Launch Plan

Koinonia creates a single launch plan rather than having separate unconnected calendars for photos, MLS, signs, marketing, and open house.

## Launch-plan components

- target live date/time
- required paperwork timeline
- seller action items
- photography/media appointment
- staging/cleaning/repair/vendor needs
- sign installation
- lockbox installation
- MLS draft/input due date
- photo delivery deadline
- marketing production deadline
- Realtor approval deadline
- property-page / QR deadline
- showing-service configuration
- open-house target, if applicable
- launch communication to seller

## Critical-path rule

The system identifies dependencies.

Example:

Photos Wednesday 11 AM → media expected Wednesday evening → launch assets prepared Thursday morning → Realtor approval by noon → MLS/public launch Thursday afternoon.

If photography slips, downstream marketing and launch deadlines automatically become exceptions rather than silently failing.

Status:

`LAUNCH_PLANNED`

---

# 7. Stage 4 — Property Preparation & Vendor Coordination

Koinonia coordinates approved specialists rather than making the Realtor manage multiple appointments.

## Possible work orders

- photography
- drone
- video
- floor plan
- 3D tour
- staging consultation
- cleaning
- landscaping
- handyman / repair vendor
- sign installation
- lockbox installation
- print material production

## Vendor record requirements

- vendor
- scope
- appointment
- cost
- Realtor/client approval when needed
- property-access plan
- completion status
- deliverables
- invoice/cost allocation

## White-glove communication rule

The Realtor should receive a concise status such as:

> Photography is booked Wednesday at 11:00. Sign install is scheduled Tuesday. We're still waiting on the seller's property disclosure before the Thursday launch.

They should not receive a stream of every internal vendor message unless action is required.

Status:

`PREPARING_PROPERTY`

---

# 8. Stage 5 — Listing Documents & MLS Preparation

## Operational tasks

- collect/organize listing paperwork
- prepare permitted forms from Realtor instructions
- track signatures
- gather objective property information
- prepare MLS draft/input within permissions
- draft public remarks from verified property facts for Realtor approval
- upload/reorder photos
- upload approved disclosures/documents
- configure virtual-tour link
- configure showing service
- enter seller/agent-approved showing instructions
- confirm syndication settings within Realtor/brokerage direction
- complete listing-live QA

## Agent/Broker gate

Koinonia does **not** independently determine:

- list price
- material property representations
- disclosure answers
- negotiation positions
- brokerage relationship
- advertising claims unsupported by source information

The system should make Realtor approval fast and obvious instead of emailing entire drafts without clear decisions.

Status:

`LISTING_BUILD_IN_PROGRESS`

---

# 9. Stage 6 — Marketing Production

A new Listing Engagement automatically creates a linked **Listing Marketing Work Order** when marketing is included or requested.

## Default digital launch kit — working design

Potential components:

- property messaging / feature copy based on approved facts
- Just Listed social asset
- vertical Story/Reel asset
- email/e-flyer
- printable/open-house flyer
- property QR / tracked link
- property landing page or single-property page when included
- open-house promotion assets when applicable
- lifecycle placeholders for price improvement / under contract / sold

## Optional amplification

- database email
- paid Meta campaign
- retargeting
- direct mail/postcards
- neighborhood/farming campaign
- premium video campaign

## Approval experience

The Realtor should receive one consolidated approval view:

- property facts
- public remarks
- primary creative
- captions/copy
- launch schedule
- paid budget, if any

Avoid making the Realtor approve six independent vendors and ten disconnected files.

Status:

`MARKETING_READY_FOR_APPROVAL`

---

# 10. Stage 7 — Launch

## Launch gate

Before public launch:

- required listing documents/status complete enough under brokerage policy
- photos/media available
- MLS/public facts approved
- marketing assets approved
- showing instructions confirmed
- property access ready
- sign/lockbox status known
- seller launch timing confirmed as needed

## Launch actions

- activate/update MLS within authorized workflow
- verify listing live
- verify syndication where applicable
- publish/send approved marketing
- activate paid promotion if ordered
- send seller/realtor launch confirmation
- start showing-feedback workflow
- create open-house work order if applicable

Status:

`ACTIVE_LISTING`

---

# 11. Stage 8 — Active Listing Operations

Once live, Koinonia should continue to manage the repeatable work rather than disappearing until contract.

## Ongoing support

- showing-feedback collection
- feedback summaries
- weekly seller-update preparation
- showing-instruction changes from Realtor direction
- photo/document updates
- price/status changes from Realtor direction
- open-house scheduling
- open-house promotion
- open-house hosting/coverage when approved
- vendor/property access coordination
- listing refresh checklist
- stale-listing marketing refresh
- back-on-market reset
- sign/lockbox support
- property checks when approved

## Realtor action queue

Koinonia surfaces judgment decisions rather than forwarding raw noise.

Examples:

- Seller asking whether to reduce price → Realtor decision.
- Five showings but repeated feedback about paint → Koinonia summarizes pattern; Realtor advises seller.
- Buyer agent asks for Sunday access → Koinonia coordinates approved showing/coverage.
- Open house requested while Realtor is out of town → Koinonia creates field-coverage and marketing work orders.

---

# 12. Stage 9 — Open House Integrated Workflow

Open houses should not exist as a disconnected $200 task inside the larger relationship.

## Trigger

Realtor requests open house or launch plan includes one.

## Koinonia coordinates

- date/time
- seller confirmation
- MLS/open-house event entry where permitted
- host assignment / licensed coverage
- sign/material preparation
- social promotion
- email promotion
- optional paid promotion
- property information/talking-point packet from Realtor-approved facts
- visitor registration process
- lead ownership/hand-off rule before assignment
- host instructions
- setup/teardown
- property securement
- feedback/lead report
- post-open-house follow-up queue

## Output

One open-house summary to Realtor:

- attendance
- represented/unrepresented visitor breakdown if captured
- notable feedback
- leads returned to Realtor
- follow-up tasks
- property/security completion

---

# 13. Stage 10 — Offer Accepted / Transaction Handoff

This should be a **handoff, not a restart**.

The listing already exists inside Koinonia. When an offer is accepted, Koinonia should not ask the Realtor to re-upload data it already has.

## Trigger

Executed purchase contract received / accepted offer confirmed.

## Automatic handoff

Create or activate Transaction Object populated with:

- Realtor/client
- property
- seller information
- buyer/buyer-agent information from contract
- executed contract
- title/closing information if available
- closing date
- deadlines
- existing listing documents
- vendor history as relevant
- open items from listing phase

## Transition actions

- notify Realtor transaction is opened
- update listing status as directed/authorized
- queue under-contract marketing
- stop/adjust listing ads as appropriate
- transition field tasks to transaction needs
- start canonical Transaction Management workflow

Status:

`UNDER_CONTRACT`

The current Transaction Management service already provides the contract-to-close operating engine; this integrated package should use that existing certified system rather than duplicate it.

---

# 14. Stage 11 — Transaction Management

Use the production Transaction Management workflow for:

- timeline/deadlines
- lender/title/party coordination
- inspection
- appraisal
- due diligence
- repair documentation
- amendments/addenda follow-up
- closing scheduling
- final-walkthrough scheduling
- closing preparation
- exception management
- post-close file completion

## Integrated field opportunities

During transaction, the same Koinonia relationship may create field work orders for approved capabilities such as:

- inspection access
- appraisal access
- contractor access
- repair-completion access
- final walk-through support once specifically certified

No separate vendor-search experience should be necessary for the Realtor.

---

# 15. Stage 12 — Closing & Post-Close

## Closing operations

- closing confirmation
- closing reminders
- possession/key coordination where approved
- file completion
- listing sign/lockbox removal coordination
- vendor closeout

Physical closing attendance remains gated until the brokerage/designation/responsibility model is formally approved.

## Marketing lifecycle

Closed status triggers:

- Sold / Closed social asset
- optional success-story email
- property campaign shutdown
- seller review-request workflow
- referral-request workflow
- past-client database conversion
- closing anniversary schedule
- nurture plan

## Customer Success

Koinonia should also review:

- what else the Realtor used during the listing
- additional pain points discovered
- whether recurring Marketing Partner / Realtor Management support is appropriate
- field-coverage usage
- next listing/transaction opportunity

Status:

`CLOSED_AND_NURTURED`

---

# 16. Realtor Portal Experience

The client portal should not expose internal departmental complexity.

## Primary listing screen

At a glance:

- listing status
- target/live date
- current phase
- next critical action
- waiting on whom
- media status
- MLS status
- marketing status
- open-house status
- showing/feedback summary
- active exceptions
- costs/approved add-ons
- transaction status after accepted offer

## Quick actions

- Upload / Forward Document
- Ask Koinonia
- Change Listing Info
- Schedule Open House
- Need Property Coverage
- Create / Refresh Marketing
- Add Vendor Task
- Update Seller Instruction
- Submit Accepted Offer

## Default interaction model

The Realtor should be able to write:

> Seller wants an open house Saturday 11–2 and wants the price reduced to $685,000 Friday morning.

The system should create the correct workstreams, identify approval/authority requirements, and return a concise confirmation rather than forcing the Realtor to navigate separate product forms.

---

# 17. Internal Work Objects

Working object model:

## Listing Engagement

Parent operational record for the property/listing lifecycle.

## Listing Task

Administrative/listing work item.

## Marketing Work Order

Creative/campaign work linked to Listing Engagement.

## Vendor Work Order

Photography, staging, print, sign, cleaning, etc.

## Field Coverage Request

Licensed/in-person property task.

## Approval Request

Anything requiring Realtor/broker/seller approval.

## Exception

Missing input, delayed media, access issue, compliance issue, capacity problem, etc.

## Transaction Object

Activated at accepted contract and linked back to Listing Engagement.

## Client Relationship / CRM Record

Persists before and after the property lifecycle.

---

# 18. Communication Standard

White-glove does **not** mean flooding the Realtor with messages.

## Koinonia sends

- confirmations
- meaningful status changes
- concise missing-item requests
- decision requests
- exception alerts
- milestone updates
- weekly summary where appropriate

## Koinonia suppresses internally

- routine vendor chatter
- redundant confirmations
- internal task assignment messages
- low-value system activity

## Principle

> The Realtor gets visibility without becoming Koinonia's project manager.

---

# 19. Approval Standard

Use standing permissions wherever legally/professionally appropriate to reduce repetitive approval.

Possible pre-authorized items after onboarding:

- use saved brand templates
- schedule approved vendor categories up to defined budget caps
- publish approved recurring marketing formats
- send standardized seller status updates
- perform defined CRM/post-close workflows

Always require explicit approval for material decisions such as:

- price
- public material property claims
- seller disclosure answers
- negotiation positions
- ad budget beyond standing authorization
- strategic brokerage/agency decisions
- material changes to listing terms

---

# 20. Billing / Packaging Architecture

No price is approved in this blueprint.

The client experience should avoid nickel-and-diming every small task while preserving transparent economics.

## Recommended architecture for testing

### A. Hand Us the Listing — Launch

Operational listing launch + base digital marketing.

Third-party media and unusual field work billed separately or as selected add-ons.

### B. Hand Us the Listing — Full Listing Management

Launch + active-listing operations + marketing lifecycle + defined open-house/field allowance.

### C. Hand Us the Listing — Listing to Close

Full Listing Management + Transaction Management after accepted offer.

### D. White-Glove Realtor Management

Recurring relationship in which listing workflows become one component of a broader monthly Koinonia partnership.

## Pricing rule

Do not double-charge overlapping work.

Example:

If a Full Listing Management package already includes the base Listing Launch Marketing kit, do not add a separate Listing Launch Marketing fee unless the Realtor orders a clearly incremental upgrade.

## Pass-through / specialist costs

Photography, drone, premium video, staging, print/postage, paid-media spend, and other specialist/vendor costs must remain transparent internally and in client agreements even when the Realtor experiences one checkout/approval flow.

---

# 21. Exception Playbooks

## Media late

- flag launch dependency
- confirm revised ETA
- identify whether launch can proceed with partial assets
- present concise options to Realtor
- update downstream marketing schedule

## Seller not ready

- pause launch-dependent work
- preserve completed work
- reschedule vendors as needed
- update Realtor with cost implications

## Missing disclosure/signature

- request missing item
- do not independently complete seller representations
- continue unrelated allowable preparation

## Photographer/vendor no-show

- escalate vendor
- attempt approved backup vendor
- notify Realtor only if timing/cost materially changes

## Field coverage unavailable

- do not falsely confirm coverage
- use approved alternate fulfillment source where allowed
- present Realtor with clear choices if no coverage available

## Marketing approval late

- hold publication
- preserve scheduled work
- remind Realtor at defined interval
- distinguish approval delay from Koinonia production delay in metrics

## Offer arrives during launch/open-house activity

- preserve listing records
- create offer/contract workstream
- await Realtor negotiation/acceptance decision
- once executed, trigger formal transaction handoff

---

# 22. KPIs

## Client experience

- Realtor input minutes per listing
- number of separate vendors Realtor personally manages
- number of Koinonia decision requests per listing
- response time
- client satisfaction / retention

## Operational

- intake-to-launch time
- on-time launch rate
- missing-item cycle time
- vendor on-time rate
- marketing approval cycle time
- open-house fulfillment rate
- field-request fulfillment rate
- accepted-offer handoff time

## Financial

- revenue per listing engagement
- direct labor per listing
- vendor spend
- field-provider cost
- marketing production time
- gross margin
- attach rate of Transaction Management
- attach rate of Marketing / Field Coverage
- recurring relationship conversion

## Growth

- percentage of listings that become Transaction Management files
- percentage of listing clients who adopt recurring Marketing Partner / Realtor Management
- repeat listing rate
- referrals generated

---

# 23. Certification Checklist Before Public Launch

Before "Hand Us the Listing" can become a production package, complete:

1. Listing Operations service scope/SOP.
2. MLS/system permission model.
3. Listing advertising approval workflow.
4. Marketing capability certification for included deliverables.
5. Media/vendor network and vendor terms.
6. Sign/lockbox fulfillment model.
7. Open-house lead-ownership/coverage SOP.
8. Field-provider fulfillment and compensation model.
9. Seller/Realtor communication permissions.
10. Package pricing and unit economics.
11. Billing/pass-through cost rules.
12. Client agreement scope/exclusions.
13. Portal New Listing intake.
14. Listing Engagement data model/work queue.
15. Accepted-offer automatic handoff to Transaction Management.
16. Post-close review/referral/nurture triggers.
17. Brokerage/legal/E&O review for licensed or brokerage-sensitive capabilities.
18. Website/service claims updated only after certification.

---

# 24. Recommended Build Order

## Sprint 1 — Operational core

- Listing Engagement object/schema
- New Listing intake
- launch-plan checklist
- documents / approval queue
- accepted-offer handoff

## Sprint 2 — Vendor + media coordination

- Vendor Work Orders
- photographer/media flow
- sign/lockbox flow
- cost/approval tracking

## Sprint 3 — Listing marketing engine

- Marketing Work Order
- standard launch assets
- approval screen
- lifecycle triggers

## Sprint 4 — Active listing management

- feedback workflow
- weekly seller summary
- listing changes
- open-house work orders

## Sprint 5 — Field integration

- approved field-task request types
- provider assignment
- completion evidence
- client-facing field status

## Sprint 6 — Post-contract / post-close automation

- transaction object handoff
- sold campaign
- review/referral flow
- past-client nurture

---

# 25. Strategic Result

If implemented correctly, the Realtor experience is not:

> "Koinonia offers listing coordination, marketing, TC, and showing coverage."

It is:

> **"I got a listing. I handed it to Koinonia. They kept the operational work moving all the way through closing and follow-up."**

That is the white-glove relationship the broader Koinonia brand is intended to create.
