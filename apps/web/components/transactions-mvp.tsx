"use client";

import { useEffect, useMemo, useState } from "react";

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction?: string | null;
  data?: Record<string, unknown> | null;
  events?: Array<{ id: string; eventType: string; summary: string; createdAt: string }>;
  sourceLinks?: Array<{ id: string; relationshipType: string; targetObject: RosObject }>;
  targetLinks?: Array<{ id: string; relationshipType: string; sourceObject: RosObject }>;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
};

const healthOptions = ["Healthy", "Attention", "Critical"];
const statusOptions = ["Intake", "Active", "Under Contract", "Closing Prep", "Closing Ready", "Closed", "Archived"];

export function TransactionsMvp() {
  const [transactions, setTransactions] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<RosObject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [health, setHealth] = useState("Healthy");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return transactions;
    return transactions.filter((transaction) =>
      [transaction.name, transaction.status, transaction.health, transaction.nextAction ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [transactions, search]);

  async function loadTransactions() {
    setError("");
    try {
      const response = await fetch("/api/objects?objectType=Transaction");
      if (!response.ok) throw new Error("Failed to load transactions.");
      const data = await response.json();
      setTransactions(data.objects ?? []);
      if (!selected && data.objects?.[0]) await loadTransaction(data.objects[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadTransaction(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/objects/${id}`);
      if (!response.ok) throw new Error("Failed to load transaction.");
      const data = await response.json();
      setSelected(data.object);
      setHealth(data.object.health ?? "Healthy");
      setStatus(data.object.status ?? "Active");
      await loadTasks(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadTasks(relatedObjectId: string) {
    const response = await fetch(`/api/tasks?relatedObjectId=${relatedObjectId}`);
    if (!response.ok) return;
    const data = await response.json();
    setTasks(data.tasks ?? []);
  }

  async function updateTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    try {
      const response = await fetch(`/api/objects/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          health,
          nextAction: selected.nextAction ?? ""
        })
      });

      if (!response.ok) throw new Error("Failed to update transaction.");
      await loadTransactions();
      await loadTransaction(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function createTransactionTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !taskTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedObjectId: selected.id,
          title: taskTitle,
          priority: health === "Critical" ? "High" : "Normal",
          status: "Open"
        })
      });

      if (!response.ok) throw new Error("Failed to create transaction task.");
      setTaskTitle("");
      await loadTransaction(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  const openTasks = tasks.filter((task) => task.status !== "Complete");
  const relatedObjects = selected ? [...(selected.sourceLinks ?? []), ...(selected.targetLinks ?? [])] : [];

  useEffect(() => {
    void loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Transactions · v8.9</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions" className="active">Transactions</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." />
          <button onClick={() => void loadTransactions()}>Refresh</button>
          <a className="ros-button-link" href="/objects">+ New Transaction</a>
        </header>

        <div className="ros-eyebrow">ROS-0074 · Transactions MVP</div>
        <h1>Transaction Center</h1>
        <p className="ros-subtitle">
          Database-backed transaction management built from Transaction objects, linked tasks, timeline events, and related object context.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Transactions</span>
            <strong>{transactions.length}</strong>
            <p>active records</p>
          </article>
          <article className="ros-card">
            <span>Critical</span>
            <strong>{transactions.filter((item) => item.health === "Critical").length}</strong>
            <p>need attention</p>
          </article>
          <article className="ros-card">
            <span>Open Tasks</span>
            <strong>{openTasks.length}</strong>
            <p>for selected file</p>
          </article>
          <article className="ros-card">
            <span>Related Objects</span>
            <strong>{relatedObjects.length}</strong>
            <p>linked context</p>
          </article>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Transactions</h2>
            {filtered.length === 0 ? <p>No transactions found. Create a Transaction object from Object Explorer.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transaction) => (
                  <tr key={transaction.id} onClick={() => void loadTransaction(transaction.id)}>
                    <td>
                      <strong>{transaction.name}</strong>
                      <span>{transaction.id}</span>
                    </td>
                    <td>{transaction.status}</td>
                    <td>{transaction.health}</td>
                    <td>{transaction.nextAction ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Transaction Detail</h2>
            {!selected ? (
              <p>Select a transaction.</p>
            ) : (
              <>
                <p><strong>{selected.id}</strong></p>
                <h3>{selected.name}</h3>

                <form className="ros-form" onSubmit={updateTransaction}>
                  <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select value={health} onChange={(event) => setHealth(event.target.value)}>
                    {healthOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <button>Update Transaction</button>
                </form>

                <p><strong>Next action:</strong> {selected.nextAction ?? "None"}</p>

                <h3>Create Transaction Task</h3>
                <form className="ros-form" onSubmit={createTransactionTask}>
                  <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Task title" />
                  <button>Create Task</button>
                </form>

                <h3>Tasks</h3>
                {tasks.length === 0 ? <p>No tasks yet.</p> : null}
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}><strong>{task.priority}</strong> · {task.title} · {task.status}</li>
                  ))}
                </ul>

                <h3>Related Objects</h3>
                {relatedObjects.length === 0 ? (
                  <p>No related objects yet.</p>
                ) : (
                  <ul>
                    {selected.sourceLinks?.map((link) => (
                      <li key={link.id}>{link.relationshipType}: {link.targetObject.name}</li>
                    ))}
                    {selected.targetLinks?.map((link) => (
                      <li key={link.id}>{link.relationshipType}: {link.sourceObject.name}</li>
                    ))}
                  </ul>
                )}

                <h3>Timeline</h3>
                {selected.events?.length ? (
                  <ul>
                    {selected.events.map((event) => (
                      <li key={event.id}><strong>{event.eventType}</strong>: {event.summary}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No timeline events yet.</p>
                )}
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
