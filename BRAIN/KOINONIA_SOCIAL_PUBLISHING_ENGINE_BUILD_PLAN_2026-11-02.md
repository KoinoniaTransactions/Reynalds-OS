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

## Current engineering task
Verify the current Preview owner workflows and disposable-PostgreSQL queue tests. Then complete provider media/insights, CRM prospect import and consent-based follow-up work below. Actual provider authorization, publication, marketing activation and production promotion remain separate owner gates.


## 2026-11-12 takeover audit and implementation record

Authority: owner master handoff authorizes substantial development, tests and isolated Preview deployments. It supersedes older per-step approval and budget-mode instructions for this assignment. It does not authorize production merges, marketing sends or public posts. Transactions and Properties remain distinct.

### Baseline and preservation
- PR #49 branch recovered at `7216a3e`; reviewed all 88 branch commits by log and inspected the current social/auth/media/schema implementation.
- Latest production observed at `1fd246d`; its only changes after the branch fork were two short-link files. Merged production into this development branch without conflicts. No production ref changed.
- Existing July local checkout has unrelated uncommitted work and was preserved. Current isolated clone is under this chat's `work/Reynalds-OS`.
- Stable social Preview alias resolves to `dpl_2d6XCy3QB957ar5xGxMtbEVZMPEr`, source `7216a3e`, status READY. HTTP read of `/employee/social` returned 200; this is reachability proof, not an authenticated end-to-end workflow test.

### Feature inventory (source audit, not live certification)
| Area | Classification | Evidence / remaining work |
| --- | --- | --- |
| Public website and approved prices | Already implemented | Production content; preserve six current products and five capabilities |
| Consultation -> Relationship, timeline, task, first/latest/conversion touch | Implemented but unified live proof unverified | `api/koinonia/consultation`, attribution and CRM modules; no replacement contact database |
| CRM follow-up tasks and lifecycle | Implemented | Existing RosObject/Task/timeline and CRM components |
| Approximately 1,000 prospect import and competitor classification | Not recovered in this branch's runtime code | Repository-wide keyword search found playbooks and short-link references, not a verified complete import; preserve external lists |
| Consent, Resend contact/topic lookup, suppression and unsubscribe webhook ledger | Implemented but deployment coverage varies | Libraries and webhook tests; marketing-integration-specific flags are not inherited by this branch |
| Campaign email sequences, SMS provider, delivery/bounce reporting | Incomplete / not established by audit | No mass sends authorized; build on existing contact policy |
| Social draft/review/calendar/private R2 media | Implemented but full authenticated QA unverified | Existing Studio/routes; prior live R2 evidence remains historical |
| Meta OAuth / encrypted vault | Implemented with new security regression tests; live blocked | Single-use scoped state; Page token identity validation, bounded cursor pagination, atomic connection/vault writes |
| LinkedIn authorization/publishing | Missing / external app setup not configured | No client ID/secret in current Vercel metadata |
| TikTok Direct Post | Blocked by intended-use policy | Official guidelines exclude internal utilities for team-managed accounts; do not bypass or promise approval |
| Persistent scheduler / provider adapters / reconciliation / metrics | Incomplete | Existing DB ledger is a foundation, not an executing publisher |
| Unified acquisition reporting | Incomplete | Existing attribution and reporting pieces; do not fabricate traffic, impressions or revenue |

### Verified foundation batch
- Added same-origin middleware protection for all social browser mutations.
- Approved variants can return to draft; prior approvals revoked and planned time cleared.
- Caption edits increment revision, revoke old approvals and retain previous/new copy in audit metadata.
- Approval audit retains exact caption/media reviewed.
- Meta responses are runtime-validated; no missing Page token fallback; Page tokens independently checked for app/account identity; token/data-access expiry enforced; pagination follows cursors against fixed endpoints only.
- Connection/vault writes and connection audit are atomic. Logs contain error class only.
- OAuth-start request rate is bounded per workspace/actor using the existing authorization ledger.
- Channel reads report expired/missing-vault grants accurately; disconnect cancels pending jobs.
- Fixed two existing TypeScript errors in Resend test mock signatures without changing production behavior.
- Tests: 43 passing across 13 social/Resend test files. `tsc --noEmit` passed. No live provider or marketing sends.

### External configuration and policy blockers
Vercel metadata inspected without decrypting or printing values. Branch-specific `META_APP_ID`, callback and vault key exist. `META_APP_SECRET`, `META_BUSINESS_LOGIN_CONFIG_ID`, `SOCIAL_META_OAUTH_ENABLED`, LinkedIn/TikTok app credentials and live-publishing enablement are absent. Global/branch metadata does not establish database isolation; verify Neon branch identity before any DB migration or integration fixture.

