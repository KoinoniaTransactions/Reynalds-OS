# Koinonia Transactions — Preview account setup

Checked 2026-11-17. Continue PR #49. This configures authorization only; public publishing remains disabled. Koinonia Properties is a separate business and is not configured by this guide.

## 1. Select the correct Vercel scope

Open https://vercel.com/koinonia3/reynalds-os-web/settings/environment-variables.

For every value below, choose **Preview** and branch `feature/koinonia-social-publishing-engine-foundation-2026-11-02`. Do not apply to Production or all branches. Enter secrets directly in Vercel, mark them Sensitive where supported, and never paste them into chat or a repository. Preserve the existing `SOCIAL_CONNECTION_VAULT_KEY`: changing it without a planned rotation invalidates stored connections.

Stable Preview origin:

`https://reynalds-os-web-git-feature-koinonia-social-pu-39a734-koinonia3.vercel.app`

## 2. Meta

1. Open https://developers.facebook.com/apps/1088961243970296/ and verify **Koinonia Social Engine**, app ID `1088961243970296`, associated with the Koinonia Transactions business portfolio.
2. In **App settings → Basic**, reveal the App Secret and enter it directly into the branch Preview variable `META_APP_SECRET`. Keep `META_APP_ID=1088961243970296`.
3. Open **Facebook Login for Business → Configurations**. Use or create a configuration for this integration. Select **User access token**, matching the implemented user-grant and `/me/accounts` Page-discovery flow. Do not substitute a system-user token or manually generated Page token.
4. Select the Koinonia Facebook Page and linked professional Instagram assets where the configuration offers asset selection. Request `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, and `instagram_content_publish`. Copy the **Configuration ID** to `META_BUSINESS_LOGIN_CONFIG_ID`; it is a different value from the App ID. Defer optional insights scopes until their specific read integration is implemented and reviewed.
5. Under the product's OAuth settings, enable web/client OAuth where offered and register this exact **Valid OAuth Redirect URI** (HTTPS; no trailing slash):

   `https://reynalds-os-web-git-feature-koinonia-social-pu-39a734-koinonia3.vercel.app/api/employee/social/oauth/meta/callback`

6. Set `SOCIAL_META_CALLBACK_URL` to that same URI and `SOCIAL_META_OAUTH_ENABLED=true` in the branch Preview scope.
7. Use a Facebook account with an app role for Development testing and appropriate Page/business access. Verify that Instagram is a professional account linked to the intended Page. Complete the consent dialog and grant the requested permissions. Missing scopes/assets must be corrected through Meta's supported flow.

Advanced Access/App Review is required to serve businesses the app owner does not own/manage. App-role testing does not establish broader launch approval. Follow actual requirements shown for this app; do not switch the app live solely to bypass a test failure.

Official reference: https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business

## 3. LinkedIn

1. Open https://www.linkedin.com/developers/apps. Use/create the Koinonia Transactions integration app associated with its company Page. Have a Page Super Admin verify the app association where requested.
2. In **Products**, request **Community Management API** Development access for this company publishing use case. Supply the requested business email, domain, Page verification and use-case details. **Share on LinkedIn** alone is insufficient for this organization's read/publish workflow. Approval is external and may take time; absent permissions cannot be fixed with another environment flag.
3. In **Auth**, copy Client ID and Client Secret directly to `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in the Vercel branch Preview scope. Mark the secret Sensitive where supported.
4. Add this exact **Authorized redirect URL**:

   `https://reynalds-os-web-git-feature-koinonia-social-pu-39a734-koinonia3.vercel.app/api/employee/social/oauth/linkedin/callback`

5. Confirm the app has `r_organization_admin`, `w_organization_social`, and `r_organization_social`. The app requests and validates these scopes; editing a scope string does not grant product access.
6. Find the company Page's numeric organization ID in its admin URL or official Page tooling. Set `SOCIAL_LINKEDIN_ORGANIZATION_URN=urn:li:organization:<numeric-ID>`. Use the company ID, not a member ID, app ID or public vanity slug. The consenting member must have an approved company publishing role; Super Admin is the simplest setup for the owner.
7. Set `SOCIAL_LINKEDIN_CALLBACK_URL` to the exact URL above, `SOCIAL_LINKEDIN_API_VERSION=202609` (the supported version reviewed for this implementation), and `SOCIAL_LINKEDIN_OAUTH_ENABLED=true` in the branch Preview scope. Recheck version support before a future release.

Official references:
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review?view=li-lms-2026-09
- https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access?view=li-lms-2026-09
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-access-control-by-role

## 4. Redeploy and connect

1. Save the variables, then redeploy the **feature branch Preview**. Environment edits do not change an already running deployment. Do not promote it to Production.
2. Open the stable Preview origin above, sign in as the Koinonia owner, then visit `/employee/social` → **Accounts**.
3. Choose **Connect Meta** / **Connect LinkedIn** and complete the provider consent flow. Start from the stable registered origin, not an arbitrary deployment URL: the OAuth state cookie and callback must share an origin.
4. Confirm the expected company/Page names, connection state, actual granted scopes and expiration metadata. Reconnect expired grants through the same flow. Do not insert tokens into the database.
5. Leave `SOCIAL_PUBLISHING_ENABLED`, `SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED`, all `SOCIAL_<PLATFORM>_ADAPTER_VERIFIED` flags and each account's `publishingEnabled` unset/false. Connection enables account validation, not publication. No public test post, customer campaign, email or SMS is authorized by this setup.

## Troubleshooting

- **Redirect mismatch:** compare scheme, hostname, full callback path and trailing slash in provider settings and Vercel; restart from the stable Preview origin.
- **Configuration unavailable / invalid permissions:** Meta Configuration ID must belong to this app and grant the required permissions; an App ID is not a Configuration ID.
- **No Page/Instagram account:** check the consenting account's Page/business access and the professional Instagram-to-Page link, then reconnect. Do not weaken account validation.
- **LinkedIn unauthorized scope:** check approved Community Management product access and app Auth permissions. Wait for approval if pending.
- **Company role missing:** verify Page membership and the configured numeric organization ID.
- **Connected but cannot publish:** expected while launch gates are disabled. Keep them off until live validation and separate owner activation approval.
- **TikTok:** remains blocked for this internal utility under Direct Post intended-use policy. Do not configure credentials as a workaround.

## Credential-free work and acceptance limits

The Preview includes durable scheduling/simulation, conservative reconciliation of uncertain outcomes, LinkedIn JPEG/PNG preparation, acquisition reporting and an owner-only prospect import review. CSV imports use the existing Relationship master, preserve existing records/opt-outs, require provenance, skip duplicates and never grant marketing consent. Person-level data must stay in approved private storage. No actual enriched prospect dataset has been imported.

Mocks and disposable PostgreSQL tests do not prove successful provider publishing. Account authorization, provider-specific API behavior/insights and authenticated owner UI acceptance remain subject to connected accounts and verified access. Unsupported media stays rejected. Production and all outbound activation remain separate decisions.
