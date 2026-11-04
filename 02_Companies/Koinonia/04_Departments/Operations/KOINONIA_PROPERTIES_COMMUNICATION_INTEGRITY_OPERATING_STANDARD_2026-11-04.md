# Koinonia Properties — Communication & Integrity Operating Standard (PROPOSED)

Created: 2026-11-04  
Status: **Working operating design for owner review, not an approved public service guarantee or implemented workflow.**  
Scope: Koinonia Properties property-management division. Both the 8% owner-involved and 10% full-service plans receive the same communication and integrity standards.  
Related controlling sources: `03_Knowledge/Brand/koinonia_brand_core.md`; `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_PROPERTIES_POSITIONING_AND_LOCAL_DISCOVERY_2026-11-03.md`; `02_Companies/Koinonia/03_Pricing/KOINONIA_PROPERTIES_MANAGEMENT_LEASING_FEES_2026-11-04.md`.

## 1. Customer experience and positioning — revised direction

**Internal leadership belief: communication shows respect.** Do not quote that statement to customers as a slogan. The test is whether owners *experience* timely attention, truthful communication and proactive follow-through without needing to chase a manager.

**Primary division-wide message (proposed; not approved for publication):** `Your Property. Your Priorities. Our Partnership.`

**Primary communication-focused acquisition message (proposed):** `You Shouldn't Have to Ask for an Update.` Alternative campaign line: `You Shouldn't Have to Chase Your Property Manager.` This is an aspiration and must not become an absolute guarantee that every circumstance will generate an update; validate claims against actual workflows.

**Supporting customer benefit:** `Property management that keeps you in the know.` We want customers to understand that Koinonia is accessible during published business hours across normal contact channels, takes ownership of requests, and communicates significant developments without being chased. Do **not** highlight dedicated phone staff as an unusual selling point: reliable phone access is a basic professional expectation, not a headline differentiation.

**60-minute text response standard:** preserve as a proposed **internal operational target and secondary proof point** for owner SMS during defined business hours, **not** the lead brand promise. No wording should imply that *all* calls, emails and portal messages receive a one-hour response. Establish reliable phone handling as part of the regular service experience; avoid building acquisition messaging around the technical channel or stopwatch.

**Core customer expectation:** (a) I can reach Koinonia, (b) I will be told about important developments, (c) I understand the decision and cost, (d) someone will follow through, (e) I won't need to repeat myself. Send high-signal updates, not a flood of messages. An activity timeline is an internal accountability tool and a customer-visible resource, not an end in itself.

**Operating rule:** A fast first reply is NOT task completion. Work stays open until fulfilled, explicitly canceled with rationale, or handed over to an accepting owner with a due date and continuing visibility.

## 2. Specific proposed communication standard (pilot targets, not guarantees)

| Channel / trigger | Proposed internal target | Notes |
| --- | --- | --- |
| Owner SMS during staffed published coverage hours | Human-reviewed meaningful first response within **60 minutes** | An automated receipt does **not** count; response must identify the specific issue and next action or actual answer. Business-hours schedule must be defined and staffed before public promise. |
| Owner SMS outside coverage hours | Automated receipt allowed; meaningful human response within 60 minutes **after the next coverage window begins** | Emergency routes are separate and never wait for the next business window. |
| Owner email | Substantive response or status/next step by next business day | Target subject to staffing pilot. |
| Owner phone calls / voicemail | Return call within four business hours | Target, not guarantee. |
| Normal active maintenance work | Resident intake and triage based on urgency; notify owner for material decisions | Legal/habitability deadlines override internal targets. |
| Significant incident, cost or delay | Prompt owner notification according to urgency, authority and tenant privacy | Do not flood owner with routine technical updates. |
| Routine status changes | Accurate continuously accessible activity record, where system supports it | Do not label as real time until event syncing is verified. |
| Regular performance information | Monthly financial statement and significant exception summary, per defined operational schedule | Reporting accuracy takes priority over timing claims. |

