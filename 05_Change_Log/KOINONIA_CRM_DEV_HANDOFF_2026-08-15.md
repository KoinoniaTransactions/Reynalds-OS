# Koinonia CRM Development Handoff — 2026-08-15

## Purpose

This document preserves the development work completed during the Koinonia marketing / relationship-learning build session so future development can resume without rediscovery.

The active business priority after this checkpoint is **marketing materials**, not continued software expansion. Future software work should be limited to small implementation needs that directly support a marketing promise, intake path, screenshot, QR destination, client experience, or operational requirement.

---

## Governing Business Principle

> Koinonia sells dependable real estate operations support. The portal is a delivery and communication tool — not the product.

The software must support the service business without turning Koinonia into a software-product company.

---

## Locked Portal / CRM Boundary

### Client Portal

The client portal is the shared work room where Koinonia staff and the Realtor/client pass active engagement work back and forth.

Typical client-visible items:
- engagement status
- documents
- required uploads
- approvals
- payment-related actions
- active work requests
- scheduling / service information

### CRM

The CRM is the internal staff brain. It is staff/admin only.

Typical CRM-only information:
- relationship history
- source / acquisition information
- pressure / problem language
- objections
- marketing attribution
- follow-up strategy
- internal next actions
- staff tasks

### Architectural Invariant

**Internal CRM actions never automatically become client-visible portal actions.**

The same Realtor/person can exist in both systems, but the data lens and visibility are different.

Portal question: **What are we doing together?**

CRM question: **What do we know about this relationship and what should Koinonia do next?**

---

## Existing-System-First Rule

During this work the following development standard was explicitly established:

> Before adding a feature, first search for the existing capability across CRM, employee/admin portal, APIs, models, and shared components. Extend what exists whenever possible instead of creating a duplicate system.

This rule was reinforced after a follow-up queue component was initially created before a broad enough duplicate-feature check.

Future development should treat this as a required pre-implementation step.

---

# Completed Development

## 1. Staff-Only CRM Boundary

The existing `/crm` route was made staff-only and protected with the employee portal permission model.

Files involved:
- `apps/web/app/crm/page.tsx`
- `apps/web/middleware.ts`
- `apps/web/components/site/Header/Header.tsx`

Key behavior:
- unauthenticated users are sent to sign-in
- Client role does not receive CRM access
- staff/admin roles with employee portal permission can access CRM
- staff navigation exposes Relationships / CRM
- client navigation remains unchanged

Important commits:
- `3868a504da6cc451b0474709e7133ec714dacefd` — Protect CRM as staff-only workspace
- `81ea7fc1b0340611083a0f56cfcb4d4058a9e079` — Protect CRM with staff session requirements
- `06b7a561d5f7439e77e8c6cf11959645db9123a4` — Expose CRM only in employee navigation

Verified preview deployment:
- `dpl_GEp88JrzG4CBnPrSMGGh7pVZXzfm`

---

## 2. Koinonia Relationship Learning CRM

The existing `Relationship` object in the Reynalds OS Object Engine remains canonical. No second CRM was created.

Primary files:
- `apps/web/lib/koinonia-relationship.ts`
- `apps/web/components/crm-mvp.tsx`

Structured relationship data includes:
- lifecycle
- source
- acquisition detail
- marketing material / campaign
- primary pressure
- exact problem language
- objection
- desired outcome
- service path
- requested service
- recommended service
- rationale
- contact / brokerage context

Architecture decision:
- continue using structured JSON in `Relationship.data` for the early relationship set
- promote fields to dedicated Prisma columns only when real operational usage earns it
- preserve raw human language and human confirmation

---

## 3. Quick Capture Relationship Learning

A natural-language Quick Capture workflow was added to the selected Relationship profile.

Primary files:
- `apps/web/components/relationship-quick-capture.tsx`
- `apps/web/lib/koinonia-relationship.ts`
- `apps/web/app/api/objects/[id]/relationship-interactions/route.ts`

Behavior:
1. staff enters a natural-language conversation note
2. deterministic parsing proposes structured relationship learning
3. staff reviews / edits the proposal
4. only confirmed information updates the canonical Relationship
5. original note remains preserved as source truth
6. timeline history is written

Important principle:
- no silent AI writes
- proposals are provisional
- human approval precedes canonical relationship changes

Examples covered:
- brokerage meeting source
- tri-fold / collateral attribution
- open-house capacity pressure
- referral / no-capacity pressure
- service-path recommendation
- follow-up next action

