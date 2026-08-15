"use client";

import { useEffect, useMemo, useState } from "react";
import {
  mergeKoinoniaRelationshipData,
  normalizeKoinoniaRelationshipData,
  relationshipLifecycleStages,
  relationshipMaterialOptions,
  relationshipPaths,
  relationshipPressureCategories,
  relationshipServiceOptions,
  relationshipSources,
  type KoinoniaRelationshipData
} from "../lib/koinonia-relationship";
import { RelationshipQuickCapture } from "./relationship-quick-capture";

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

type RelationshipForm = {
  name: string;
  status: string;
  health: string;
  nextAction: string;
  email: string;
  phone: string;
  role: string;
  brokerage: string;
  market: string;
  source: string;
  sourceDetail: string;
  material: string;
  campaign: string;
  primaryPressure: string;
  exactLanguage: string;
  objection: string;
  desiredOutcome: string;
  path: string;
  requestedService: string;
  recommendedService: string;
  rationale: string;
};

const blankForm: RelationshipForm = {
  name: "",
  status: "Lead",
  health: "Healthy",
  nextAction: "",
  email: "",
  phone: "",
  role: "Realtor",
  brokerage: "",
  market: "",
  source: "",
  sourceDetail: "",
  material: "",
  campaign: "",
  primaryPressure: "",
  exactLanguage: "",
  objection: "",
  desiredOutcome: "",
  path: "Undetermined",
  requestedService: "",
  recommendedService: "",
  rationale: ""
};

function canonicalLifecycleStatus(status: string) {
  const legacyMap: Record<string, string> = {
    Open: "Lead",
    Active: "Client",
    "Active Client": "Client",
    Complete: "Successful Delivery",
    Closed: "Successful Delivery"
  };

  return legacyMap[status] ?? status;
}

function relationshipToForm(relationship: RosObject): RelationshipForm {
  const profile = normalizeKoinoniaRelationshipData(relationship.data);

  return {
    name: relationship.name,
    status: canonicalLifecycleStatus(relationship.status),
    health: relationship.health,
    nextAction: relationship.nextAction ?? "",
    email: profile.contact?.email ?? "",
    phone: profile.contact?.phone ?? "",
    role: profile.contact?.role ?? "",
    brokerage: profile.contact?.brokerage ?? "",
    market: profile.contact?.market ?? "",
    source: profile.acquisition?.source ?? "",
    sourceDetail: profile.acquisition?.sourceDetail ?? "",
    material: profile.acquisition?.material ?? "",
    campaign: profile.acquisition?.campaign ?? "",
    primaryPressure: profile.problem?.primaryPressure ?? "",
    exactLanguage: profile.problem?.exactLanguage ?? "",
    objection: profile.problem?.objection ?? "",
    desiredOutcome: profile.problem?.desiredOutcome ?? "",
    path: profile.diagnosis?.path ?? "Undetermined",
    requestedService: profile.diagnosis?.requestedService ?? "",
    recommendedService: profile.diagnosis?.recommendedService ?? "",
    rationale: profile.diagnosis?.rationale ?? ""
  };
}

function formToProfile(form: RelationshipForm): KoinoniaRelationshipData {
  return {
    relationshipProfileVersion: 1,
    contact: {
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
      brokerage: form.brokerage.trim(),
      market: form.market.trim()
    },
    acquisition: {
      source: form.source,
      sourceDetail: form.sourceDetail.trim(),
      material: form.material,
      campaign: form.campaign.trim(),
      firstTouchChannel: form.source === "Website" ? "Website" : ""
    },
    problem: {
      primaryPressure: form.primaryPressure,
      exactLanguage: form.exactLanguage.trim(),
      objection: form.objection.trim(),
      desiredOutcome: form.desiredOutcome.trim()
    },
    diagnosis: {
      path: form.path,
      requestedService: form.requestedService,
      recommendedService: form.recommendedService,
      rationale: form.rationale.trim()
    }
  };
}

