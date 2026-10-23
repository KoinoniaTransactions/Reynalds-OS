# M7 — Outbound email compliance and reputation gate (design only)

Date: 2026-10-22
Branch: `koinonia-marketing-integration-2026-09-16`
State: NOT APPROVED FOR SENDING; NO PRODUCTION ACTIVATION

## Approved boundaries
- Customer-facing sending domain: `koinoniatransactions.com`. `koinoniaadmin.com` reserved for internal admin/billing.
- Four distinct modes: personal correspondence, warm follow-up, opt-in marketing nurture, and transactional; do not misclassify promotional messages as transactional to evade consent/unsubscribe restrictions.
- Marketing contact eligibility must independently enforce CRM permission/source evidence, topic-specific permission, global unsubscribe, Resend team-wide suppressions, and verified provider identity. A topic opt-in never overrides global unsubscribe.
- No export/import, automatic contact provisioning, topic changes, bulk campaigns, or new sending endpoints in this package.

## Open acceptance gates
1. **Sender reputation:** confirm Resend outbound marketing domain, DNS/authentication, and isolation from Google Workspace correspondence. Workspace SPF/DKIM/DMARC PASS alone does not prove Resend outbound readiness.
2. **Identity:** verify From and Reply-To under the approved customer-facing domain, including reply handling.
3. **Postal address:** obtain and approve an accurate physical postal mailing address (or qualifying compliant alternative); verify actual placement in commercial campaign templates. Do not invent a business address.
4. **Unsubscribe:** test actual recipient-facing preference/unsubscribe links and one-click requirements where applicable using an explicitly authorized isolated test send. The previously verified Resend contact webhook is not a substitute.
5. **Suppression:** prove the actual outbound selection/send path excludes global unsubscribes, topic opt-outs, complaint/bounce/manual suppressions, ambiguous contacts, invalid consent, and unavailable provider checks; execute isolated tests before any customer send.
6. **List evidence:** accept only well-supported permission provenance; purchased, scraped, inferred, or imported lists require additional review and do not automatically qualify for nurture.
7. **Reputation ramp:** establish approved initial sending caps, daily/weekly increase limits, bounce/complaint/opt-out monitoring, pause thresholds, and owner escalation. No arbitrary numeric limits authorized.
8. **Owner approval:** explicit sign-off on recipients, message/template, domain, test mode, and send schedule before activation.

## Implementation
Pure `evaluateKoinoniaSendReadiness` performs checklist evaluation but ALWAYS returns `sendingEnabled:false`, `enrollmentApproved:false`, and `action:manual_review`. Passing booleans are not evidence of actual deliverability or legal compliance. No send route, CRM mutation, Resend mutation, configuration changes, or production promotion included.

M7.4, M7.6–M7.9, and M7.11 remain open until evidenced owner acceptance.
