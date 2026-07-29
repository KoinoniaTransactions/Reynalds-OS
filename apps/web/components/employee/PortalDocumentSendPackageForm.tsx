"use client";

import { useState } from "react";
import { documentSendPackageDeliveryChannels } from "../../lib/document-send-packages";

type PortalDocumentSendPackageDocumentOption = {
  id: string;
  label: string;
  status: string;
};

type PortalDocumentSendPackageFormProps = {
  disabled?: boolean;
  documents: PortalDocumentSendPackageDocumentOption[];
};

type PortalDocumentSendPackageResponse = {
  documentSendPackage?: {
    id: string;
    status: string;
  };
  error?: string;
};

export function PortalDocumentSendPackageForm({
  disabled = false,
  documents
}: PortalDocumentSendPackageFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting || documents.length === 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) {
      setStatus("error");
      setMessage("Live document records are required before preparing send packages.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch("/api/portal/document-send-packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          approvalConfirmed: formData.get("approvalConfirmed") === "on",
          deliveryChannel: String(formData.get("deliveryChannel") ?? ""),
          documentIds: formData.getAll("documentIds").map(String),
          notes: String(formData.get("notes") ?? ""),
          packageName: String(formData.get("packageName") ?? ""),
          recipientSummary: String(formData.get("recipientSummary") ?? ""),
          requestedSendTiming: String(formData.get("requestedSendTiming") ?? ""),
          signatureRequired: formData.get("signatureRequired") === "on"
        })
      });
      const payload = (await response.json()) as PortalDocumentSendPackageResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to prepare this send package yet.");
      }

      form.reset();
      setStatus("success");
      setMessage(`Send package created with status: ${payload.documentSendPackage?.status ?? "ready"}.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to prepare this send package yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-document-status-form koinonia-send-package-form" onSubmit={handleSubmit}>
      <label>
        Package Name
        <input
          disabled={isDisabled}
          name="packageName"
          placeholder="Buyer offer signature package"
          required
          type="text"
        />
      </label>

      <label>
        Delivery Channel
        <select disabled={isDisabled} name="deliveryChannel">
          {documentSendPackageDeliveryChannels.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="koinonia-document-checkbox-list">
        <legend>Documents</legend>
        {documents.length ? (
          documents.map((document) => (
            <label key={document.id}>
              <input disabled={isDisabled} name="documentIds" type="checkbox" value={document.id} />
              <span>
                {document.label}
                <small>{document.status}</small>
              </span>
            </label>
          ))
        ) : (
          <p className="koinonia-document-security-note employee">
            No active document versions are available for a send package yet.
          </p>
        )}
      </fieldset>

      <label>
        Recipients
        <textarea
          disabled={isDisabled}
          name="recipientSummary"
          placeholder="Buyer, co-buyer, Realtor, lender, or brokerage review queue"
          required
          rows={3}
        />
      </label>

      <label>
        Requested Timing
        <input
          disabled={isDisabled}
          name="requestedSendTiming"
          placeholder="Today, before inspection deadline, after final approval"
          type="text"
        />
      </label>

      <label className="koinonia-document-inline-check">
        <input disabled={isDisabled} name="approvalConfirmed" type="checkbox" />
        Realtor approval is recorded or attached
      </label>

      <label className="koinonia-document-inline-check">
        <input disabled={isDisabled} name="signatureRequired" type="checkbox" />
        Signature routing required
      </label>

      <label>
        Send Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Package note only; no passwords, card data, access codes, or private login details"
          rows={3}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Preparing" : "Prepare Send Package"}
      </button>

      {disabled ? (
        <p className="koinonia-document-security-note employee">
          Live document records must be available before send packages can be prepared.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}