Official references checked 2026-11-12:
- https://developers.tiktok.com/doc/content-sharing-guidelines/ (intended-use restriction; indexed official page also available at `/docs/en/content-sharing-guidelines`)
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api (versioned Posts API and organization permissions)
- https://developers.facebook.com/docs/pages-api/posts/ and Instagram content-publishing docs were inaccessible/rate-limited to the web reader. Current adapters must remain unverified until official API requirements and authorized account scopes are checked.
- Vercel has newly introduced Schedules beta; do not add a paid/beta dependency automatically. The existing DB ledger can be driven by a secured bounded server worker.


### Durable execution batch — 2026-11-12
Implemented the existing job ledger rather than adding a second queue:
- Owner-only, workspace-scoped queue, cancellation and retry endpoints; a version-specific deterministic idempotency key and approved content snapshot.
- Explicit UTC instants and IANA timezone labels; DST regression coverage; simulations cannot bind provider accounts.
- Database leases and fenced completion, durable attempt history, exponential backoff, rate-limit classification, owner notifications and audit events.
- Expired dispatch intent without a known provider ID enters `needs_reconciliation` and cannot be canceled/requeued blindly. Recorded external IDs are verified instead of resent.
- Separate Preview simulation runner: no token decryption, media requests or provider traffic. Simulated jobs are labeled `simulated`, never `published`.
- Secured server dispatch endpoint, default-deny global plus owner approval and per-channel enablement; no live flag set. Candidate Vercel cron config is included for the eventual approved Production release; Vercel Cron does not execute these jobs in Preview. Frequency/plan suitability must be checked before rollout, with no upgrades authorized.
- Provider implementations added behind explicit verification gates: Facebook text/images; Instagram single JPEG/MP4 Reel container processing; LinkedIn text. LinkedIn media, Facebook video, Instagram carousel and all provider insights remain incomplete; unsupported media is rejected instead of dropped.
- Studio Calendar includes job queue controls, explicit simulation/live mode, account selection, cancellation/retry and attempt history.

Database evidence: Neon branch `br-spring-flower-af6eyttp` independently verified as non-default/non-primary Preview, endpoint `ep-billowing-silence-afy5ci4i`. The additive migration `20261112193000_social_queue_execution` was applied through the Neon connector in a single transaction with its SHA-256 Prisma ledger entry (`8982037436c59d05b6f38ce8546becf3dbdbdfafab5d999f369b1cb32fc75b2e`); readback confirms fields and ledger. No existing records reset or deleted. Historical orphan `SocialOAuthState` migration/table was preserved. PR #49's branch-specific DATABASE_URL is explicitly pinned to this Preview endpoint; Production variables untouched.

Local verification limitation: Prisma's native macOS connection reports `bad certificate format`, including when using the system CA bundle; TLS validation was not disabled. Consequently no Prisma-backed worker integration test is claimed. Connector SQL readback proves migration application, and worker tests currently use mocked DB transactions. Native browser binding also timed out; no authenticated UI QA is claimed.

Recovery discovery: full git-history search found the older DORA universe workflow and fetch script at `c582bc9` / `57d8a98`, on `main` and related branches. These are recoverable source assets, not proof the approximately 1,000 enriched contacts have been imported into this Preview CRM. Person-level records must remain outside this public repository.

Queue verification: 64 focused tests passed across 16 files, including worker fencing, immutable approvals, simulation without provider calls, ambiguous outcomes, provider response classification, queue idempotency, and dispatcher authorization. TypeScript passed before the latest campaign search UI change; final checks are tracked below. Optimized Next.js build passed with the local Prisma engine path supplied (no database credentials used for build). Campaign names can now be assigned at draft creation and searched on the server; existing approved business copy is unchanged.


## Current continuation checkpoint — 2026-11-17

Branch/production review: PR #49 remains open/draft; remote development head was `a8822eb`, production `1fd246d`. Neither branch changed since the preceding batch. Continue this PR; do not restart or merge Production.

