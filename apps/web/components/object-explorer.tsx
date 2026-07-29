"use client";

import { useEffect, useMemo, useState } from "react";

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  ownerId?: string | null;
  clientUserId?: string | null;
  clientObjectId?: string | null;
  assignedStaffUserId?: string | null;
  backupStaffUserId?: string | null;
  nextAction?: string | null;
  updatedAt?: string;
};

type ObjectDetail = RosObject & {
  events?: Array<{
    id: string;
    eventType: string;
    summary: string;
    createdAt: string;
  }>;
  sourceLinks?: Array<{
    id: string;
    relationshipType: string;
    targetObject: RosObject;
  }>;
  targetLinks?: Array<{
    id: string;
    relationshipType: string;
    sourceObject: RosObject;
  }>;
};

type ObjectFormState = {
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction: string;
};

type RelationshipFormState = {
  targetObjectId: string;
  relationshipType: string;
};

const blankForm: ObjectFormState = {
  objectType: "Task",
  name: "",
  status: "Open",
  health: "Healthy",
  nextAction: ""
};

const blankRelationshipForm: RelationshipFormState = {
  targetObjectId: "",
  relationshipType: "related_to"
};

const objectTypes = ["All", "Relationship", "Transaction", "Task", "Invoice", "Service", "Property", "Workflow"];
const createObjectTypes = ["Relationship", "Transaction", "Task", "Invoice", "Service", "Property", "Workflow", "Customer Success"];
const statuses = ["Open", "Active", "Closing Prep", "Due Now", "Paid", "Waiting on Client", "Complete", "Archived"];
const healthStates = ["Healthy", "Attention", "Critical"];

