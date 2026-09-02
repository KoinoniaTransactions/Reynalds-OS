# Hand Us the Listing — Production Backbone Implementation

Date: 2026-09-02  
Status: Implemented foundation / not yet public-package certified

## Purpose

This implementation creates the first working application backbone for Koinonia's integrated **Hand Us the Listing** experience.

It intentionally extends the existing Reynalds OS Object Engine instead of creating a parallel listing database architecture.

## Architecture decision

A listing is represented as a `RosObject` with:

- `objectType = "Listing Engagement"`
- listing lifecycle/status in standard object fields
- listing-specific operational data in `data`
- launch work in existing `Task` records
- audit history in existing `TimelineEvent` records
- accepted-offer handoff through an `ObjectRelationship` to a standard `Transaction` object

No new Prisma `Listing` model or database migration is required for this foundation.

## Added files

### `apps/web/lib/koinonia-listings.ts`

Domain logic for:

- listing intake validation
- Listing Engagement object naming/data
- launch checklist defaults
- initial launch-task generation
- accepted-offer validation
- mapping known listing data into the Transaction object

### `apps/web/lib/koinonia-listings.test.ts`

Unit tests for:

- required listing fields
- date validation
- launch data
- conditional marketing/open-house tasks
- accepted-offer transaction-data mapping

### `apps/web/app/api/koinonia/listings/route.ts`

`GET /api/koinonia/listings`

- permission checked
- workspace scoped
- returns active Listing Engagement objects

`POST /api/koinonia/listings`

- validates intake
- creates Listing Engagement
- creates initial launch tasks
- creates timeline/audit events
- uses a database transaction so the initial listing setup is committed coherently

### `apps/web/app/api/koinonia/listings/[id]/accepted-offer/route.ts`

`POST /api/koinonia/listings/:id/accepted-offer`

- permission checked
- workspace scoped
- requires a Listing Engagement
- idempotently returns the existing linked Transaction if already handed off
- otherwise creates the Transaction object
- copies known property/seller information into the transaction
- records accepted-offer/closing information supplied at handoff
- links Listing Engagement to Transaction with `converted_to_transaction`
- moves Listing Engagement to `Under Contract`
- seeds the first transaction-management tasks
- writes timeline events on both records

This fulfills the core design rule that an accepted listing becomes a transaction through a handoff rather than a second intake.

### `apps/web/components/listings-mvp.tsx`

Initial Listing Center UI with:

- listing queue/search
- mobile-friendly new-listing intake
- core property/seller/launch fields
- automatic marketing-workstream request
- open-house intent
- listing detail
- launch task visibility
- timeline visibility
- accepted-offer handoff form
- linked Transaction visibility

### `apps/web/app/listings/page.tsx`

Adds `/listings` application route.

## Existing architecture extended

The implementation reuses:

- `RosObject`
- `ObjectRelationship`
- `TimelineEvent`
- `Task`
- workspace permissions
- existing Transaction Center
- existing shared ROS design system

The Object Engine registry now recognizes `listing_engagement` as a core conceptual type.

Dashboard navigation now exposes `/listings`.

## Current Listing Engagement data shape

Version 1 includes:

- lifecycle
- phase
- property address
- seller names
- target list date
- listing-agreement status
- list price
- occupancy status
- seller-contact permission
- media preference
- sign/lockbox requirement
- open-house plan
- marketing requested
- special instructions
- approval state
- launch checklist

When handed off, it also records:

- transaction id
- accepted-offer buyer/agent details
- closing date/company
- contract notes

## Initial launch tasks

Each new Listing Engagement automatically receives tasks for:

1. listing agreement / authority / brokerage requirements
2. listing documents / seller disclosures
3. coordinated launch plan
4. access / sign / lockbox requirements
5. media / property-preparation vendors
6. MLS/listing setup and launch QA
7. marketing work order when requested
8. open-house planning when requested/maybe

## Accepted-offer handoff

The handoff creates a standard `Transaction` RosObject and seeds:

1. Validate executed contract and extract critical dates.
2. Confirm title, closing, lender, and participant information.
3. Build contract-to-close communication and QA schedule.

Future transaction workflow automation should extend these tasks rather than create a separate seller-transaction engine.

## Not implemented yet

This foundation does **not** yet implement:

- document upload/transaction-specific inbound email inside Listing Center
- listing phase/status action controls
- granular checklist completion state
- dedicated Approval Request object/work queue
- Vendor Work Order object/work queue
- Marketing Work Order object/work queue
- Field Coverage Request object/work queue
- automatic launch-date dependency calculation
- MLS integration
- social/email/ad publishing integrations
- media vendor booking integrations
- open-house provider assignment
- transaction deadline extraction from an uploaded contract
- client-facing authentication/role restrictions beyond the current ROS auth scaffold

Those should be added as incremental slices on this same object architecture.

## Safety / integrity rules

- Listing intake never grants Koinonia authority the Realtor/brokerage has not supplied.
- A listing cannot be accepted-offer handed off unless it belongs to the current workspace and is a Listing Engagement.
- Accepted-offer handoff is idempotent to avoid duplicate Transaction objects.
- The Realtor remains the decision gate for pricing, representations, negotiation, disclosures, and brokerage/professional judgments.
- Public service/package claims remain controlled by canonical service/pricing certification; this application foundation does not itself authorize a new public promise.

## Recommended next implementation slice

Build the **Listing Launch Control Board** on top of the Listing Engagement:

1. phase/status progression
2. checklist completion
3. approval queue
4. Marketing Work Order
5. Vendor Work Order
6. quick actions for open house / field request / marketing refresh

This should remain inside the same Listing Engagement context rather than becoming separate client-facing systems.
