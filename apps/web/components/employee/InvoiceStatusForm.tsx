"use client";

import { useState } from "react";
import { portalInvoiceStatuses } from "../../lib/portal-billing-invoices";

type InvoiceStatusFormProps = {
  currentStatus: string;
  disabled?: boolean;
  invoiceId: string;
};

type InvoiceStatusResponse = {
  error?: string;
  invoice?: {
    status: string;
  };
};

export function InvoiceStatusForm({
  currentStatus,
  disabled = false,
  invoiceId
}: InvoiceStatusFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(normalizeStatus(currentStatus));
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch(`/api/portal/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dueAt: String(formData.get("dueAt") ?? ""),
          notes: String(formData.get("notes") ?? ""),
          paymentMethodSummary: String(formData.get("paymentMethodSummary") ?? ""),
          processorPaymentReference: String(formData.get("processorPaymentReference") ?? ""),
          status: String(formData.get("status") ?? "")
        })
      });
      const payload = (await response.json()) as InvoiceStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this invoice yet.");
      }

      form.reset();
      setSelectedStatus(payload.invoice?.status ?? selectedStatus);
      setStatus("success");
      setMessage("Invoice status updated and recorded in the file history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this invoice yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-billing-status-form" onSubmit={handleSubmit}>
      <label>
        Invoice Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => setSelectedStatus(event.target.value)}
          value={selectedStatus}
        >
          {portalInvoiceStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Due Date
        <input disabled={isDisabled} name="dueAt" type="date" />
      </label>

      <label>
        Processor Payment Reference
        <input
          disabled={isDisabled}
          name="processorPaymentReference"
          placeholder="Processor payment, invoice, or charge reference"
          type="text"
        />
      </label>

      <label>
        Payment Method Summary
        <input
          disabled={isDisabled}
          name="paymentMethodSummary"
          placeholder="Visa ending 4242, processor wallet, or setup reference"
          type="text"
        />
      </label>

      <label>
        Update Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Payment note only; no card numbers, CVV, bank details, or payment secrets"
          rows={3}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Invoice Status"}
      </button>

      {disabled ? (
        <p className="koinonia-billing-security-note employee">
          Live invoice storage must be available before staff invoice updates can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-billing-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): string {
  return portalInvoiceStatuses.includes(status as (typeof portalInvoiceStatuses)[number])
    ? status
    : "Open";
}
