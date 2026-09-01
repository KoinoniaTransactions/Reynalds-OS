"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  inferredSide?: TransactionSide;
  inferredStage?: TransactionStage;
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

type ConfirmResult = {
  transaction?: { id: string; name: string };
  side?: TransactionSide;
  stage?: TransactionStage;
  documentType?: string;
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
  const [resolvedSide, setResolvedSide] = useState<TransactionSide | null>(null);
  const [resolvedStage, setResolvedStage] = useState<TransactionStage | null>(null);
  const [sideOverride, setSideOverride] = useState<TransactionSide | null>(null);
  const [stageOverride, setStageOverride] = useState<TransactionStage | null>(null);
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

  const effectiveSide = resolvedSide ?? proposal?.inferredSide ?? sideOverride;
  const effectiveStage = resolvedStage ?? proposal?.inferredStage ?? stageOverride;
  const documentRequirements = useMemo(
    () => effectiveSide && effectiveStage
      ? getTransactionDocumentRequirements(effectiveSide, effectiveStage)
      : [],
    [effectiveSide, effectiveStage]
  );
  const currentFile = files[currentIndex] ?? null;
  const matchedRequirement = proposal?.documentRequirementId
    ? documentRequirements.find((requirement) => requirement.id === proposal.documentRequirementId)
    : undefined;
  const busy = status === "processing" || status === "confirming" || status === "finishing";
  const identityReady = Boolean(effectiveSide && effectiveStage);

  function resetPackage() {
    setResolvedSide(null);
    setResolvedStage(null);
    setSideOverride(null);
    setStageOverride(null);
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
    setMessage(`${selected.length} ${selected.length === 1 ? "document" : "documents"} ready. Koinonia will figure out the transaction from what you uploaded.`);
  }

  async function startPackage() {
    if (!files.length || busy) return;

    setStatus("processing");
    setMessage("Starting the file and reading your first document…");

    try {
      const response = await fetch("/api/portal/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeRequestId,
          sourceDocumentName: files[0].name
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
      setMessage("All selected documents have been reviewed. Finish the package when you have uploaded what you currently have.");
      return;
    }

    setStatus("processing");
    setCurrentIndex(index);
    setProposal(null);
    setCurrentDocumentId(null);
    setMismatchOverride(false);
    setSideOverride(null);
    setStageOverride(null);
    setMessage(`Reading ${file.name} (${index + 1} of ${files.length})…`);

    const form = new FormData();
    form.set("file", file);
    form.set("documentType", PENDING_DOCUMENT_TYPE);
    form.set("relatedObjectId", txId);
    form.set("transactionName", txName);
    form.set("requestedAction", "Identify this document, infer the transaction context when supported, and extract only facts supported by the document");

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
        ? "Koinonia flagged this document for review. You decide whether it belongs in the file."
        : "Koinonia read the document. Confirm what it found, and we will keep building the transaction."
    );
  }

  async function confirmCurrentDocument() {
    if (!transactionId || !transactionName || !proposal || busy) return;
    if (proposal.documentMatch === "mismatch" && !mismatchOverride) {
      setMessage("Choose Continue Anyway or remove this document from the package.");
      return;
    }
    if (!identityReady) {
      setMessage("Koinonia could not determine all of the transaction context from this document. Choose only the missing item below to continue.");
      return;
    }

    setStatus("confirming");
    setMessage("Filing the confirmed document and updating the transaction…");

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(transactionId)}/extraction`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm",
            confirmedSide: resolvedSide || proposal.inferredSide ? undefined : sideOverride,
            confirmedStage: resolvedStage || proposal.inferredStage ? undefined : stageOverride,
            mismatchOverride: proposal.documentMatch === "mismatch" ? mismatchOverride : false
          })
        }
      );
      const result = await readApiResult<ConfirmResult>(response);
      if (!response.ok) throw new Error(result.error ?? "Koinonia could not confirm this document.");

      const documentType = result.documentType ?? proposal.identifiedDocumentType;
      const nextName = result.transaction?.name ?? transactionName;
      if (result.side) setResolvedSide(result.side);
      if (result.stage) setResolvedStage(result.stage);
      setTransactionName(nextName);
      setProcessed((items) => [...items, { fileName: currentFile?.name ?? "Document", documentType }]);
      await processDocument(transactionId, nextName, currentIndex + 1);
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
      <section className="koinonia-client-work-panel" aria-labelledby="package-upload-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Start with what you have</p>
          <h2 id="package-upload-title">Give Koinonia your transaction documents.</h2>
          <p>
            Contract, listing agreement, disclosure, addendum, or whatever you have right now.
            You do not need to organize or rename anything. Koinonia will identify the transaction,
            build the file, and only ask you for information the documents cannot answer.
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
              {status === "processing" ? "Reading documents…" : `Build File from ${files.length || ""} ${files.length === 1 ? "Document" : "Documents"}`.trim()}
            </button>
          </div>
        ) : null}

        {transactionId ? (
          <div className="koinonia-client-request-card">
            <strong>Koinonia is building the file</strong>
            <p>{processed.length} of {files.length} documents confirmed.</p>
            {resolvedSide && resolvedStage ? (
              <p>
                Transaction identified: <strong>{sideLabel(resolvedSide)}</strong> · <strong>{stageLabel(resolvedStage, resolvedSide)}</strong>
              </p>
            ) : null}
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
              <h2 id="package-review-title">Here is what Koinonia found.</h2>
              <p>
                <strong>{proposal.identifiedDocumentType}</strong>
                {matchedRequirement ? <> · <strong>{matchedRequirement.label}</strong></> : null}
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
              <ExtractionItem label="Transaction side" value={effectiveSide ? sideLabel(effectiveSide) : "Could not determine"} />
              <ExtractionItem label="Transaction stage" value={effectiveStage ? stageLabel(effectiveStage, effectiveSide) : "Could not determine"} />
              <ExtractionItem label="Client" value={proposal.clientNames.join(" & ") || "Not established by this document"} />
              <ExtractionItem label="Property" value={proposal.propertyAddress ?? "Not found"} />
            </div>

            {!effectiveSide ? (
              <div className="koinonia-client-request-card">
                <strong>One thing we could not determine: which side do you represent?</strong>
                <p>Only answer this because the uploaded document did not establish it.</p>
                <div className="koinonia-workspace-question-options">
                  <ChoiceButton selected={sideOverride === "buyer"} label="Buyer" onClick={() => setSideOverride("buyer")} />
                  <ChoiceButton selected={sideOverride === "seller"} label="Seller" onClick={() => setSideOverride("seller")} />
                </div>
              </div>
            ) : null}

            {!effectiveStage ? (
              <div className="koinonia-client-request-card">
                <strong>One thing we could not determine: where is the transaction now?</strong>
                <p>Only answer this because the uploaded document did not establish the stage.</p>
                <div className="koinonia-workspace-question-options">
                  <ChoiceButton selected={stageOverride === "pre_contract"} label="Not under contract yet" onClick={() => setStageOverride("pre_contract")} />
                  <ChoiceButton selected={stageOverride === "under_contract"} label="Under contract" onClick={() => setStageOverride("under_contract")} />
                </div>
              </div>
            ) : null}

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
                disabled={busy || !identityReady || (proposal.documentMatch === "mismatch" && !mismatchOverride)}
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
              Koinonia will now combine the facts found across the package, determine what applies to this transaction,
              and ask only for anything that still cannot be determined from the documents.
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

function ChoiceButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button className="koinonia-button" type="button" aria-pressed={selected} onClick={onClick}>
      {selected ? `${label} ✓` : label}
    </button>
  );
}

function ExtractionItem({ label, value }: { label: string; value: string }) {
  return <article className="koinonia-client-work-item"><div><span>{label}</span><h3>{value}</h3></div></article>;
}

function sideLabel(side: TransactionSide): string {
  return side === "buyer" ? "Buyer" : "Seller";
}

function stageLabel(stage: TransactionStage, side?: TransactionSide | null): string {
  if (stage === "under_contract") return "Under Contract";
  return side === "seller" ? "Listing / Not Under Contract Yet" : "Not Under Contract Yet";
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
