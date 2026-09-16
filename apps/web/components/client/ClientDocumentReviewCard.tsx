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
  const [showNote, setShowNote] = useState(false);
  const version = document.versionLabel?.trim() || `v${document.versionNumber}`;
  const inlineUrl = `/api/portal/documents/${encodeURIComponent(document.id)}/download?disposition=inline`;
  const question = getReviewQuestion(document);

  async function respond(action: "approve" | "request_revision") {
    if (saving) return;
    if (action === "request_revision" && note.trim().length < 3) {
      setShowNote(true);
      setMessage("Tell Koinonia what needs to be changed.");
      return;
    }

    setSaving(action);
    setMessage("");

    try {
      const response = await fetch(`/api/portal/documents/${encodeURIComponent(document.id)}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: note.trim() || undefined })
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not record your response.");

      setMessage(action === "approve" ? "Got it. Koinonia has it from here." : "Sent back to Koinonia for revision.");
      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not record your response.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <article className="koinonia-client-review-card koinonia-client-review-card-inline">
      <div className="koinonia-client-review-preview">
        <iframe
          src={inlineUrl}
          title={`${document.documentType} ${version}`}
          loading="lazy"
        />
        <a href={inlineUrl} target="_blank" rel="noreferrer" className="koinonia-client-preview-open">
          Open larger
        </a>
      </div>

      <div className="koinonia-client-review-actions koinonia-client-review-question">
        <div className="koinonia-client-review-card-copy">
          <span>Needs your review · {version}</span>
          <h3>{question.title}</h3>
          <p>{question.prompt}</p>
          <small>{document.documentType} · {document.fileName}</small>
        </div>

        <div className="koinonia-client-review-choice-set" aria-label={`Response for ${document.documentType}`}>
          <button
            className="koinonia-client-choice primary-choice"
            type="button"
            disabled={Boolean(saving)}
            onClick={() => void respond("approve")}
          >
            <strong>{saving === "approve" ? "Saving…" : question.approveLabel}</strong>
            <span>{question.approveHelp}</span>
          </button>

          <button
            className="koinonia-client-choice"
            type="button"
            disabled={Boolean(saving)}
            onClick={() => setShowNote(true)}
          >
            <strong>{question.reviseLabel}</strong>
            <span>{question.reviseHelp}</span>
          </button>
        </div>

        {showNote ? (
          <div className="koinonia-client-review-note-panel">
            <label>
              <span>What should Koinonia change?</span>
              <textarea
                rows={3}
                autoFocus
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Example: closing date should be September 30, not September 29"
                aria-label={`Revision note for ${document.documentType}`}
              />
            </label>
            <div>
              <button
                className="koinonia-client-text-action"
                type="button"
                disabled={Boolean(saving)}
                onClick={() => {
                  setShowNote(false);
                  setMessage("");
                }}
              >
                Cancel
              </button>
              <button
                className="koinonia-client-primary-action"
                type="button"
                disabled={Boolean(saving)}
                onClick={() => void respond("request_revision")}
              >
                {saving === "request_revision" ? "Sending…" : "Send correction"}
              </button>
            </div>
          </div>
        ) : null}

        {message ? <small className="koinonia-work-assignment-status">{message}</small> : null}
      </div>
    </article>
  );
}

function getReviewQuestion(document: ReviewDocument): {
  title: string;
  prompt: string;
  approveLabel: string;
  approveHelp: string;
  reviseLabel: string;
  reviseHelp: string;
} {
  const requestedAction = document.requestedAction?.trim();

  if (requestedAction) {
    return {
      title: "Does this look right?",
      prompt: requestedAction,
      approveLabel: "Yes, looks right",
      approveHelp: "Koinonia can continue with this version.",
      reviseLabel: "Something is wrong",
      reviseHelp: "Tell us the correction and we will update it."
    };
  }

  return {
    title: "Is this document accurate?",
    prompt: "Review the document beside this question. If everything is correct, approve it. If not, tell Koinonia the correction and we will create the next version.",
    approveLabel: "Looks right",
    approveHelp: "Koinonia can continue with this version.",
    reviseLabel: "Needs a correction",
    reviseHelp: "Tell us what is wrong; you do not need to edit the document yourself."
  };
}
