"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getKoinoniaBillingSetupOptions } from "../../lib/koinonia-service-templates";
import { koinoniaBillingRequestSourceHeader } from "../../lib/portal-billing-request-source";

type BillingSetupRequestFormProps = {
  storageReady: boolean;
};

type BillingSetupCreateResponse = {
  billingSetupRequest?: {
    id: string;
  };
  error?: string;
};

type ProcessorSessionResponse = {
  error?: string;
  url?: string;
};

const billingSetupOptions = getKoinoniaBillingSetupOptions();

export function BillingSetupRequestForm({
  storageReady
}: BillingSetupRequestFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState(
    billingSetupOptions[0]?.serviceName ?? ""
  );
  const [status, setStatus] = useState<"error" | "success" | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOption =
    billingSetupOptions.find(
      (option) => option.serviceName === selectedServiceName
    ) ?? billingSetupOptions[0];

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
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
      const form = event.currentTarget;
      const formData = new FormData(form);
      const consentAcknowledged =
        formData.get("consentAcknowledged") === "on";

      const response = await fetch(
        "/api/portal/billing-setup-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [koinoniaBillingRequestSourceHeader]: "client-portal"
          },
          body: JSON.stringify({
            amountLabel: formData.get("amountLabel"),
            billingModel: formData.get("billingModel"),
            clientName: formData.get("clientName"),
            consentAcknowledged,
            notes: formData.get("notes"),
            serviceName: formData.get("serviceName"),
            triggerDescription: formData.get(
              "triggerDescription"
            )
          })
        }
      );

      const payload =
        (await response.json()) as BillingSetupCreateResponse;

      if (!response.ok || !payload.billingSetupRequest?.id) {
        throw new Error(
          payload.error ??
            "Unable to save this billing setup request yet."
        );
      }

      if (consentAcknowledged) {
        setMessage(
          "Billing setup saved. Opening Stripe secure payment setup..."
        );
        setStatus("success");

        const processorResponse = await fetch(
          `/api/portal/billing-setup-requests/${payload.billingSetupRequest.id}/processor-session`,
          { method: "POST" }
        );

        const processorPayload =
          (await processorResponse.json()) as ProcessorSessionResponse;

        if (!processorResponse.ok || !processorPayload.url) {
          throw new Error(
            processorPayload.error ??
              "Billing setup was saved, but Stripe secure setup could not be opened yet."
          );
        }

        window.location.assign(processorPayload.url);
        return;
      }

      form.reset();
      setStatus("success");
      setMessage(
        "Billing setup request saved. Billing consent must be recorded before Stripe secure setup can begin."
      );
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this billing setup request yet."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !storageReady || isSubmitting;

  return (
    <section className="koinonia-billing-panel">
      <p className="koinonia-eyebrow">Setup Request</p>

      <form
        className="koinonia-billing-setup-form"
        onSubmit={handleSubmit}
      >
        <label>
          Service
          <select
            disabled={disabled}
            name="serviceName"
            onChange={(event) =>
              setSelectedServiceName(event.target.value)
            }
            required
            value={selectedServiceName}
          >
            {billingSetupOptions.map((option) => (
              <option
                key={`${option.templateId}:${option.serviceName}`}
                value={option.serviceName}
              >
                {option.serviceName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Billing Model
          <input
            name="billingModel"
            readOnly
            value={
              selectedOption?.billingModelLabel ??
              "Custom written agreement"
            }
          />
        </label>

        {selectedOption ? (
          <p className="koinonia-billing-security-note">
            Portal setup:{" "}
            {selectedOption.clientPortalSections.join(", ")}.
            Staff next step: {selectedOption.staffNextAction}
          </p>
        ) : null}

        <p className="koinonia-billing-security-note">
          After billing consent is recorded, this form opens
          Stripe&apos;s secure hosted setup page. Card details are
          entered with Stripe, not in Koinonia.
        </p>

        <label>
          Amount
          <input
            disabled={disabled}
            name="amountLabel"
            placeholder="$389 prepaid or $599 after close"
          />
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
          <input
            disabled={disabled}
            name="clientName"
            placeholder="Client/team name"
          />
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
          <input
            disabled={disabled}
            name="consentAcknowledged"
            type="checkbox"
          />
          Client authorizes the selected service billing model
        </label>

        <button
          className="koinonia-button primary"
          disabled={disabled}
          type="submit"
        >
          {isSubmitting
            ? "Opening Secure Setup"
            : "Save & Open Secure Payment Setup"}
        </button>

        {!storageReady ? (
          <p className="koinonia-billing-security-note">
            Billing setup requests will save once production storage
            is reachable.
          </p>
        ) : null}

        {message ? (
          <p
            className={`koinonia-billing-setup-form-status ${
              status ?? ""
            }`}
          >
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
