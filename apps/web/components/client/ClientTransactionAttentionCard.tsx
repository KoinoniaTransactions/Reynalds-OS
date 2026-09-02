"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TransactionAttention = {
  transactionId: string;
  title: string;
  reason: string;
  documentType?: string | null;
  fileName?: string | null;
  kind: "document_mismatch" | "general";
};

export function ClientTransactionAttentionCard({ attention }: { attention: TransactionAttention }) {
  const router = useRouter();
  const [saving, setSaving] = useState<"keep" | "remove" | null>(null);
  const [message, setMessage] = useState("");

  async function resolveMismatch(action: "keep" | "remove") {
    if (saving || attention.kind !== "document_mismatch") return;

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

      setMessage(
        action === "keep"
          ? "Got it. Koinonia will keep this document and continue."
          : "Removed. Send the correct document whenever you have it."
      );
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not save your choice.");
    } finally {
      setSaving(null);
    }
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

      {attention.kind === "document_mismatch" ? (
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
            If it is the wrong document, Koinonia will remove it from this transaction and you can send the correct one when ready.
          </small>
        </div>
      ) : (
        <a className="koinonia-client-primary-action" href="/client/documents">Send document</a>
      )}

      {message ? <p className="koinonia-client-attention-result" role="status">{message}</p> : null}
    </section>
  );
}
