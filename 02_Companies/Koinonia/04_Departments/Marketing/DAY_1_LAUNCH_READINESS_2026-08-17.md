# Koinonia Transactions — Day 1 Marketing Launch Readiness

Status: Pre-Launch Readiness Record  
Prepared: August 17, 2026  
Launch Plan: `30_DAY_MARKETING_LAUNCH_CALENDAR_2026-08-18.md`

## Purpose

Record what is actually verified or implemented before Koinonia begins the first 30-day marketing launch.

Do not treat an item as verified merely because it is planned.

## Green — Verified or Implemented in the Current Integration Branch

### Public Website Structure

- Public Home route exists.
- Public Services route exists.
- Public Contact route exists.
- Public Referral Partner route exists.
- Public About route exists.
- Contact page contains the consultation scheduler.

### Consultation Lead Capture

The public consultation form already:

- collects name
- collects email
- collects phone
- collects selected consultation/service path
- collects requested date and time
- collects natural-language notes/problem context
- posts to the Koinonia consultation API

The consultation API already:

- creates or updates one Koinonia Relationship record
- preserves advanced lifecycle status when appropriate
- maps consultation type to pressure/service/path
- stores the submitted notes as exact problem language when no earlier problem language exists
- creates a consultation-request timeline event
- creates an open follow-up task
- can send a notification email through Resend when configured

### Marketing Attribution — Added for Launch Readiness

The website now captures first-touch campaign information for the browser session:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- Facebook click indicator when present
- TikTok click indicator when present
- referring page/site when available

The consultation form now reuses stored first-touch attribution even if the prospect enters through another page before navigating to Contact.

The consultation API now maps that information into the existing Relationship acquisition fields:

- source
- source detail
- first-touch channel
- campaign
- referrer

Existing relationships keep their original first-touch acquisition values rather than having those values overwritten by a later consultation submission.

Raw Facebook/TikTok click identifiers are not intentionally retained as long-term Relationship acquisition fields.

### Privacy Notice — Added for Launch Readiness

Added:

- public `/privacy` page source
- Privacy link in the shared Koinonia footer
- privacy-reference language in the consultation scheduler

The privacy notice describes website/contact information, relationship information, campaign attribution, analytics/advertising technologies when enabled, service providers, retention, choices, security, third-party services, changes, and contact information.

This is an operational website privacy notice and should not be represented as individualized legal advice or a substitute for legal review when Koinonia's data/advertising practices materially expand.

## Yellow — Requires Manual Account Verification

The current environment cannot confirm logged-in ownership/access for external marketing platforms.

Before those channels are used operationally, Jeremiah should verify:

### Facebook / Meta

- Facebook Page access
- Meta Business Portfolio / Business Manager access
- Ad Account access
- correct billing method when paid launch begins
- Instagram account connected to the correct Meta business assets
- lead access permissions for anyone responsible for responding

### Instagram

- correct Koinonia account
- professional/business account status
- profile name, category, bio, contact destination, and profile image
- connection to the correct Facebook/Meta business assets

### TikTok

- correct Koinonia Transactions account
- Business Account status
- profile name/bio/link configuration
- TikTok Ads Manager access before paid TikTok is considered in Phase 2

### Email

- `jeremiah@koinoniaadmin.com` can send/receive normally
- Resend production configuration is present if website notification email is expected
- a compliant bulk/nurture email platform is selected before scaled promotional email begins
- unsubscribe/suppression process exists before bulk/nurture email begins

## Yellow — Needs Live-Site Verification After an Approved Release

The new launch-readiness website changes are currently on:

`integration/koinonia-portal-production-sync-20260815`

They are not considered live merely because they exist on the integration branch.

Before paid ads or lead forms depend on these changes, verify on the approved live release:

- `/privacy` loads publicly
- Privacy footer link works
- consultation scheduler works
- a test consultation reaches the Koinonia Relationship record
- a test UTM link preserves source/medium/campaign/content into the Relationship record
- existing first-touch acquisition is not overwritten by later consultation activity
- notification email behavior works as intended

No production deployment is authorized by this readiness record.

## Not Yet Implemented — Intentional

The following should not block organic preparation but must be intentionally addressed before the associated paid/measurement phase requires them:

- Meta Pixel / Conversions API configuration
- TikTok Pixel / Events API configuration
- ad-platform conversion-event IDs
- automated Meta lead-to-CRM integration for native Instant Forms
- automated TikTok lead-to-CRM integration for native Instant Forms
- automated ad-platform quality feedback from paid-engagement outcomes
- scaled bulk email automation
- automated promotional SMS

Do not invent account IDs, pixel IDs, access tokens, or platform credentials in source code.

## Day 1 Launch Decision

### Ready now

- marketing strategy and execution plan
- 30-day content calendar
- organic content preparation
- Realtor outreach-list preparation
- brokerage outreach-list preparation
- manual relationship/source/pressure capture
- website attribution code on integration branch
- privacy notice source on integration branch

### Do not spend paid-media dollars yet unless these are true

1. External Meta account access is manually verified.
2. Lead ownership/response process is confirmed.
3. The required website privacy destination is live and accurate for the campaign being launched.
4. The planned conversion destination/form has been tested.
5. Campaign/source naming is configured consistently.
6. The person responsible for leads can access them promptly.

## Immediate Next Operational Step

Once the external account checks are confirmed, move to Day 2 profile/conversion-path setup and then Day 3 list building while the first TikTok/social production batch is prepared.
