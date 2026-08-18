"use client";

import { useState } from "react";

type PayAtCloseTriggerFormProps = {
  invoiceId: string;
};

type PayAtCloseTriggerResponse = {
  error?: string;
  invoice?: {
    status: string;
  };
  trigger?: {
    id: string;
  };
};

export function PayAtCloseTriggerForm({
  invoiceId
}: PayAtCloseTriggerFormProps) {
  const [message, setMessage] = useState<string | null>(
    null
  );
  const [status, setStatus] = useState<
    "error" | "success" | null
  >(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const response = await fetch(
        `/api/portal/invoices/${invoiceId}/pay-at-close-trigger`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            closingDate: String(
              formData.get("closingDate") ?? ""
            ),
            confirmationSource: String(
              formData.get("confirmationSource") ?? ""
            ),
            note: String(formData.get("note") ?? ""),
            outcome: "successful_close"
          })
        }
      );

      const payload =
        (await response.json()) as PayAtCloseTriggerResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to confirm this successful closing."
        );
      }

      setStatus("success");
      setMessage(
        "Successful closing confirmed. Invoice is Ready to Process."
      );

      window.location.assign(
        "/employee/billing?pay_at_close=confirmed"
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to confirm this successful closing."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="koinonia-billing-status-form"
      onSubmit={handleSubmit}
    >
      <label>
        Confirmed Closing Date
        <input
          disabled={isSubmitting}
          name="closingDate"
          required
          type="date"
        />
      </label>

      <label>
        Confirmation Source
        <input
          disabled={isSubmitting}
          maxLength={160}
          name="confirmationSource"
          placeholder="Title company, brokerage, closing disclosure, or other approved source"
          required
          type="text"
        />
      </label>

      <label>
        Closing Note
        <textarea
          disabled={isSubmitting}
          maxLength={500}
          name="note"
          placeholder="Optional operational note. Do not enter card, bank, or processor secrets."
          rows={3}
        />
      </label>

      <button
        className="koinonia-button primary"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? "Confirming"
          : "Confirm Successful Close"}
      </button>

      <p className="koinonia-billing-security-note employee">
        This confirms the closing trigger only. It does
        not charge the client or create a Payment record.
      </p>

      {message ? (
        <p
          className={`koinonia-billing-form-status ${
            status ?? ""
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
