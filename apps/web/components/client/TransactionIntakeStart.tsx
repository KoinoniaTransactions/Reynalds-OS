"use client";

import { useMemo, useState } from "react";
import {
  getTransactionIntakeDefinition,
  type TransactionSide,
  type TransactionStage
} from "../../lib/transaction-intake";

type IntakeResult = {
  transaction?: {
    id: string;
    name: string;
  };
  error?: string;
};

export function TransactionIntakeStart() {
  const [side, setSide] = useState<TransactionSide>("buyer");
  const [stage, setStage] = useState<TransactionStage>("pre_contract");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const definition = useMemo(
    () => getTransactionIntakeDefinition(side, stage),
    [side, stage]
  );

  async function startFile() {
    if (!file || status === "saving") {
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      const transactionResponse = await fetch("/api/portal/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          sourceDocumentName: file.name,
          stage
        })
      });
      const transactionResult = (await transactionResponse.json()) as IntakeResult;

      if (!transactionResponse.ok || !transactionResult.transaction) {
        throw new Error(transactionResult.error ?? "Koinonia could not start this transaction.");
      }

      const documentForm = new FormData();
      documentForm.set("file", file);
      documentForm.set("documentType", definition.preferredDocument);
      documentForm.set("relatedObjectId", transactionResult.transaction.id);
      documentForm.set("transactionName", transactionResult.transaction.name);
      documentForm.set("requestedAction", "Extract transaction details and identify the client/property");

      const documentResponse = await fetch("/api/portal/documents", {
        method: "POST",
        body: documentForm
      });
      const documentResult = (await documentResponse.json()) as { error?: string };

      if (!documentResponse.ok) {
        throw new Error(
          documentResult.error ??
            "The transaction was started, but the document could not be uploaded."
        );
      }

      setStatus("done");
      setMessage(
        `File started. Koinonia received ${file.name} and will use it to build the ${side} transaction.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Koinonia could not start the file.");
    }
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
            onClick={() => setSide("buyer")}
          >
            <span>Buyer</span>
            <strong>{side === "buyer" ? "Selected" : "Choose"}</strong>
            <p>Start with buyer representation, then add the property when one exists.</p>
          </button>

          <button
            className="koinonia-client-summary-card"
            type="button"
            aria-pressed={side === "seller"}
            onClick={() => setSide("seller")}
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
            onClick={() => setStage("pre_contract")}
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
            onClick={() => setStage("under_contract")}
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
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setStatus("idle");
                setMessage(null);
              }}
            />
          </label>

          {file ? (
            <p className="koinonia-client-security-note">
              Ready for intake: <strong>{file.name}</strong>
            </p>
          ) : null}

          <button
            className="koinonia-button koinonia-button-primary"
            type="button"
            disabled={!file || status === "saving"}
            onClick={startFile}
          >
            {status === "saving" ? "Starting file…" : "Start File"}
          </button>

          {message ? (
            <p className="koinonia-client-security-note" role={status === "error" ? "alert" : "status"}>
              {message}
            </p>
          ) : null}
        </div>

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
      </section>

      <section className="koinonia-client-request-card">
        <p className="koinonia-eyebrow">Reusable clients</p>
        <p>
          When document extraction identifies people already in the Realtor's Koinonia account, the
          transaction can link to those existing client records instead of duplicating them. A client can
          be a seller on one transaction and a buyer on another while each file remains independent.
        </p>
      </section>
    </div>
  );
}
