"use client";

import {
  useRouter
} from "next/navigation";
import {
  useState
} from "react";

export type ClientBillingTermsCardTerms = {
  authorizationRequirements?: string;
  authorizationStatus: string;
  billingDay?: number;
  billingModel: "monthly" | "custom";
  billingSetupRequestId: string;
  checkInCadence?: string;
  effectiveDate: string;
  id: string;
  includedHours?: number;
  monthlyAmount?: string;
  overageRate?: string;
  paymentTiming: string;
  pricingBasis?: string;
  renewalCancellationSummary: string;
  reviewCadence?: string;
  scopeSummary: string;
  serviceName: string;
  termsVersion: string;
};

type ClientBillingTermsCardProps = {
  disabled?: boolean;
  terms?: ClientBillingTermsCardTerms;
};

type AcceptanceResponse = {
  billingRule?: {
    id: string;
    status: string;
  };
  error?: string;
};

export function ClientBillingTermsCard({
  disabled = false,
  terms
}: ClientBillingTermsCardProps) {
  const router =
    useRouter();

  const [
    accepted,
    setAccepted
  ] = useState(false);

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

  if (!terms) {
    return null;
  }

  const isAuthorized =
    terms.authorizationStatus ===
    "Authorized";

  const isDisabled =
    disabled ||
    isAuthorized ||
    isSubmitting;

  async function acceptTerms() {
    if (!terms || !accepted) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setResultStatus(null);

    try {
      const response =
        await fetch(
          `/api/portal/billing-rules/${terms.id}/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                accepted: true,
                termsVersion:
                  terms.termsVersion
              })
          }
        );

      const payload =
        (await response.json()) as
          AcceptanceResponse;

      if (
        !response.ok ||
        !payload.billingRule?.id
      ) {
        throw new Error(
          payload.error ??
            "Unable to accept these billing terms."
        );
      }

      setResultStatus(
        "success"
      );

      setMessage(
        `Terms version ${terms.termsVersion} accepted. Secure payment setup, when required, remains a separate step.`
      );

      router.refresh();
    } catch (error) {
      setResultStatus(
        "error"
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept these billing terms."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="koinonia-billing-status-form">
      <p className="koinonia-eyebrow">
        Written Billing Terms
      </p>

      <div className="koinonia-billing-work-meta">
        <strong>
          {terms.authorizationStatus}
        </strong>
        <span>
          Terms version{" "}
          {terms.termsVersion}
        </span>
      </div>

      <p>
        <strong>Service:</strong>{" "}
        {terms.serviceName}
      </p>

      <p>
        <strong>Effective date:</strong>{" "}
        {terms.effectiveDate}
      </p>

      <p>
        <strong>Approved scope:</strong>{" "}
        {terms.scopeSummary}
      </p>

      {terms.billingModel ===
      "monthly" ? (
        <>
          <p>
            <strong>
              Monthly amount:
            </strong>{" "}
            ${terms.monthlyAmount}
          </p>

          <p>
            <strong>
              Billing day:
            </strong>{" "}
            Day {terms.billingDay}
          </p>

          <p>
            <strong>
              Included hours:
            </strong>{" "}
            {terms.includedHours}
          </p>

          {terms.overageRate ? (
            <p>
              <strong>
                Overage rate:
              </strong>{" "}
              ${terms.overageRate}
            </p>
          ) : null}

          <p>
            <strong>
              Check-in cadence:
            </strong>{" "}
            {terms.checkInCadence}
          </p>
        </>
      ) : (
        <>
          <p>
            <strong>
              Pricing basis:
            </strong>{" "}
            {terms.pricingBasis}
          </p>

          <p>
            <strong>
              Review cadence:
            </strong>{" "}
            {terms.reviewCadence}
          </p>

          <p>
            <strong>
              Authorization requirements:
            </strong>{" "}
            {
              terms.authorizationRequirements
            }
          </p>
        </>
      )}

      <p>
        <strong>Payment timing:</strong>{" "}
        {terms.paymentTiming}
      </p>

      <p>
        <strong>
          Renewal, cancellation, and
          changes:
        </strong>{" "}
        {
          terms.renewalCancellationSummary
        }
      </p>

      {isAuthorized ? (
        <p className="koinonia-billing-security-note">
          You accepted this exact terms
          version. Any later change must
          be presented as a new version
          for separate acceptance.
        </p>
      ) : (
        <>
          <label className="koinonia-billing-checkbox">
            <input
              checked={accepted}
              disabled={
                disabled ||
                isSubmitting
              }
              onChange={(event) =>
                setAccepted(
                  event.target.checked
                )
              }
              type="checkbox"
            />
            I have reviewed and accept
            written billing terms version{" "}
            {terms.termsVersion}.
          </label>

          <button
            className="koinonia-button primary"
            disabled={
              isDisabled ||
              !accepted
            }
            onClick={acceptTerms}
            type="button"
          >
            {isSubmitting
              ? "Accepting Terms"
              : `Accept Terms ${terms.termsVersion}`}
          </button>
        </>
      )}

      <p className="koinonia-billing-security-note">
        Accepting written terms does not
        charge a card or bank account and
        does not create an invoice.
        Payment setup, when required, is
        completed separately through the
        secure processor-hosted flow.
      </p>

      {disabled ? (
        <p className="koinonia-billing-security-note">
          Live billing storage must be
          available before written terms
          can be accepted.
        </p>
      ) : null}

      {message ? (
        <p
          className={`koinonia-billing-form-status ${resultStatus ?? ""}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
