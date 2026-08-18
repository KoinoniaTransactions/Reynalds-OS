# Koinonia Transactions — TikTok Paid Phase Playbook

Status: Build-Mode Operating Playbook  
Business: Koinonia Transactions  
Owner: Marketing  
Effective Date: 2026-08-17

## Purpose

Define when and how Koinonia may add TikTok paid advertising after organic learning has produced enough signal to justify it.

This document governs:

**Organic learning -> Paid-readiness decision -> Spark Ads first -> Lead Generation / Instant Form -> Lead retrieval -> Quality review -> Pixel / Events API roadmap -> Stop / scale**

This document does not authorize TikTok paid activation.

Until activation is explicitly approved:

- do not launch TikTok campaigns
- do not boost posts
- do not create live Spark Ads
- do not fund an ad account
- do not publish lead forms for paid use
- do not install production TikTok tracking

---

# Core TikTok Paid Principle

Koinonia should not use TikTok paid as a substitute for learning what works organically.

Paid starts only after organic content teaches us which problems, hooks, and formats attract the right Realtors.

Sequence:

1. publish organic TikTok consistently
2. capture actual buying-intent signals
3. identify repeatable problem/hook combinations
4. select proven organic creative
5. test Spark Ads first where appropriate
6. add native Lead Generation / Instant Form when the lead-response system is ready
7. add website conversion optimization only after tracking is verified
8. add retargeting after enough audience volume exists

---

# Current TikTok Product Baseline

TikTok currently supports:

- Spark Ads using organic TikTok posts
- Lead Generation campaigns with Instant Forms
- Instant Form types including More Volume and Higher Intent
- form-level tracking parameters
- CRM integration / lead download workflows
- UTM parameters and dynamic macros for website URLs
- Pixel and Events API for web measurement
- Business Account and lead-generation Custom Audiences for retargeting when minimum audience requirements are met

Platform labels/features change. Verify the current interface during implementation, but preserve the business logic in this playbook.

---

# Organic-Learning Gate

TikTok paid must not begin merely because:

- a Business Account exists
- an Ads Manager account exists
- one video received high views
- another business says TikTok ads work

Paid readiness requires evidence.

## Minimum organic evidence

Before TikTok paid activation, Koinonia should have:

- at least 12–20 organic videos published across multiple pressure categories
- at least 3–4 weeks of consistent organic activity unless strong earlier business signal justifies review
- more than one hook/format tested
- meaningful Realtor comments, DMs, profile actions, website visits, or consultation interest from TikTok
- at least one content concept showing repeatable qualified engagement rather than one isolated viral result

The numerical thresholds are working Koinonia readiness criteria, not TikTok platform requirements.

## Strong paid-readiness signals

Examples:

- Realtors ask how showing/open-house support works
- multiple people describe the same operational pressure
- qualified DMs reference a specific video
- profile visits lead to consultation activity
- one theme performs well across multiple videos

## Weak signals

Examples:

- views with unrelated audience comments
- generic likes
- followers with no real-estate relevance
- one entertainment-heavy viral video with no business intent

Do not promote a Weak Signal simply because it has the highest view count.

---

# Paid Creative Selection Score

Score candidate organic videos 0–2 on each dimension.

## Audience Fit

- 2 = clearly attracting Colorado Realtors / real-estate professionals
- 1 = mixed but plausible
- 0 = mostly irrelevant audience

## Pressure Clarity

- 2 = one clear operational problem
- 1 = partially clear
- 0 = generic branding/entertainment

## Buying-Intent Signal

- 2 = DMs/questions/consultation behavior
- 1 = saves/shares/profile interest
- 0 = views/likes only

## Hook Strength

- 2 = repeatable strong opening
- 1 = adequate
- 0 = weak/slow

## Koinonia Fit

- 2 = natural Koinonia solution
- 1 = educational but indirect
- 0 = little commercial relevance

## Brand / Compliance

- 2 = ready for paid amplification
- 1 = minor revision needed
- 0 = not suitable

Maximum = 12.

Suggested review:

- 10–12 = strong Spark candidate
- 7–9 = consider remake/test
- 0–6 = do not pay to amplify yet

Score does not authorize launch.

---

# Phase 1 — Spark Ads First

Preferred first paid TikTok layer:

**Amplify proven Koinonia organic content using Spark Ads.**

TikTok Spark Ads use organic posts as ad creative and attribute paid engagement back to the organic post.

Use Koinonia's own linked Business Account content for the first phase.

Do not introduce creator partnerships before Koinonia understands its own paid economics.

## Why Spark first

- preserves native content feel
- builds on actual organic evidence
- keeps paid/organic learning connected
- reduces pressure to manufacture polished commercial ads

## Spark candidate rule

The video should already be a business or learning winner before paid spend.

