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
};

export function OperationsQueueMvp() {
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadObjects() {
    setError("");

    try {
      const response = await fetch("/api/objects?objectType=rb.work_item");
      if (!response.ok) throw new Error("Failed to load Reynalds Brothers work items.");
      const data = await response.json();
      setObjects(data.objects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadObjects();
  }, []);

  const workItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return objects;

    return objects.filter((item) =>
      [item.name, item.status, item.health, item.nextAction ?? "", JSON.stringify(item.data ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [objects, search]);

  const criticalItems = workItems.filter((item) => ["Critical", "Watch", "Attention"].includes(item.health));
  const waitingItems = workItems.filter((item) => item.status.toLowerCase().includes("waiting"));
  const planningItems = workItems.filter((item) => item.status.toLowerCase().includes("planning"));
  const activeItems = workItems.filter((item) => !["Complete", "Closed", "Archived"].includes(item.status));

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">RB</div>
          <div>
            <strong>Reynalds Brothers</strong>
            <span>Operations Center</span>
          </div>
        </div>

        <nav>
          <a href="/">Command Center</a>
          <a href="/operations" className="active">Operations</a>
          <a href="/objects">Object Explorer</a>
          <a href="/workflows">Workflows</a>
          <a href="/copilot">AI Copilot</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs, stores, service lines, cities..."
          />
          <button onClick={() => void loadObjects()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Open Object Engine</a>
        </header>

        <div className="ros-eyebrow">RB-001 · Operational OS</div>
        <h1>Reynalds Brothers Operations Center</h1>
        <p className="ros-subtitle">
          Daily command console for active field work, job health, next actions, and operational attention.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Active Jobs</span>
            <strong>{activeItems.length}</strong>
            <p>open work items</p>
          </article>

          <article className="ros-card">
            <span>Needs Attention</span>
            <strong>{criticalItems.length}</strong>
            <p>watch, attention, or critical</p>
          </article>

          <article className="ros-card">
            <span>Planning</span>
            <strong>{planningItems.length}</strong>
            <p>scope and preparation</p>
          </article>

          <article className="ros-card">
            <span>Waiting</span>
            <strong>{waitingItems.length}</strong>
            <p>blocked or pending</p>
          </article>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Active Work Orders</h2>
            {workItems.length === 0 ? <p>No Reynalds Brothers work items found.</p> : null}

            <div style={{ display: "grid", gap: 14 }}>
              {workItems.map((item) => {
                const data = item.data ?? {};
                const customer = String(data.customer ?? "Customer TBD");
                const storeNumber = String(data.storeNumber ?? "");
                const city = String(data.city ?? "");
                const state = String(data.state ?? "");
                const serviceLine = String(data.serviceLine ?? "Service Line TBD");
                const workType = String(data.workType ?? "Work Type TBD");

                return (
                  <article key={item.id} className="ros-card">
                    <div className="ros-eyebrow">{serviceLine}</div>
                    <h3>{item.name}</h3>

                    <p>
                      <strong>{customer}</strong>
                      {storeNumber ? ` · Store ${storeNumber}` : ""}
                      {(city || state) ? ` · ${city}${city && state ? ", " : ""}${state}` : ""}
                    </p>

                    <table className="ros-table">
                      <tbody>
                        <tr>
                          <th>Status</th>
                          <td>{item.status}</td>
                        </tr>
                        <tr>
                          <th>Health</th>
                          <td>{item.health}</td>
                        </tr>
                        <tr>
                          <th>Work Type</th>
                          <td>{workType}</td>
                        </tr>
                        <tr>
                          <th>Next Action</th>
                          <td>{item.nextAction ?? "No next action set."}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p style={{ marginTop: 12 }}>
                      <a className="ros-button-link" href={`/objects?selected=${item.id}`}>
                        Open Work Item
                      </a>
                    </p>
                  </article>
                );
              })}
            </div>
          </article>

          <aside className="ros-card">
            <h2>Operational Alerts</h2>

            {criticalItems.length === 0 ? (
              <p>No critical operational alerts detected.</p>
            ) : (
              <ul>
                {criticalItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.health}</strong>: {item.name}
                    <br />
                    <span>{item.nextAction ?? "Review this work item."}</span>
                  </li>
                ))}
              </ul>
            )}

            <h2 style={{ marginTop: 24 }}>AI Operations Assistant</h2>
            <p>
              Next build: evaluate work items for missing photos, crew assignment, equipment assignment,
              disposal documentation, invoice readiness, and customer update recommendations.
            </p>

            <h3>Operating Rule</h3>
            <p>
              Reynalds Brothers should organize around work orders first. Tasks, photos, documents,
              invoices, and communications support the work order.
            </p>
          </aside>
        </section>
      </section>
    </main>
  );
}
