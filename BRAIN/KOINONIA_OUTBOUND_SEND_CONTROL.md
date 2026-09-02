# Koinonia Outbound Send Control

Status: Hard Operating Rule  
Owner: Jeremiah Reynalds / Koinonia Transactions  
Effective: 2026-09-02

## Governing Rule

No marketing email, SMS, direct message, campaign message, or other outbound prospect communication may be transmitted until Jeremiah explicitly authorizes the specific send.

This is a hard control, not a preference.

## What Does NOT Count as Send Authorization

The following instructions do not authorize transmission:

- `proceed`
- `continue`
- `next`
- `build it`
- `set it up`
- `prepare it`
- `stage it`
- `finish the campaign`
- approval of copy, creative, targeting, a prospect list, an automation, or an email platform by itself

Those instructions authorize preparation only.

## What Counts as Send Authorization

Authorization must clearly instruct that a defined outbound batch or message should actually be sent, for example:

- `send the 12-person pilot`
- `send Email 1 to Wave 1`
- `launch the approved campaign now`

If the intended recipients or message are ambiguous, the system must remain staged rather than infer authorization.

## Scope of Authorization

Authorization applies only to the specific batch/message reasonably identified by Jeremiah.

It does not automatically authorize:

- later waves;
- follow-up emails;
- another channel;
- newly added prospects;
- materially changed copy;
- a recurring campaign;
- future automatic sends.

Each of those requires separate authorization unless Jeremiah expressly approves that broader scope.

## Pre-Send State

Before authorization the system may:

- research prospects;
- build and refresh the DORA prospect universe;
- enrich public professional contact information;
- validate business email addresses;
- score and segment prospects;
- apply suppression/DNC rules;
- draft and revise messages;
- create campaign waves;
- configure tracking and notifications;
- create preview/test records that do not contact prospects;
- stage provider imports without activating a campaign.

The system must not perform a live outbound transmission.

## Technical Default

All Koinonia outbound marketing integrations must default to disabled.

Canonical environment control:

`KOINONIA_OUTBOUND_EMAIL_ENABLED=false`

A future sending implementation must fail closed when this value is missing, malformed, or false.

Changing an environment flag by itself is not sufficient human authorization. The application must also have a current, scoped send-authorization record or equivalent explicit approval control before transmitting prospect messages.

## Automation Rule

Automations may react to engagement only after a parent campaign has been explicitly activated.

Prepared follow-up messages must remain staged unless Jeremiah has expressly authorized the follow-up automation or the specific follow-up send.

No engagement event may silently expand the scope of prior authorization.

## Test Email Rule

A test message to an address specifically designated for internal testing is not a prospect send. Tests must never use a prospect's address unless Jeremiah explicitly authorizes that recipient as a live send.

## Related Sources

- `02_Companies/Koinonia/04_Departments/Marketing/README.md`
- `02_Companies/Koinonia/04_Departments/Marketing/prospect_engagement_visit_workflow.md`
- `02_Companies/Koinonia/04_Departments/Marketing/DORA_PROSPECT_UNIVERSE_PIPELINE.md`
- `BRAIN/KOINONIA_SERVICE_AREA.md`

## Current State

Outbound prospect sending is **NOT AUTHORIZED**.

Research, enrichment, scoring, campaign design, notification design, provider setup, and staging may continue.