Do not use paid spend to rescue a weak organic concept without a clear reason.

---

# Spark Campaign Naming

Example campaign:

`KTX_TT_SPARK_PRESSURE_V1`

Ad group:

`KTX_CO_REALTORS_SPARK_V1`

Ad names:

- `T02_TWO_SHOWINGS_SPARK_V1`
- `T05_OPEN_HOUSE_SPARK_V1`
- `T07_NO_FULLTIME_ASSISTANT_SPARK_V1`

Preserve the original TikTok content ID so paid and organic results can be compared.

---

# Phase 2 — TikTok Lead Generation / Instant Form

Use only after:

- organic-learning gate is met
- paid creative candidate exists
- lead response is operational
- privacy destination is live
- lead retrieval is tested

Objective:

**Lead Generation**

Optimization location:

**Instant Form** for the first native lead test.

TikTok Instant Forms currently support contact fields, custom questions, tracking parameters, and form types designed for volume or higher intent.

---

# Instant Form Type

Preferred initial form for Koinonia:

**Higher Intent** if available for the chosen format.

Reason:

Koinonia values qualified Realtor conversations more than raw form-fill volume.

TikTok's Higher Intent form adds a review step and CAPTCHA, while More Volume removes that additional review step.

If early lead volume is too low to learn anything, test More Volume later as a controlled variable rather than changing immediately.

---

# TikTok Instant Form

Form name:

`KTX_TT_PRESSURE_DIAGNOSIS_V1`

Intro:

**Where is your real estate business feeling the pressure?**

Recommended contact fields:

- first name
- last name
- email
- phone optional initially unless implementation testing supports requiring it

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
- within 30 days
- exploring for later

Keep the form concise.

Do not collect client confidential or transaction-sensitive details in the lead form.

---

# Privacy / Form Gate

TikTok currently requires a privacy policy URL for Instant Forms.

Before paid activation:

- live Koinonia privacy URL verified
- form data use matches actual privacy practices
- TikTok Lead Ads Terms / advertising policies reviewed
- lead-access permissions confirmed
- form fields are necessary
- follow-up process is ready

Do not complete/publish a paid lead form using a placeholder privacy link.

Important platform behavior:

Once a TikTok Instant Form is completed/published, it cannot simply be edited in place; changes may require copying the form and creating a new version.

Therefore use versioned form names and QA carefully before completion.

---

# Lead Retrieval Rule

TikTok Ads Manager currently stores Instant Form lead data for 90 days.

Therefore Koinonia must not rely on TikTok as the permanent lead database.

Preferred retrieval order:

1. tested CRM integration
2. Leads Center / TikTok lead management tools
3. controlled manual CSV download as temporary fallback

Lead data should enter Koinonia's Relationship system promptly.

Do not wait near the 90-day retention window.

---

# TikTok Lead -> Koinonia Relationship Mapping

Capture:

- Source: Social Media
- Source detail: TikTok paid lead
- First-touch channel: TikTok
- Campaign
- Ad group
- creative/content ID
- Instant Form version
- pressure
- timing
- exact language if provided
- lifecycle
- next action
- next-action date

Do not retain unnecessary ad-platform identifiers as business-profile data unless they are required for a defined measurement/integration purpose.

---

# First Lead Response

Use the same Koinonia diagnosis standard as every other source.

Opening:

**You selected [pressure]. Before I recommend anything, I'd like to understand the actual situation. What's happening in the business that made that one stand out?**

Same-business-day response is the working standard.

For current/urgent needs, respond as quickly as practical during business hours.

---

# TikTok Paid UTM Standard

For website destinations:

## Source

`tiktok`

## Medium

`paid_social`

## Campaign

Examples:

- `spark_pressure_v1`
- `leadgen_pressure_v1`

## Content

Use original content ID / ad concept.

Examples:

- `t02_two_showings`
- `t05_open_house`
- `t07_no_fulltime_assistant`

TikTok Ads Manager currently supports standard UTM parameters and dynamic macros. TikTok can also auto-attach UTM parameters in supported setups.

Koinonia should keep naming readable and consistent rather than relying entirely on platform-generated names.

For every paid website destination, include at least:

- `utm_source=tiktok`
- a stable campaign/content identifier

Use `utm_id` as appropriate when implementation requires stronger analytics matching.

---

# Tracking Parameters for Instant Forms

TikTok Instant Forms support hidden tracking parameters that appear in API, CSV, or CRM lead data.

Recommended fields:

- `koinonia_campaign`
- `koinonia_content_id`
- `koinonia_form_version`

Use these for internal mapping when available.

Do not use hidden parameters to collect sensitive user information.

---

# First Paid Test Budget

TikTok paid should not overlap Meta's first learning test unless Koinonia intentionally decides it has enough operational capacity and measurement clarity to run both.

