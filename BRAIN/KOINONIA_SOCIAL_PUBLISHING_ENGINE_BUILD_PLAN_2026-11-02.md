# Koinonia social publishing engine — recovery and build plan

Status: DEVELOPMENT / no publishing authorization
Started: 2026-11-02
Base: koinonia-production
Priority: finish publishing engine first, then resume client/employee portal work.

## Existing assets to preserve
- Production consultation-to-CRM workflow and relationship data.
- Marketing attribution, consent, ad-pixel safety, GA4 and CRM tagging.
- Approved business positioning and product/service descriptions from production site.
- Existing marketing content briefs, scripts, storyboards and playbooks in the Marketing department.
- Existing four verified public social accounts: Facebook, Instagram, TikTok and LinkedIn.
- All sender/provider access remains opt-in; no automated sends or posts without owner approval.

## Recovery result (currently supported)
Marketing playbooks and creative assets exist. No working end-to-end social scheduler/publisher has yet been verified in production. Do not label documentation as a working integration. Older marketing branches diverged from production: reconcile individual code changes rather than merge branches wholesale.

## Product MVP
A staff-only social marketing workspace:
1. Content library (caption, asset attachments, campaign tags, platform variants).
2. Draft editor and platform preview with content-type compatibility checks.
3. Explicit human approval per channel/version and immutable approval audit.
4. Calendar and per-channel posting queue.
5. Account connection health, scoped OAuth, token refresh and revocation.
6. Provider adapters for Facebook Page / Instagram professional account (Meta), LinkedIn company page, TikTok business account when developer-app approval permits.
7. Per-platform publishing attempt ledger (idempotency key, status, external post ID, timestamp, error codes, retry and human intervention).
8. Status dashboard and results capture (post URLs, basic metrics when granted).
9. Safe media storage; tenant/workspace isolation, protected credentials, audit logs.
10. No campaign/paid-ad publishing, email marketing enrollment, or automated DM/SMS in the social publishing scope.

## Required publishing lifecycle
draft -> in_review -> approved -> scheduled -> publishing -> published
Alternate paths: changes_requested, canceled, failed, needs_reauthorization.
Edits to approved caption/media invalidate that channel approval.
Queue accepts only approved versions for explicitly connected accounts.
Global default SOCIAL_PUBLISHING_ENABLED=false; per-channel disabled unless owner approves.
A scheduled row alone never authorizes publishing.

## Implementation sequence
S0. Inventory code, existing DB tables, accounts, integrations, content, and platform API approval status. Record exact evidence.
S1. Add Prisma models for ContentAsset, SocialChannelConnection, SocialPost, SocialPostVariant, SocialApproval, SocialPublishJob, SocialPublishAttempt with workspace IDs and unique/idempotent constraints; validate migration on isolated Preview branch only.
S2. Staff-only API, authorization checks, audit events, and draft/approval state machine with automated tests.
S3. Staff-only Content Studio: drafts, variants, visual previews, review/approval, calendar; **no provider calls**.
S4. Connect accounts via secure per-platform OAuth with minimum permissions, encrypted secrets and expiration handling; verify correct Koinonia page/account identifiers.
S5. Implement per-provider APIs separately with platform-specific requirements and review gates. TikTok requires approved scope and developer-app audit for public Direct Post.
S6. Scheduled worker/cron with idempotency, locks, retry/backoff, rate limits and reconciliation.
S7. Isolated preview smoke tests using mocks/provider sandbox; then owner-approved real provider tests one channel at a time.
S8. Read-only reporting, failed-publish alerts and operational runbooks.
S9. Owner production launch gate: approved accounts, approved posts, verified failure/retry/suppression and rollback; no auto-launch.

## Provider constraints confirmed 2026-11-02
- TikTok official Direct Post requires registered developer app, approved video.publish scope and user authorization; unaudited clients cannot public-post. See developers.tiktok.com/docs/en/content-posting-api-get-started.
- LinkedIn organization publishing uses Posts API and w_organization_social permission for approved page roles. See learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api.
- Meta Facebook Pages/Instagram professional publishing needs app authorization and app review/permissions to be validated before implementation; do not assume current profile logins supply API access.

## Approval boundary
This branch is construction only. Do not change production DB, set live provider credentials, post, schedule live jobs, contact prospects, run ads or send outbound marketing without distinct owner approval. No production merge until build, isolated-DB QA, authorization testing and owner review pass.

## Next engineering task
Inspect production Prisma schema and existing reusable auth, RBAC, task, media-storage and API patterns; implement S1 against current production schema on this branch. Do not duplicate existing models.
