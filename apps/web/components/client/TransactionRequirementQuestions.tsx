"use client";

import { useEffect, useState } from "react";
import type { TransactionRequirementQuestion } from "../../lib/transaction-document-requirements";

type Props = {
  transactionId: string;
  questions: TransactionRequirementQuestion[];
};

type RealtorOverview = {
  status: "on_track" | "needs_you" | "attention" | "closing_soon" | "closed" | "processing";
  headline: string;
  summary: string;
  nextMilestone?: string;
  closingDate?: string;
  needsFromRealtor: string[];
};

export function TransactionRequirementQuestions({ transactionId }: Props) {
  const [overview, setOverview] = useState<RealtorOverview | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const response = await fetch(
          `/api/portal/transactions/${encodeURIComponent(transactionId)}/projection`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Projection unavailable");
        const payload = (await response.json()) as { realtor?: RealtorOverview };
        if (!cancelled && payload.realtor) setOverview(payload.realtor);
      } catch {
        if (!cancelled) setUnavailable(true);
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  if (!overview && !unavailable) {
    return (
      <section className="koinonia-workspace-requirement-questions" aria-label="Koinonia transaction overview">
        <p className="koinonia-client-security-note">Koinonia is reviewing the current transaction status…</p>
      </section>
    );
  }

  if (!overview) return null;

  return (
    <section className="koinonia-workspace-requirement-questions" aria-labelledby="koinonia-overview-title">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">Koinonia Overview</p>
          <h3 id="koinonia-overview-title">{overview.headline}</h3>
        </div>
        <strong>{statusLabel(overview.status)}</strong>
      </div>

      <p>{overview.summary}</p>

      {overview.nextMilestone || overview.closingDate ? (
        <div className="koinonia-workspace-meta-grid">
          {overview.nextMilestone ? (
            <article>
              <span>Next milestone</span>
              <strong>{overview.nextMilestone}</strong>
            </article>
          ) : null}
          {overview.closingDate ? (
            <article>
              <span>Closing</span>
              <strong>{formatDate(overview.closingDate)}</strong>
            </article>
          ) : null}
        </div>
      ) : null}

      {overview.needsFromRealtor.length ? (
        <div className="koinonia-client-request-card">
          <strong>What we need from you</strong>
          <ul className="koinonia-client-showing-notes">
            {overview.needsFromRealtor.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="koinonia-client-security-note">Nothing is needed from you right now. Koinonia is handling the transaction details.</p>
      )}
    </section>
  );
}

function statusLabel(status: RealtorOverview["status"]): string {
  if (status === "needs_you") return "Need Something From You";
  if (status === "attention") return "Koinonia Reviewing";
  if (status === "closing_soon") return "Closing Soon";
  if (status === "closed") return "Closed";
  if (status === "processing") return "Setting Up";
  return "On Track";
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(timestamp));
}