A 60-minute SMS commitment requires designated staffing coverage, backup, phone/SMS provider uptime monitoring, and actual observed service performance. Determine exact hours and whether weekends are covered **before publication**; earlier Monday-Friday 8 AM-6 PM was a **recommendation, not yet selected by the owner**. Define holidays, clock boundaries, long messages, abusive/spam texts, outages, opt-outs and the identity/authorization of texters in the final policy.

**A qualifying meaningful response:** acknowledges the particular question/problem and either provides an accurate answer or states what has been done, who's taking the next action, and when a further update is expected. A human may use assisted drafts if content is verified. Never imply a vendor has been contacted or booked unless confirmed.

## 3. System of record / minimum data model

Use established licensed property-management software as the financial, resident and work-order source of truth when feasible; do not launch a second conflicting work-order database. Before building a custom activity view, inspect vendor capabilities, exports, APIs and event fidelity.

Every actionable issue (repair, rent delinquency, leasing exception, inspection, complaint, owner request, vendor no-show, material cost change) should track at minimum:

- case/ticket ID, property ID, restricted person/role links and intake channel;
- timestamp of receipt; urgency and **statutory response/deadline flag**;
- accurate current status; responsible staff member, backup and escalation owner;
- next action, owner of next action, due timestamp, and next owner/resident update timestamp;
- current cost estimate, authorization threshold, decision status and final invoice / markup when applicable;
- owner communication preference and contact consent;
- time-stamped outbound/inbound updates with delivery attempt/result where observable;
- linked vendor dispatch/appointment milestones, exceptions, documents and before/after evidence;
- closure reason, completion confirmation, any follow-up action and audit history.

Sensitive resident information, protected tenant details and confidential records should be visible only to appropriately authorized parties. SMS content should avoid confidential documents or financial account information; use secure links only after authentication and privacy review.

## 4. Workflow and accountability

1. **Capture**: inbound SMS/email/phone/portal event tied to an owner/property/ticket and time-stamped. Unknown senders routed to identity verification; do not expose account details.
2. **Triage**: recognize emergencies/habitability/safety issues immediately; route to separate duty response. Routine matters may follow the owner-plan authority matrix. Legal deadlines override approval timers.
3. **Own**: assign one accountable team member and named backup. No unowned work queue.
4. **Respond**: send a meaningful update within channel target. The response itself records the next commitment. Acknowledgment does not close ticket or stop outstanding next-action tracking.
5. **Act**: coordinate owner-approved work or qualified vendor; record what was actually done, not intended.
6. **Update by significance**: owner alerted for required approval, material new cost, meaningful schedule change, major delay or safety problem. Noncritical detailed status remains on the timeline and in digest/report.
7. **Escalate**: missed internal next-action due time or owner response target prompts assigned backup escalation; do not simply generate another auto-reply.
8. **Close**: verified completion, supported photos/invoice where applicable, resident communication, owner visibility, and no overdue next action. Manager audits exceptions and reopened tickets.

Proposed SMS monitoring for pilot:
- T+15 minutes: unresponded message highlighted to primary coordinator;
- T+30: backup notified;
- T+45: manager escalation;
- T+60: target miss recorded and reviewed, with owner reply still due;
- all intervals measured in staffed coverage minutes, with an emergency override.

Avoid vanity metrics: track **median and 90th percentile meaningful response time**, percent within 60 minutes, overdue commitments, owner-initiated chase-ups, reopened tickets, uncommunicated vendor no-shows, average time to resolution by urgency, and owner satisfaction. Review weekly during pilot; publish no performance claims without verified evidence.

## 5. Customer-facing communication event matrix (working examples)

