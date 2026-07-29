"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getWorkItemData,
  getWorkItemLane,
  getWorkItemLocation,
  getWorkItemMetrics,
  isInvoiceReadyStatus,
  needsCrew,
  needsDocumentation,
  reynaldsBrothersFallbackWorkItems,
  type ReynaldsBrothersWorkItem
} from "../../lib/reynalds-brothers-work-items";

const lanes = ["Planning", "Field Work", "Waiting", "Billing", "Complete"];

const systemModules = [
  {
    title: "Work Items",
    body: "The work item is the center object. Tasks, photos, documents, customer updates, and invoices attach to it."
  },
  {
    title: "Sites and Customers",
    body: "Walmart stores, Zurn projects, commercial sites, contacts, access windows, and recurring customer rules stay visible."
  },
  {
    title: "Crew and Equipment",
    body: "Every job needs a crew lead, crew list, equipment list, materials check, travel readiness, and safety notes before field work."
  },
  {
    title: "Media and Documents",
    body: "Before photos, after photos, completion notes, disposal manifests, test reports, and paperwork drive billing readiness."
  },
  {
    title: "Billing Readiness",
    body: "Invoices should show whether scope, completion proof, customer approval, and pricing are ready."
  },
  {
    title: "Customer Updates",
    body: "The system should show who needs an update, what was promised, and what is waiting on the customer or a third party."
  }
];

const operatingRhythm = [
  "Morning: review attention jobs, crew readiness, access windows, and customer blockers.",
  "Before field work: confirm site contact, equipment, safety requirements, documentation needs, and billing scope.",
  "After field work: upload photos, completion notes, exceptions, customer update, and invoice readiness.",
  "Weekly: review open work items, unpaid work, repeat customers, route efficiency, and missing documentation."
];

type ApiPayload = {
  source?: string;
  workItems?: ReynaldsBrothersWorkItem[];
  warning?: string;
};

const defaultCreateForm = {
  name: "",
  serviceLine: "",
  customer: "",
  siteName: "",
  workType: "",
  nextAction: ""
};

