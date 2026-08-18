# Koinonia Transactions — Meta Ads Build & Launch Playbook

Status: Build-Mode Operating Playbook  
Business: Koinonia Transactions  
Owner: Marketing  
Effective Date: 2026-08-17

## Purpose

Define exactly how Koinonia will build, QA, launch, monitor, and optimize its first Facebook + Instagram paid lead-generation campaign.

This document does not authorize ad launch or spend.

Until activation is explicitly approved:

- do not publish campaigns
- do not activate ad sets or ads
- do not enter a live budget
- do not turn on automatic spend increases
- do not connect unreviewed CRM events to Meta

---

# First-Test Strategy

Campaign theme:

**More Transactions Should Create More Opportunity, Not More Chaos.**

Audience qualifier:

**For Colorado Realtors**

Primary goal:

Generate qualified Realtor conversations about operational pressure.

Do not optimize the business around cheapest form fills.

The first test should answer:

- which pressure angle attracts the right Realtor
- which creative produces meaningful conversations
- whether Instant Form leads are usable
- whether Koinonia's response process is fast enough
- whether first paid engagements justify continued spend

---

# Current Meta Product Baseline

Meta currently supports the Leads objective with multiple conversion locations including Instant Forms, website forms, messaging, and calling.

For eligible Leads campaigns, Advantage+ leads is an automation-first/default setup that may enable Advantage+ audience, placements, and campaign budget.

Koinonia's first test uses:

- Objective: Leads
- Conversion location: Instant Form
- Geography: Colorado
- Advantage+ automation where appropriate
- no unnecessary interest-stack overengineering

Platform interfaces change. During implementation, verify the current Ads Manager labels before launch without changing the business logic in this playbook.

---

# Campaign Architecture

## Campaign

Name:

`KTX_META_LEADS_OPPORTUNITY_NOT_CHAOS_V1`

Objective:

Leads

Status during build mode:

Draft / Off

Budget model:

Working first test:

- $20/day
- 14 days
- $280 planned maximum initial spend
- no automatic budget increase

This is a Koinonia test budget, not a Meta requirement or promised performance level.

## Ad Set

Name:

`KTX_CO_REALTORS_INSTANTFORM_V1`

Primary settings:

- conversion location: Instant Form
- location: Colorado
- audience: Colorado real-estate professional intent/context where available, but avoid a tiny manual interest stack before evidence supports it
- placements: Advantage+ placements unless a real placement-quality problem appears

Do not exclude useful inventory simply because it is unfamiliar.

Do not expand outside Colorado during the first test.

## Ads

Create three primary creative angles.

### M1 — Operational Chaos

Internal name:

`M1_MORE_OPPORTUNITY`

Primary copy concept:

**More transactions should create more opportunity, not more chaos.**

Headline:

**What Is Stealing Time From Your Business?**

On-image / opening line:

**More Opportunity. Less Operational Chaos.**

### M2 — Client Time Protection

Internal name:

`M2_CLIENT_TIME`

Headline:

**You Focus on Your Clients.**

Supporting line:

**We'll keep the business running behind you.**

### M3 — Smallest Useful Starting Point

Internal name:

`M3_START_SMALL`

Headline:

**Start With the Pressure You Have Now**

Message:

Koinonia does not require a Realtor to replace their entire operating system or hire a full-time employee. Start with the smallest useful engagement.

---

# Creative Format Rules

Prepare at least one flexible visual/video concept that can adapt across Feed, Stories, and Reels placements.

Preferred visual direction:

- bright
- clean
- professional
- calm
- real-estate operations context
- black / warm white / Koinonia gold accents
- no dark luxury cliché
- no software-dashboard-first creative

Creative should communicate the problem before the service list.

Avoid:

- excessive text on image
- tiny unreadable service lists
- pricing collage
- referral-option dominance
- fake urgency
- exaggerated income/productivity promises

---

# Meta Creative QA Checklist

Before approval:

## Message

- Colorado Realtor audience is clear
- one pressure or promise per creative
- Koinonia category is understandable
- no unsupported guarantee
- no implication that Koinonia replaces Realtor judgment
- Referral Partner path is not mixed into general support creative

## Visual

- brand-consistent
- readable on mobile
- crop safe across placements
- no confidential information
- no unlicensed/copyrighted asset misuse
- no misleading before/after claim

