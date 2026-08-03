# Koinonia Billing and Payment Setup Specification

Status: Proposed MVP architecture  
Date: 2026-07-28  
Owner: Koinonia Transactions  
Applies To: Customer billing profiles, service billing rules, payment-method setup, invoices, pay-at-closing tracking, and payment processing readiness

---

## 1. Purpose

Koinonia needs billing information on each customer file because clients may choose different services with different billing rules.

The portal should help Koinonia:

- See what service or package each customer selected.
- Know whether the service is prepaid, pay-at-closing, monthly, or custom.
- Request secure payment-method setup when appropriate.
- Track whether a payment method is ready to charge.
- Create invoices connected to clients, services, transactions, and packages.
- Track prepaid invoices before work begins.
- Track pay-at-closing billing triggers after successful closing.
- Track monthly or custom billing rules.
- Record payment consent and charge authorization.
- Process payments through an approved payment processor.

This should be a billing operations system tied to the customer file, not a raw credit-card vault.

---

## 2. Critical Payment Security Boundary

The portal must not store raw credit card numbers, CVV/CVC codes, magnetic stripe data, PIN data, or other sensitive authentication data.

The safer model is:

1. Use an approved payment processor such as Stripe, Square, or another compliant provider.
2. Let the processor-hosted checkout, payment element, or setup flow collect the card details.
3. Store only safe billing metadata in Koinonia:
   - Processor customer ID.
   - Processor payment method ID or token reference.
   - Brand.
   - Last four digits.
   - Expiration month/year.
   - Billing contact.
   - Consent record.
   - Payment setup status.
4. Never store CVV/CVC.
5. Never store full card number in the Koinonia database.
6. Keep audit history for setup, consent, invoice creation, payment attempts, successful payments, refunds, failures, and removed payment methods.

If Koinonia later needs full PCI-scope payment processing, that should be treated as a separate security project with legal, insurance, processor, and compliance review.

Production readiness requires:

- `KOINONIA_PAYMENT_PROCESSOR_PROVIDER` set to the approved processor.
- `KOINONIA_PAYMENT_SETUP_URL` set to a public HTTPS processor-hosted setup destination.
- `KOINONIA_PAYMENT_WEBHOOK_URL` set to the public HTTPS endpoint configured in the payment processor.
- `KOINONIA_PAYMENT_WEBHOOK_SECRET` set so processor events can be verified before payment status is trusted.

Stripe setup uses `https://www.koinoniatransactions.com/api/portal/payments/webhook` as the production webhook endpoint.
Configure Stripe to send setup, checkout, payment success, payment failure, and refund events to that endpoint.
Stripe Checkout Sessions, SetupIntents, or PaymentIntents should include Koinonia metadata so the portal can match processor events safely:

- `koinoniaWorkspaceId`
- `koinoniaInvoiceId` for invoice payment events.
- `koinoniaBillingSetupRequestId` for payment-method setup events.

The webhook should store only safe processor references and safe payment-method summaries.
Do not place raw card numbers, CVV/CVC, bank details, API keys, or Stripe secrets in metadata, notes, or portal records.

---

## 3. Customer Billing Profile

Every customer file should include a billing profile.

Recommended fields:

- Customer account.
- Billing contact name.
- Billing contact email.
- Billing contact phone.
- Billing address, if needed by processor.
- Default payment method status.
- Processor customer ID.
- Default payment method reference.
- Payment method brand.
- Payment method last four digits.
- Payment method expiration.
- Consent status.
- Consent terms version.
- Consent timestamp.
- Authorized billing models.
- Outstanding balance.
- Open invoices.
- Payment issues.
- Internal billing notes.

Client users should be able to see safe payment method metadata and update payment setup through the processor-hosted flow.

Staff users should be able to see billing readiness, invoice status, failed payment status, and pay-at-closing triggers.

---

## 4. Service Billing Models

Each service activation or work item should have its own billing model.

### Prepaid

Applies to:

- Transaction Coordination Plus.

Default rule:

- $389 due before transaction work begins.
- Work should not move to active coordination until payment status is paid or an approved exception exists.

### Pay-at-Closing

Applies to:

- Pay-at-Closing Coordination.

Default rule:

- $599 due only after successful closing.
- No coordination fee if the transaction does not close.
- Billing trigger should be tied to closing status, closing date, and file outcome.

### Monthly / Retainer

Applies to:

- Monthly Operations Partnership.
- Some Realtor Support Plus arrangements.

Default rule:

