"use client";

import { useState } from "react";

const billingSetupStatusOptions = [
  "Setup Requested",
  "Consent Needed",
  "Processor Link Needed",
  "Payment Method Ready",
  "Pay at Close Watch",
  "Blocked"
] as const;

type BillingSetupStatusFormProps = {
  currentStatus: string;
  disabled?: boolean;
  disabledReason?: string;
  requestId: string;
};

type BillingSetupStatusResponse = {
  billingSetupRequest?: {
    status: string;
  };
  error?: string;
};

export function BillingSetupStatusForm({
  currentStatus,
  disabled = false,
  disabledReason,
  requestId
}: BillingSetupStatusFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(normalizeStatus(currentStatus));
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;
  const requiresPaymentMethodEvidence = selectedStatus === "Payment Method Ready";
  const requiresTriggerDescription = selectedStatus === "Pay at Close Watch";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch(`/api/portal/billing-setup-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notes: String(formData.get("notes") ?? ""),
          paymentMethodSummary: String(formData.get("paymentMethodSummary") ?? ""),
          processorReference: String(formData.get("processorReference") ?? ""),
          status: String(formData.get("status") ?? ""),
          triggerDescription: String(formData.get("triggerDescription") ?? "")
        })
      });
      const payload = (await response.json()) as BillingSetupStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this billing setup yet.");
      }

      form.reset();
      setSelectedStatus(payload.billingSetupRequest?.status ?? selectedStatus);
      setStatus("success");
      setMessage("Billing setup status updated and recorded in the file history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this billing setup yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-billing-status-form" onSubmit={handleSubmit}>
      <label>
        Setup Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => setSelectedStatus(event.target.value)}
          value={selectedStatus}
        >
          {billingSetupStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Processor Reference
        <input
          disabled={isDisabled}
          name="processorReference"
          placeholder="Processor customer or payment method reference"
          required={requiresPaymentMethodEvidence}
          type="text"
        />
      </label>

      <label>
        Payment Method Summary
        <input
          disabled={isDisabled}
          name="paymentMethodSummary"
          placeholder="Visa ending 4242, expiration, or setup status"
          required={requiresPaymentMethodEvidence}
          type="text"
        />
      </label>

      <label>
        Trigger / Terms
        <input
          disabled={isDisabled}
          name="triggerDescription"
          placeholder="Before work begins, after close, monthly cycle"
          required={requiresTriggerDescription}
          type="text"
        />
      </label>

      <label>
        Update Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Billing note only; no card numbers, CVV, bank details, or payment secrets"
          rows={3}
        />
      </label>

      {requiresPaymentMethodEvidence ? (
        <p className="koinonia-billing-security-note employee">
          Payment Method Ready requires recorded consent, a processor reference, and a safe
          payment method summary.
        </p>
      ) : null}

      {requiresTriggerDescription ? (
        <p className="koinonia-billing-security-note employee">
          Pay at Close Watch requires recorded consent and a clear successful-closing trigger.
        </p>
      ) : null}

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Billing Status"}
      </button>

      {disabled ? (
        <p className="koinonia-billing-security-note employee">
          {disabledReason ?? "Billing setup updates are unavailable."}
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-billing-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): string {
  return billingSetupStatusOptions.includes(status as (typeof billingSetupStatusOptions)[number])
    ? status
    : "Setup Requested";
}
