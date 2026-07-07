"use client";

import { useState } from "react";

type CopilotResponse = {
  answer: string;
  recommendedAction?: string;
  requiresHumanReview: boolean;
  mode: string;
  supportingReferences: {
    criticalObjectIds: string[];
    openTaskIds: string[];
    pendingInvoiceIds: string[];
    recentTimelineEventIds: string[];
    knowledgeObjectIds: string[];
  };
};

const suggestedQuestions = [
  "What should I work on next?",
  "What is critical right now?",
  "What invoices need attention?",
  "What knowledge objects do we have?",
  "What is blocking work?"
];

export function CopilotMvp() {
  const [question, setQuestion] = useState("What should I work on next?");
  const [answer, setAnswer] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  async function askCopilot(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsAsking(true);
    setError("");

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to ask Copilot.");
      }

      const data = await response.json();
      setAnswer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Copilot · v9.4</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations">Operations</a>
          <a href="/finance">Finance</a>
          <a href="/knowledge">Knowledge</a>
          <a href="/copilot" className="active">Copilot</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask Copilot..." />
          <button onClick={() => void askCopilot()}>{isAsking ? "Asking..." : "Ask"}</button>
          <a className="ros-button-link" href="/operations">Open Queue</a>
        </header>

        <div className="ros-eyebrow">ROS-0079 · Read-Only Copilot MVP</div>
        <h1>AI Copilot</h1>
        <p className="ros-subtitle">
          Read-only Copilot grounded in objects, tasks, invoices, timeline events, and knowledge records. It recommends; it does not change data.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Ask a Question</h2>
            <form className="ros-form" onSubmit={askCopilot}>
              <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I work on next?" />
              <button disabled={isAsking}>{isAsking ? "Asking..." : "Ask Copilot"}</button>
            </form>

            <h3>Suggested Questions</h3>
            <div className="ros-filters">
              {suggestedQuestions.map((item) => (
                <button key={item} onClick={() => setQuestion(item)}>{item}</button>
              ))}
            </div>

            {answer ? (
              <div className="ros-panel">
                <h2>Answer</h2>
                <p>{answer.answer}</p>
                <p><strong>Recommended action:</strong> {answer.recommendedAction ?? "Review context"}</p>
                <p><strong>Mode:</strong> {answer.mode}</p>
                <p><strong>Human review required:</strong> {answer.requiresHumanReview ? "Yes" : "No"}</p>
              </div>
            ) : (
              <p>No answer yet.</p>
            )}
          </article>

          <aside className="ros-card">
            <h2>Supporting References</h2>
            {!answer ? (
              <p>Ask Copilot to see grounded references.</p>
            ) : (
              <>
                <h3>Critical Objects</h3>
                <ul>{answer.supportingReferences.criticalObjectIds.map((id) => <li key={id}>{id}</li>)}</ul>

                <h3>Open Tasks</h3>
                <ul>{answer.supportingReferences.openTaskIds.map((id) => <li key={id}>{id}</li>)}</ul>

                <h3>Pending Invoices</h3>
                <ul>{answer.supportingReferences.pendingInvoiceIds.map((id) => <li key={id}>{id}</li>)}</ul>

                <h3>Timeline Events</h3>
                <ul>{answer.supportingReferences.recentTimelineEventIds.map((id) => <li key={id}>{id}</li>)}</ul>

                <h3>Knowledge</h3>
                <ul>{answer.supportingReferences.knowledgeObjectIds.map((id) => <li key={id}>{id}</li>)}</ul>
              </>
            )}

            <h2>Copilot Rule</h2>
            <p>Read-only Copilot can explain, prioritize, and recommend. It cannot mutate data without a reviewed action workflow.</p>
          </aside>
        </section>
      </section>
    </main>
  );
}
