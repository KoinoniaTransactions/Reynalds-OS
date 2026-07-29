"use client";

import { useState } from "react";

type PortalDocumentUploadFormProps = {
  storageReady: boolean;
};

export function PortalDocumentUploadForm({ storageReady }: PortalDocumentUploadFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setStatus("error");
      setMessage("Document upload storage and malware scanning are not fully configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const response = await fetch("/api/portal/documents", {
        method: "POST",
        body: new FormData(form)
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload this document yet.");
      }

      form.reset();
      setStatus("success");
      setMessage("Document uploaded. Koinonia can now review it in the staff workspace.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to upload this document yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !storageReady || isSubmitting;

  return (
    <section className="koinonia-document-panel">
      <p className="koinonia-eyebrow">Upload</p>
      <form className="koinonia-document-upload-form" onSubmit={handleSubmit}>
        <label>
          Document Type
          <select disabled={disabled} name="documentType" required>
            <option value="Seller Property Disclosure">Seller Property Disclosure</option>
            <option value="Executed Agreement">Executed Agreement</option>
            <option value="Inspection Instructions">Inspection Instructions</option>
            <option value="Lender Contact Sheet">Lender Contact Sheet</option>
            <option value="Contract Source File">Contract Source File</option>
            <option value="Other Transaction Document">Other Transaction Document</option>
          </select>
        </label>

        <label>
          Transaction
          <input
            disabled={disabled}
            name="transactionName"
            placeholder="Transaction or client file"
            type="text"
          />
        </label>

        <label>
          Action Needed
          <select disabled={disabled} name="requestedAction">
            <option value="Review uploaded document">Review uploaded document</option>
            <option value="Use for draft preparation">Use for draft preparation</option>
            <option value="Add to transaction file">Add to transaction file</option>
            <option value="Update checklist status">Update checklist status</option>
            <option value="Archive final copy">Archive final copy</option>
          </select>
        </label>

        <label>
          File
          <input
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="koinonia-document-file-input"
            disabled={disabled}
            name="file"
            required
            type="file"
          />
        </label>

        <label>
          Notes
          <textarea
            disabled={disabled}
            name="notes"
            placeholder="Instructions only; no passwords or access codes"
            rows={4}
          />
        </label>

        <button className="koinonia-button primary" disabled={disabled} type="submit">
          {isSubmitting ? "Uploading" : "Upload Document"}
        </button>

        {!storageReady ? (
          <p className="koinonia-document-security-note">
            Storage and malware scanning must be configured before live document uploads are enabled.
          </p>
        ) : null}

        {message ? (
          <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
        ) : null}
      </form>
    </section>
  );
}
