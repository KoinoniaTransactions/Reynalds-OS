# Koinonia Prospect Engagement → Personal Visit Workflow

Status: Production Planning Spec  
Owner: Koinonia Transactions  
Effective: 2026-09-02  
Related campaign: Coverage Campaign 01

## Purpose

Turn qualified digital engagement from Colorado Realtor prospects into timely human follow-up and, when appropriate, a brief in-person office visit.

This workflow supports the canonical Marketing & Growth Engine and Sales lifecycle. It is not a second marketing strategy.

Core principle:

> Notify sooner than we visit.

Digital engagement should help Jeremiah know who is paying attention. A physical office visit should require a stronger signal than an email open or a single ambiguous tracking event.

## Governing Sources

- `02_Companies/Koinonia/04_Departments/Marketing/README.md`
- `02_Companies/Koinonia/04_Departments/Sales/README.md`
- `BRAIN/KOINONIA_SERVICE_AREA.md`
- `02_Companies/Koinonia/05_Business_Materials/social_paid_campaign_01_coverage.md`
- `packages/database/prisma/schema.prisma`

## Service-Area Gate

The prospect must have a verified public business location in an approved Koinonia service-area city unless a later business decision establishes another valid service-area basis.

All currently listed Koinonia services are available throughout the approved service area. Do not use the retired statewide-remote versus 20-mile-field split.

## Private Prospect Data

The GitHub repository is public. Raw prospect records containing email addresses, phone numbers, and office addresses must not be committed to Git history.

Canonical private local path when operating from a local Reynalds-OS workspace:

`.local/koinonia/marketing/prospects/`

The existing repository `.gitignore` ignores `.local/`.

Longer term, prospect records should move into the secured Reynalds-OS database/CRM rather than remain spreadsheet-only.

## Prospect Record Model

Use the existing generic OS architecture rather than creating a parallel CRM.

Recommended mapping:

- `RosObject`
  - `objectType`: `koinonia_marketing_prospect`
  - `name`: prospect full name
  - `status`: lifecycle state
  - `health`: engagement state
  - `nextAction`: current human or automated follow-up
  - `data`: business contact, brokerage, service-area, campaign and consent/suppression fields
- `TimelineEvent`
  - preserves outbound and engagement history
- `Task`
  - creates personal follow-up and office-visit work
- `Notification`
  - alerts Jeremiah when real engagement occurs
- `Workflow` / `AutomationRule`
  - controls engagement scoring and follow-up actions

Do not add a new database table until the existing object/event/task/notification architecture proves insufficient.

---

# Engagement Signal Hierarchy

## Low-confidence signal — email open

Treatment:

- Record for aggregate reporting when available.
- Score lightly.
- Do not notify Jeremiah on an open alone.
- Never create an office-visit task from an open alone.

Reason:

Mail privacy systems and security tooling can create false or inflated opens.

## Verified human click

Treatment:

- Record the destination and timestamp.
- Notify Jeremiah with the prospect card.
- One verified click creates awareness but not an automatic visit.
- Two or more verified clicks within the active campaign window create a visit-review candidate.

A provider's bot-filtering capability or equivalent server-side validation should be used before treating a click as human engagement.

## Meaningful website visit

Examples:

- prospect reaches a campaign/service page and remains meaningfully engaged;
- prospect views multiple relevant service pages;
- prospect performs a non-lead conversion action that indicates research.

Treatment:

- Notify Jeremiah.
- Combined with a verified click, move prospect to visit-review status.

## Positive reply

Treatment:

- Immediate notification.
- Stop automated engagement follow-up.
- Jeremiah responds personally.
- Mark as a personal-touch candidate.

Do not make an unannounced visit as a substitute for replying to someone who has already opened a direct conversation.

## Question reply

Treatment:

- Immediate notification.
- Stop automated engagement follow-up.
- Jeremiah answers personally.
- Visit may be coordinated if it would help the relationship.

## Consultation / lead-form activity

Treatment:

- Immediate notification.
- Create high-priority follow-up task.
- Send only the appropriate acknowledgment/confirmation.
- Personal visit becomes relationship follow-through, not a surprise prospecting tactic.

## Negative reply / unsubscribe / do-not-contact

Treatment:

- Suppress immediately.
- Do not send sales follow-up.
- Do not create an office-visit task.
- Preserve suppression history.

## Bounce

Treatment:

- Mark address unusable until corrected or reverified.
- Do not continue sends to the failed address.

---

# Working Engagement Score

Use the score as prioritization support, not as a substitute for the actual signal context.

- Open: +1 each, maximum +2
- Verified human click: +3 each, maximum two scored clicks
- Meaningful website visit: +5
- Question reply: +8
- Positive reply: +10
- Consultation / lead form: +15
- Negative reply: -10 and stop active prospecting
- Unsubscribe/DNC or bounce: suppress / stop

Working states:

- `LOW SIGNAL` — no meaningful engagement yet
- `ENGAGED` — score 3–4
- `WARM` — score 5–9
- `HOT` — score 10+ or direct positive/question/consultation signal
- `STOP` / `DNC` / `BOUNCE` — do not continue campaign activity

---

# Notification Workflow

## Notification trigger

Create an owner notification when any of the following occurs:

- verified human click;
- meaningful website visit;
- positive or question reply;
- consultation / lead form.

Do not alert on an open alone.

## Notification contents

The notification should contain:

