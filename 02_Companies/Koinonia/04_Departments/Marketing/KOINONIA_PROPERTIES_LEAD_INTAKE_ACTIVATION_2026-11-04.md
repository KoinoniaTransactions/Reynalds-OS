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
