"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TransactionRequirementQuestion } from "../../lib/transaction-document-requirements";

type Props = {
  transactionId: string;
  questions: TransactionRequirementQuestion[];
};

type PackageStatus = "checking" | "incomplete" | "complete";

type DeadlineAlert = {
  kind: "listing_expired" | "contract_deadline_passed";
  title: string;
  detail: string;
  deadlineName: string;
  deadlineDate: string;
  recommendedDocument: "Listing Contract Amend / Extend" | "Agreement to Amend / Extend";
};

type DeadlineHealth = {
  status: "clear" | "review";
  alerts: DeadlineAlert[];
};

export function TransactionRequirementQuestions({ transactionId, questions }: Props) {
  const router = useRouter();
  const [packageStatus, setPackageStatus] = useState<PackageStatus>("checking");
  const [deadlineHealth, setDeadlineHealth] = useState<DeadlineHealth>({ status: "clear", alerts: [] });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const [packageResult, deadlineResult] = await Promise.allSettled([
        fetch(`/api/portal/transactions/${encodeURIComponent(transactionId)}/intake-package`, {
          cache: "no-store"
        }),
        fetch(`/api/portal/transactions/${encodeURIComponent(transactionId)}/deadline-health`, {
          cache: "no-store"
        })
      ]);

      if (cancelled) return;

      if (packageResult.status === "fulfilled") {
        try {
          const payload = await packageResult.value.json() as { complete?: boolean };
          setPackageStatus(payload.complete ? "complete" : "incomplete");
        } catch {
          setPackageStatus("incomplete");
        }
      } else {
        setPackageStatus("incomplete");
      }

      if (deadlineResult.status === "fulfilled" && deadlineResult.value.ok) {
        try {
          const payload = await deadlineResult.value.json() as DeadlineHealth;
          setDeadlineHealth(payload);
        } catch {
          setDeadlineHealth({ status: "clear", alerts: [] });
        }
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const showQuestions = questions.length > 0 && packageStatus === "complete";
  const showDeadlineReview = deadlineHealth.status === "review" && deadlineHealth.alerts.length > 0;

  if (!showQuestions && !showDeadlineReview) return null;

  async function saveAnswer(factKey: string, value: string) {
    if (savingKey) return;
    setSavingKey(factKey);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/portal/transactions/${encodeURIComponent(transactionId)}/facts`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factKey, value })
        }
      );
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Koinonia could not save this answer.");

      setMessage("Checklist updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Koinonia could not save this answer.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="koinonia-workspace-requirement-stack">
      {showDeadlineReview ? (
        <section className="koinonia-workspace-requirement-questions" aria-labelledby="deadline-review-title">
          <div className="koinonia-workspace-panel-heading">
            <div>
              <p className="koinonia-eyebrow">Deadline review</p>
              <h3 id="deadline-review-title">A date may need attention</h3>
            </div>
            <p>Koinonia flags the date; the Realtor decides whether an Amend / Extend is actually needed.</p>
          </div>

          <div className="koinonia-workspace-question-list">
            {deadlineHealth.alerts.map((alert) => (
              <article className="koinonia-workspace-question" key={`${alert.kind}:${alert.deadlineName}:${alert.deadlineDate}`}>
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                  <p>Possible document: {alert.recommendedDocument}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {showQuestions ? (
        <section className="koinonia-workspace-requirement-questions" aria-labelledby="requirement-questions-title">
          <div className="koinonia-workspace-panel-heading">
            <div>
              <p className="koinonia-eyebrow">Only what is still unknown</p>
              <h3 id="requirement-questions-title">A few details we could not determine from your documents</h3>
            </div>
            <p>These questions appear only after Koinonia has read the initial document package.</p>
          </div>

          <div className="koinonia-workspace-question-list">
            {questions.map((question) => (
              <article className="koinonia-workspace-question" key={question.factKey}>
                <div>
                  <strong>{question.prompt}</strong>
                  <p>{question.helpText}</p>
                </div>

                {question.inputType === "number" ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const value = String(form.get("value") ?? "").trim();
                      if (value) void saveAnswer(question.factKey, value);
                    }}
                  >
                    <input
                      type="number"
                      name="value"
                      min="1600"
                      max={new Date().getFullYear() + 1}
                      placeholder="Year built"
                      aria-label={question.prompt}
                    />
                    <button className="koinonia-button" type="submit" disabled={savingKey === question.factKey}>
                      {savingKey === question.factKey ? "Saving…" : "Save"}
                    </button>
                  </form>
                ) : (
                  <div className="koinonia-workspace-question-options">
                    {question.options.map((option) => (
                      <button
                        className="koinonia-button"
                        type="button"
                        key={option.value}
                        disabled={Boolean(savingKey)}
                        onClick={() => void saveAnswer(question.factKey, option.value)}
                      >
                        {savingKey === question.factKey ? "Saving…" : option.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {message ? <p className="koinonia-client-security-note" role="status">{message}</p> : null}
    </div>
  );
}
