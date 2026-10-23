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
3. **Postal address:** owner-supplied draft footer address: `Koinonia Transactions LLC, 14101 Scarlet Sage St, Parker, CO 80134`. Verify its exact formatting and eligibility for commercial mailing requirements, then verify placement in actual commercial campaign templates. This is not yet live-template acceptance.
4. **Unsubscribe:** test actual recipient-facing preference/unsubscribe links and one-click requirements where applicable using an explicitly authorized isolated test send. The previously verified Resend contact webhook is not a substitute.
5. **Suppression:** prove the actual outbound selection/send path excludes global unsubscribes, topic opt-outs, complaint/bounce/manual suppressions, ambiguous contacts, invalid consent, and unavailable provider checks; execute isolated tests before any customer send.
6. **List evidence:** accept only well-supported permission provenance; purchased, scraped, inferred, or imported lists require additional review and do not automatically qualify for nurture.
7. **Reputation ramp:** establish approved initial sending caps, daily/weekly increase limits, bounce/complaint/opt-out monitoring, pause thresholds, and owner escalation. No arbitrary numeric limits authorized.
8. **Owner approval:** explicit sign-off on recipients, message/template, domain, test mode, and send schedule before activation.

## Implementation
Pure `evaluateKoinoniaSendReadiness` performs checklist evaluation but ALWAYS returns `sendingEnabled:false`, `enrollmentApproved:false`, and `action:manual_review`. Passing booleans are not evidence of actual deliverability or legal compliance. No send route, CRM mutation, Resend mutation, configuration changes, or production promotion included.

M7.4, M7.6–M7.9, and M7.11 remain open until evidenced owner acceptance.

## 2026-10-22 owner address decision
The owner designated the address above for the marketing email footer. It is recorded as a **draft mailing identity only**, not a live email template or permission to send. Keep M7.6 open until template rendering and compliance review are complete.

## 2026-10-22 provider capability verified — no live Resend account inspection

Resend documents that Broadcasts support the `{{{RESEND_UNSUBSCRIBE_URL}}}` recipient-specific placeholder and a built-in unsubscribe footer. Resend also states that global unsubscribed contacts are skipped even when a Topic is opted-in, and Broadcasts can apply a Topic. This lets Koinonia **reuse Resend's native unsubscribe handling** instead of building a parallel unsubscribe service.

Sources:
- https://resend.com/blog/send-marketing-emails-with-resend-broadcasts
- https://resend.com/blog/unsubscribe-topics
- https://resend.com/blog/manage-subscribers-using-resend-audiences
- https://resend.com/changelog/domain-verification-events

**Recommended final template approach:** use the native Resend Broadcast unsubscribe placeholder/footer, along with the approved draft postal mailing address. The isolated code footer preview validates an HTTPS unsubscribe URL but is **not** a verified Resend Broadcast template and must not be wired into live sending by itself.

**Still unverified:** this account's actual Resend sending-domain verification status, live subscriber-facing link, exact template placement, complete provider suppression coverage in the send path and final sending approval. Do not mark M7.4 or M7.6–M7.9 complete based on documentation alone.