Important commits:
- `e303e27955980886343b438ac613dca1e91be50b`
- `5959fde2be800562c7f5a7b1024736cf3368cf4a`
- `842440cc007981aa10192874cb0c15778b62d4b5`
- `c79ccf1a6cccff63041d19f4db267b6e5986c668`

---

## 4. Quick Capture → Existing Staff Task System

Quick Capture was extended so a confirmed next action can create an internal staff Task.

This deliberately reuses the existing `Task` model instead of creating a CRM-specific task system.

Behavior:
- task defaults on only when a useful next action exists
- human can turn task creation off
- Task is linked to the Relationship
- owner defaults to the current staff user
- status = Open
- priority = Normal
- duplicate prevention checks for an already-open exact-title task on the same Relationship / workspace
- a `task.created` timeline event is written
- task stays internal and does not create a client portal request

Important commits:
- `e56745a7c71b52e00c073f8f67e6546a9ca75449`
- `d103fc2513b13bb10348453f9ab47d1d47972bfe`

Verified preview deployment:
- `dpl_DqSetaH1UM3BKNrY1rmYQhTQfGw2`

---

## 5. Follow-Up Timing / Date Suggestions

Deterministic natural-language due-date suggestions were added for staff follow-up tasks.

Primary file:
- `apps/web/lib/relationship-follow-up-date.ts`

Supported examples include:
- tomorrow
- in N days
- in N weeks
- in N months
- next week
- next month
- named weekdays such as Tuesday / next Friday

Number words one through twelve are supported.

Important safety / design behavior:
- vague milestones such as “before her listing goes live” do not invent a calendar date
- the suggested date is editable or clearable before save
- due-date scheduling metadata remains Task metadata, not Relationship learning data
- date-only task values are stored at noon UTC to avoid common U.S. timezone date-shift problems

Duplicate-safe improvement:
- if the matching open Task already exists and a newly confirmed due date is provided, the existing Task is updated instead of duplicated
- the update writes a `task.updated` TimelineEvent
- leaving the new date blank does not silently erase an existing task due date

Important commits:
- `bcd11c75d7ebd4e75ac2ca6fdf43eb3a630efcd3` — Add deterministic follow-up date suggestions
- `d06cb83f6254110e4628140c6346d51f4aab3575` — Add editable follow-up due date to Quick Capture
- `7b8278e6aa4e9a311021953d53302dc04e9d1406` — Apply confirmed due dates to Quick Capture tasks
- `8f6c450321811b1245a58036bfd829def73ac120` — Test follow-up date suggestions

Verified preview deployment:
- `dpl_GwyjeurqLcubLU4vxGHMq5NGwBk7`

Accuracy note:
- the focused Vitest file was committed
- the Vercel production build does not run Vitest
- do not claim those focused tests were separately executed unless they are run in a future session

---

## 6. Relationship Follow-Up Queue

A consolidated internal CRM follow-up queue was added using the existing Task system.

Primary file:
- `apps/web/components/relationship-follow-up-queue.tsx`

The queue groups open Relationship-linked tasks into:
- Overdue
- Today
- Upcoming
- Unscheduled

Actions:
- open the existing Relationship profile
- complete a task through the existing Task PATCH endpoint
- completion continues to use the existing `task.completed` audit / timeline behavior

The queue is wired into:
- `apps/web/components/crm-mvp.tsx`

The queue refreshes when:
- Quick Capture creates or updates a follow-up
- a manual follow-up is created
- a queue task changes

There was an intermediate build failure because the CRM import was committed before the queue component was actually present on the branch. The missing file was restored and the combined deployment subsequently passed.

Important commits:
- `cac5f25b7f45866dbd2dc74dd1653edf6526a1a3` — Wire relationship follow-up queue into CRM
- `d9156f6e0ebd6aaa5cdd74227cf8c180a7cf4018` — Restore relationship follow-up queue component

Verified preview deployment:
- `dpl_GnPihbF21bAEkeQxcUnCjkxW8AER`

---

## 7. My Follow-Ups / All Staff + Inline Rescheduling

The Relationship Follow-Up Queue was made operationally useful for daily staff work.

Behavior:
- default view = **My Follow-Ups**
- optional view = **All Staff**
- `/api/tasks` supports `owner=me`
- staff can change a due date inline
- staff can clear the due date to return a task to Unscheduled
- rescheduling uses the existing Task PATCH route
- `task.updated` remains the audit trail