## Destination / Form

- correct Instant Form selected
- privacy URL correct and live
- thank-you destination correct
- business identity matches Koinonia

## Final

- ad name correct
- version recorded
- correct Facebook Page
- correct Instagram account
- campaign/ad set still Off until launch approval

---

# Instant Form

Form name:

`KTX_PRESSURE_DIAGNOSIS_V1`

Form purpose:

Identify the Realtor's actual pressure before Koinonia recommends a service.

Intro:

**Where is your business feeling the pressure?**

Recommended contact fields:

- first name
- last name
- email
- phone

Email is required.

Phone may be optional in the first test if manual implementation review determines that requiring it creates unnecessary friction.

Do not collect sensitive transaction/client information in the ad form.

---

# Qualifying Questions

## Q1 — Role

**Which best describes you?**

- Colorado Realtor
- Team lead / team member
- Brokerage leader / manager
- Other real estate professional
- None of the above

## Q2 — Pressure

**What is taking the most time in your business right now?**

- transaction/file follow-through
- contracts/documents
- showing conflicts
- open houses/listing support
- CRM/follow-up/organization
- I have client opportunities I do not want/cannot take
- something else

## Q3 — Timing

**When would support be most useful?**

- current need
- within the next 30 days
- exploring for later

Keep the form focused.

Do not add questions simply because the platform allows them.

---

# Form Privacy / Lead Terms Gate

Before launch:

- Koinonia privacy policy must be publicly reachable
- privacy URL must reflect actual data/advertising practices
- Meta Lead Ad Terms must be accepted by the authorized business user
- form questions must be necessary and appropriate
- Koinonia must know who can access submitted lead data

Do not launch with a placeholder or broken privacy link.

---

# Thank-You Screen

Headline:

**Thank you — we'll follow up personally.**

Body:

Koinonia will review the pressure you selected and follow up with the smallest useful next step.

CTA options:

Preferred initial choice:

**Visit Koinonia**

Destination:

Koinonia website/contact path using appropriate paid-social UTM attribution.

A Schedule Consultation CTA may be used later if live conversion testing shows it improves qualified conversations without creating duplicate/confusing intake.

---

# Paid UTM Standard

Use lowercase.

## Source

- `facebook`
- `instagram`

Where Meta placement-level source cannot be cleanly preassigned because delivery spans both platforms, use campaign/ad-level tracking parameters that preserve Meta as source and placement breakdown in Ads Manager.

## Medium

`paid_social`

## Campaign

`opportunity_not_chaos_v1`

## Content

Examples:

- `m1_more_opportunity`
- `m2_client_time`
- `m3_start_small`

Do not create inconsistent ad-hoc UTM names inside individual ads.

---

# Account / Asset Readiness Checklist

Before build becomes launch-ready, manually verify:

## Business access

- Meta Business Portfolio access
- Facebook Page access
- Instagram professional account connected
- correct ad account
- correct user permissions
- lead access permissions

## Billing

- valid payment method
- correct business billing details
- no unresolved account restriction

## Brand assets

- correct Page identity
- correct Instagram identity
- approved profile images

## Lead operations

- person responsible for leads can retrieve them
- notification method is understood
- backup retrieval method exists

Do not assume Page access automatically means lead-data access is correct.

---

# Lead Retrieval — Phase 1

The first active test must have a reliable way to retrieve leads promptly.

Preferred order:

1. automated CRM retrieval if safely implemented and tested
2. Meta Leads Center
3. controlled manual download as temporary fallback

Meta distinguishes lead retrieval from Conversions API optimization.

Lead retrieval gets the submitted lead into Koinonia's workflow.

Conversions API later sends downstream quality/outcome signals back to Meta.

Do not wait for a sophisticated Conversions API integration before testing the first campaign if lead retrieval and response are reliable.

---

# Native Meta Lead -> Koinonia Relationship Mapping

Every meaningful Meta lead should become one Koinonia Relationship record.

Capture:

- Source: Social Media
- Source detail: Meta paid lead / campaign / creative
- First-touch channel: Facebook or Instagram when known
- Campaign: `opportunity_not_chaos_v1`
- pressure category
- exact free-text language if supplied
- timing
- lifecycle stage
- next action
- next-action date

Do not create a separate shadow spreadsheet as the permanent CRM.

