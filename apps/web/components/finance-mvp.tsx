"use client";

import { useEffect, useMemo, useState } from "react";

type Invoice = {
  id: string;
  clientObjectId: string;
  relatedObjectId?: string | null;
  packageObjectId?: string | null;
  amount: string;
  status: string;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
};

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
};

export function FinanceMvp() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [clientObjectId, setClientObjectId] = useState("");
  const [relatedObjectId, setRelatedObjectId] = useState("");
  const [amount, setAmount] = useState("389");
  const [error, setError] = useState("");

  const objectMap = useMemo(() => new Map(objects.map((object) => [object.id, object])), [objects]);

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const pendingRevenue = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  async function loadInvoices() {
    setError("");
    try {
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to load invoices.");
      const data = await response.json();
      setInvoices(data.invoices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadObjects() {
    const response = await fetch("/api/objects");
    if (!response.ok) return;
    const data = await response.json();
    setObjects(data.objects ?? []);
    const firstClient = data.objects?.find((object: RosObject) => ["Relationship", "Client"].includes(object.objectType));
    const firstRelated = data.objects?.find((object: RosObject) => ["Transaction", "Task", "Service"].includes(object.objectType));
    if (firstClient) setClientObjectId(firstClient.id);
    if (firstRelated) setRelatedObjectId(firstRelated.id);
  }

  async function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientObjectId,
          relatedObjectId: relatedObjectId || undefined,
          amount,
          status: "Pending"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create invoice.");
      }

      await loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function markPaid(id: string) {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Paid" })
    });

    if (!response.ok) {
      setError("Failed to mark invoice paid.");
      return;
    }

    await loadInvoices();
  }

  useEffect(() => {
    void loadObjects();
    void loadInvoices();
  }, []);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Finance · v9.1</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations">Operations</a>
          <a href="/finance" className="active">Finance</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input placeholder="Search invoices coming next..." disabled />
          <button onClick={() => void loadInvoices()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Open Objects</a>
        </header>

        <div className="ros-eyebrow">ROS-0076 · Finance MVP</div>
        <h1>Finance Center</h1>
        <p className="ros-subtitle">
          Database-backed invoices, payment status, and revenue metrics linked to shared ROS objects.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Paid Revenue</span>
            <strong>${paidRevenue.toFixed(0)}</strong>
            <p>paid invoices</p>
          </article>
          <article className="ros-card">
            <span>Pending Revenue</span>
            <strong>${pendingRevenue.toFixed(0)}</strong>
            <p>not yet paid</p>
          </article>
          <article className="ros-card">
            <span>Invoices</span>
            <strong>{invoices.length}</strong>
            <p>total records</p>
          </article>
          <article className="ros-card">
            <span>Unpaid</span>
            <strong>{invoices.filter((invoice) => invoice.status !== "Paid").length}</strong>
            <p>need follow-up</p>
          </article>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Create Invoice</h2>
            <form className="ros-form" onSubmit={createInvoice}>
              <select value={clientObjectId} onChange={(event) => setClientObjectId(event.target.value)}>
                <option value="">Select client/relationship</option>
                {objects.map((object) => (
                  <option key={object.id} value={object.id}>{object.name} · {object.objectType}</option>
                ))}
              </select>
              <select value={relatedObjectId} onChange={(event) => setRelatedObjectId(event.target.value)}>
                <option value="">Optional related object</option>
                {objects.map((object) => (
                  <option key={object.id} value={object.id}>{object.name} · {object.objectType}</option>
                ))}
              </select>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
              <button>Create Invoice</button>
            </form>

            <h2 style={{ marginTop: 24 }}>Invoices</h2>
            {invoices.length === 0 ? <p>No invoices found.</p> : null}
            <table className="ros-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Related</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoice.id}</strong>
                      <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>{objectMap.get(invoice.clientObjectId)?.name ?? invoice.clientObjectId}</td>
                    <td>{invoice.relatedObjectId ? objectMap.get(invoice.relatedObjectId)?.name ?? invoice.relatedObjectId : "None"}</td>
                    <td>{invoice.status}</td>
                    <td>${Number(invoice.amount).toFixed(2)}</td>
                    <td>{invoice.status !== "Paid" ? <button onClick={() => void markPaid(invoice.id)}>Mark Paid</button> : "Paid"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Finance Rules</h2>
            <p>Every dollar should connect to a client, service/package, invoice, payment status, and related operational object when applicable.</p>

            <h3>Current MVP</h3>
            <ul>
              <li>Create invoices</li>
              <li>Mark invoices paid</li>
              <li>Track paid vs pending revenue</li>
              <li>Create timeline events on invoice changes</li>
            </ul>

            <h3>Next Build</h3>
            <p>Add payment records, invoice detail page, package selection, and revenue by service.</p>
          </aside>
        </section>
      </section>
    </main>
  );
}
