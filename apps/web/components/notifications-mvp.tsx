"use client";

import { useEffect, useMemo, useState } from "react";

type Notification = {
  id: string;
  relatedObjectId?: string | null;
  level: string;
  title: string;
  message: string;
  status: string;
  dueAt?: string | null;
  createdAt: string;
};

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
};

const levels = ["", "Critical", "Important", "Informational"];
const statuses = ["", "Unread", "Read", "Resolved"];

export function NotificationsMvp() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [relatedObjects, setRelatedObjects] = useState<RosObject[]>([]);
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newLevel, setNewLevel] = useState("Important");
  const [newRelatedObjectId, setNewRelatedObjectId] = useState("");
  const [error, setError] = useState("");

  const objectMap = useMemo(() => new Map([...objects, ...relatedObjects].map((object) => [object.id, object])), [objects, relatedObjects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return notifications;

    return notifications.filter((notification) => {
      const related = notification.relatedObjectId ? objectMap.get(notification.relatedObjectId) : undefined;
      return [notification.title, notification.message, notification.level, notification.status, related?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [notifications, search, objectMap]);

  async function loadNotifications() {
    setError("");
    const params = new URLSearchParams();
    if (level) params.set("level", level);
    if (status) params.set("status", status);

    try {
      const response = await fetch(`/api/notifications${params.toString() ? `?${params.toString()}` : ""}`);
      if (!response.ok) throw new Error("Failed to load notifications.");
      const data = await response.json();
      setNotifications(data.notifications ?? []);
      setRelatedObjects(data.relatedObjects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadObjects() {
    const response = await fetch("/api/objects");
    if (!response.ok) return;
    const data = await response.json();
    setObjects(data.objects ?? []);
  }

  async function createNotification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          message: newMessage,
          level: newLevel,
          relatedObjectId: newRelatedObjectId || undefined,
          status: "Unread"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create notification.");
      }

      setNewTitle("");
      setNewMessage("");
      setNewRelatedObjectId("");
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function generateNotifications() {
    setError("");

    try {
      const response = await fetch("/api/notifications/generate", {
        method: "POST"
      });

      if (!response.ok) throw new Error("Failed to generate notifications.");
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function updateNotification(id: string, nextStatus: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) throw new Error("Failed to update notification.");
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  const unreadCount = notifications.filter((item) => item.status === "Unread").length;
  const criticalCount = notifications.filter((item) => item.level === "Critical" && item.status !== "Resolved").length;
  const unresolvedCount = notifications.filter((item) => item.status !== "Resolved").length;

  useEffect(() => {
    void loadObjects();
  }, []);

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, status]);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Notifications · v9.6</span>
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
          <a href="/notifications" className="active">Notifications</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications..." />
          <button onClick={() => void loadNotifications()}>Refresh</button>
          <button onClick={() => void generateNotifications()}>Generate Alerts</button>
        </header>

        <div className="ros-eyebrow">ROS-0081 · Automatic Notifications</div>
        <h1>Notification Center</h1>
        <p className="ros-subtitle">
          Database-backed alerts for critical, important, and informational activity tied to shared ROS objects.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
            <p>need review</p>
          </article>
          <article className="ros-card">
            <span>Critical</span>
            <strong>{criticalCount}</strong>
            <p>unresolved</p>
          </article>
          <article className="ros-card">
            <span>Unresolved</span>
            <strong>{unresolvedCount}</strong>
            <p>open alerts</p>
          </article>
          <article className="ros-card">
            <span>Total</span>
            <strong>{notifications.length}</strong>
            <p>current filter</p>
          </article>
        </section>

        <section className="ros-panel">
          <div className="ros-filters">
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              {levels.map((item) => <option key={item} value={item}>{item || "Any level"}</option>)}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => <option key={item} value={item}>{item || "Any status"}</option>)}
            </select>
          </div>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Create Notification</h2>
            <form className="ros-form" onSubmit={createNotification}>
              <select value={newLevel} onChange={(event) => setNewLevel(event.target.value)}>
                {levels.filter(Boolean).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Title" />
              <input value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Message" />
              <select value={newRelatedObjectId} onChange={(event) => setNewRelatedObjectId(event.target.value)}>
                <option value="">Optional related object</option>
                {objects.map((object) => <option key={object.id} value={object.id}>{object.name} · {object.objectType}</option>)}
              </select>
              <button>Create Notification</button>
            </form>

            <h2 style={{ marginTop: 24 }}>Notifications</h2>
            {filtered.length === 0 ? <p>No notifications found.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Related</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((notification) => {
                  const related = notification.relatedObjectId ? objectMap.get(notification.relatedObjectId) : undefined;
                  return (
                    <tr key={notification.id}>
                      <td>
                        <strong>{notification.title}</strong>
                        <span>{notification.message}</span>
                      </td>
                      <td>{notification.level}</td>
                      <td>{notification.status}</td>
                      <td>{related ? `${related.name} · ${related.objectType}` : "None"}</td>
                      <td>
                        {notification.status === "Unread" ? <button onClick={() => void updateNotification(notification.id, "Read")}>Mark Read</button> : null}
                        {notification.status !== "Resolved" ? <button onClick={() => void updateNotification(notification.id, "Resolved")}>Resolve</button> : "Resolved"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Notification Rules</h2>
            <p>Notifications should reduce uncertainty, not create noise. Every alert should have a level, message, owner/context, and resolution path.</p>

            <h3>Levels</h3>
            <ul>
              <li><strong>Critical:</strong> immediate action.</li>
              <li><strong>Important:</strong> action soon.</li>
              <li><strong>Informational:</strong> useful status update.</li>
            </ul>

            <h3>Auto-Generation Sources</h3>
            <ul>
              <li>Critical object health</li>
              <li>High-priority open tasks</li>
              <li>Pending invoices</li>
            </ul>
          </aside>
        </section>
      </section>
    </main>
  );
}