A temporary launch sheet may exist only as an operational backup if native integration is not yet ready.

---

# First Lead Response

Working response target during launch:

**Same business day, as quickly as practical.**

For active/current-need submissions, faster response is preferred.

Response opening:

**You selected [pressure]. Before I recommend anything, I'd like to understand the actual situation. What's happening in the business that made that one stand out?**

Do not respond with a five-service brochure dump.

Diagnose first.

---

# Budget Control Rules

Initial test:

- $20/day
- 14 days
- $280 intended cap

Do not:

- automatically raise budget because CPL looks cheap
- double budget during early learning
- create multiple competing campaigns with the same small budget
- launch Meta and TikTok paid tests simultaneously during the first learning cycle

Budget changes require an intentional review.

---

# First 72 Hours Rule

After activation, avoid major edits during approximately the first 72 hours unless:

- ad/form is broken
- privacy link is wrong
- lead access is broken
- serious policy/compliance issue appears
- targeting/geography is clearly incorrect
- spend control is malfunctioning

Do not repeatedly edit copy/audience/budget because a few early leads feel expensive.

The goal is to collect enough signal to make a reasoned decision.

---

# 72-Hour Review

Review:

- spend
- leads
- role qualification
- pressure categories
- meaningful conversations
- obviously poor-fit leads
- form completion quality
- response operational performance
- creative-level lead quality

Do not judge only:

- impressions
- CTR
- cheapest CPL

Primary question:

**Are the people submitting the form plausible Koinonia relationships?**

---

# Green / Yellow / Red Decision Framework

## Green

Signals:

- qualified Colorado Realtors are submitting
- meaningful conversations are occurring
- pressure language matches Koinonia's service lanes
- response process is working
- no major compliance/lead-access issue

Action:

Continue the planned test without unnecessary edits.

Do not automatically increase budget.

## Yellow

Signals:

- some qualified leads but weak conversation rate
- one creative attracts poor fit
- form friction or confusing question appears
- lead response delay exists

Action:

Diagnose the specific weak point.

Change one meaningful variable at a time when practical.

## Red

Signals:

- geography/role badly wrong
- spam/fraud dominates
- form/privacy path broken
- lead retrieval fails
- no viable conversation despite enough spend/volume to evaluate
- ad/account policy concern

Action:

Pause and diagnose.

Do not spend through a known broken system simply to finish 14 days.

---

# Day-14 Review

At planned test end calculate:

- total spend
- leads
- qualified leads
- meaningful conversations
- consultations
- first paid engagements
- first revenue attributed
- cost per lead
- cost per qualified lead
- cost per meaningful conversation
- cost per consultation
- cost per first paid engagement

Also review:

- pressure category distribution
- creative quality by business outcome
- objections
- wrong-fit lead patterns
- response speed

A cheap lead that never becomes a useful conversation is not a winning lead.

---

# Scale Rules

Do not scale until:

1. lead quality is acceptable
2. lead response is operationally reliable
3. at least one creative/angle shows repeatable qualified response
4. spend can be increased without overwhelming follow-up
5. measurement is trustworthy enough to interpret

When scaling later:

- increase deliberately
- preserve a clean comparison period
- avoid stacking multiple major changes together

Do not use a universal percentage rule as if platform performance is guaranteed.

---

# Stop Rules

Pause when:

- lead access or response breaks
- privacy/compliance problem exists
- campaign is serving outside intended geography in a material way
- fraud/spam makes results unusable
- spend exceeds approved control
- repeated qualified-conversation failure persists after enough data

Stop/hold may also be appropriate when Koinonia cannot operationally respond to new leads.

Marketing should not create demand Koinonia cannot serve responsibly.

---

# Advantage+ Audience / Placements Rule

Initial approach:

Use Meta's current automation where appropriate rather than over-constraining the campaign with a tiny interest stack.

Keep hard business constraints clear:

- Colorado
- relevant age/legal platform settings
- correct business identity

Use placement/audience breakdowns for diagnosis.

Restrict only when real performance/quality evidence supports the change.

---

# Website Form Test — Later Layer

Koinonia's first test is Instant Form first.

A later controlled comparison may test website-form conversion once:

- website privacy page is live
- attribution is verified
- consultation conversion path is tested
- Meta Pixel/CAPI web event plan is ready enough for useful measurement

