"use client";

import { useEffect, useState } from "react";

const nav = [
  "Dashboard",
  "CRM",
  "Transactions",
  "Contracts",
  "Showings",
  "Operations",
  "Finance",
  "Customer Success",
  "Knowledge",
  "Reports",
  "Administration",
  "Object Explorer",
  "Timeline",
  "Workflows",
  "Automations",
  "Intelligence"
];

type Metric = {
  label: string;
  value: string;
  note: string;
};

function navHref(item: string) {
  if (item === "CRM") return "/crm";
  if (item === "Transactions") return "/transactions";
  if (item === "Operations") return "/operations";
  if (item === "Finance") return "/finance";
  if (item === "Object Explorer") return "/objects";
  return "#";
}

export function DashboardShell() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [error, setError] = useState("");

  async function loadMetrics() {
    setError("");

    try {
      const response = await fetch("/api/analytics/dashboard");
      if (!response.ok) throw new Error("Failed to load dashboard metrics.");
      const data = await response.json();
      setMetrics(data.metrics ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setMetrics([
        { label: "Core Services", value: "4", note: "production certified" },
        { label: "Platform Version", value: "9.2", note: "database dashboard" },
        { label: "Object Engine", value: "Ready", note: "schema defined" },
        { label: "MVP Epics", value: "12", note: "build backlog" }
      ]);
    }
  }

  useEffect(() => {
    void loadMetrics();
  }, []);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Koinonia ERP · v9.2</span>
          </div>
        </div>

        <nav>
          {nav.map((item) => (
            <a key={item} href={navHref(item)} className={item === "Dashboard" ? "active" : ""}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input placeholder="Search objects, transactions, SOPs, commands..." />
          <button onClick={() => void loadMetrics()}>Refresh</button>
          <button>AI Command</button>
        </header>

        <div className="ros-eyebrow">ROS-0077 · Database Dashboard Metrics</div>
        <h1>Reynalds OS Dashboard</h1>
        <p className="ros-subtitle">
          Database-backed executive dashboard powered by objects, tasks, invoices, and timeline events.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid">
          {metrics.map((metric) => (
            <article className="ros-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="ros-object-layout" style={{ marginTop: 18 }}>
          <article className="ros-card">
            <h2>Primary Workflows</h2>
            <table className="ros-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Path</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CRM</strong></td>
                  <td><a href="/crm">Open CRM</a></td>
                  <td>Manage Relationship objects and follow-ups.</td>
                </tr>
                <tr>
                  <td><strong>Transactions</strong></td>
                  <td><a href="/transactions">Open Transactions</a></td>
                  <td>Manage transaction health, status, tasks, and timeline.</td>
                </tr>
                <tr>
                  <td><strong>Operations</strong></td>
                  <td><a href="/operations">Open Queue</a></td>
                  <td>Prioritize and complete task work.</td>
                </tr>
                <tr>
                  <td><strong>Finance</strong></td>
                  <td><a href="/finance">Open Finance</a></td>
                  <td>Create invoices and track payment status.</td>
                </tr>
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Dashboard Rule</h2>
            <p>Dashboard numbers should be computed from the database, not hardcoded into the interface.</p>
            <h3>Current Sources</h3>
            <ul>
              <li>Objects</li>
              <li>Tasks</li>
              <li>Invoices</li>
              <li>Timeline Events</li>
            </ul>
          </aside>
        </section>
      </section>
    </main>
  );
}
