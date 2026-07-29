"use client";

import { useState } from "react";

type PortalDocumentApprovalFormProps = {
  disabled?: boolean;
  documentId: string;
};

type PortalDocumentApprovalResponse = {
  approval?: {
    action: string;
    status: string;
  };
  error?: string;
};

export function PortalDocumentApprovalForm({
  disabled = false,
  documentId
}: PortalDocumentApprovalFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting || isComplete;

  async function submitResponse(action: "approve" | "request_revision") {
    if (disabled) {
      setStatus("error");
      setMessage("Live document storage must be available before approval responses can be saved.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/portal/documents/${documentId}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          notes: note
        })
      });
      const payload = (await response.json()) as PortalDocumentApprovalResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save this document response yet.");
      }

      setIsComplete(true);
      setStatus("success");
      setMessage(
        action === "approve"
          ? "Approval recorded. Koinonia can continue the next approved step."
          : "Revision request recorded. Koinonia will review your note before sending."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save this document response yet."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="koinonia-document-status-form client">
      <label>
        Response Note
        <textarea
          disabled={isDisabled}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Approval or revision notes only; no passwords, card data, or access codes"
          rows={3}
          value={note}
        />
      </label>

      <div className="koinonia-document-approval-actions">
        <button
          className="koinonia-button primary"
          disabled={isDisabled}
          onClick={() => void submitResponse("approve")}
          type="button"
        >
          Approve
        </button>
        <button
          className="koinonia-button secondary"
          disabled={isDisabled}
          onClick={() => void submitResponse("request_revision")}
          type="button"
        >
          Request Revision
        </button>
      </div>

      {disabled ? (
        <p className="koinonia-document-security-note">
          Live document storage must be available before approval responses can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </div>
  );
}