Meta currently supports both Instant Form and website-form lead campaigns, and Meta reports advantages from mixed strategies in aggregate advertiser data.

Koinonia should still validate with its own qualified-conversation economics rather than assume those averages will apply.

---

# Pixel / Conversions API Implementation Plan

Do not install tracking merely because it exists.

## Phase A — Website Event Foundation

Later implementation should define useful events such as:

- contact page view
- consultation form start
- consultation form submission

Do not send unnecessary form text or sensitive transaction information as event data.

## Phase B — Conversions API for Website

Use alongside browser-based Meta Pixel where appropriate to improve measurement reliability.

## Phase C — CRM / Down-Funnel Lead Quality

Once Relationship outcome data is reliable, evaluate sending events such as:

- Qualified Lead
- Consultation
- Paid Engagement

Meta's Conversions API can receive CRM/offline/down-funnel marketing data to improve optimization and measurement.

Do not send ambiguous lifecycle data until Koinonia's internal definitions are stable.

## Phase D — Conversion Leads Optimization

Only consider optimizing for conversion leads after enough reliable qualified-outcome data exists and CRM/CAPI feedback is functioning.

Do not pretend the first campaign has machine-learning signal it does not yet have.

---

# Data / Privacy Rules

Use lead data only for legitimate Koinonia relationship and marketing purposes described by applicable notices/terms.

Do not:

- collect sensitive client transaction details in Instant Forms
- repurpose lead data into unrelated businesses without a proper basis
- upload unnecessary personal data to Meta
- use Conversions API as a way to bypass privacy/platform restrictions

Meta's Lead Generation Terms and Business Tools requirements apply in addition to Koinonia's own privacy obligations.

---

# Ad Review / Policy QA

Meta reviews ads before they run and may assess:

- creative
- copy
- targeting
- landing page/destination

Before launch:

- verify destination works
- verify website claims match ad claims
- avoid misleading personal-attribute assumptions
- avoid guaranteed results
- ensure service availability/geography is truthful

If rejected:

- read the specific policy reason
- correct the actual issue
- do not repeatedly resubmit superficial variations without understanding the cause

---

# Reporting Hierarchy

## Primary

- qualified Realtor conversations
- consultations
- first paid engagements
- attributed revenue

## Secondary

- qualified leads
- cost per qualified lead
- cost per meaningful conversation
- form completion quality

## Diagnostic

- CPL
- CTR
- CPM
- impressions
- frequency
- placement performance

Do not optimize the business around a vanity CPL.

---

# Build-Mode Activation Gate

Meta paid remains inactive until all are true:

1. Koinonia has entered implementation mode.
2. Meta Business/Ad Account/Page/Instagram access is verified.
3. billing is verified.
4. lead access is verified.
5. privacy policy is live and accurate.
6. Instant Form is reviewed and tested.
7. lead retrieval path is tested.
8. lead response owner/process is ready.
9. campaign/ad-set/ad naming is correct.
10. creative is approved.
11. $20/day x 14-day working budget is approved.
12. stop/scale rules are understood.
13. Relationship capture is ready.
14. the user explicitly approves Meta activation.

Until then:

**Campaign status = Draft / Off. Spend = $0.**

---

# Build-Phase Completion Definition

The Meta paid system is considered built when Koinonia has:

1. first-test goal defined
2. campaign structure defined
3. naming convention defined
4. geo/audience approach defined
5. three creative angles defined
6. creative QA defined
7. Instant Form defined
8. qualifying questions defined
9. privacy/lead-terms gate defined
10. lead retrieval plan defined
11. CRM mapping defined
12. response handoff defined
13. budget controls defined
14. 72-hour review defined
15. green/yellow/red decisions defined
16. Day-14 review defined
17. stop/scale rules defined
18. Advantage+ rules defined
19. website-form later test defined
20. Pixel/CAPI roadmap defined
21. privacy/data rules defined
22. activation gate defined

No ad must run and no money must be spent to complete build mode.

## Next Build Dependency

Next system:

**Brokerage Relationship Playbook**

It should define brokerage account selection, leader outreach, 15–20 minute presentation format, pre-meeting preparation, meeting capture, agent-level follow-up boundaries, and account-level reporting—without contacting any brokerage during build mode.
