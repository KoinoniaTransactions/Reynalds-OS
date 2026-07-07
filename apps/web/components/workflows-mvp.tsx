"use client";

import { useEffect, useMemo, useState } from "react";

type Workflow = {
  id: string;
  name: string;
  status: string;
  triggerEvent: string;
  definition: {
    version?: number;
    stages?: string[];
    steps?: Array<{ id: string; type: string; label: string; action?: string }>;
    variables?: Record<string, unknown>;
    conditions?: unknown[];
  };
  updatedAt: string;
};

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
};

type WorkflowRun = {
  id: string;
  workflowId: string;
  objectId: string;
  status: string;
  currentStage?: string | null;
  startedAt: string;
  completedAt?: string | null;
};

const starterWorkflows = [
  {
    name: "Transaction Management Workflow",
    triggerEvent: "transaction.created",
    status: "Active",
    definition: {
      version: 1,
      stages: ["Intake", "Compliance", "Deadlines", "Closing Prep", "Closing", "Archive"],
      steps: [
        { id: "create_tasks", type: "system", label: "Create transaction tasks", action: "tasks.create" },
        { id: "create_timeline", type: "system", label: "Create timeline event", action: "timeline.create" },
        { id: "notify_owner", type: "system", label: "Notify owner", action: "notifications.create" }
      ],
      variables: { service: "Transaction Management" },
      conditions: []
    }
  },
  {
    name: "Customer Success Handoff",
    triggerEvent: "transaction.closed",
    status: "Draft",
    definition: {
      version: 1,
      stages: ["Thank You", "Satisfaction Check", "Review Request", "Referral Follow-Up"],
      steps: [
        { id: "create_success_task", type: "system", label: "Create customer success task", action: "tasks.create" },
        { id: "notify_success", type: "system", label: "Notify success owner", action: "notifications.create" }
      ],
      variables: { service: "Customer Success" },
      conditions: []
    }
  }
];

export function WorkflowsMvp() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [targetObjectId, setTargetObjectId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return workflows;
    return workflows.filter((workflow) =>
      [workflow.name, workflow.status, workflow.triggerEvent]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [workflows, search]);

  async function loadWorkflows() {
    setError("");
    try {
      const response = await fetch("/api/workflows");
      if (!response.ok) throw new Error("Failed to load workflows.");
      const data = await response.json();
      setWorkflows(data.workflows ?? []);
      if (!selected && data.workflows?.[0]) setSelected(data.workflows[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadObjects() {
    const response = await fetch("/api/objects");
    if (!response.ok) return;
    const data = await response.json();
    setObjects(data.objects ?? []);
    if (data.objects?.[0]) setTargetObjectId(data.objects[0].id);
  }

  async function loadRuns() {
    const response = await fetch("/api/workflow-runs");
    if (!response.ok) return;
    const data = await response.json();
    setRuns(data.runs ?? []);
  }

  async function seedWorkflows() {
    setError("");
    try {
      for (const workflow of starterWorkflows) {
        await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflow)
        });
      }
      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function startWorkflow() {
    if (!selected || !targetObjectId) return;
    setError("");

    try {
      const response = await fetch(`/api/workflows/${selected.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectId: targetObjectId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to start workflow.");
      }

      await loadRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadWorkflows();
    void loadObjects();
    void loadRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stages = selected?.definition?.stages ?? [];
  const steps = selected?.definition?.steps ?? [];

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Workflows · v10.0</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations">Operations</a>
          <a href="/finance">Finance</a>
          <a href="/knowledge">Knowledge</a>
          <a href="/copilot">Copilot</a>
          <a href="/notifications">Notifications</a>
          <a href="/workflows" className="active">Workflows</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workflows..." />
          <button onClick={() => void loadWorkflows()}>Refresh</button>
          <button onClick={() => void seedWorkflows()}>Seed Workflows</button>
        </header>

        <div className="ros-eyebrow">ROS-0082 · Workflow Automation Engine</div>
        <h1>Workflow Engine</h1>
        <p className="ros-subtitle">
          Workflow definitions, stages, steps, triggers, and execution runs. This is the automation layer that future modules can plug into.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Workflows</span>
            <strong>{workflows.length}</strong>
            <p>definitions</p>
          </article>
          <article className="ros-card">
            <span>Active</span>
            <strong>{workflows.filter((workflow) => workflow.status === "Active").length}</strong>
            <p>ready to run</p>
          </article>
          <article className="ros-card">
            <span>Runs</span>
            <strong>{runs.length}</strong>
            <p>started workflows</p>
          </article>
          <article className="ros-card">
            <span>Selected Steps</span>
            <strong>{steps.length}</strong>
            <p>workflow actions</p>
          </article>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Workflow Library</h2>
            {filtered.length === 0 ? <p>No workflows found. Use Seed Workflows to create starter definitions.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Trigger</th>
                  <th>Stages</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((workflow) => (
                  <tr key={workflow.id} onClick={() => setSelected(workflow)}>
                    <td>
                      <strong>{workflow.name}</strong>
                      <span>{workflow.id}</span>
                    </td>
                    <td>{workflow.status}</td>
                    <td>{workflow.triggerEvent}</td>
                    <td>{workflow.definition?.stages?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ marginTop: 24 }}>Workflow Runs</h2>
            {runs.length === 0 ? <p>No workflow runs yet.</p> : null}
            <table className="ros-table">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Workflow</th>
                  <th>Object</th>
                  <th>Status</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>{run.id}</td>
                    <td>{run.workflowId}</td>
                    <td>{run.objectId}</td>
                    <td>{run.status}</td>
                    <td>{run.currentStage ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Workflow Detail</h2>
            {!selected ? (
              <p>Select a workflow.</p>
            ) : (
              <>
                <p><strong>{selected.id}</strong></p>
                <h3>{selected.name}</h3>
                <p>{selected.status} · Trigger: {selected.triggerEvent}</p>

                <h3>Start Workflow</h3>
                <form className="ros-form" onSubmit={(event) => { event.preventDefault(); void startWorkflow(); }}>
                  <select value={targetObjectId} onChange={(event) => setTargetObjectId(event.target.value)}>
                    {objects.map((object) => (
                      <option key={object.id} value={object.id}>{object.name} · {object.objectType}</option>
                    ))}
                  </select>
                  <button>Start Workflow</button>
                </form>

                <h3>Stages</h3>
                <ol>
                  {stages.map((stage) => <li key={stage}>{stage}</li>)}
                </ol>

                <h3>Steps</h3>
                <ul>
                  {steps.map((step) => (
                    <li key={step.id}>
                      <strong>{step.label}</strong> · {step.type} · {step.action ?? "manual"}
                    </li>
                  ))}
                </ul>

                <h3>Definition</h3>
                <pre className="ros-code">{JSON.stringify(selected.definition, null, 2)}</pre>
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
