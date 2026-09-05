"use client";

import { useState } from "react";

type Props = {
  transactionId: string;
  obligationId: string;
  label: string;
  onResolved?: () => void;
};

type ResolutionAction = {
  resolution: "satisfied" | "not_applicable";
  outcome: "occurred" | "no_event" | "completed";
  label: string;
};

export function TransactionObligationResolutionControls({
  transactionId,
  obligationId,
  label,
  onResolved
}: Props) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isObjectionMilestone = label.toLocaleLowerCase("en-US").includes("objection");
  const actions: ResolutionAction[] = isObjectionMilestone
    ? [
        { resolution: "satisfied", outcome: "occurred", label: "Objection occurred" },
        { resolution: "satisfied", outcome: "no_event", label: "No objection occurred" }
      ]
    : [
        { resolution: "satisfied", outcome: "completed", label: "Resolved / Completed" },
        { resolution: "not_applicable", outcome: "no_event", label: "Not Applicable" }
      ];

  async function resolve(action: ResolutionAction) {
    if (saving) return;
    const normalizedReason = reason.trim();
    if (normalizedReason.length < 3) {
      setMessage("Add a short internal reason before resolving this milestone.");
      return;
    }

    setSaving(action.outcome);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/employee/transactions/${encodeURIComponent(transactionId)}/obligations/${encodeURIComponent(obligationId)}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution: action.resolution,
            outcome: action.outcome,
            reason: normalizedReason
          })
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
      {actions.map((action) => (
        <button
          className="koinonia-button"
          type="button"
          disabled={Boolean(saving)}
          key={action.outcome}
          onClick={() => void resolve(action)}
        >
          {saving === action.outcome ? "Saving…" : action.label}
        </button>
      ))}
      {message ? <small className="koinonia-work-assignment-status">{message}</small> : null}
    </div>
  );
}