Preferred sequence:

1. Meta first test completed or substantially understood
2. TikTok organic evidence reviewed
3. TikTok paid test approved separately

Working TikTok test budget should be set at activation based on:

- current TikTok minimum-budget rules
- current account/campaign type
- Koinonia cash budget
- lead-response capacity
- strength of organic evidence

Do not hard-code a dollar amount in this build playbook because platform minimums and auction economics can change.

At activation, set a fixed maximum test budget and no automatic increase.

---

# Test Design

Keep the first paid TikTok test narrow.

Preferred structure:

- one campaign objective
- one clear Colorado audience strategy
- 1–3 proven creative concepts
- one form version
- one primary business KPI

Do not simultaneously test:

- Spark vs Non-Spark
- Higher Intent vs More Volume
- multiple geographies
- multiple landing pages
- multiple offers
- major audience changes

Start with the strongest hypothesis.

---

# Paid Creative Rules

Paid TikTok creative should remain native-looking.

Preferred:

- direct-to-camera
- immediate hook
- one scenario
- readable captions
- natural delivery
- clear Koinonia connection
- low-pressure CTA

Avoid:

- polished TV-commercial style
- long logo intros
- generic corporate montage
- all-five-services list
- pricing wall
- referral fee as the default paid message

---

# Initial Paid Creative Candidates

Do not preselect a winner before organic data exists.

Likely candidate families from the prepared TikTok library include:

- T2 — Two Clients Need Showings at the Same Time
- T5 — The Open House Saturday Problem
- T7 — You Do Not Need a Full-Time Assistant
- T9 — CRM Follow-Up Is Operational Work
- T12 — Start With the Smallest Useful Place

Actual paid candidates must be chosen from live organic performance and business signal.

---

# First Review Window

After paid activation, avoid impulsive daily redesign.

Review early for:

- broken form
- broken privacy link
- wrong geography
- lead-access failure
- policy rejection
- spend-control malfunction

Otherwise allow enough delivery to evaluate.

The exact review window may depend on spend/volume, but use approximately 72 hours as the first operational checkpoint when sufficient delivery exists.

---

# TikTok Paid Quality Review

Review:

- spend
- raw leads
- qualified leads
- meaningful conversations
- consultations
- first paid engagements
- creative/content ID
- pressure category
- response speed
- obviously poor-fit leads

Diagnostic:

- views
- CPM
- CTR
- CPC
- form completion
- video watch metrics

Primary question:

**Did paid TikTok create more of the Realtor conversations Koinonia wants?**

---

# Green / Yellow / Red

## Green

- qualified Realtor leads/conversations
- paid creative reflects organic learning
- lead retrieval works
- response is timely
- spend within approved cap

Action:

Continue test.

Do not automatically scale.

## Yellow

- useful engagement but weak lead quality
- creative gets attention but wrong audience
- form friction
- response delay
- tracking gap

Action:

Diagnose one weak point at a time.

## Red

- broken form/privacy
- no lead access
- repeated irrelevant/spam leads
- uncontrolled spend
- no qualified business signal after enough spend to evaluate
- policy/compliance problem

Action:

Pause and fix.

---

# Stop Rules

Pause TikTok paid when:

- Koinonia cannot respond promptly
- privacy/form path is broken
- lead data cannot be retrieved reliably
- spend exceeds approved limits
- account/policy issue exists
- sustained lead quality is unusable
- service-delivery capacity cannot support demand

Do not keep spending because a campaign is "still learning" when the operating system is known to be broken.

---

# Scale Rules

Scale only after:

1. organic hypothesis was validated
2. paid creative produces repeatable qualified signals
3. lead response is reliable
4. cost per meaningful conversation is acceptable relative to first-engagement economics
5. service capacity exists
6. measurement is trustworthy enough

Scaling options later:

- increase budget deliberately
- test a second proven organic creative
- add retargeting
- test website lead-gen
- test Higher Intent vs More Volume if justified

Do not stack all scaling changes together.

---

# Retargeting Gate

TikTok supports Custom Audiences from lead-generation and Business Account engagement, but minimum audience thresholds apply for targeting.

Do not create retargeting campaigns before enough audience volume exists.

Possible future audiences:

- Business Account engagers
- Instant Form viewers
- Instant Form submitters
- website visitors once Pixel/Events setup exists

Exclude current converted clients/leads where appropriate and technically supported.

---

# Pixel / Events API Roadmap

TikTok currently recommends Events API alongside TikTok Pixel for website connections.

## Phase A — Pixel Foundation

Later implementation may track:

- ViewContent for key pages where appropriate
- Contact
- Lead
- Schedule / consultation booking where appropriate

Use TikTok standard events when they accurately represent the action.

Do not send sensitive form text or client transaction details.

## Phase B — Events API

