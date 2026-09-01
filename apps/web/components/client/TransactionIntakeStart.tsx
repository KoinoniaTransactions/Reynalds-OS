"use client";

import { useMemo, useState } from "react";
import {
  getTransactionIntakeDefinition,
  type TransactionSide,
  type TransactionStage
} from "../../lib/transaction-intake";

const MAX_PORTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

type IntakeResult = {
  transaction?: {
    id: string;
    name: string;
  };
  error?: string;
};

type DocumentUploadResult = {
  document?: {
    id: string;
  };
  error?: string;
};

type ExtractionProposal = {
  clientNames: string[];
  propertyAddress?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  closingDate?: string;
  possession?: string;
  financingType?: string;
  deadlines: Record<string, string>;
  confidence: "high" | "medium" | "low";
  notes?: string[];
};

type ExtractionResult = {
  proposal?: ExtractionProposal;
  error?: string;
};

type IntakeStatus = "idle" | "saving" | "review" | "confirming" | "done" | "error";

export function TransactionIntakeStart() {
  const [side, setSide] = useState<TransactionSide>("buyer");
  const [stage, setStage] = useState<TransactionStage>("pre_contract");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ExtractionProposal | null>(null);
  const [intakeRequestId, setIntakeRequestId] = useState(createTransactionIntakeRequestId);

  const definition = useMemo(
    () => getTransactionIntakeDefinition(side, stage),
    [side, stage]
  );

  async function startFile() {
    if (!file || status === "saving" || status === "confirming") {
      return;
    }

    if (file.size > MAX_PORTAL_UPLOAD_BYTES) {
      setStatus("error");
      setMessage(
        `This document is ${formatFileSize(file.size)}. For this Preview, uploads must be 4 MB or smaller. Please choose a smaller PDF, JPEG, or PNG.`
      );
      return;
    }

    setStatus("saving");
    setMessage("Starting the file and reading your document…");
    setProposal(null);

    try {
      const transactionResponse = await fetch("/api/portal/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeRequestId,
          side,
          sourceDocumentName: file.name,
          stage
        })
      });
      const transactionResult = await readApiResult<IntakeResult>(transactionResponse);

      if (!transactionResponse.ok || !transactionResult.transaction) {
        throw new Error(transactionResult.error ?? "Koinonia could not start this transaction.");
      }

      const newTransactionId = transactionResult.transaction.id;
      setTransactionId(newTransactionId);

      const documentForm = new FormData();
      documentForm.set("file", file);
      documentForm.set("documentType", definition.preferredDocument);
      documentForm.set("relatedObjectId", newTransactionId);
      documentForm.set("transactionName", transactionResult.transaction.name);
      documentForm.set("requestedAction", "Extract transaction details and identify the client/property");

      const documentResponse = await fetch("/api/portal/documents", {
        method: "POST",
        body: documentForm
      });
      const documentResult = await readApiResult<DocumentUploadResult>(documentResponse);

      if (!documentResponse.ok || !documentResult.document) {
        throw new Error(
          documentResult.error ??
            "The transaction was started, but the document could not be uploaded."
        );
      }

      const extractionResponse = await fetch(
        `/api/portal/transactions/${encodeURIComponent(newTransactionId)}/extraction/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: documentResult.document.id })
        }
      );
      const extractionResult = await readApiResult<ExtractionResult>(extractionResponse);

      if (!extractionResponse.ok || !extractionResult.proposal) {
        setStatus("done");
        setMessage(
          extractionResult.error
            ? `File started and document saved. Automatic extraction needs follow-up: ${extractionResult.error}`
            : "File started and document saved. Koinonia will review the document and finish building the file."
        );
        return;
      }

      setProposal(extractionResult.proposal);
      setStatus("review");
      setMessage("We found the information below. Review it before Koinonia applies it to the file.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Koinonia could not start the file.");
    }
  }

  async function confirmExtraction() {
    if (!transactionId || !proposal || status === "confirming") return;

    setStatus("confirming");
    setMessage("Applying the confirmed information…");

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(transactionId)}/extraction`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm" })
        }
      );
      const result = await readApiResult<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(result.error ?? "Koinonia could not confirm the extracted information.");
      }

      setStatus("done");
      setMessage("File created. The confirmed document information is now attached to the transaction.");
    } catch (error) {
      setStatus("review");
      setMessage(
        error instanceof Error
          ? error.message
          : "Koinonia could not confirm the extracted information."
      );
    }
  }

  function resetSelection() {
    setStatus("idle");
    setMessage(null);
    setProposal(null);
    setTransactionId(null);
    setIntakeRequestId(createTransactionIntakeRequestId());
  }

  return (
    <div className="koinonia-client-main-stack">
      <section className="koinonia-client-work-panel" aria-labelledby="transaction-side-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 1</p>
          <h2 id="transaction-side-title">Who are you representing?</h2>
          <p>Buyer and seller files follow different intake and transaction workflows.</p>
        </div>

        <div className="koinonia-client-summary-grid">
          <button
            className="koinonia-client-summary-card"
            type="button"
            aria-pressed={side === "buyer"}
            disabled={status === "saving" || status === "confirming" || status === "review"}
            onClick={() => {
              setSide("buyer");
              resetSelection();
            }}
          >
            <span>Buyer</span>
            <strong>{side === "buyer" ? "Selected" : "Choose"}</strong>
            <p>Start with buyer representation, then add the property when one exists.</p>
          </button>

          <button
            className="koinonia-client-summary-card"
            type="button"
            aria-pressed={side === "seller"}
            disabled={status === "saving" || status === "confirming" || status === "review"}
            onClick={() => {
              setSide("seller");
              resetSelection();
            }}
          >
            <span>Seller</span>
            <strong>{side === "seller" ? "Selected" : "Choose"}</strong>
            <p>Start with the listing/property and follow the seller-side workflow.</p>
          </button>
        </div>
      </section>

      <section className="koinonia-client-work-panel" aria-labelledby="transaction-stage-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 2</p>
          <h2 id="transaction-stage-title">Where is this client in the process?</h2>
        </div>

        <div className="koinonia-client-work-list">
          <button
            className="koinonia-client-work-item"
            type="button"
            aria-pressed={stage === "pre_contract"}
            disabled={status === "saving" || status === "confirming" || status === "review"}
            onClick={() => {
              setStage("pre_contract");
              resetSelection();
            }}
          >
            <div>
              <span>{side === "buyer" ? "Buyer" : "Seller"}</span>
              <h3>{side === "buyer" ? "Not Under Contract Yet" : "Listing / Not Under Contract Yet"}</h3>
              <p>
                {side === "buyer"
                  ? "We can start the client relationship before a property is selected."
                  : "We can start the listing file before an offer is accepted."}
              </p>
            </div>
            <div className="koinonia-client-work-meta">
              <strong>{stage === "pre_contract" ? "Selected" : "Choose"}</strong>
            </div>
          </button>

          <button
            className="koinonia-client-work-item"
            type="button"
            aria-pressed={stage === "under_contract"}
            disabled={status === "saving" || status === "confirming" || status === "review"}
            onClick={() => {
              setStage("under_contract");
              resetSelection();
            }}
          >
            <div>
              <span>{side === "buyer" ? "Buyer" : "Seller"}</span>
              <h3>Under Contract</h3>
              <p>Use the executed contract to build the transaction and deadline timeline.</p>
            </div>
            <div className="koinonia-client-work-meta">
              <strong>{stage === "under_contract" ? "Selected" : "Choose"}</strong>
            </div>
          </button>
        </div>
      </section>

      <section className="koinonia-client-work-panel" aria-labelledby="transaction-doc-title">
        <div className="koinonia-client-panel-heading">
          <p className="koinonia-eyebrow">Step 3</p>
          <h2 id="transaction-doc-title">Upload what you already have</h2>
          <p>{definition.description}</p>
        </div>

        <div className="koinonia-client-request-card">
          <strong>{definition.preferredDocument}</strong>
          <p>
            Give Koinonia the document you already have. We will start the file from it rather than
            making you retype client, property, or contract information first.
          </p>

          <label>
            <span>Choose a document</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              disabled={status === "saving" || status === "confirming" || status === "review"}
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                resetSelection();

                if (selectedFile && selectedFile.size > MAX_PORTAL_UPLOAD_BYTES) {
                  setFile(null);
                  setStatus("error");
                  setMessage(
                    `This document is ${formatFileSize(selectedFile.size)}. For this Preview, uploads must be 4 MB or smaller. Please choose a smaller PDF, JPEG, or PNG.`
                  );
                  event.currentTarget.value = "";
                  return;
                }

                setFile(selectedFile);
              }}
            />
          </label>

          {file ? (
            <p className="koinonia-client-security-note">
              Ready for intake: <strong>{file.name}</strong> ({formatFileSize(file.size)})
            </p>
          ) : null}

          {status !== "review" && status !== "done" ? (
            <button
              className="koinonia-button koinonia-button-primary"
              type="button"
              disabled={!file || status === "saving" || status === "confirming"}
              onClick={startFile}
            >
              {status === "saving" ? "Reading document…" : status === "error" && transactionId ? "Retry Upload" : "Start File"}
            </button>
          ) : null}

          {message ? (
            <p className="koinonia-client-security-note" role={status === "error" ? "alert" : "status"}>
              {message}
            </p>
          ) : null}
        </div>

        {proposal ? (
          <section className="koinonia-client-work-panel" aria-labelledby="extraction-review-title">
            <div className="koinonia-client-panel-heading">
              <p className="koinonia-eyebrow">Review</p>
              <h2 id="extraction-review-title">Here&apos;s what we found</h2>
              <p>
                Confidence: <strong>{proposal.confidence}</strong>. Nothing below is applied until you confirm it.
              </p>
            </div>

            <div className="koinonia-client-work-list">
              <ExtractionItem label="Clients" value={proposal.clientNames.join(" & ") || "Not found"} />
              <ExtractionItem label="Property" value={proposal.propertyAddress ?? "Not found"} />
              <ExtractionItem
                label="Purchase price"
                value={proposal.purchasePrice !== undefined ? formatMoney(proposal.purchasePrice) : "Not found"}
              />
              <ExtractionItem
                label="Earnest money"
                value={proposal.earnestMoney !== undefined ? formatMoney(proposal.earnestMoney) : "Not found"}
              />
              <ExtractionItem label="Closing" value={proposal.closingDate ?? "Not found"} />
              <ExtractionItem label="Financing" value={proposal.financingType ?? "Not found"} />
              <ExtractionItem label="Possession" value={proposal.possession ?? "Not found"} />
            </div>

            {Object.keys(proposal.deadlines).length ? (
              <div className="koinonia-client-request-card">
                <strong>Contract deadlines</strong>
                <ul className="koinonia-client-showing-notes">
                  {Object.entries(proposal.deadlines).map(([name, date]) => (
                    <li key={`${name}-${date}`}>{name}: {date}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {proposal.notes?.length ? (
              <div className="koinonia-client-request-card">
                <strong>Extraction notes</strong>
                <ul className="koinonia-client-showing-notes">
                  {proposal.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}

            <button
              className="koinonia-button koinonia-button-primary"
              type="button"
              disabled={status === "confirming"}
              onClick={confirmExtraction}
            >
              {status === "confirming" ? "Confirming…" : "Confirm & Build File"}
            </button>
          </section>
        ) : (
          <div className="koinonia-client-work-list">
            <article className="koinonia-client-work-item">
              <div>
                <span>We will extract</span>
                <h3>{definition.title}</h3>
                <ul className="koinonia-client-showing-notes">
                  {definition.extractedFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="koinonia-client-work-item">
              <div>
                <span>Only if still missing</span>
                <h3>Small follow-up questions</h3>
                <ul className="koinonia-client-showing-notes">
                  {definition.followUpFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="koinonia-client-request-card">
        <p className="koinonia-eyebrow">Reusable clients</p>
        <p>
          When document extraction identifies people already in the Realtor&apos;s Koinonia account, the
          transaction can link to those existing client records instead of duplicating them. A client can
          be a seller on one transaction and a buyer on another while each file remains independent.
        </p>
      </section>
    </div>
  );
}

function ExtractionItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="koinonia-client-work-item">
      <div>
        <span>{label}</span>
        <h3>{value}</h3>
      </div>
    </article>
  );
}

async function readApiResult<T extends { error?: string }>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      error: normalizePlatformError(text, response.status)
    } as T;
  }
}

function normalizePlatformError(value: string, status: number): string {
  const normalized = value.trim();

  if (status === 413 || /request entity too large|payload too large/i.test(normalized)) {
    return "This document is too large for the current upload path. Please choose a file 4 MB or smaller.";
  }

  if (/request en/i.test(normalized)) {
    return "The hosting platform rejected this document before Koinonia could process it. Please try a smaller file.";
  }

  return normalized || `Request failed with status ${status}.`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function createTransactionIntakeRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `intake-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
