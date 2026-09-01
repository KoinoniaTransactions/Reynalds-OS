"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getTransactionDocumentRequirements } from "../../lib/transaction-document-requirements";
import type { TransactionSide, TransactionStage } from "../../lib/transaction-intake";

const MAX_PORTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_PACKAGE_FILES = 12;
const PENDING_DOCUMENT_TYPE = "Pending Classification";

type IntakeResult = {
  transaction?: { id: string; name: string };
  error?: string;
};

type DocumentUploadResult = {
  document?: { id: string };
  error?: string;
};

type ExtractionProposal = {
  clientNames: string[];
  propertyAddress?: string;
  identifiedDocumentType: string;
  documentRequirementId?: string;
  listPrice?: number;
  listingEffectiveDate?: string;
  listingExpirationDate?: string;
  brokerageName?: string;
  agentName?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  closingDate?: string;
  possession?: string;
  financingType?: string;
  deadlines: Record<string, string>;
  confidence: "high" | "medium" | "low";
  documentMatch: "match" | "mismatch" | "uncertain";
  documentMatchReason?: string;
  notes?: string[];
};

type ExtractionResult = {
  proposal?: ExtractionProposal;
  error?: string;
};

type PackageStatus =
  | "idle"
  | "processing"
  | "review"
  | "confirming"
  | "package-ready"
  | "finishing"
  | "error";

type ProcessedDocument = {
  fileName: string;
  documentType: string;
};

