"use client";

import { useState } from "react";

type Props = {
  inboundEmail: string | null;
  transactionId: string;
};

export function ClientTransactionQuickActions({ inboundEmail, transactionId }: Props) {
  const [copied, setCopied] = useState(false);
  const uploadHref = `/client/documents?relatedObjectId=${encodeURIComponent(transactionId)}#employee-document-upload`;
  const workHref = `/client/work/${encodeURIComponent(transactionId)}`;

  async function copyEmail() {
    if (!inboundEmail) return;
    await navigator.clipboard.writeText(inboundEmail);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <details className="koinonia-client-row-actions" onClick={(event) => event.stopPropagation()}>
      <summary aria-label="Transaction quick actions" title="Quick actions">•••</summary>
      <div className="koinonia-client-row-actions-menu">
        <a href={uploadHref}>Send document</a>
        {inboundEmail ? (
          <button type="button" onClick={() => void copyEmail()}>
            {copied ? "Email copied" : "Copy transaction email"}
          </button>
        ) : (
          <span className="is-disabled" title="Inbound email routing is not configured yet">
            Email documents — coming soon
          </span>
        )}
        <a href={workHref}>Open file</a>
      </div>
    </details>
  );
}
