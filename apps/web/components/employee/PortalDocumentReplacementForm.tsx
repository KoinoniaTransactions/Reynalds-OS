"use client";

import { useState } from "react";

type PortalDocumentReplacementFormProps = {
  disabled?: boolean;
  documentId: string;
  nextVersionLabel: string;
};

type PortalDocumentReplacementResponse = {
  document?: {
    id: string;
    versionNumber: number;
  };
  error?: string;
};

export function PortalDocumentReplacementForm({
  disabled = false,
  documentId,
  nextVersionLabel
}: PortalDocumentReplacementFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      setStatus("error");
      setMessage("Live document storage and malware scanning must be available before replacing files.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const response = await fetch(`/api/portal/documents/${documentId}/replacement`, {
        method: "POST",
        body: new FormData(form)
      });
      const payload = (await response.json()) as PortalDocumentReplacementResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to replace this document yet.");
      }

      form.reset();
      setStatus("success");
      setMessage("Replacement uploaded. The prior version was kept in the file history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to replace this document yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <details className="koinonia-document-replacement">
      <summary>Replace Version</summary>
      <form className="koinonia-document-status-form" onSubmit={handleSubmit}>
        <label>
          Version Label
          <input disabled={isDisabled} name="versionLabel" placeholder={nextVersionLabel} type="text" />
        </label>

        <label>
          Replacement Reason
          <input
            disabled={isDisabled}
            name="replacementReason"
            placeholder="Revision, corrected terms, signed copy, or updated draft"
            required
            type="text"
          />
        </label>

        <label>
          Next Action
          <input
            disabled={isDisabled}
            name="requestedAction"
            placeholder="Review replacement version"
            type="text"
          />
        </label>

        <label>
          Replacement File
          <input
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="koinonia-document-file-input"
            disabled={isDisabled}
            name="file"
            required
            type="file"
          />
        </label>

        <label>
          Replacement Note
          <textarea
            disabled={isDisabled}
            name="notes"
            placeholder="Version note only; no passwords, card data, or access codes"
            rows={3}
          />
        </label>

        <button className="koinonia-button primary" disabled={isDisabled} type="submit">
          {isSubmitting ? "Uploading" : `Upload ${nextVersionLabel}`}
        </button>

        {disabled ? (
          <p className="koinonia-document-security-note employee">
            Storage and malware scanning must be configured before replacement uploads are enabled.
          </p>
        ) : null}

        {message ? (
          <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
        ) : null}
      </form>
    </details>
  );
}
