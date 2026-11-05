# Koinonia Properties — Public Website Lead Intake Activation

Date: 2026-11-04  
Status: Preview implementation; **server-side delivery is disabled until credentials, inbox, origin, and anti-bot verification are approved, configured, and tested**.

## Intent

Preserve the existing website. Move owner/rental-analysis/buyer/seller prospects toward one in-site, validated inquiry capture workflow. Do not invent a private management portal, a client database, or immediate market rent estimates. Real operations should inform future proprietary backend requirements.

## Implemented on preview branch

- Reusable client form for owner, rental-analysis, buyer and seller intent; name, email, optional phone/address, short message, honeypot, Cloudflare Turnstile widget; visible submission/error states.
- Server-side `POST /api/inquiries` validation: fixed intent allowlist, length limits, email format, same-origin check, 12 KB body cap, Turnstile server verification and hostname check. Resend API is used solely as a delivery mechanism; recipient and sender come from server-only variables.
- Successful API response only when email service accepts the message, not proof that a human read it. Failed delivery returns an error, with a direct email option. The form falls back to a clearly labeled email inquiry if activation flags are off.
- No private screening, payment, identification or document upload. No local lead database is claimed.
- The rental-analysis copy is updated to the approved 8% and 10% management plans and expressly states that an instant data-backed estimate has not been implemented.

## Activation requirements

1. Confirm current Properties business email identity and a verified Resend sender domain. Choose the responsible inbox and owner/staff follow-up assignment. Never commit secrets or print them.
2. Create Cloudflare Turnstile site and secret for the precise preview/prod hostnames. Set a separate test configuration where needed.
3. Add `PROPERTIES_RESEND_API_KEY`, `PROPERTIES_INQUIRY_FROM_EMAIL`, `PROPERTIES_INQUIRY_TO_EMAIL`, `PROPERTIES_TURNSTILE_SECRET_KEY`, `PROPERTIES_INQUIRY_ALLOWED_ORIGIN` in scoped Vercel environment settings. Set both `PROPERTIES_INQUIRIES_ENABLED` and `NEXT_PUBLIC_PROPERTIES_INQUIRIES_ENABLED` to true only for a controlled, verified test; set `NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY`. Never copy Transactions secrets by assumption.
4. Verify a genuine inquiry arrives at the approved inbox with the correct category, source and reply address, and confirm staff handling. Test bad origin, bot challenge, malformed messages, service outage and duplicate submissions.
5. Review privacy/retention, SMS consent (if used later), inquiry notification operations, access controls, abuse/rate limiting at the edge or provider, and CRM handoff before public availability. This email-delivery MVP is not a transactional, durable queue: if persistence/deduplication is required, design a durable capture store and retry processing before relying on form delivery at scale.
6. Confirm lawful advertising and brokerage disclosures. Approve public release separately.

## Scope note

Owner/rental/buyer/seller forms are part of general **lead acquisition**. Resident maintenance, tenant screening, applications and vendor records remain routed through approved processes; do not send sensitive account information into a basic prospect form.

## Future rental estimate

The requested instant rent range is a separate product capability requiring licensed data, verified comparables, calibrated uncertainty and consent/privacy review. This branch does NOT fabricate an estimate or claim that it operates.

## Review gates

Build, source checks and protected preview deployment are technical gates only. They do not demonstrate end-to-end delivery without real environment configuration and an authorized test inbox. Production/marketing activation needs separate explicit approval.


## Google Workspace identity decision — owner approval, 2026-11-04

Owner confirmed Koinonia already uses one existing Google Workspace for Koinonia Admin and Koinonia Transactions and wants Koinonia Properties public mail at the Properties domain. **Recommended**: add `koinoniaproperties.com` as a secondary domain in that existing Workspace, then create recipient aliases/Groups as appropriate rather than creating a new Workspace tenant. Proposed public identities pending Workspace setup and routing tests:

- `hello@koinoniaproperties.com` — general.
- `management@koinoniaproperties.com` — owner prospects.
- `realestate@koinoniaproperties.com` — buyers and sellers.
- `notifications@koinoniaproperties.com` — automated from address; must be verified with Resend before first send.

