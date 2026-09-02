"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MissingFact = "clientName" | "propertyAddress" | "side" | "stage";

type TransactionAttention = {
  transactionId: string;
  title: string;
  reason: string;
  documentType?: string | null;
  fileName?: string | null;
  kind: "document_mismatch" | "general";
  missingFacts?: MissingFact[];
};

export function ClientTransactionAttentionCard({ attention }: { attention: TransactionAttention }) {
  const router = useRouter();
  const [mode, setMode] = useState<"choices" | "facts">("choices");
  const [saving, setSaving] = useState<"keep" | "remove" | "facts" | "later" | null>(null);
  const [message, setMessage] = useState("");
  const [clientName, setClientName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [side, setSide] = useState("");
  const [stage, setStage] = useState("");

  const missingFacts = attention.missingFacts ?? [];
  const needsMoreFacts = missingFacts.length > 0;

  async function resolveMismatch(action: "keep" | "remove") {
    if (saving || attention.kind !== "document_mismatch") return;

    if (action === "keep" && needsMoreFacts) {
      setMode("facts");
      setMessage("");
      return;
    }

    setSaving(action);
    setMessage("");

    try {
      const endpoint = action === "keep"
        ? `/api/portal/transactions/${encodeURIComponent(attention.transactionId)}/extraction`
        : `/api/portal/transactions/${encodeURIComponent(attention.transactionId)}/attention`;
      const method = action === "keep" ? "PATCH" : "POST";
      const body = action === "keep"
        ? { action: "confirm", mismatchOverride: true }
        : { action: "remove_mismatched_document" };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not save your choice.");

      finish(
        action === "keep"
          ? "Got it. Koinonia will keep this document and continue."
          : "Removed. Send the correct document whenever you have it."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not save your choice.");
    } finally {
      setSaving(null);
    }
  }

  async function provideFacts() {
    if (saving) return;
    setSaving("facts");
    setMessage("");

    try {
      const attentionResponse = await fetch(
        `/api/portal/transactions/${encodeURIComponent(attention.transactionId)}/attention`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "provide_missing_facts",
            clientName: clientName.trim() || undefined,
            propertyAddress: propertyAddress.trim() || undefined,
            side: side || undefined,
            stage: stage || undefined
          })
        }
      );
      const attentionPayload = (await attentionResponse.json().catch(() => ({}))) as { error?: string };
      if (!attentionResponse.ok) throw new Error(attentionPayload.error ?? "Koinonia still needs a little more information.");

      const confirmResponse = await fetch(
        `/api/portal/transactions/${encodeURIComponent(attention.transactionId)}/extraction`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm", mismatchOverride: true })
        }
      );
      const confirmPayload = (await confirmResponse.json().catch(() => ({}))) as { error?: string };
      if (!confirmResponse.ok) throw new Error(confirmPayload.error ?? "Koinonia could not finish the transaction setup.");

      finish("Thanks. Koinonia has what it needs and will continue from here.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not save those details.");
    } finally {
      setSaving(null);
    }
  }

  async function waitForFutureDocument() {
    if (saving) return;
    setSaving("later");
    setMessage("");

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(attention.transactionId)}/attention`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "wait_for_future_document" })
        }
      );
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not save your choice.");

      finish("Got it. Koinonia will wait for another document and fill in the remaining details from there.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not save your choice.");
    } finally {
      setSaving(null);
    }
  }

  function finish(nextMessage: string) {
    setMessage(nextMessage);
    setTimeout(() => {
      router.refresh();
      window.location.reload();
    }, 700);
  }

  return (
    <section className="koinonia-client-attention-card" aria-labelledby="transaction-attention-title">
      <div className="koinonia-client-attention-card-copy">
        <span className="koinonia-client-section-label">Needs your attention</span>
        <h2 id="transaction-attention-title">{attention.title}</h2>
        <p>{attention.reason}</p>
        {attention.documentType || attention.fileName ? (
          <div className="koinonia-client-attention-document">
            {attention.documentType ? <strong>{attention.documentType}</strong> : null}
            {attention.fileName ? <span>{attention.fileName}</span> : null}
          </div>
        ) : null}
      </div>

      {attention.kind === "document_mismatch" && mode === "choices" ? (
        <div className="koinonia-client-attention-choice">
          <span>Does this document belong to this transaction?</span>
          <div className="koinonia-client-attention-choice-buttons">
            <button type="button" disabled={Boolean(saving)} onClick={() => void resolveMismatch("keep")}>
              {saving === "keep" ? "Saving…" : "Yes, keep it"}
            </button>
            <button type="button" disabled={Boolean(saving)} onClick={() => void resolveMismatch("remove")}>
              {saving === "remove" ? "Removing…" : "No, wrong document"}
            </button>
          </div>
          <small>
            If it belongs here but Koinonia still needs a few facts, we will ask only for those next.
          </small>
        </div>
      ) : null}

      {attention.kind === "document_mismatch" && mode === "facts" ? (
        <div className="koinonia-client-missing-facts">
          <div>
            <strong>Koinonia needs a few details this document did not provide.</strong>
            <p>Enter them now, or tell us to wait for another transaction document.</p>
          </div>

          <div className="koinonia-client-missing-facts-fields">
            {missingFacts.includes("clientName") ? (
              <label>
                <span>Client name</span>
                <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Buyer or seller name" />
              </label>
            ) : null}
            {missingFacts.includes("propertyAddress") ? (
              <label>
                <span>Property address</span>
                <input value={propertyAddress} onChange={(event) => setPropertyAddress(event.target.value)} placeholder="Property address" />
              </label>
            ) : null}
            {missingFacts.includes("side") ? (
              <label>
                <span>Who do you represent?</span>
                <select value={side} onChange={(event) => setSide(event.target.value)}>
                  <option value="">Choose</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
            ) : null}
            {missingFacts.includes("stage") ? (
              <label>
                <span>Where is the transaction?</span>
                <select value={stage} onChange={(event) => setStage(event.target.value)}>
                  <option value="">Choose</option>
                  <option value="under_contract">Under contract</option>
                  <option value="pre_contract">Not under contract yet</option>
                </select>
              </label>
            ) : null}
          </div>

          <div className="koinonia-client-missing-facts-actions">
            <button type="button" disabled={Boolean(saving)} onClick={() => void provideFacts()}>
              {saving === "facts" ? "Saving…" : "Save and continue"}
            </button>
            <button type="button" disabled={Boolean(saving)} onClick={() => void waitForFutureDocument()}>
              {saving === "later" ? "Saving…" : "I’ll send another document later"}
            </button>
          </div>
        </div>
      ) : null}

      {attention.kind === "general" ? (
        <a className="koinonia-client-primary-action" href="/client/documents">Send document</a>
      ) : null}

      {message ? <p className="koinonia-client-attention-result" role="status">{message}</p> : null}
    </section>
  );
}