| Scenario | What Koinonia must communicate | Trigger / ownership |
| --- | --- | --- |
| Routine tenant repair | Owner action only if required; current status and cost visible; confirmation on completion | Assigned maintenance coordinator |
| Emergency leak / no heat with applicable safety or habitability concerns | Urgent escalation and necessary tenant/property protection; owner informed as soon as appropriate, not contingent on normal SMS business-hours clock | On-call emergency lead; statutory requirements apply |
| Plumber fails to attend | Confirm actual no-show, contact vendor, arrange next action, notify affected resident and owner when material; do not claim work completed | Assigned coordinator; overdue-appointment alert |
| Unexpected $2,000 repair | Explain diagnosis, written estimate, options and delegated authority; issue emergency response promptly if applicable | Manager / authorized decision-maker |
| Resident late rent | Discreet owner update following verification, legal notices and privacy rules; avoid premature claims of default | Property accounting / authorized manager |
| Owner on 8% plan fails to arrange work | Escalate based on urgency and contract; document owner outreach and Koinonia fallback; do not delay habitability duties | Maintenance lead / broker supervisor |
| Lease renewal or vacancy | Clear dates, next steps, applicant/tenant privacy controls, and major decisions | Leasing coordinator |
| Koinonia makes a mistake | Proactively disclose material facts and remediation without concealment or misleading certainty | Responsible manager and supervisor |

## 6. Pilot, staffing and cost gates

**Do not advertise guaranteed 60-minute response time until successful pilot and backup coverage are established.**

Pilot design proposal:
- First choose staffed business hours, holidays, escalation roster and ownership of on-call emergencies.
- Select a shared SMS inbox with team access and exportable response-time events; ensure messages can be linked to property tickets and permission-scoped records.
- Test 30 calendar days using simulated issues plus real owner messages only with consent/legitimate live operations. Review edge cases: staffing absence, multiple concurrent cases, carrier outage, duplicate texts, identity verification, weekends, owner texts "thanks", urgent situations.
- Define what percentage of meaningful responses must meet target (proposed **at least 95%**, with documented and reviewed exceptions) before marketing the commitment; even a 95% pilot hit rate leaves misses, so confirm language and remedies explicitly before publication.
- Track staff minutes per ticket and per management plan, software/SMS costs, uncovered hours, and vendor follow-through cost. Do not rely on the 10% markup to obscure unprofitable operations.
- Document that 8% / 10% management levels do not change service responsiveness; owner participation changes only agreed eligible maintenance duties.

Proposed marketing hierarchy (for separate later approval): **"Your Property. Your Priorities. Our Partnership."** Lead a communication campaign with **"You Shouldn't Have to Ask for an Update."** and supporting copy about accessible, proactive service and documented follow-through. Keep the 60-minute SMS response commitment as a clearly qualified secondary service detail only after measured validation and publication review.

## 7. Product requirements and sequencing

**Required before claiming proactive communication or a response-time promise:** staffing roster/backup, accessible business-hours phone service, shared SMS inbox, monitored clocks, ticket owner and due tasks, emergency escalation, clear contact authority, real transaction audit trail, issue-close discipline, basic monthly owner reporting.

**Version 1.1 enhancements:** authenticated owner activity timeline, reliable vendor status integration, intelligent notification preferences, repair options and cost-context view, contractor directory if verified.

**Future vision:** advanced proactive risk alerts, portfolio-level recommendations and cross-property operational reporting, only after data quality and privacy requirements are proven.

Do not build a second property-management accounting/trust platform to support this promise. Evaluate integration capability first. No website, marketing publication, SMS sending, real-customer testing, vendor contract, production system change or legal obligation is approved here.

## 8. Unresolved owner decisions and verification checklist

- Select exact business-hours coverage (weekday/weekend/holidays) and provide emergency on-call coverage consistent with legal duties.
- Confirm if promise applies solely to owner texting, with different resident expectations clearly and responsibly scoped.
- Define response-clock rules, what counts as meaningful, escalation contacts, exclusions, outage messaging and remedies (if any).
- Select property management software and SMS stack only after a requirements/integration audit.
- Establish broker/compliance review for Colorado property-management, recordkeeping, consent, privacy, fair housing, resident safety and applicable habitability deadlines.
- Decide whether public 60-minute language is a `commitment` or enforceable `guarantee` and what happens when missed; avoid unsupported assurances.
- Build a pro forma for hours/coverage staffing and management-unit capacity before signing up owners against the promise.

This standard is a **draft proposal for owner review**; its specific target hours, response definitions, communication matrix and design details should not be mistaken for already approved production rules.