### Newly implemented
- `/employee/marketing` and owner-only `/api/employee/marketing/overview`: existing workspace CRM relationships, qualified leads, recorded consultation requests, customer lifecycle, campaign acquisition, opt-outs, overdue workspace tasks, social job counts, account metadata and failed-job issues.
- Attribution distinguishes conversion-tagged campaigns, staff-entered campaign labels and unattributed records. Recorded cumulative relationship revenue replaces first-engagement revenue to avoid double-counting. It is not presented as verified cash or causal ROAS. Website traffic, conversion rates, platform engagement, spend and email engagement remain explicitly unavailable.
- Reports are bounded to 5,000 relationships with explicit truncation disclosure. No prospect email/phone fields leave the reporting API.
- Existing CRM supports manual audience classification: unreviewed, prospect, client, partner or competitor. Competitors are excluded from customer marketing eligibility and acquisition reporting; other consent/suppression controls are retained.
- CRM relationship linking now awaits authorization, verifies both active records belong to the workspace, and commits relation/audit/timeline evidence atomically. Object detail responses filter related objects to the same workspace.
- Recovered the existing DORA prospect-source playbook and fetch script from Git history; no person-level dataset committed, fetched or imported.
- Added LinkedIn company OAuth start/callback and readiness/UI wiring, using the existing single-use authorization ledger and encrypted connection vault. Callback validates current owner, origin, state actor/workspace/expiry, token introspection (app, 3-legged authorization, actual scopes, expiry), and an approved publishing role on one explicitly configured organization. Provider response bodies and credentials are not logged. Reconnect uses the same authorization flow; no unsupported refresh-token claims.
- TikTok setup clearly reports the intended-use blocker rather than offering an unsupported connection.
- Extended the existing disposable PostgreSQL CI harness with real queue tests: concurrent worker claim, idempotent queue, future execution boundary, workspace isolation, cancellation/reapproval, changed revision rejection and interrupted-dispatch reconciliation. It rejects cloud database URLs and only cleans UUID-tagged fixtures in the named local test service. No new service/subscription, production credentials or provider network requests are required.

### Verification at this checkpoint
- Complete local unit/route suite: 514 passed, 3 existing Resend database tests skipped before adding the new guarded PostgreSQL test file. These are not provider live tests.
- TypeScript and optimized Next.js build pass, including the new dashboard and OAuth routes.
- PostgreSQL CI tests are pending the next PR update; record their real result after completion. Local native macOS Prisma still has the certificate-format limitation; TLS was not weakened.
- Preview-only schema from the preceding batch remains additive. No new database migration is needed for classification, reporting or LinkedIn authorization.

### Secure setup required before live provider validation
Configure secrets directly in the Vercel dashboard scoped only to this feature branch's Preview environment; never paste them into chat or public documentation.
- Meta: `META_APP_SECRET`, `META_BUSINESS_LOGIN_CONFIG_ID`, `SOCIAL_META_OAUTH_ENABLED=true`; verify the exact registered callback and actual permissions.
- LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `SOCIAL_LINKEDIN_CALLBACK_URL`, `SOCIAL_LINKEDIN_ORGANIZATION_URN`, `SOCIAL_LINKEDIN_API_VERSION`, `SOCIAL_LINKEDIN_OAUTH_ENABLED=true`. The app needs `r_organization_admin`, `w_organization_social`, and `r_organization_social` for the implemented company workflow.
- Both use the existing Preview-only `SOCIAL_CONNECTION_VAULT_KEY`. The owner completes the provider consent flow from the registered Preview origin. Connecting an account does not enable publishing.
- Keep `SOCIAL_PUBLISHING_ENABLED`, `SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED`, all `SOCIAL_<PLATFORM>_ADAPTER_VERIFIED` flags and per-account `publishingEnabled` off until their separate launch review. No activation authorized by the owner's “proceed”.

### Remaining implementation and acceptance work (not claimed complete)
1. Authenticated Preview browser/route/database workflow proof and live account authorization once secure app configuration exists.
2. Provider format expansion (LinkedIn media, Facebook video, Instagram carousel), reconciliation tooling and real insights with permission-specific verification. Current supported adapters remain activation-gated.
3. Recover and review the current enriched prospect dataset from approved private storage; implement/import with duplicate/source/competitor review into existing Relationship records. The DORA source recovery is not proof of the approximately 1,000-contact import.
4. Campaign landing-page and unified tagged lead-to-CRM acceptance evidence; existing website and approved commercial copy remain authoritative.
5. Complete consent-based email sequences, delivery/bounce telemetry and SMS provider/opt-out workflows using the existing contact policies. No outbound campaigns or messages authorized.
6. Production readiness review, account/platform policy review, privacy checks and explicit owner approval before any Production merge or marketing activation.

Official LinkedIn implementation references checked 2026-11-17:
- https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
- https://learn.microsoft.com/en-us/linkedin/shared/authentication/token-introspection
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-access-control-by-role
