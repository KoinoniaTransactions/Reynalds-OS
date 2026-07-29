"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BillingSetupRequestFormProps = {
  storageReady: boolean;
};

export function BillingSetupRequestForm({ storageReady }: BillingSetupRequestFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setStatus("error");
      setMessage("Billing setup storage is not available yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/portal/billing-setup-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountLabel: formData.get("amountLabel"),
          billingModel: formData.get("billingModel"),
          clientName: formData.get("clientName"),
          consentAcknowledged: formData.get("consentAcknowledged") === "on",
          notes: formData.get("notes"),
          serviceName: formData.get("serviceName"),
          status: formData.get("status"),
          triggerDescription: formData.get("triggerDescription")
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save this billing setup request yet.");
      }

      event.currentTarget.reset();
      setStatus("success");
      setMessage("Billing setup request saved. Koinonia can send the secure processor link.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save this billing setup request yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !storageReady || isSubmitting;

  return (
    <section className="koinonia-billing-panel">
      <p className="koinonia-eyebrow">Setup Request</p>
      <form className="koinonia-billing-setup-form" onSubmit={handleSubmit}>
        <label>
          Service
          <select disabled={disabled} name="serviceName" required>
            <option value="Transaction Coordination Plus">Transaction Coordination Plus</option>
            <option value="Pay-at-Closing Coordination">Pay-at-Closing Coordination</option>
            <option value="Licensed Showing Coverage">Licensed Showing Coverage</option>
            <option value="Monthly Operations Partnership">Monthly Operations Partnership</option>
            <option value="Realtor Support Plus">Realtor Support Plus</option>
            <option value="Custom Scope">Custom Scope</option>
          </select>
        </label>

        <label>
          Billing Model
          <select disabled={disabled} name="billingModel" required>
            <option value="Prepaid before work begins">Prepaid before work begins</option>
            <option value="Pay after successful close">Pay after successful close</option>
            <option value="Per showing after completion">Per showing after completion</option>
            <option value="Monthly recurring support">Monthly recurring support</option>
            <option value="Custom written agreement">Custom written agreement</option>
          </select>
        </label>

        <label>
          Status
          <select disabled={disabled} name="status">
            <option value="Setup Requested">Setup requested</option>
            <option value="Consent Needed">Consent needed</option>
            <option value="Processor Link Needed">Processor link needed</option>
            <option value="Payment Method Ready">Payment method ready</option>
            <option value="Pay at Close Watch">Pay at close watch</option>
            <option value="Blocked">Blocked</option>
          </select>
        </label>

        <label>
          Amount
          <input disabled={disabled} name="amountLabel" placeholder="$389 prepaid or $599 after close" />
        </label>

        <label>
          Trigger
          <input
            disabled={disabled}
            name="triggerDescription"
            placeholder="Before work begins, after close, or after showing"
          />
        </label>

        <label>
          Client or Team
          <input disabled={disabled} name="clientName" placeholder="Client/team name" />
        </label>

        <label>
          Notes
          <textarea
            disabled={disabled}
            name="notes"
            placeholder="Billing instructions only; no card, CVV, or bank details"
            rows={4}
          />
        </label>

        <label className="koinonia-billing-checkbox">
          <input disabled={disabled} name="consentAcknowledged" type="checkbox" />
          Client authorizes the selected service billing model
        </label>

        <button className="koinonia-button primary" disabled={disabled} type="submit">
          {isSubmitting ? "Saving" : "Save Setup Request"}
        </button>

        {!storageReady ? (
          <p className="koinonia-billing-security-note">
            Billing setup requests will save once production storage is reachable.
          </p>
        ) : null}

        {message ? (
          <p className={`koinonia-billing-setup-form-status ${status ?? ""}`}>{message}</p>
        ) : null}
      </form>
    </section>
  );
}