Primary files:
- `apps/web/app/api/tasks/route.ts`
- `apps/web/app/api/tasks/[id]/route.ts`
- `apps/web/components/relationship-follow-up-queue.tsx`

Important commits:
- `a4ab8c91c134dd265b7239575d5cb4eeac32fb15` — Filter CRM tasks to current owner
- `d3174b409524cc09fe1906039b9af8c2414914d3` — Support explicit task due date rescheduling
- `78c51d546f381a694653ea11184f9b3f45e8a2fa` — Add CRM follow-up ownership filter and rescheduling

Verified preview deployment:
- `dpl_8SZkxYtoM7Kp4ngzUymEVjBzsmuN`

---

## 8. Follow-Up Owner Visibility

The All Staff queue now displays the current owner name and role for each Relationship follow-up.

The task API returns the minimum staff identity needed for display:
- id
- name
- role

Primary files:
- `apps/web/app/api/tasks/route.ts`
- `apps/web/components/relationship-follow-up-queue.tsx`

Important commits:
- `f444917654a7b7f9c7b96f3ce69edaf8e123ee64` — Return task owners with CRM task queries
- `d5d3187d6573f968eba1069166fd795cf497afc1` — Show follow-up owners in CRM queue

Verified preview deployment:
- `dpl_FHjMMbzuFT1x3gw24jYyNf1NEVbZ`
- state verified READY

---

# Important Deferred Development Decision

## CRM Follow-Up Reassignment

Reassignment controls were intentionally **not** added.

Why:
- the employee Assignment Queue treats reassignment as an Operations-level responsibility
- the generic Task PATCH endpoint currently allows `ownerId` updates under broader `tasks:update`
- exposing a CRM reassignment dropdown before reconciling those permission models would weaken the access architecture

When development resumes, decide deliberately whether Relationship follow-up reassignment should:
1. inherit the employee `employee-portal:assignments:update` permission model, or
2. gain a task-specific assignment permission

Do not simply expose generic `ownerId` editing in the CRM UI without resolving this boundary.

---

# Existing Employee Assignment System Is Separate

The employee dashboard already has an Assignment Queue for client/service work ownership.

Primary examples:
- `apps/web/app/employee/dashboard/page.tsx`
- `apps/web/components/employee/PortalWorkAssignmentForm.tsx`

That system manages active service/work assignment and staff capacity.

The Relationship Follow-Up Queue manages CRM relationship tasks.

Do not merge the concepts merely because both have owners.

---

# Production / Branch Status

Repository:
- `KoinoniaTransactions/Reynalds-OS`

Development branch used for this work:
- `integration/koinonia-portal-production-sync-20260815`

Current documented development head before this handoff document:
- `d5d3187d6573f968eba1069166fd795cf497afc1`

Latest verified CRM preview deployment before this documentation commit:
- `dpl_FHjMMbzuFT1x3gw24jYyNf1NEVbZ`
- READY
- target = preview / integration, not production

**Production was not touched by these CRM slices.**

Important release warning:
- the integration branch also contains unrelated Reynalds OS / Koinonia Properties / Reynalds Brothers routes and work
- do not promote the integration branch wholesale to Koinonia Transactions production
- future production promotion should use a controlled Koinonia Transactions-only release package / reconciliation process

---

# Resume-Development Checklist

When returning to this development work:

1. Read this file first.
2. Confirm the current branch / release lineage before editing.
3. Search the repository for existing functionality before implementing anything new.
4. Preserve the client-portal vs internal-CRM visibility boundary.
5. Reuse the canonical Relationship and Task systems.
6. Do not create a second CRM or task system.
7. Do not expose CRM follow-up reassignment until the permission boundary is intentionally resolved.
8. Run focused tests if changing the natural-language parser / date parser, and explicitly distinguish tests actually executed from tests merely committed.
9. Verify the Vercel preview reaches READY before considering a slice complete.
10. Keep production untouched unless production promotion is explicitly authorized.

---

# Active Priority After This Checkpoint

**Return to Koinonia marketing materials.**

Software development is paused unless a small implementation is directly required to support the marketing-material workflow or a promise being made in those materials.

Recommended marketing sequence at this checkpoint:
1. Service Guide
2. Pricing Insert
3. Brokerage Intro Sheet
4. Tri-fold brochure
5. Referral Partner piece
6. Digital follow-up packet
7. Business cards / presentation support

The Service Guide should be treated as the core source from which the other collateral is adapted.
