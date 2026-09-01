"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TransactionRequirementQuestion } from "../../lib/transaction-document-requirements";

type Props = {
  transactionId: string;
  questions: TransactionRequirementQuestion[];
};

export function TransactionRequirementQuestions({ transactionId, questions }: Props) {
  const router = useRouter();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!questions.length) return null;

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
    <section className="koinonia-workspace-requirement-questions" aria-labelledby="requirement-questions-title">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">A few details</p>
          <h3 id="requirement-questions-title">Help us finish the document checklist</h3>
        </div>
        <p>Only questions that change what this transaction needs appear here.</p>
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

      {message ? <p className="koinonia-client-security-note" role="status">{message}</p> : null}
    </section>
  );
}
