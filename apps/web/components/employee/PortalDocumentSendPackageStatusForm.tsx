"use client";

import { useState } from "react";
import { documentSendPackageStatuses } from "../../lib/document-send-packages";

type PortalDocumentSendPackageStatusFormProps = {
  currentStatus: string;
  disabled?: boolean;
  sendPackageId: string;
};

type PortalDocumentSendPackageStatusResponse = {
  documentSendPackage?: {
    status: string;
  };
  error?: string;
};

export function PortalDocumentSendPackageStatusForm({
  currentStatus,
  disabled = false,
  sendPackageId
}: PortalDocumentSendPackageStatusFormProps) {
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
      const response = await fetch(`/api/portal/document-send-packages/${sendPackageId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          deliveryConfirmation: String(formData.get("deliveryConfirmation") ?? ""),
          notes: String(formData.get("notes") ?? ""),
          status: String(formData.get("status") ?? "")
        })
      });
      const payload = (await response.json()) as PortalDocumentSendPackageStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this send package yet.");
      }

      form.reset();
      setSelectedStatus(payload.documentSendPackage?.status ?? selectedStatus);
      setStatus("success");
      setMessage("Send package status updated and recorded in the file history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this send package yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-document-status-form" onSubmit={handleSubmit}>
      <label>
        Send Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => setSelectedStatus(event.target.value)}
          value={selectedStatus}
        >
          {documentSendPackageStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Delivery Confirmation
        <input
          disabled={isDisabled}
          name="deliveryConfirmation"
          placeholder="Approved portal delivery, email confirmation, or e-signature queue reference"
          type="text"
        />
      </label>

      <label>
        Update Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Delivery note only; no passwords, card data, access codes, or private login details"
          rows={3}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Send Status"}
      </button>

      {disabled ? (
        <p className="koinonia-document-security-note employee">
          Live send-package storage must be available before delivery updates can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): string {
  return documentSendPackageStatuses.includes(
    status as (typeof documentSendPackageStatuses)[number]
  )
    ? status
    : "Approval Needed";
}
