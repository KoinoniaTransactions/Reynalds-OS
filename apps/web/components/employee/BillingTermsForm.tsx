"use client";

import {
  useRouter
} from "next/navigation";
import {
  useState
} from "react";
import {
  getKoinoniaServiceTemplateByPackageName
} from "../../lib/koinonia-service-templates";

type BillingTermsFormProps = {
  canManage: boolean;
  disabled?: boolean;
  requestId: string;
  serviceName: string;
};

type BillingRuleResponse = {
  billingRule?: {
    id: string;
    status: string;
  };
  error?: string;
};

export function BillingTermsForm({
  canManage,
  disabled = false,
  requestId,
  serviceName
}: BillingTermsFormProps) {
  const router =
    useRouter();

  const [
    isSubmitting,
    setIsSubmitting
  ] = useState(false);

  const [
    message,
    setMessage
  ] = useState<string | null>(
    null
  );

  const [
    resultStatus,
    setResultStatus
  ] = useState<
    "error" | "success" | null
  >(null);

  const template =
    getKoinoniaServiceTemplateByPackageName(
      serviceName
    );

  const billingModel =
    template?.billingModel;

  if (
    billingModel !== "monthly" &&
    billingModel !== "custom"
  ) {
    return null;
  }

  const isDisabled =
    disabled ||
    !canManage ||
    isSubmitting;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage(null);
    setResultStatus(null);

    try {
      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const commonInput = {
        billingSetupRequestId:
          requestId,

        billingModel,

        effectiveDate:
          String(
            formData.get(
              "effectiveDate"
            ) ?? ""
          ),

        renewalCancellationSummary:
          String(
            formData.get(
              "renewalCancellationSummary"
            ) ?? ""
          ),

        scopeSummary:
          String(
            formData.get(
              "scopeSummary"
            ) ?? ""
          ),

        termsVersion:
          String(
            formData.get(
              "termsVersion"
            ) ?? ""
          )
      };

      const ruleInput =
        billingModel === "monthly"
          ? {
              ...commonInput,

              billingDay:
                Number(
                  formData.get(
                    "billingDay"
                  )
                ),

              checkInCadence:
                String(
                  formData.get(
                    "checkInCadence"
                  ) ?? ""
                ),

              includedHours:
                Number(
                  formData.get(
                    "includedHours"
                  )
                ),

              monthlyAmount:
                String(
                  formData.get(
                    "monthlyAmount"
                  ) ?? ""
                ),

              overageRate:
                String(
                  formData.get(
                    "overageRate"
                  ) ?? ""
                ),

              paymentTiming:
                String(
                  formData.get(
                    "paymentTiming"
                  ) ?? ""
                )
            }
          : {
              ...commonInput,

              authorizationRequirements:
                String(
                  formData.get(
                    "authorizationRequirements"
                  ) ?? ""
                ),

              paymentTiming:
                String(
                  formData.get(
                    "paymentTiming"
                  ) ?? ""
                ),

              pricingBasis:
                String(
                  formData.get(
                    "pricingBasis"
                  ) ?? ""
                ),

              reviewCadence:
                String(
                  formData.get(
                    "reviewCadence"
                  ) ?? ""
                )
            };

      const response =
        await fetch(
          "/api/portal/billing-rules",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(
                ruleInput
              )
          }
        );

      const payload =
        (await response.json()) as
          BillingRuleResponse;

      if (
        !response.ok ||
        !payload.billingRule?.id
      ) {
        throw new Error(
          payload.error ??
            "Unable to save these written billing terms."
        );
      }

      form.reset();

      setResultStatus(
        "success"
      );

      setMessage(
        `Written terms saved as ${payload.billingRule.status}. The client must accept this exact version before secure payment setup can begin.`
      );

      router.refresh();
    } catch (error) {
      setResultStatus(
        "error"
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save these written billing terms."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="koinonia-billing-status-form"
      onSubmit={handleSubmit}
    >
      <p className="koinonia-eyebrow">
        Written Billing Terms
      </p>

      <p className="koinonia-billing-security-note employee">
        {billingModel ===
        "monthly"
          ? "Record the exact monthly scope, recurring amount, included hours, cadence, payment timing, and change terms the client will review."
          : "Record the exact custom scope, pricing basis, payment timing, review cadence, and authorization requirements the client will review."}
      </p>

      <label>
        Terms Version
        <input
          disabled={isDisabled}
          name="termsVersion"
          placeholder={
            billingModel ===
            "monthly"
              ? "monthly-v1"
              : "custom-v1"
          }
          required
          type="text"
        />
      </label>

      <label>
        Effective Date
        <input
          disabled={isDisabled}
          name="effectiveDate"
          required
          type="date"
        />
      </label>

      <label>
        Approved Scope
        <textarea
          disabled={isDisabled}
          name="scopeSummary"
          placeholder="Describe the exact approved service scope."
          required
          rows={4}
        />
      </label>

      {billingModel ===
      "monthly" ? (
        <>
          <label>
            Monthly Amount
            <input
              disabled={isDisabled}
              inputMode="decimal"
              name="monthlyAmount"
              placeholder="1200.00"
              required
              type="text"
            />
          </label>

          <label>
            Billing Day
            <input
              disabled={isDisabled}
              max={28}
              min={1}
              name="billingDay"
              required
              type="number"
            />
          </label>

          <label>
            Included Hours
            <input
              disabled={isDisabled}
              max={1000}
              min={0}
              name="includedHours"
              required
              step="0.25"
              type="number"
            />
          </label>

          <label>
            Overage Rate
            <input
              disabled={isDisabled}
              inputMode="decimal"
              name="overageRate"
              placeholder="100.00"
              type="text"
            />
          </label>

          <label>
            Check-in Cadence
            <input
              disabled={isDisabled}
              name="checkInCadence"
              placeholder="Monthly review"
              required
              type="text"
            />
          </label>
        </>
      ) : (
        <>
          <label>
            Pricing Basis
            <textarea
              disabled={isDisabled}
              name="pricingBasis"
              placeholder="Describe how approved custom work is priced."
              required
              rows={3}
            />
          </label>

          <label>
            Review Cadence
            <input
              disabled={isDisabled}
              name="reviewCadence"
              placeholder="Review before scope expansion"
              required
              type="text"
            />
          </label>

          <label>
            Authorization Requirements
            <textarea
              disabled={isDisabled}
              name="authorizationRequirements"
              placeholder="Describe what written approval is required before billable custom work."
              required
              rows={3}
            />
          </label>
        </>
      )}

      <label>
        Payment Timing
        <textarea
          disabled={isDisabled}
          name="paymentTiming"
          placeholder="Describe exactly when an invoice or approved charge becomes eligible."
          required
          rows={3}
        />
      </label>

      <label>
        Renewal / Cancellation / Changes
        <textarea
          disabled={isDisabled}
          name="renewalCancellationSummary"
          placeholder="Describe renewal, cancellation, and how changes require a new terms version."
          required
          rows={3}
        />
      </label>

      <button
        className="koinonia-button primary"
        disabled={isDisabled}
        type="submit"
      >
        {isSubmitting
          ? "Saving Written Terms"
          : "Save Written Terms for Client Review"}
      </button>

      <p className="koinonia-billing-security-note employee">
        Do not enter card numbers,
        CVV, bank details, login
        credentials, processor secrets,
        or other payment credentials in
        written terms.
      </p>

      {!canManage ? (
        <p className="koinonia-billing-security-note employee">
          Owner or Finance authorization
          is required to create or replace
          written billing terms.
        </p>
      ) : null}

      {disabled ? (
        <p className="koinonia-billing-security-note employee">
          Live billing storage must be
          available before written terms
          can be saved.
        </p>
      ) : null}

      {message ? (
        <p
          className={`koinonia-billing-form-status ${resultStatus ?? ""}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
