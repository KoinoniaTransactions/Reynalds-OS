"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_PACKAGE_FILES = 12;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

type Props = { storageReady: boolean };
type IntakeResult = { transaction?: { id: string; name: string }; error?: string };
type UploadResult = { document?: { id: string }; error?: string };

export function TransactionDocumentPackageIntake({ storageReady }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [intakeRequestId] = useState(createTransactionIntakeRequestId);

  function chooseFiles(selected: File[]) {
    setMessage(null);
    if (!selected.length) {
      setFiles([]);
      return;
    }
    if (selected.length > MAX_PACKAGE_FILES) {
      setFiles([]);
      setStatus("error");
      setMessage(`Choose up to ${MAX_PACKAGE_FILES} documents at a time.`);
      return;
    }
    const oversized = selected.find((file) => file.size > MAX_FILE_BYTES);
    if (oversized) {
      setFiles([]);
      setStatus("error");
      setMessage(`${oversized.name} is too large. Each document must be 25 MB or smaller.`);
      return;
    }
    setFiles(selected);
    setStatus("idle");
    setMessage(`${selected.length} ${selected.length === 1 ? "document" : "documents"} ready. Koinonia will build the file from what you send.`);
  }

  async function buildFile() {
    if (!files.length || status === "working") return;
    if (!storageReady) {
      setStatus("error");
      setMessage("Secure document storage must be configured before live transaction intake is enabled.");
      return;
    }

    setStatus("working");
    setMessage("Creating the transaction and filing your documents…");

    try {
      const intakeResponse = await fetch("/api/portal/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeRequestId,
          sourceDocumentName: files[0].name
        })
      });
      const intake = await readResult<IntakeResult>(intakeResponse);
      if (!intakeResponse.ok || !intake.transaction) {
        throw new Error(intake.error ?? "Koinonia could not start this transaction.");
      }

      for (let index = 0; index < files.length; index += 1) {
        setMessage(`Filing document ${index + 1} of ${files.length}…`);
        const form = new FormData();
        form.set("file", files[index]);
        form.set("documentType", "Pending Classification");
        form.set("relatedObjectId", intake.transaction.id);
        form.set("transactionName", intake.transaction.name);
        form.set("requestedAction", "Identify, review, and file this document to the transaction");
        const uploadResponse = await fetch("/api/portal/documents", { method: "POST", body: form });
        const upload = await readResult<UploadResult>(uploadResponse);
        if (!uploadResponse.ok || !upload.document) {
          throw new Error(upload.error ?? `Koinonia created the file but could not upload ${files[index].name}.`);
        }
      }

      router.push(`/client/work/${encodeURIComponent(intake.transaction.id)}#documents`);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Koinonia could not build the file.");
    }
  }

  return (
    <section className="koinonia-document-panel koinonia-client-package-intake" aria-labelledby="package-intake-title">
      <div className="koinonia-client-document-heading">
        <p className="koinonia-client-transaction-kicker">Start with what you have</p>
        <h2 id="package-intake-title">Give Koinonia the transaction documents.</h2>
        <p>You do not need to organize, rename, or retype the transaction. Koinonia will create the file and attach everything you send.</p>
      </div>

      <label className="koinonia-client-package-picker">
        <span>Choose documents</span>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          disabled={!storageReady || status === "working"}
          onChange={(event) => chooseFiles(Array.from(event.target.files ?? []))}
        />
      </label>

      {files.length ? (
        <div className="koinonia-client-package-files">
          {files.map((file) => (
            <div key={`${file.name}-${file.lastModified}`}>
              <strong>{file.name}</strong>
              <span>{formatFileSize(file.size)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <button className="koinonia-button primary" type="button" disabled={!files.length || !storageReady || status === "working"} onClick={() => void buildFile()}>
        {status === "working" ? "Building file…" : files.length ? `Build File from ${files.length} ${files.length === 1 ? "Document" : "Documents"}` : "Choose documents to start"}
      </button>

      {!storageReady ? <p className="koinonia-client-security-note">Secure document storage is not enabled in this environment yet, so live intake remains safely disabled.</p> : null}
      {message ? <p className={`koinonia-document-form-status ${status === "error" ? "error" : ""}`} role={status === "error" ? "alert" : "status"}>{message}</p> : null}
    </section>
  );
}

async function readResult<T>(response: Response): Promise<T> {
  try { return await response.json() as T; } catch { return {} as T; }
}
function createTransactionIntakeRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `intake-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
