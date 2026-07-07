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

export function CrmMvp() {
  const [relationships, setRelationships] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<RosObject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return relationships;
    return relationships.filter((relationship) =>
      [relationship.name, relationship.status, relationship.health, relationship.nextAction ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [relationships, search]);

  async function loadRelationships() {
    setError("");
    try {
      const response = await fetch("/api/objects?objectType=Relationship");
      if (!response.ok) throw new Error("Failed to load CRM relationships.");
      const data = await response.json();
      setRelationships(data.objects ?? []);
      if (!selected && data.objects?.[0]) await loadRelationship(data.objects[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadRelationship(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/objects/${id}`);
      if (!response.ok) throw new Error("Failed to load relationship.");
      const data = await response.json();
      setSelected(data.object);
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

  async function createFollowUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !taskTitle.trim()) return;

    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedObjectId: selected.id,
          title: taskTitle,
          priority: "Normal",
          status: "Open"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create follow-up.");
      }

      setTaskTitle("");
      await loadRelationship(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadRelationships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>CRM · v8.8</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/objects">Object Explorer</a>
          <a href="/crm" className="active">CRM</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search relationships..." />
          <button onClick={() => void loadRelationships()}>Refresh</button>
          <a className="ros-button-link" href="/objects">+ New Relationship</a>
        </header>

        <div className="ros-eyebrow">ROS-0073 · CRM MVP</div>
        <h1>CRM Relationship Center</h1>
        <p className="ros-subtitle">
          Database-backed CRM built from Relationship objects in the shared Object Engine.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Relationships</h2>
            {filtered.length === 0 ? <p>No relationships found. Create a Relationship object from Object Explorer.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((relationship) => (
                  <tr key={relationship.id} onClick={() => void loadRelationship(relationship.id)}>
                    <td>
                      <strong>{relationship.name}</strong>
                      <span>{relationship.id}</span>
                    </td>
                    <td>{relationship.status}</td>
                    <td>{relationship.health}</td>
                    <td>{relationship.nextAction ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Relationship Profile</h2>
            {!selected ? (
              <p>Select a relationship.</p>
            ) : (
              <>
                <p><strong>{selected.id}</strong></p>
                <h3>{selected.name}</h3>
                <p>{selected.status} · {selected.health}</p>
                <p><strong>Next action:</strong> {selected.nextAction ?? "None"}</p>

                <h3>Create Follow-Up</h3>
                <form className="ros-form" onSubmit={createFollowUp}>
                  <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Follow-up task title" />
                  <button>Create Follow-Up</button>
                </form>

                <h3>Open Follow-Ups</h3>
                {tasks.length === 0 ? <p>No follow-up tasks yet.</p> : null}
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}><strong>{task.priority}</strong> · {task.title} · {task.status}</li>
                  ))}
                </ul>

                <h3>Related Objects</h3>
                {[...(selected.sourceLinks ?? []), ...(selected.targetLinks ?? [])].length === 0 ? (
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
