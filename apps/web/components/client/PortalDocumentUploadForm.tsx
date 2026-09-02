"use client";

import {
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";
import { useState } from "react";

type PortalDocumentUploadFormProps = {
  relatedObjectId?: string;
  storageReady: boolean;
};

export function PortalDocumentUploadForm({
  relatedObjectId,
  storageReady
}: PortalDocumentUploadFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedDocumentType = searchParams?.get("documentType")?.trim() ?? "";
  const requestedRelatedObjectId = searchParams?.get("relatedObjectId")?.trim() ?? "";
  const effectiveRelatedObjectId = relatedObjectId ?? requestedRelatedObjectId || undefined;
  const [documentType, setDocumentType] = useState(
    requestedDocumentType || "Other Transaction Document"
  );
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
      setMessage(
        effectiveRelatedObjectId
          ? "Got it. Koinonia is reviewing and filing this document to the selected transaction."
          : "Got it. Koinonia is reviewing and filing this document."
      );

      if (effectiveRelatedObjectId) {
        router.replace(`/client/work/${encodeURIComponent(effectiveRelatedObjectId)}#documents`, {
          scroll: true
        });
      } else if (pathname) {
        router.replace(`${pathname}#employee-work-documents`, {
          scroll: true
        });
      }

      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to upload this document yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !storageReady || isSubmitting;

  return (
    <section className="koinonia-document-panel" id="employee-document-upload">
      <p className="koinonia-eyebrow">Send document</p>
      {effectiveRelatedObjectId ? (
        <p className="koinonia-document-security-note">
          This upload will go directly to the transaction you selected. Koinonia will identify and file it.
        </p>
      ) : null}
      <form className="koinonia-document-upload-form" onSubmit={handleSubmit}>
        {effectiveRelatedObjectId ? (
          <input name="relatedObjectId" type="hidden" value={effectiveRelatedObjectId} />
        ) : null}

        <label>
          What are you sending?
          <select
            disabled={disabled}
            name="documentType"
            onChange={(event) => setDocumentType(event.target.value)}
            required
            value={documentType}
          >
            {requestedDocumentType &&
            ![
              "Seller Property Disclosure",
              "Executed Agreement",
              "Inspection Instructions",
              "Lender Contact Sheet",
              "Contract Source File",
              "Other Transaction Document"
            ].includes(requestedDocumentType) ? (
              <option value={requestedDocumentType}>{requestedDocumentType}</option>
            ) : null}
            <option value="Other Transaction Document">Let Koinonia identify it</option>
            <option value="Seller Property Disclosure">Seller Property Disclosure</option>
            <option value="Executed Agreement">Executed Agreement</option>
            <option value="Inspection Instructions">Inspection Instructions</option>
            <option value="Lender Contact Sheet">Lender Contact Sheet</option>
            <option value="Contract Source File">Contract Source File</option>
          </select>
        </label>

        {!effectiveRelatedObjectId ? (
          <label>
            Transaction
            <input
              disabled={disabled}
              name="transactionName"
              placeholder="Transaction or client file"
              type="text"
            />
          </label>
        ) : null}

        <input name="requestedAction" type="hidden" value="Review, identify, and file this document to the transaction" />

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
          Note <span className="koinonia-client-optional-label">optional</span>
          <textarea
            disabled={disabled}
            name="notes"
            placeholder="Anything Koinonia should know?"
            rows={2}
          />
        </label>

        <button className="koinonia-button primary" disabled={disabled} type="submit">
          {isSubmitting ? "Sending…" : "Send to Koinonia"}
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