export function ReynaldsBrothersOperationsSystem() {
  const [workItems, setWorkItems] = useState<ReynaldsBrothersWorkItem[]>(reynaldsBrothersFallbackWorkItems);
  const [selectedId, setSelectedId] = useState(reynaldsBrothersFallbackWorkItems[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("fallback");
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [statusUpdate, setStatusUpdate] = useState("Planning");
  const [healthUpdate, setHealthUpdate] = useState("Healthy");
  const [nextActionUpdate, setNextActionUpdate] = useState("");
  const [crewLeadUpdate, setCrewLeadUpdate] = useState("");
  const [invoiceStatusUpdate, setInvoiceStatusUpdate] = useState("Not Ready");
  const [customerUpdateStatus, setCustomerUpdateStatus] = useState("");

  async function loadWorkItems() {
    setError("");

    try {
      const response = await fetch("/api/reynalds-brothers/work-items");
      if (!response.ok) throw new Error("Failed to load Reynalds Brothers work items.");
      const payload = (await response.json()) as ApiPayload;
      const loaded = payload.workItems?.length ? payload.workItems : reynaldsBrothersFallbackWorkItems;
      setWorkItems(loaded);
      setSource(payload.source ?? "fallback");
      setSelectedId((current) => (loaded.some((item) => item.id === current) ? current : loaded[0]?.id ?? ""));
      if (payload.warning) setError(payload.warning);
    } catch (err) {
      setSource("fallback");
      setError(err instanceof Error ? err.message : "Using preview work items.");
      setWorkItems(reynaldsBrothersFallbackWorkItems);
    }
  }

  useEffect(() => {
    void loadWorkItems();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workItems;

    return workItems.filter((item) =>
      [item.name, item.status, item.health, item.nextAction ?? "", JSON.stringify(item.data ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, workItems]);

  const metrics = getWorkItemMetrics(filtered);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? workItems[0];
  const selectedData = selected ? getWorkItemData(selected) : {};
  const attentionItems = filtered.filter((item) => ["Watch", "Attention", "Critical"].includes(item.health));

  useEffect(() => {
    if (!selected) return;

    setStatusUpdate(selected.status);
    setHealthUpdate(selected.health);
    setNextActionUpdate(selected.nextAction ?? "");
    setCrewLeadUpdate(selectedData.crewLead ?? "");
    setInvoiceStatusUpdate(selectedData.invoiceStatus ?? "Not Ready");
    setCustomerUpdateStatus(selectedData.customerUpdateStatus ?? "");
  }, [selected, selectedData.crewLead, selectedData.customerUpdateStatus, selectedData.invoiceStatus]);

  async function createWorkItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/reynalds-brothers/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          status: "Intake",
          health: "Healthy",
          nextAction: createForm.nextAction,
          data: {
            serviceLine: createForm.serviceLine,
            customer: createForm.customer,
            siteName: createForm.siteName,
            workType: createForm.workType,
            phase: "Intake",
            invoiceStatus: "Not Ready",
            mediaStatus: "No media yet",
            customerUpdateStatus: "Needs first customer update"
          }
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be created.");

      setCreateForm(defaultCreateForm);
      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work Item could not be created.");
    }
  }

  async function updateSelectedWorkItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setError("");

    try {
      const response = await fetch(`/api/reynalds-brothers/work-items/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusUpdate,
          health: healthUpdate,
          nextAction: nextActionUpdate,
          data: {
            phase: statusUpdate,
            crewLead: crewLeadUpdate,
            invoiceStatus: invoiceStatusUpdate,
            customerUpdateStatus
          }
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be updated.");

      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work Item could not be updated.");
    }
  }

  return (
    <main className="ros-app rb-os">
      <aside className="ros-sidebar rb-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">RB</div>
          <div>
            <strong>Reynalds Brothers</strong>
            <span>Company Workspace</span>
          </div>
        </div>

        <nav>
          <a href="/">Reynalds OS</a>
          <a href="/reynalds-brothers" className="active">RB Operations</a>
          <a href="/operations">Shared Queue</a>
          <a href="/objects">Object Engine</a>
          <a href="/finance">Finance</a>
          <a href="/workflows">Workflows</a>
          <a href="/copilot">AI Copilot</a>
        </nav>
      </aside>

      <section className="ros-main rb-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search work items, stores, services, blockers..."
          />
          <button onClick={() => void loadWorkItems()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Object Engine</a>
        </header>

        <div className="ros-eyebrow">Company workspace</div>
        <h1>Reynalds Brothers Operations System</h1>
        <p className="ros-subtitle">
          A company-level command center for field service work, Walmart tank work, pressure washing,
          plumbing, backflow, grease interceptor projects, Zurn jobs, documents, billing readiness,
          and customer follow-through.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="rb-section rb-create-panel">
          <div>
            <div className="ros-eyebrow">Work Item intake</div>
            <h2>Create new work</h2>
          </div>

          <form className="rb-inline-form" onSubmit={createWorkItem}>
            <input
              required
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Work item name"
            />
            <input
              value={createForm.serviceLine}
              onChange={(event) => setCreateForm((current) => ({ ...current, serviceLine: event.target.value }))}
              placeholder="Service line"
            />
            <input
              value={createForm.customer}
              onChange={(event) => setCreateForm((current) => ({ ...current, customer: event.target.value }))}
              placeholder="Customer"
            />
            <input
              value={createForm.siteName}
              onChange={(event) => setCreateForm((current) => ({ ...current, siteName: event.target.value }))}
              placeholder="Site or store"
            />
            <input
              value={createForm.workType}
              onChange={(event) => setCreateForm((current) => ({ ...current, workType: event.target.value }))}
              placeholder="Work type"
            />
            <input
              required
              value={createForm.nextAction}
              onChange={(event) => setCreateForm((current) => ({ ...current, nextAction: event.target.value }))}
              placeholder="Next action"
            />
            <button type="submit">Create Work Item</button>
          </form>
        </section>

        <section className="rb-command-strip" aria-label="Reynalds Brothers operational metrics">
          <article className="rb-metric">
            <span>Open Work</span>
            <strong>{metrics.active}</strong>
            <p>{source === "database" ? "live company records" : "preview records"}</p>
          </article>
          <article className="rb-metric">
            <span>Needs Attention</span>
            <strong>{metrics.attention}</strong>
            <p>watch, attention, or critical</p>
          </article>
          <article className="rb-metric">
            <span>Missing Crew</span>
            <strong>{metrics.missingCrew}</strong>
            <p>needs a crew lead</p>
          </article>
          <article className="rb-metric">
            <span>Docs Needed</span>
            <strong>{metrics.missingDocumentation}</strong>
            <p>proof or paperwork pending</p>
          </article>
        </section>

        <section className="rb-layout">
          <div className="rb-board" aria-label="Work item lanes">
            {lanes.map((lane) => {
              const laneItems = filtered.filter((item) => getWorkItemLane(item) === lane);

              return (
                <section className="rb-lane" key={lane}>
                  <div className="rb-lane-heading">
                    <h2>{lane}</h2>
                    <span>{laneItems.length}</span>
                  </div>

                  <div className="rb-card-stack">
                    {laneItems.length === 0 ? <p className="rb-empty">No work in this lane.</p> : null}
                    {laneItems.map((item) => {
                      const data = getWorkItemData(item);

                      return (
                        <button
                          className={item.id === selected?.id ? "rb-work-card active" : "rb-work-card"}
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          type="button"
                        >
                          <span className="rb-service">{data.serviceLine ?? "Service"}</span>
                          <strong>{item.name}</strong>
                          <small>{getWorkItemLocation(item)}</small>
                          <span className={`rb-health ${item.health.toLowerCase()}`}>{item.health}</span>
                          <p>{item.nextAction ?? "Set the next action."}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="rb-detail" aria-label="Selected work item details">
            {!selected ? (
              <p>Select a work item.</p>
            ) : (
              <>
                <div className="rb-detail-heading">
                  <div>
                    <span className="rb-service">{selectedData.serviceLine ?? "Work Item"}</span>
                    <h2>{selected.name}</h2>
                    <p>{getWorkItemLocation(selected)}</p>
                  </div>
                  <span className={`rb-health ${selected.health.toLowerCase()}`}>{selected.health}</span>
                </div>

                <dl className="rb-detail-grid">
                  <div>
                    <dt>Customer</dt>
                    <dd>{selectedData.customer ?? "Customer TBD"}</dd>
                  </div>
                  <div>
                    <dt>Work Order</dt>
                    <dd>{selectedData.workOrderNumber ?? "WO TBD"}</dd>
                  </div>
                  <div>
                    <dt>Phase</dt>
                    <dd>{selectedData.phase ?? selected.status}</dd>
                  </div>
                  <div>
                    <dt>Crew Lead</dt>
                    <dd>{selectedData.crewLead ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Invoice</dt>
                    <dd>{selectedData.invoiceStatus ?? "Not Ready"}</dd>
                  </div>
                  <div>
                    <dt>Customer Update</dt>
                    <dd>{selectedData.customerUpdateStatus ?? "Not set"}</dd>
                  </div>
                </dl>

                <section className="rb-checklist">
                  <h3>Readiness</h3>
                  <ul>
                    <li className={needsCrew(selected) ? "missing" : "ready"}>
                      Crew assignment {needsCrew(selected) ? "needed" : "ready"}
                    </li>
                    <li className={needsDocumentation(selected) ? "missing" : "ready"}>
                      Documentation {needsDocumentation(selected) ? "pending" : "complete"}
                    </li>
                    <li className={isInvoiceReadyStatus(selectedData.invoiceStatus) ? "ready" : "missing"}>
                      Billing {isInvoiceReadyStatus(selectedData.invoiceStatus) ? "ready" : "not ready"}
                    </li>
                  </ul>
                </section>

                <section className="rb-mini-columns">
                  <div>
                    <h3>Equipment</h3>
                    <ul>
                      {(selectedData.equipmentRequired ?? ["Equipment list needed"]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Documents</h3>
                    <ul>
                      {(selectedData.documentationRequired ?? ["Document list needed"]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h3>Next Action</h3>
                  <p>{selected.nextAction ?? "No next action set."}</p>
                </section>

                <form className="rb-update-form" onSubmit={updateSelectedWorkItem}>
                  <h3>Update Work Item</h3>
                  <label>
                    Status
                    <select value={statusUpdate} onChange={(event) => setStatusUpdate(event.target.value)}>
                      {["Intake", "Planning", "Field Work", "Waiting on Customer", "Billing", "Complete"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Health
                    <select value={healthUpdate} onChange={(event) => setHealthUpdate(event.target.value)}>
                      {["Healthy", "Watch", "Attention", "Critical"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Crew Lead
                    <input value={crewLeadUpdate} onChange={(event) => setCrewLeadUpdate(event.target.value)} />
                  </label>
                  <label>
                    Invoice Status
                    <select value={invoiceStatusUpdate} onChange={(event) => setInvoiceStatusUpdate(event.target.value)}>
                      {["Not Ready", "Blocked", "Ready to Invoice", "Invoice Sent", "Paid"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Customer Update
                    <input value={customerUpdateStatus} onChange={(event) => setCustomerUpdateStatus(event.target.value)} />
                  </label>
                  <label>
                    Next Action
                    <input value={nextActionUpdate} onChange={(event) => setNextActionUpdate(event.target.value)} />
                  </label>
                  <button type="submit">Save Update</button>
                </form>
              </>
            )}
          </aside>
        </section>

        <section className="rb-section">
          <div className="rb-section-heading">
            <div>
              <div className="ros-eyebrow">Build-out map</div>
              <h2>What Reynalds Brothers needs inside Reynalds OS</h2>
            </div>
          </div>

          <div className="rb-module-grid">
            {systemModules.map((module) => (
              <article className="rb-module" key={module.title}>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rb-two-column">
          <article className="rb-section">
            <div className="ros-eyebrow">Attention stack</div>
            <h2>Review first</h2>
            {attentionItems.length === 0 ? <p>No attention items in the current queue.</p> : null}
            <ul className="rb-alert-list">
              {attentionItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.nextAction ?? "Review this work item."}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rb-section">
            <div className="ros-eyebrow">Operating rhythm</div>
            <h2>How the company should run each week</h2>
            <ol className="rb-rhythm">
              {operatingRhythm.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      </section>
    </main>
  );
}