**Provider/admin access not established by GitHub, Vercel, Gmail mailbox or Drive connectors.** Workspace Admin and Cloudflare zone changes have NOT been made. Do not claim these mailboxes or aliases already exist. Do not add records to unrelated Admin/Transactions DNS zones. DNS sequence for Properties: verify domain ownership in Google Admin, add provider-issued Google MX to Properties only, set SPF, Google DKIM and DMARC, and verify incoming/outgoing test mail. Preserve web A/CNAME and active Vercel domains. For automated Resend mail, register/verify Properties sending domain using provider-issued records without replacing Google MX, then configure a Properties-scoped API key and sender/recipient in Vercel. Cloudflare Turnstile key/hostname and end-to-end test are independent requirements; activation flags stay off until all are verified. Proposed alias names are an initial operating plan and require final owner approval before public posting.

Official references: https://support.google.com/a/answer/7502379 ; https://developers.cloudflare.com/dns/manage-dns-records/how-to/set-up-google-workspace/ ; https://resend.com/docs/dashboard/domains/introduction


## 2026-11-05 activation checkpoint

Owner verified Google Workspace secondary domain `koinoniaproperties.com` and confirmed that `hello@koinoniaproperties.com` and `info@koinoniaproperties.com` exist as alternate emails for the original Workspace user. Gmail 'Send mail as' lists both and owner reports successful send/receive test. The Properties public contact config now uses `hello@koinoniaproperties.com` on this preview branch.

Vercel Properties project `prj_iKGoW1dEYSfwLIlhthH1FwFhk5es`: added three **preview-only** nonsecret environment variables: `PROPERTIES_INQUIRY_TO_EMAIL=hello@koinoniaproperties.com`, `PROPERTIES_INQUIRIES_ENABLED=false`, and `NEXT_PUBLIC_PROPERTIES_INQUIRIES_ENABLED=false`. Neither production nor DNS was modified. Because Properties Vercel has no linked Git repository, it rejected branch-scoped env variables; safe preview-wide variables were added instead.

Existing separate Transactions Vercel project `reynalds-os-web` has `RESEND_API_KEY`, `CONTACT_INTAKE_FROM_EMAIL`, and `CONTACT_INTAKE_TO_EMAIL` keys (values not accessed). Do **not** copy the Transactions Resend key or send identity by default. No connected Resend dashboard or Cloudflare Turnstile administration tool exists in this session.

**Outstanding:** Create and verify a Properties-specific Resend sending domain/subdomain and sender identity, establish appropriate scoped API credential, create Cloudflare Turnstile widget for the exact chosen preview host, set the remaining Properties preview environment variables securely, build a new preview from those values, perform actual successful and failed delivery tests, then make an explicit release decision. Do not conflate Google email alias success with automated form submission success.


## 2026-11-05 live preview submission confirmation

Owner reported that an actual rental-analysis inquiry submitted from the Properties preview generated an email that arrived at the configured Google Workspace recipient. The preview deployment `dpl_4gCTWtdUzZ7jZgcw9MPf3388X1oK` was previously confirmed READY, with stable alias `https://koinonia-properties-git-preview-properties-inq-1f92b2-koinonia3.vercel.app`. The owner-confirmed receipt validates the **successful preview happy path for the rental-analysis lead form**, including the server-side API and Resend delivery. It is not an independently reviewed email-header/Resend-log audit, nor does it prove every lead type has passed testing.

**Still to verify before a production release:** buyer and seller form end-to-end receipt; failure states (invalid verification, malformed requests, email provider outage, repeated submissions), responsive presentation, spam/abuse rate controls, owner privacy disclosures and retention, lead handoff/response process, exact production host configuration and credentials, and legally reviewed public sales/property management claims. The current allowed-origin/Turnstile configuration is **preview-host specific**; production must have separate origin/hostname readiness and cannot blindly reuse it. Do not equate an email delivery response with durable prospect storage or CRM synchronization.

**Change control:** No production promotion authorized or executed. Preserve preview-only secrets and production separation. After acceptance, stage and test a production-targeted deployment without switching the live domain, then require explicit owner approval before promotion.
