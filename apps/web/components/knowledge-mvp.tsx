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

const knowledgeTypes = ["Service", "Workflow", "Template", "Decision Playbook", "SOP"];

export function KnowledgeMvp() {
  const [items, setItems] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<RosObject | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesType = typeFilter === "All" || item.objectType === typeFilter;
      const matchesSearch = !q || [item.id, item.objectType, item.name, item.status, item.health, item.nextAction ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);

      return matchesType && matchesSearch;
    });
  }, [items, search, typeFilter]);

  async function loadKnowledge() {
    setError("");

    try {
      const allItems: RosObject[] = [];

      for (const objectType of knowledgeTypes) {
        const response = await fetch(`/api/objects?objectType=${encodeURIComponent(objectType)}`);
        if (response.ok) {
          const data = await response.json();
          allItems.push(...(data.objects ?? []));
        }
      }

      setItems(allItems);
      if (!selected && allItems[0]) await loadItem(allItems[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadItem(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/objects/${id}`);
      if (!response.ok) throw new Error("Failed to load knowledge item.");
      const data = await response.json();
      setSelected(data.object);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function seedServiceObject() {
    setError("");

    try {
      const response = await fetch("/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectType: "Service",
          name: "Business Operations Support Service",
          status: "Production Certified",
          health: "Healthy",
          nextAction: "Monitor service improvement opportunities",
          data: {
            objectId: "OBJ-00000005",
            module: "Koinonia",
            category: "Core Service"
          }
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create service object.");
      }

      await loadKnowledge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  const relatedObjects = selected ? [...(selected.sourceLinks ?? []), ...(selected.targetLinks ?? [])] : [];
  const certifiedCount = items.filter((item) => item.status.toLowerCase().includes("certified")).length;

  useEffect(() => {
    void loadKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Knowledge · v9.3</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations">Operations</a>
          <a href="/finance">Finance</a>
          <a href="/knowledge" className="active">Knowledge</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services, workflows, templates, SOPs..." />
          <button onClick={() => void loadKnowledge()}>Refresh</button>
          <button onClick={() => void seedServiceObject()}>+ Seed Service</button>
        </header>

        <div className="ros-eyebrow">ROS-0078 · Knowledge MVP</div>
        <h1>Knowledge Center</h1>
        <p className="ros-subtitle">
          Database-backed knowledge library powered by Service, Workflow, Template, Decision Playbook, and SOP objects.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Knowledge Items</span>
            <strong>{items.length}</strong>
            <p>loaded objects</p>
          </article>
          <article className="ros-card">
            <span>Certified</span>
            <strong>{certifiedCount}</strong>
            <p>production-ready</p>
          </article>
          <article className="ros-card">
            <span>Types</span>
            <strong>{new Set(items.map((item) => item.objectType)).size}</strong>
            <p>object categories</p>
          </article>
          <article className="ros-card">
            <span>Related</span>
            <strong>{relatedObjects.length}</strong>
            <p>selected context</p>
          </article>
        </section>

        <section className="ros-panel">
          <div className="ros-filters">
            {["All", ...knowledgeTypes].map((type) => (
              <button key={type} className={typeFilter === type ? "active" : ""} onClick={() => setTypeFilter(type)}>
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Knowledge Library</h2>
            {filtered.length === 0 ? <p>No knowledge objects found. Use Object Explorer or Seed Service to add one.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => void loadItem(item.id)}>
                    <td>
                      <strong>{item.name}</strong>
                      <span>{item.id}</span>
                    </td>
                    <td>{item.objectType}</td>
                    <td>{item.status}</td>
                    <td>{item.health}</td>
                    <td>{item.nextAction ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Knowledge Detail</h2>
            {!selected ? (
              <p>Select a knowledge object.</p>
            ) : (
              <>
                <p><strong>{selected.id}</strong></p>
                <h3>{selected.name}</h3>
                <p>{selected.objectType} · {selected.status} · {selected.health}</p>
                <p><strong>Next action:</strong> {selected.nextAction ?? "None"}</p>

                <h3>Metadata</h3>
                {selected.data ? (
                  <pre className="ros-code">{JSON.stringify(selected.data, null, 2)}</pre>
                ) : (
                  <p>No metadata stored.</p>
                )}

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