- Billing cadence, included hours, overage rate, and renewal terms must be documented.
- Payment method on file should be collected with explicit consent for recurring or future charges.

### Custom

Applies to:

- Realtor Support Plus.
- Scope-based or mixed-service support.

Default rule:

- Custom billing terms must document included services, excluded services, payment timing, review cadence, and authorization requirements.

### Showing Coverage

Applies to:

- Licensed Showing Coverage.

Default rule:

- Billing may be per showing, prepaid, monthly-bundled, or custom depending on the client agreement.
- Rush, distance, access complexity, or extended showing time may affect the amount.

---

## 5. Client-Facing Billing Center

Route:

`/client/billing`

Purpose:

Give Realtor clients a safe place to see their selected services, billing model, invoices, payment setup status, and payment method readiness.

Expected sections:

- Billing profile.
- Services selected.
- Payment method setup.
- Invoices.
- Pay-at-closing status.
- Monthly/custom billing status.
- Payment history.
- Billing questions.

Client actions:

- Open secure payment setup.
- Update payment method through processor-hosted flow.
- View invoice status.
- Pay an open prepaid invoice.
- Confirm billing contact.
- Review authorized billing model.
- View pay-at-closing trigger status.

Client users should not be able to enter card numbers directly into Koinonia portal fields.

---

## 6. Employee-Facing Billing Workspace

Route:

`/employee/billing`

Purpose:

Give Koinonia staff one place to see billing readiness for each customer file and service activation.

Expected sections:

- Customer billing profiles.
- Payment setup needed.
- Prepaid invoices due before work begins.
- Pay-at-closing billing watch.
- Monthly/custom billing.
- Failed payment follow-up.
- Refund/adjustment notes.
- Revenue by service.
- Billing audit trail.

Staff actions:

- Send payment setup link.
- Record billing model.
- Update billing setup status with safe processor references, payment method summaries, and billing triggers.
- Create invoice.
- Update invoice/payment status with safe processor references and audit history.
- Mark pay-at-closing trigger ready.
- Record approved payment exception.
- Record failed payment follow-up.
- View safe payment method metadata.
- Open processor dashboard link, when available.

Staff users should not see full card numbers or CVV/CVC.
Staff billing notes and status updates must not store raw card numbers, CVV/CVC, bank details, processor secrets, or payment passwords.

---

## 7. Payment Consent Requirements

When saving a payment method for future use, the portal should record:

- Who consented.
- When consent was given.
- What billing model was authorized.
- What service or package the consent applies to.
- Whether charges may happen off-session.
- How the amount is determined.
- Timing or frequency of charges.
- Cancellation or dispute policy reference.
- Terms version.

Consent must be specific enough to support the billing model.

Examples:

- Prepaid one-time charge for Transaction Coordination Plus.
- Pay-at-closing charge after successful close.
- Monthly recurring charge for operations support.
- Custom support charges authorized by written agreement.

---

## 8. Recommended Data Model Additions

These models should be refined before production implementation:

- `CustomerBillingProfile`
- `PaymentMethodReference`
- `PaymentConsent`
- `ServiceActivation`
- `BillingRuleAssignment`
- `Invoice`
- `PaymentAttempt`
- `PaymentReceipt`
- `PaymentException`
- `PayAtClosingTrigger`
- `RefundAdjustment`
- `BillingAuditEvent`

These should connect to existing Reynalds OS concepts:

- `Workspace`
- `User`
- `Role`
- `RosObject`
- `Task`
- `Invoice`
- `Payment`
- `TimelineEvent`

The preferred implementation should extend the existing finance and object model instead of creating a disconnected billing database.

---

## 9. MVP Build Order

Build billing in safe slices:

1. Billing and payment setup specification. — Complete
2. Billing permissions and tests. — Complete
3. Client billing center preview with live billing setup and invoice status fallback. — Complete
4. Employee billing workspace preview with live billing setup, invoice queue, and status updates. — Complete
5. Billing profile and service activation schema.
6. Processor customer/payment-method reference model.
7. Processor-hosted payment setup link flow.
8. Prepaid invoice collection.
9. Pay-at-closing trigger workflow.
10. Monthly/custom billing workflow.
11. Payment audit trail.
12. Production security and compliance review before collecting real payment methods.

---

## 10. Launch Classification

Recommended classification:

Version 1.2 billing operations enhancement.

Reason:

The public Koinonia website can launch before payment setup is built, but live client portal operations should not accept real work at scale until billing model, payment setup, invoice status, consent, and pay-at-closing triggers are visible on each customer file.