- full name;
- brokerage/team;
- public business city;
- verified public office address;
- phone;
- email;
- lead tier;
- exact signal that triggered the alert;
- engagement state and score;
- last campaign touch;
- recommended next action;
- link to the internal prospect record when available.

## Notification channels

Phase 1:

- Reynalds-OS `Notification` record;
- owner dashboard/inbox when the interface exists.

Phase 2:

- optional immediate email/push/SMS delivery to Jeremiah for HOT signals;
- digest delivery for lower-priority verified engagement if immediate alerts become noisy.

Do not expose prospect contact data through public repository assets.

---

# Follow-up Email Workflow

Prepared copy lives in:

`02_Companies/Koinonia/05_Business_Materials/coverage_campaign_email_followup.md`

## Follow-up A

Use when a prospect has verified engagement but has not replied, booked, unsubscribed, or otherwise created a stronger signal.

Timing:

- WARM: approximately one business day after the qualifying engagement;
- ENGAGED: wait 24–48 hours and send only if no stronger signal occurs.

Never auto-send Follow-up A after:

- positive reply;
- question reply;
- consultation/lead form;
- negative reply;
- unsubscribe/DNC;
- bounce.

These conditions require human handling or suppression.

---

# Personal Office Visit Workflow

## Visit trigger

### Watch only

- one verified human click;
- no meaningful website activity;
- no reply or lead action.

Jeremiah receives the prospect information but no visit task is required yet.

### Review for office visit

Any of:

- two or more verified human clicks;
- verified click plus meaningful website visit;
- repeated meaningful engagement over the campaign window.

Create a review task containing the public office information and recent engagement history.

### Coordinate personal touch

Any of:

- positive reply;
- question reply;
- consultation/lead form.

Jeremiah responds personally first. The office visit may then be coordinated or used as an appropriate relationship follow-through.

## Visit location rule

Use only a verified public business/brokerage office or another appropriate commercial location.

Do not use a home/private residential address merely because it appears in a data source.

Before a drop-in, confirm that the location is still a functioning public office and is appropriate for visitors.

## Visit objective

The visit is not a hard close.

The goal is to create recognition and trust:

- brief introduction;
- connect the email/brand to a real person;
- leave something useful;
- ask one practical question about where their workload tends to collide;
- leave an easy path to follow up.

---

# Gift / Leave-Behind Standard

Use a small, useful, professional, non-cash branded leave-behind.

The item should:

- be modest in value;
- be easy for an office to accept;
- reinforce Koinonia's practical operational-support positioning;
- never be conditioned on a referral, transaction, recommendation, or purchase.

Avoid making the gift the reason for the visit. The relationship is the reason; the leave-behind simply makes the interaction memorable.

A future branded leave-behind concept should be designed as part of the campaign materials rather than purchased ad hoc.

---

# Event Types for Reynalds OS

Recommended event names:

- `marketing.email.sent`
- `marketing.email.opened_low_confidence`
- `marketing.email.clicked_verified`
- `marketing.website.meaningful_visit`
- `marketing.email.reply_positive`
- `marketing.email.reply_question`
- `marketing.email.reply_negative`
- `marketing.consultation.created`
- `marketing.email.unsubscribed`
- `marketing.email.bounced`
- `marketing.followup.sent`
- `marketing.visit.review_created`
- `marketing.visit.planned`
- `marketing.visit.completed`
- `marketing.gift.delivered`

---

# Automation Rules

## Rule 1 — verified engagement alert

Trigger:

`marketing.email.clicked_verified` or `marketing.website.meaningful_visit`

Actions:

1. Add TimelineEvent.
2. Recalculate engagement state.
3. Create Notification for Jeremiah.
4. Set next action according to state.

## Rule 2 — direct-interest alert

Trigger:

positive/question reply or consultation.

Actions:

1. Mark prospect HOT.
2. Cancel pending automated engagement follow-up.
3. Create high-priority human follow-up Task.
4. Create immediate Notification.
5. Evaluate personal-touch/visit path.

## Rule 3 — suppression

Trigger:

negative reply, unsubscribe/DNC, or bounce.

Actions:

1. Cancel pending campaign sends.
2. Set suppression state.
3. Prevent visit creation.
4. Preserve the event history.

## Rule 4 — office-visit review

Trigger:

second verified click, or verified click + meaningful site visit.

Actions:

1. Create `Review Koinonia office visit — {Prospect Name}` task.
2. Include public office address and engagement history.
3. Require human review before visit status becomes Planned.

---

# Implementation Sequence

1. Finalize Campaign 01 initial email creative/copy.
2. Confirm outbound-email platform and sender compliance/deliverability configuration.
3. Import only approved service-area prospects from the private staging list.
4. Create prospect RosObjects or equivalent secured CRM records.
5. Connect provider engagement events to TimelineEvents.
6. Connect meaningful website/lead events.
7. Implement notification rules.
8. Implement Follow-up A conditions.
9. Implement visit-review task creation.
10. Design the physical leave-behind/gift.
11. Run a small controlled pilot before scaling.

## Activation Gate

Do not activate sending merely because the contact file exists.

Before first send confirm:

- final initial email copy/creative;
- service-area selection;
- suppression list;
- business-email validation;
- sender identity and authentication;
- applicable legal/provider-policy requirements;
- tracking/privacy configuration;
- notification delivery path;
- follow-up cancellation rules;
- visit and gift materials.