export function CrmMvp() {
  const [relationships, setRelationships] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<RosObject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [createForm, setCreateForm] = useState<RelationshipForm>(blankForm);
  const [editForm, setEditForm] = useState<RelationshipForm>(blankForm);
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return relationships;

    return relationships.filter((relationship) => {
      const profile = normalizeKoinoniaRelationshipData(relationship.data);
      return [
        relationship.name,
        relationship.status,
        relationship.health,
        relationship.nextAction ?? "",
        profile.contact?.email ?? "",
        profile.contact?.phone ?? "",
        profile.contact?.brokerage ?? "",
        profile.problem?.primaryPressure ?? "",
        profile.problem?.exactLanguage ?? "",
        profile.diagnosis?.requestedService ?? "",
        profile.diagnosis?.recommendedService ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [relationships, search]);

  async function loadRelationships(preferredId?: string) {
    setError("");
    try {
      const response = await fetch("/api/objects?objectType=Relationship");
      if (!response.ok) throw new Error("Failed to load CRM relationships.");
      const data = await response.json();
      const nextRelationships = data.objects ?? [];
      setRelationships(nextRelationships);

      const id = preferredId ?? selected?.id ?? nextRelationships[0]?.id;
      if (id) await loadRelationship(id);
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
      setEditForm(relationshipToForm(data.object));
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

  async function createRelationship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createForm.name.trim()) return;

    setIsSaving(true);
    setError("");

    try {
      const profile = formToProfile(createForm);
      profile.acquisition = {
        ...profile.acquisition,
        firstTouchDate: new Date().toISOString().slice(0, 10)
      };

      const response = await fetch("/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectType: "Relationship",
          name: createForm.name.trim(),
          status: createForm.status,
          health: createForm.health,
          nextAction: createForm.nextAction.trim() || undefined,
          data: profile
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create relationship.");

      setCreateForm(blankForm);
      setShowCreate(false);
      await loadRelationships(data.object.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateRelationship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setIsSaving(true);
    setError("");

    try {
      const mergedProfile = mergeKoinoniaRelationshipData(
        selected.data,
        formToProfile(editForm)
      );

      const response = await fetch(`/api/objects/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          status: editForm.status,
          health: editForm.health,
          nextAction: editForm.nextAction.trim(),
          data: mergedProfile
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update relationship.");

      await loadRelationships(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
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

  const selectedProfile = selected
    ? normalizeKoinoniaRelationshipData(selected.data)
    : null;

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Koinonia Relationship Center</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/objects">Object Explorer</a>
          <a href="/crm" className="active">Relationships</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people, brokerage, pressure, service..."
          />
          <button onClick={() => void loadRelationships()}>Refresh</button>
          <button onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? "Close" : "+ New Relationship"}
          </button>
        </header>

        <div className="ros-eyebrow">Koinonia · Relationship Learning CRM</div>
        <h1>Relationship Center</h1>
        <p className="ros-subtitle">
          One relationship history from first conversation through consultation, service delivery, repeat work, advocacy, and referral.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        {showCreate ? (
          <article className="ros-card" style={{ marginBottom: 18 }}>
            <h2>New Relationship</h2>
            <p>Capture the useful context from the first meaningful conversation. You can add detail later.</p>
            <form className="ros-form" onSubmit={createRelationship}>
              <RelationshipFormFields form={createForm} setForm={setCreateForm} />
              <button disabled={isSaving || !createForm.name.trim()}>
                {isSaving ? "Saving..." : "Create Relationship"}
              </button>
            </form>
          </article>
        ) : null}

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Relationships</h2>
            {filtered.length === 0 ? <p>No relationships found.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Lifecycle</th>
                  <th>Primary Pressure</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((relationship) => {
                  const profile = normalizeKoinoniaRelationshipData(relationship.data);
                  return (
                    <tr key={relationship.id} onClick={() => void loadRelationship(relationship.id)}>
                      <td>
                        <strong>{relationship.name}</strong>
                        <span>{profile.contact?.brokerage || profile.contact?.email || relationship.id}</span>
                      </td>
                      <td>{relationship.status}</td>
                      <td>{profile.problem?.primaryPressure || "Not captured"}</td>
                      <td>{relationship.nextAction ?? "None"}</td>
                    </tr>
                  );
                })}
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

                {selectedProfile?.acquisition?.firstTouchDate ? (
                  <p><strong>First touch:</strong> {selectedProfile.acquisition.firstTouchDate}</p>
                ) : null}

                {selectedProfile?.consultationRequest?.submittedAt ? (
                  <div className="ros-panel" style={{ marginBottom: 14 }}>
                    <strong>Latest consultation request</strong>
                    <p>
                      {selectedProfile.consultationRequest.type || "General consultation"}
                      {selectedProfile.consultationRequest.preferredDate
                        ? ` · ${selectedProfile.consultationRequest.preferredDate}`
                        : ""}
                      {selectedProfile.consultationRequest.preferredTime
                        ? ` · ${selectedProfile.consultationRequest.preferredTime}`
                        : ""}
                    </p>
                    {selectedProfile.consultationRequest.notes ? (
                      <p>{selectedProfile.consultationRequest.notes}</p>
                    ) : null}
                  </div>
                ) : null}

                <form className="ros-form" onSubmit={updateRelationship}>
                  <RelationshipFormFields form={editForm} setForm={setEditForm} />
                  <button disabled={isSaving}>{isSaving ? "Saving..." : "Save Relationship"}</button>
                </form>

                <RelationshipQuickCapture
                  relationshipId={selected.id}
                  relationshipName={selected.name}
                  onSaved={() => loadRelationships(selected.id)}
                />

                <h3>Create Follow-Up</h3>
                <form className="ros-form" onSubmit={createFollowUp}>
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="Follow-up task title"
                  />
                  <button>Create Follow-Up</button>
                </form>

                <h3>Open Follow-Ups</h3>
                {tasks.length === 0 ? <p>No follow-up tasks yet.</p> : null}
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <strong>{task.priority}</strong> · {task.title} · {task.status}
                    </li>
                  ))}
                </ul>

                <h3>Related Work</h3>
                {[...(selected.sourceLinks ?? []), ...(selected.targetLinks ?? [])].length === 0 ? (
                  <p>No related transactions, services, invoices, or other objects yet.</p>
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

function RelationshipFormFields({
  form,
  setForm
}: {
  form: RelationshipForm;
  setForm: React.Dispatch<React.SetStateAction<RelationshipForm>>;
}) {
  function patch(next: Partial<RelationshipForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  return (
    <div className="ros-form">
      <h3>Identity</h3>
      <input value={form.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Name" />
      <input value={form.email} onChange={(event) => patch({ email: event.target.value })} placeholder="Email" type="email" />
      <input value={form.phone} onChange={(event) => patch({ phone: event.target.value })} placeholder="Phone" />
      <input value={form.role} onChange={(event) => patch({ role: event.target.value })} placeholder="Role" />
      <input value={form.brokerage} onChange={(event) => patch({ brokerage: event.target.value })} placeholder="Brokerage / Team" />
      <input value={form.market} onChange={(event) => patch({ market: event.target.value })} placeholder="Market / Area" />

      <h3>Relationship Status</h3>
      <select value={form.status} onChange={(event) => patch({ status: event.target.value })}>
        {relationshipLifecycleStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
      </select>
      <select value={form.health} onChange={(event) => patch({ health: event.target.value })}>
        {["Healthy", "Attention", "Critical"].map((health) => (
          <option key={health} value={health}>{health}</option>
        ))}
      </select>
      <input value={form.nextAction} onChange={(event) => patch({ nextAction: event.target.value })} placeholder="Next action" />

      <h3>Acquisition</h3>
      <select value={form.source} onChange={(event) => patch({ source: event.target.value })}>
        <option value="">Source not captured</option>
        {relationshipSources.map((source) => <option key={source} value={source}>{source}</option>)}
      </select>
      <input value={form.sourceDetail} onChange={(event) => patch({ sourceDetail: event.target.value })} placeholder="Source detail / who introduced you" />
      <select value={form.material} onChange={(event) => patch({ material: event.target.value })}>
        {relationshipMaterialOptions.map((material) => (
          <option key={material || "none"} value={material}>{material || "Material not captured"}</option>
        ))}
      </select>
      <input value={form.campaign} onChange={(event) => patch({ campaign: event.target.value })} placeholder="Campaign / message, if known" />

      <h3>Problem Language</h3>
      <select value={form.primaryPressure} onChange={(event) => patch({ primaryPressure: event.target.value })}>
        <option value="">Pressure not captured</option>
        {relationshipPressureCategories.map((pressure) => <option key={pressure} value={pressure}>{pressure}</option>)}
      </select>
      <textarea value={form.exactLanguage} onChange={(event) => patch({ exactLanguage: event.target.value })} rows={3} placeholder="Their words: what problem did they actually describe?" />
      <textarea value={form.objection} onChange={(event) => patch({ objection: event.target.value })} rows={2} placeholder="Objection / hesitation" />
      <textarea value={form.desiredOutcome} onChange={(event) => patch({ desiredOutcome: event.target.value })} rows={2} placeholder="Desired outcome" />

      <h3>Diagnosis</h3>
      <select value={form.path} onChange={(event) => patch({ path: event.target.value })}>
        {relationshipPaths.map((path) => <option key={path} value={path}>{path}</option>)}
      </select>
      <select value={form.requestedService} onChange={(event) => patch({ requestedService: event.target.value })}>
        {relationshipServiceOptions.map((service) => (
          <option key={`requested-${service || "none"}`} value={service}>{service || "Requested service not captured"}</option>
        ))}
      </select>
      <select value={form.recommendedService} onChange={(event) => patch({ recommendedService: event.target.value })}>
        {relationshipServiceOptions.map((service) => (
          <option key={`recommended-${service || "none"}`} value={service}>{service || "Recommendation not made yet"}</option>
        ))}
      </select>
      <textarea value={form.rationale} onChange={(event) => patch({ rationale: event.target.value })} rows={2} placeholder="Why this is the smallest useful starting point" />
    </div>
  );
}