export function ObjectExplorer() {
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<ObjectDetail | null>(null);
  const [objectType, setObjectType] = useState("All");
  const [status, setStatus] = useState("");
  const [health, setHealth] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState<ObjectFormState>(blankForm);
  const [editForm, setEditForm] = useState<ObjectFormState>(blankForm);
  const [relationshipForm, setRelationshipForm] = useState<RelationshipFormState>(blankRelationshipForm);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (objectType !== "All") params.set("objectType", objectType);
    if (status) params.set("status", status);
    if (health) params.set("health", health);
    return params.toString();
  }, [objectType, status, health]);

  const filteredObjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter((object) =>
      [object.id, object.objectType, object.name, object.status, object.health, object.nextAction ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [objects, search]);

  async function loadObjects() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/objects${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Failed to load objects.");
      const data = await response.json();
      setObjects(data.objects ?? []);
      if (!selected && data.objects?.[0]) {
        await loadObjectDetail(data.objects[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadObjectDetail(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/objects/${id}`);
      if (!response.ok) throw new Error("Failed to load object detail.");
      const data = await response.json();
      setSelected(data.object);
      setRelationshipForm(blankRelationshipForm);
      setEditForm({
        objectType: data.object.objectType ?? "Task",
        name: data.object.name ?? "",
        status: data.object.status ?? "Open",
        health: data.object.health ?? "Healthy",
        nextAction: data.object.nextAction ?? ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function createObject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create object.");
      }

      const data = await response.json();
      setCreateForm(blankForm);
      await loadObjects();
      await loadObjectDetail(data.object.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateObject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/objects/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to update object.");
      }

      await loadObjects();
      await loadObjectDetail(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createRelationship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setIsSaving(true);
    setError("");

    try {
      if (!relationshipForm.targetObjectId) {
        throw new Error("Select a target object.");
      }

      const response = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceObjectId: selected.id,
          targetObjectId: relationshipForm.targetObjectId,
          relationshipType: relationshipForm.relationshipType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create relationship.");
      }

      setRelationshipForm(blankRelationshipForm);
      await loadObjectDetail(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveObject(id: string) {
    const response = await fetch(`/api/objects/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to archive object.");
      return;
    }

    setSelected(null);
    await loadObjects();
  }

  useEffect(() => {
    void loadObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Object Explorer · v8.7</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/objects" className="active">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search objects locally..." />
          <button onClick={() => void loadObjects()}>Refresh</button>
          <button onClick={() => setCreateForm(blankForm)}>+ New Object</button>
        </header>

        <div className="ros-eyebrow">ROS-0072 · Search and Relationships</div>
        <h1>Object Explorer</h1>
        <p className="ros-subtitle">
          Search, create, update, relate, inspect, and archive shared ROS objects through the production Object API.
        </p>

        <section className="ros-panel">
          <div className="ros-filters">
            {objectTypes.map((type) => (
              <button
                key={type}
                className={objectType === type ? "active" : ""}
                onClick={() => setObjectType(type)}
              >
                {type}
              </button>
            ))}

            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Any status</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <select value={health} onChange={(event) => setHealth(event.target.value)}>
              <option value="">Any health</option>
              {healthStates.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </section>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-object-layout">
          <div>
            <article className="ros-card">
              <h2>Create Object</h2>
              <form className="ros-form" onSubmit={createObject}>
                <select value={createForm.objectType} onChange={(event) => setCreateForm({ ...createForm, objectType: event.target.value })}>
                  {createObjectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} placeholder="Name" />
                <select value={createForm.status} onChange={(event) => setCreateForm({ ...createForm, status: event.target.value })}>
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={createForm.health} onChange={(event) => setCreateForm({ ...createForm, health: event.target.value })}>
                  {healthStates.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={createForm.nextAction} onChange={(event) => setCreateForm({ ...createForm, nextAction: event.target.value })} placeholder="Next Action" />
                <button disabled={isSaving}>{isSaving ? "Saving..." : "Create Object"}</button>
              </form>
            </article>

            <article className="ros-card" style={{ marginTop: 18 }}>
              <h2>Object Registry</h2>
              {isLoading ? <p>Loading objects...</p> : null}
              {!isLoading && filteredObjects.length === 0 ? <p>No objects found.</p> : null}

              <table className="ros-table">
                <thead>
                  <tr>
                    <th>Object</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredObjects.map((object) => (
                    <tr key={object.id} onClick={() => void loadObjectDetail(object.id)}>
                      <td>
                        <strong>{object.name}</strong>
                        <span>{object.id}</span>
                      </td>
                      <td>{object.objectType}</td>
                      <td>{object.status}</td>
                      <td>{object.health}</td>
                      <td>{object.nextAction ?? "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>

          <aside className="ros-card">
            <h2>Object Detail</h2>
            {!selected ? (
              <p>Select an object to inspect details.</p>
            ) : (
              <>
                <p><strong>{selected.id}</strong></p>

                <form className="ros-form" onSubmit={updateObject}>
                  <select value={editForm.objectType} onChange={(event) => setEditForm({ ...editForm, objectType: event.target.value })}>
                    {createObjectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                  <select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select value={editForm.health} onChange={(event) => setEditForm({ ...editForm, health: event.target.value })}>
                    {healthStates.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <input value={editForm.nextAction} onChange={(event) => setEditForm({ ...editForm, nextAction: event.target.value })} />
                  <button disabled={isSaving}>{isSaving ? "Saving..." : "Update Object"}</button>
                </form>

                <button onClick={() => void archiveObject(selected.id)} style={{ marginTop: 10 }}>Archive Object</button>

                <h3>Create Relationship</h3>
                <form className="ros-form" onSubmit={createRelationship}>
                  <select value={relationshipForm.targetObjectId} onChange={(event) => setRelationshipForm({ ...relationshipForm, targetObjectId: event.target.value })}>
                    <option value="">Select target object</option>
                    {objects.filter((object) => object.id !== selected.id).map((object) => (
                      <option key={object.id} value={object.id}>{object.name} · {object.objectType}</option>
                    ))}
                  </select>
                  <input value={relationshipForm.relationshipType} onChange={(event) => setRelationshipForm({ ...relationshipForm, relationshipType: event.target.value })} placeholder="Relationship Type" />
                  <button disabled={isSaving}>Create Relationship</button>
                </form>

                <h3>Related Objects</h3>
                {[...(selected.sourceLinks ?? []), ...(selected.targetLinks ?? [])].length === 0 ? (
                  <p>No relationships yet.</p>
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
                      <li key={event.id}>
                        <strong>{event.eventType}</strong>: {event.summary}
                      </li>
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
