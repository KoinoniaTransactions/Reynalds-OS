"use client";

import { useMemo, useState } from "react";

export type PortalLaunchProofFormItem = {
  id: string;
  statusLabel: string;
  title: string;
};

type PortalLaunchProofFormProps = {
  defaultOwner: string;
  items: PortalLaunchProofFormItem[];
};

const defaultStatus = "Completed";

export function PortalLaunchProofForm({ defaultOwner, items }: PortalLaunchProofFormProps) {
  const [checklistItemId, setChecklistItemId] = useState(items[0]?.id ?? "");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [proofDate, setProofDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [proofOwner, setProofOwner] = useState(defaultOwner);
  const [status, setStatus] = useState(defaultStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const selectedItem = useMemo(
    () => items.find((item) => item.id === checklistItemId) ?? items[0],
    [checklistItemId, items]
  );

  async function submitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/portal/launch-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistItemId,
          evidenceUrl,
          notes,
          proofDate,
          proofOwner,
          status
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Launch proof could not be recorded.");
      }

      setMessage("Launch proof recorded. Refreshing the checklist.");
      setNotes("");
      setEvidenceUrl("");
      window.setTimeout(() => window.location.reload(), 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch proof could not be recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <form className="koinonia-launch-proof-form" onSubmit={submitProof}>
      <div>
        <p className="koinonia-eyebrow">Record Proof</p>
        <h2>Save launch evidence</h2>
        <p>
          Use this for dry runs and service QA proof. Keep passwords, access
          codes, card numbers, and private login details out of notes.
        </p>
      </div>

      <label>
        Checklist Item
        <select
          required
          value={checklistItemId}
          onChange={(event) => setChecklistItemId(event.target.value)}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} - {item.statusLabel}
            </option>
          ))}
        </select>
      </label>

      <div className="koinonia-launch-proof-form-grid">
        <label>
          Status
          <select required value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Completed">Completed</option>
            <option value="Needs Follow-up">Needs Follow-up</option>
          </select>
        </label>

        <label>
          Proof Date
          <input
            required
            type="date"
            value={proofDate}
            onChange={(event) => setProofDate(event.target.value)}
          />
        </label>

        <label>
          Owner
          <input
            required
            value={proofOwner}
            onChange={(event) => setProofOwner(event.target.value)}
          />
        </label>
      </div>

      <label>
        Evidence Link
        <input
          inputMode="url"
          placeholder="https://..."
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
        />
      </label>

      <label>
        Proof Notes
        <textarea
          required
          minLength={20}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={`What did staff verify for ${selectedItem?.title ?? "this checklist item"}?`}
        />
      </label>

      <button className="koinonia-button primary" disabled={submitting} type="submit">
        {submitting ? "Recording..." : "Record Proof"}
      </button>

      {error ? <p className="koinonia-launch-proof-form-status error">{error}</p> : null}
      {message ? <p className="koinonia-launch-proof-form-status success">{message}</p> : null}
    </form>
  );
}