Use as a second channel with Pixel when appropriate for stronger measurement reliability.

Define:

- events
- parameters
- match keys
- data minimization
- legal/privacy review

Validate with TikTok diagnostics after implementation.

## Phase C — Down-Funnel / CRM Signals

Once internal outcomes are stable, evaluate sending suitable quality events back to TikTok.

Possible Koinonia outcomes:

- qualified lead
- consultation
- paid engagement

Map only when a TikTok-supported event or approved integration accurately represents the business outcome.

Do not create misleading event names or send sensitive data.

---

# Click / Matching Data Rule

TikTok Events API may use click IDs and hashed contact/matching data for attribution/matching.

Koinonia should share only the minimum information needed for an approved measurement purpose.

Before enabling advanced matching or CRM postback:

- define purpose
- verify privacy notice
- confirm hashing/integration behavior
- review platform terms
- confirm data retention/governance

Do not retain raw TikTok click IDs indefinitely in the Relationship profile merely because the platform generated them.

---

# Website Lead Generation — Later Phase

Do not begin with website conversion optimization unless:

- Koinonia site changes are live
- UTM attribution is verified
- consultation path is tested
- TikTok Pixel/Events data connection is verified
- selected web conversion event is firing correctly

TikTok supports web lead-generation events such as Contact, Lead, Complete Registration, Subscribe, and Schedule depending on the actual action.

Choose the event that truthfully matches the user action.

---

# Smart+ / Automation Rule

TikTok may offer Smart+ or other automated campaign options.

Koinonia should not reject automation automatically, but automation must serve a clear business objective.

For the first paid learning cycle:

- keep business constraints clear
- preserve creative/content IDs
- keep one primary conversion goal
- avoid hiding poor lead quality behind platform optimization metrics

Use qualified conversations and paid engagements as the business truth.

---

# Business Account / Permissions Readiness

Before paid activation verify:

- correct Koinonia Transactions TikTok Business Account
- Ads Manager account
- Business Center if required for ownership/permissions
- account identity linked for Spark Ads
- billing/payment method
- appropriate admin/operator access
- lead download/management permission
- website/profile link correct

Do not invent account IDs or credentials in documentation.

---

# Paid TikTok Reporting

Add to the Marketing Dashboard:

## Business outcomes

- qualified leads
- meaningful conversations
- consultations
- first paid engagements
- attributed revenue

## Cost

- spend
- cost per qualified lead
- cost per meaningful conversation
- cost per consultation
- cost per first paid engagement

## Creative learning

- organic content ID
- Spark vs other format
- pressure category
- hook
- qualified conversation quality

## Diagnostic

- views
- watch time/completion
- CTR
- CPC
- CPM
- lead-form completion

Do not call a video a winner simply because paid views are high.

---

# Build-Mode Activation Gate

TikTok paid remains inactive until all are true:

1. whole marketing system has entered implementation mode
2. TikTok Business Account/profile is live and correct
3. at least 12–20 organic videos / sufficient learning evidence exists
4. at least one repeatable business-signal content theme exists
5. Spark candidate(s) selected from real organic evidence
6. Ads Manager/Business Center/permissions are verified
7. billing is verified
8. privacy URL is live
9. lead form is fully QA'd
10. lead retrieval is tested
11. Relationship mapping is ready
12. lead response is operational
13. Meta/other paid activity will not overwhelm response capacity
14. a fixed TikTok test budget/cap is approved
15. stop/scale rules are understood
16. the user explicitly approves TikTok paid activation

Until then:

**TikTok Paid = OFF. Spend = $0.**

---

# Build-Phase Completion Definition

The TikTok paid system is considered built when Koinonia has:

1. organic-learning gate defined
2. paid creative scoring defined
3. Spark-first strategy defined
4. campaign naming defined
5. Lead Generation path defined
6. Higher Intent / More Volume logic defined
7. Instant Form defined
8. privacy/form gate defined
9. lead retrieval rule defined
10. CRM mapping defined
11. response handoff defined
12. UTM standard defined
13. Instant Form tracking parameters defined
14. budget control philosophy defined
15. test design defined
16. paid creative standard defined
17. review window defined
18. quality review defined
19. green/yellow/red logic defined
20. stop/scale rules defined
21. retargeting gate defined
22. Pixel/Events API roadmap defined
23. data/matching rules defined
24. website lead-gen later phase defined
25. automation rule defined
26. account/permission readiness defined
27. reporting requirements defined
28. activation gate defined

No TikTok ad must run and no money must be spent to complete build mode.

## Next Step

All planned channel-specific build systems are now complete.

Next:

**Whole Marketing System Review**

The review should reconcile all playbooks against the governing strategy, identify contradictions/gaps, separate build-complete items from implementation-only tasks, and produce one final Activation Readiness Plan before anything is turned on.
