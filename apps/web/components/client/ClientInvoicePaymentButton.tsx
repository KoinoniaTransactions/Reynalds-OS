"use client";

import { useState } from "react";

type ClientInvoicePaymentButtonProps = {
  invoiceId: string;
};

type PaymentSessionResponse = {
  error?: string;
  url?: string;
};

export function ClientInvoicePaymentButton({
  invoiceId
}: ClientInvoicePaymentButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setIsOpening(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/portal/invoices/${invoiceId}/payment-session`,
        {
          method: "POST"
        }
      );

      const payload =
        (await response.json()) as PaymentSessionResponse;

      if (!response.ok || !payload.url) {
        throw new Error(
          payload.error ??
            "Secure invoice payment could not be opened."
        );
      }

      window.location.assign(payload.url);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Secure invoice payment could not be opened."
      );
      setIsOpening(false);
    }
  }

  return (
    <div>
      <button
        className="koinonia-button primary"
        disabled={isOpening}
        onClick={handlePayment}
        type="button"
      >
        {isOpening ? "Opening Stripe" : "Pay Securely"}
      </button>

      {error ? (
        <p className="koinonia-billing-setup-form-status error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
