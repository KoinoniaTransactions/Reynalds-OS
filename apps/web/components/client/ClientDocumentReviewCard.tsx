"use client";

import { useState } from "react";

type ReviewDocument = {
  id: string;
  documentType: string;
  fileName: string;
  versionNumber: number;
  versionLabel?: string | null;
  requestedAction?: string | null;
};

export function ClientDocumentReviewCard({ document }: { document: ReviewDocument }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState<"approve" | "request_revision" | null>(null);
  const [message, setMessage] = useState("");

  async function respond(action: "approve" | "request_revision") {
    if (saving) return;
    if (action === "request_revision" && note.trim().length < 3) {
      setMessage("Tell Koinonia what needs to be changed.");
      return;
    }

    setSaving(action);
    setMessage("");

    try {
      const response = await fetch(`/api/portal/documents/${encodeURIComponent(document.id)}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: note.trim() || undefined
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not record your response.");

      setMessage(
        action === "approve"
          ? "Approved. Koinonia has it from here."
          : "Sent back to Koinonia for revision."
      );
      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not record your response.");
    } finally {
      setSaving(null);
    }
  }

  const version = document.versionLabel?.trim() || `v${document.versionNumber}`;

  return (
    <article className="koinonia-client-review-card">
      <div className="koinonia-client-review-card-copy">
        <span>Needs your review · {version}</span>
        <h3>{document.documentType}</h3>
        <p>
          Koinonia prepared this version for your accuracy review. Check it and tell us whether it is ready or needs a change.
        </p>
        <p className="koinonia-client-review-file">{document.fileName}</p>
      </div>

      <div className="koinonia-client-review-actions">
        <a
          className="koinonia-document-link"
          href={`/api/portal/documents/${encodeURIComponent(document.id)}/download?disposition=inline`}
          target="_blank"
          rel="noreferrer"
        >
          Review document
        </a>

        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Only add a note if something needs to change"
          aria-label={`Revision note for ${document.documentType}`}
        />

        <div className="koinonia-client-review-buttons">
          <button
            className="koinonia-button"
            type="button"
            disabled={Boolean(saving)}
            onClick={() => void respond("approve")}
          >
            {saving === "approve" ? "Saving…" : "Looks Good"}
          </button>
          <button
            className="koinonia-button"
            type="button"
            disabled={Boolean(saving)}
            onClick={() => void respond("request_revision")}
          >
            {saving === "request_revision" ? "Sending…" : "Needs Changes"}
          </button>
        </div>

        {message ? <small className="koinonia-work-assignment-status">{message}</small> : null}
      </div>
    </article>
  );
}
