"use client";

import { useState } from "react";

type Props = {
  transactionId: string;
  obligationId: string;
  label: string;
  onResolved?: () => void;
};

export function TransactionObligationResolutionControls({
  transactionId,
  obligationId,
  label,
  onResolved
}: Props) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState<"satisfied" | "not_applicable" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function resolve(resolution: "satisfied" | "not_applicable") {
    if (saving) return;
    const normalizedReason = reason.trim();
    if (normalizedReason.length < 3) {
      setMessage("Add a short internal reason before resolving this milestone.");
      return;
    }

    setSaving(resolution);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/employee/transactions/${encodeURIComponent(transactionId)}/obligations/${encodeURIComponent(obligationId)}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolution, reason: normalizedReason })
        }
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not resolve this milestone.");

      setMessage(`${label} updated.`);
      setReason("");
      onResolved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not resolve this milestone.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="koinonia-workspace-question-options" aria-label={`Resolve ${label}`}>
      <input
        type="text"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Internal outcome / reason"
        aria-label={`Internal resolution reason for ${label}`}
      />
      <button
        className="koinonia-button"
        type="button"
        disabled={Boolean(saving)}
        onClick={() => void resolve("satisfied")}
      >
        {saving === "satisfied" ? "Saving…" : "Resolved / Completed"}
      </button>
      <button
        className="koinonia-button"
        type="button"
        disabled={Boolean(saving)}
        onClick={() => void resolve("not_applicable")}
      >
        {saving === "not_applicable" ? "Saving…" : "Not Applicable"}
      </button>
      {message ? <small className="koinonia-work-assignment-status">{message}</small> : null}
    </div>
  );
}
