"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PortalDocumentRemoveFormProps = {
  disabled?: boolean;
  documentId: string;
  documentName: string;
};

type PortalDocumentRemovalResponse = {
  document?: {
    id: string;
  };
  error?: string;
};

export function PortalDocumentRemoveForm({
  disabled = false,
  documentId,
  documentName
}: PortalDocumentRemoveFormProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"error" | "success" | null>(null);

  async function removeDocument() {
    if (disabled) {
      setStatus("error");
      setMessage("Live document storage must be available before documents can be removed.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/portal/documents/${documentId}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined
        })
      });

      const responseText = await response.text();
      const payload = responseText
        ? (JSON.parse(responseText) as PortalDocumentRemovalResponse)
        : {};

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to remove this document yet.");
      }

      setStatus("success");
      setMessage(`${documentName} was removed from the active Document Center.`);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to remove this document yet."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isConfirming) {
    return (
      <button
        className="koinonia-button secondary"
        disabled={disabled}
        onClick={() => {
          setIsConfirming(true);
          setMessage(null);
          setStatus(null);
        }}
        type="button"
      >
        Remove from Document Center
      </button>
    );
  }

  return (
    <div className="koinonia-document-status-form client">
      <p>
        Remove <strong>{documentName}</strong> from the active Document Center?
        The file and its history will remain available for compliance review.
      </p>

      <label>
        Removal Reason (optional)
        <textarea
          disabled={isSubmitting}
          maxLength={220}
          onChange={(event) => setReason(event.target.value)}
          placeholder="For example: duplicate upload or wrong document"
          rows={2}
          value={reason}
        />
      </label>

      <div className="koinonia-document-approval-actions">
        <button
          className="koinonia-button secondary"
          disabled={isSubmitting}
          onClick={() => void removeDocument()}
          type="button"
        >
          {isSubmitting ? "Removing" : "Confirm Removal"}
        </button>

        <button
          className="koinonia-button secondary"
          disabled={isSubmitting}
          onClick={() => {
            setIsConfirming(false);
            setReason("");
            setMessage(null);
            setStatus(null);
          }}
          type="button"
        >
          Cancel
        </button>
      </div>

      {message ? (
        <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </div>
  );
}