export function TransactionDocumentPackageIntake() {
  const router = useRouter();
  const [side, setSide] = useState<TransactionSide>("buyer");
  const [stage, setStage] = useState<TransactionStage>("pre_contract");
  const [files, setFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionName, setTransactionName] = useState<string | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ExtractionProposal | null>(null);
  const [processed, setProcessed] = useState<ProcessedDocument[]>([]);
  const [mismatchOverride, setMismatchOverride] = useState(false);
  const [status, setStatus] = useState<PackageStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [intakeRequestId, setIntakeRequestId] = useState(createTransactionIntakeRequestId);

  const documentRequirements = useMemo(
    () => getTransactionDocumentRequirements(side, stage),
    [side, stage]
  );
  const currentFile = files[currentIndex] ?? null;
  const matchedRequirement = proposal?.documentRequirementId
    ? documentRequirements.find((requirement) => requirement.id === proposal.documentRequirementId)
    : undefined;
  const busy = status === "processing" || status === "confirming" || status === "finishing";

  function resetPackage() {
    setFiles([]);
    setCurrentIndex(0);
    setTransactionId(null);
    setTransactionName(null);
    setCurrentDocumentId(null);
    setProposal(null);
    setProcessed([]);
    setMismatchOverride(false);
    setStatus("idle");
    setMessage(null);
    setIntakeRequestId(createTransactionIntakeRequestId());
  }

  function changeSide(next: TransactionSide) {
    if (busy || status === "review") return;
    setSide(next);
    resetPackage();
  }

  function changeStage(next: TransactionStage) {
    if (busy || status === "review") return;
    setStage(next);
    resetPackage();
  }

  function chooseFiles(selected: File[]) {
    resetPackage();

    if (!selected.length) return;
    if (selected.length > MAX_PACKAGE_FILES) {
      setStatus("error");
      setMessage(`Choose up to ${MAX_PACKAGE_FILES} documents at a time for this Preview.`);
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_PORTAL_UPLOAD_BYTES);
    if (oversized) {
      setStatus("error");
      setMessage(
        `${oversized.name} is ${formatFileSize(oversized.size)}. Each document must be 4 MB or smaller in this Preview.`
      );
      return;
    }

    setFiles(selected);
    setStatus("idle");
    setMessage(`${selected.length} ${selected.length === 1 ? "document" : "documents"} ready. Koinonia will process them one at a time.`);
  }

  async function startPackage() {
    if (!files.length || busy) return;

    setStatus("processing");
    setMessage("Starting the transaction and preparing the first document…");

    try {
      const response = await fetch("/api/portal/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeRequestId,
          side,
          sourceDocumentName: files[0].name,
          stage
        })
      });
      const result = await readApiResult<IntakeResult>(response);
      if (!response.ok || !result.transaction) {
        throw new Error(result.error ?? "Koinonia could not start this transaction.");
      }

      setTransactionId(result.transaction.id);
      setTransactionName(result.transaction.name);
      await processDocument(result.transaction.id, result.transaction.name, 0);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Koinonia could not start the document package.");
    }
  }

  async function processDocument(txId: string, txName: string, index: number) {
    const file = files[index];
    if (!file) {
      setStatus("package-ready");
      setMessage("All selected documents have been reviewed. When you are done adding what you have, finish the package so Koinonia can calculate what is still missing.");
      return;
    }

    setStatus("processing");
    setCurrentIndex(index);
    setProposal(null);
    setCurrentDocumentId(null);
    setMismatchOverride(false);
    setMessage(`Reading ${file.name} (${index + 1} of ${files.length})…`);

    const form = new FormData();
    form.set("file", file);
    form.set("documentType", PENDING_DOCUMENT_TYPE);
    form.set("relatedObjectId", txId);
    form.set("transactionName", txName);
    form.set("requestedAction", "Identify this document, match it to the transaction checklist, and extract only facts supported by the document");

    const uploadResponse = await fetch("/api/portal/documents", { method: "POST", body: form });
    const uploadResult = await readApiResult<DocumentUploadResult>(uploadResponse);
    if (!uploadResponse.ok || !uploadResult.document) {
      throw new Error(uploadResult.error ?? `Koinonia could not upload ${file.name}.`);
    }

    setCurrentDocumentId(uploadResult.document.id);

    const extractionResponse = await fetch(
      `/api/portal/transactions/${encodeURIComponent(txId)}/extraction/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: uploadResult.document.id })
      }
    );
    const extractionResult = await readApiResult<ExtractionResult>(extractionResponse);
    if (!extractionResponse.ok || !extractionResult.proposal) {
      throw new Error(
        extractionResult.error ?? `Koinonia saved ${file.name}, but could not classify it automatically.`
      );
    }

    setProposal(extractionResult.proposal);
    setStatus("review");
    setMessage(
      extractionResult.proposal.documentMatch === "mismatch"
        ? "AI flagged this document for review. You decide whether it belongs in the file."
        : "Review this classification, then continue to the next document."
    );
  }

  async function confirmCurrentDocument() {
    if (!transactionId || !transactionName || !proposal || busy) return;
    if (proposal.documentMatch === "mismatch" && !mismatchOverride) {
      setMessage("Choose Continue Anyway or remove this document from the package.");
      return;
    }

    setStatus("confirming");
    setMessage("Filing the confirmed document…");

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(transactionId)}/extraction`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm",
            mismatchOverride: proposal.documentMatch === "mismatch" ? mismatchOverride : false
          })
        }
      );
      const result = await readApiResult<{ error?: string; documentType?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Koinonia could not confirm this document.");

      const documentType = result.documentType ?? proposal.identifiedDocumentType;
      setProcessed((items) => [...items, { fileName: currentFile?.name ?? "Document", documentType }]);
      await processDocument(transactionId, transactionName, currentIndex + 1);
    } catch (error) {
      setStatus("review");
      setMessage(error instanceof Error ? error.message : "Koinonia could not confirm this document.");
    }
  }

  async function removeCurrentDocument() {
    if (!transactionId || !transactionName || !currentDocumentId || busy) return;

    setStatus("processing");
    setMessage("Removing this document from the package…");

    try {
      const response = await fetch(
        `/api/portal/documents/${encodeURIComponent(currentDocumentId)}/remove`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Removed during initial transaction package review" })
        }
      );
      const result = await readApiResult<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Koinonia could not remove this document.");

      await processDocument(transactionId, transactionName, currentIndex + 1);
    } catch (error) {
      setStatus("review");
      setMessage(error instanceof Error ? error.message : "Koinonia could not remove this document.");
    }
  }

  async function finishPackage() {
    if (!transactionId || busy) return;

    setStatus("finishing");
    setMessage("Finishing the initial document package and calculating what is still needed…");

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(transactionId)}/intake-package`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete" })
        }
      );
      const result = await readApiResult<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Koinonia could not finish the document package.");

      router.push(`/client/work/${encodeURIComponent(transactionId)}#documents`);
      router.refresh();
    } catch (error) {
      setStatus("package-ready");
      setMessage(error instanceof Error ? error.message : "Koinonia could not finish the document package.");
    }
  }

  return (
    <div className="koinonia-client-main-stack">
      <section className="koinonia-client-work-panel" aria-labelledby="package-side-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 1</p>
          <h2 id="package-side-title">Who are you representing?</h2>
          <p>Choose the transaction side. Koinonia will use it to classify the document package.</p>
        </div>
        <div className="koinonia-client-summary-grid">
          <ChoiceCard selected={side === "buyer"} title="Buyer" disabled={busy || status === "review"} onClick={() => changeSide("buyer")} />
          <ChoiceCard selected={side === "seller"} title="Seller" disabled={busy || status === "review"} onClick={() => changeSide("seller")} />
        </div>
      </section>

      <section className="koinonia-client-work-panel" aria-labelledby="package-stage-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 2</p>
          <h2 id="package-stage-title">Where is the transaction now?</h2>
        </div>
        <div className="koinonia-client-work-list">
          <StageChoice
            selected={stage === "pre_contract"}
            title={side === "seller" ? "Listing / Not Under Contract Yet" : "Not Under Contract Yet"}
            disabled={busy || status === "review"}
            onClick={() => changeStage("pre_contract")}
          />
          <StageChoice
            selected={stage === "under_contract"}
            title="Under Contract"
            disabled={busy || status === "review"}
            onClick={() => changeStage("under_contract")}
          />
        </div>
      </section>

      <section className="koinonia-client-work-panel" aria-labelledby="package-upload-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 3</p>
          <h2 id="package-upload-title">Upload what you already have</h2>
          <p>
            Select the transaction documents you already have. You do not need to organize or rename them.
            Koinonia will read each one, identify it, and combine the information across the package before asking you anything.
          </p>
        </div>

        {!transactionId ? (
          <div className="koinonia-client-request-card">
            <label>
              <span>Choose documents</span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png"
                disabled={busy}
                onChange={(event) => chooseFiles(Array.from(event.target.files ?? []))}
              />
            </label>

            {files.length ? (
              <div className="koinonia-client-work-list">
                {files.map((file) => (
                  <article className="koinonia-client-work-item" key={`${file.name}-${file.lastModified}`}>
                    <div>
                      <span>Ready</span>
                      <h3>{file.name}</h3>
                      <p>{formatFileSize(file.size)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <button
              className="koinonia-button koinonia-button-primary"
              type="button"
              disabled={!files.length || busy}
              onClick={() => void startPackage()}
            >
              {status === "processing" ? "Starting package…" : `Process ${files.length || ""} ${files.length === 1 ? "Document" : "Documents"}`.trim()}
            </button>
          </div>
        ) : null}

        {transactionId ? (
          <div className="koinonia-client-request-card">
            <strong>Document package</strong>
            <p>{processed.length} of {files.length} documents confirmed.</p>
            {processed.length ? (
              <ul className="koinonia-client-showing-notes">
                {processed.map((item) => <li key={`${item.fileName}-${item.documentType}`}>{item.fileName} → {item.documentType}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}

        {message ? <p className="koinonia-client-security-note" role={status === "error" ? "alert" : "status"}>{message}</p> : null}

        {proposal && currentFile ? (
          <section className="koinonia-client-work-panel" aria-labelledby="package-review-title">
            <div className="koinonia-client-panel-heading">
              <p className="koinonia-eyebrow">Document {currentIndex + 1} of {files.length}</p>
              <h2 id="package-review-title">Review {currentFile.name}</h2>
              <p>
                Identified as <strong>{proposal.identifiedDocumentType}</strong>
                {matchedRequirement ? <> · Checklist item: <strong>{matchedRequirement.label}</strong></> : null}
                {" "}· Confidence: <strong>{proposal.confidence}</strong>
              </p>
            </div>

            {proposal.documentMatch !== "match" ? (
              <div className="koinonia-client-request-card" role="alert">
                <strong>{proposal.documentMatch === "mismatch" ? "Possible mismatch" : "Classification uncertain"}</strong>
                <p>{proposal.documentMatchReason ?? "Koinonia could not confidently place this document."}</p>
                <p>The AI recommendation is advisory. You make the final filing decision.</p>
                {proposal.documentMatch === "mismatch" ? (
                  <button
                    className="koinonia-button koinonia-button-primary"
                    type="button"
                    aria-pressed={mismatchOverride}
                    onClick={() => setMismatchOverride(true)}
                  >
                    {mismatchOverride ? "Continue Anyway Selected" : "This Belongs in the File — Continue"}
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="koinonia-client-work-list">
              <ExtractionItem label={side === "seller" ? "Sellers" : "Buyers"} value={proposal.clientNames.join(" & ") || "Not found"} />
              <ExtractionItem label="Property" value={proposal.propertyAddress ?? "Not found"} />
            </div>

            {proposal.notes?.length ? (
              <div className="koinonia-client-request-card">
                <strong>Notes from this document</strong>
                <ul className="koinonia-client-showing-notes">
                  {proposal.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="koinonia-workspace-question-options">
              <button className="koinonia-button" type="button" disabled={busy} onClick={() => void removeCurrentDocument()}>
                Remove This Document
              </button>
              <button
                className="koinonia-button koinonia-button-primary"
                type="button"
                disabled={busy || (proposal.documentMatch === "mismatch" && !mismatchOverride)}
                onClick={() => void confirmCurrentDocument()}
              >
                {status === "confirming" ? "Confirming…" : currentIndex + 1 < files.length ? "Confirm & Read Next" : "Confirm Document"}
              </button>
            </div>
          </section>
        ) : null}

        {status === "package-ready" && transactionId ? (
          <div className="koinonia-client-request-card">
            <strong>Done uploading what you have?</strong>
            <p>
              When you finish the package, Koinonia will combine the facts found across these documents,
              determine which conditional documents apply, and only then ask for anything the documents could not answer.
            </p>
            <button className="koinonia-button koinonia-button-primary" type="button" onClick={() => void finishPackage()}>
              Done Uploading What I Have
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ChoiceCard({ selected, title, disabled, onClick }: { selected: boolean; title: string; disabled: boolean; onClick: () => void }) {
  return (
    <button className="koinonia-client-summary-card" type="button" aria-pressed={selected} disabled={disabled} onClick={onClick}>
      <span>{title}</span>
      <strong>{selected ? "Selected" : "Choose"}</strong>
      <p>{title === "Buyer" ? "Buyer-side transaction workflow." : "Seller-side transaction workflow."}</p>
    </button>
  );
}

function StageChoice({ selected, title, disabled, onClick }: { selected: boolean; title: string; disabled: boolean; onClick: () => void }) {
  return (
    <button className="koinonia-client-work-item" type="button" aria-pressed={selected} disabled={disabled} onClick={onClick}>
      <div>
        <span>Transaction stage</span>
        <h3>{title}</h3>
      </div>
      <div className="koinonia-client-work-meta"><strong>{selected ? "Selected" : "Choose"}</strong></div>
    </button>
  );
}

function ExtractionItem({ label, value }: { label: string; value: string }) {
  return <article className="koinonia-client-work-item"><div><span>{label}</span><h3>{value}</h3></div></article>;
}

async function readApiResult<T extends { error?: string }>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text.trim() || `Request failed with status ${response.status}.` } as T;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createTransactionIntakeRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `intake-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
