"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  relatedObjectId?: string | null;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
  completedAt?: string | null;
};

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction?: string | null;
};

const statuses = ["", "Open", "Due Now", "Waiting", "Complete"];
const priorities = ["", "Low", "Normal", "High", "Critical"];

export function OperationsQueueMvp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [relatedObjects, setRelatedObjects] = useState<RosObject[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState("");

  const objectMap = useMemo(() => {
    return new Map(relatedObjects.map((object) => [object.id, object]));
  }, [relatedObjects]);

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter((task) => {
      const related = task.relatedObjectId ? objectMap.get(task.relatedObjectId) : undefined;
      return [task.title, task.status, task.priority, related?.name ?? "", related?.objectType ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tasks, search, objectMap]);

  const openTasks = tasks.filter((task) => task.status !== "Complete");
  const highPriorityTasks = tasks.filter((task) => ["High", "Critical"].includes(task.priority) && task.status !== "Complete");

  async function loadTasks() {
    setError("");
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);

    try {
      const response = await fetch(`/api/tasks${params.toString() ? `?${params.toString()}` : ""}`);
      if (!response.ok) throw new Error("Failed to load tasks.");
      const data = await response.json();
      setTasks(data.tasks ?? []);
      setRelatedObjects(data.relatedObjects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function completeTask(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Complete" })
      });

      if (!response.ok) throw new Error("Failed to complete task.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          status: "Open",
          priority: "Normal"
        })
      });

      if (!response.ok) throw new Error("Failed to create task.");
      setNewTaskTitle("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Operations · v9.0</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations" className="active">Operations</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, objects, owners..." />
          <button onClick={() => void loadTasks()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Open Objects</a>
        </header>

        <div className="ros-eyebrow">ROS-0075 · Operations Queue MVP</div>
        <h1>Operations Work Queue</h1>
        <p className="ros-subtitle">
          Database-backed task queue for operational work, priorities, completion, and related object context.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Open Tasks</span>
            <strong>{openTasks.length}</strong>
            <p>not complete</p>
          </article>
          <article className="ros-card">
            <span>High Priority</span>
            <strong>{highPriorityTasks.length}</strong>
            <p>high or critical</p>
          </article>
          <article className="ros-card">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
            <p>current filter</p>
          </article>
          <article className="ros-card">
            <span>Related Objects</span>
            <strong>{relatedObjects.length}</strong>
            <p>linked context</p>
          </article>
        </section>

        <section className="ros-panel">
          <div className="ros-filters">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => <option key={item} value={item}>{item || "Any status"}</option>)}
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorities.map((item) => <option key={item} value={item}>{item || "Any priority"}</option>)}
            </select>
          </div>
        </section>

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Create Standalone Task</h2>
            <form className="ros-form" onSubmit={createTask}>
              <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Task title" />
              <button>Create Task</button>
            </form>

            <h2 style={{ marginTop: 24 }}>Work Queue</h2>
            {filteredTasks.length === 0 ? <p>No tasks found.</p> : null}

            <table className="ros-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Related Object</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const related = task.relatedObjectId ? objectMap.get(task.relatedObjectId) : undefined;
                  return (
                    <tr key={task.id}>
                      <td>
                        <strong>{task.title}</strong>
                        <span>{task.id}</span>
                      </td>
                      <td>{task.priority}</td>
                      <td>{task.status}</td>
                      <td>{related ? `${related.name} · ${related.objectType}` : "None"}</td>
                      <td>
                        {task.status !== "Complete" ? (
                          <button onClick={() => void completeTask(task.id)}>Complete</button>
                        ) : (
                          "Done"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </article>

          <aside className="ros-card">
            <h2>Queue Guidance</h2>
            <p>
              Work high-priority and critical tasks first. Completing a task creates a timeline event on the related object when one is linked.
            </p>

            <h3>Recommended Order</h3>
            <ol>
              <li>Critical transaction blockers</li>
              <li>Same-day showing issues</li>
              <li>Client follow-ups due today</li>
              <li>Finance and archive cleanup</li>
            </ol>

            <h3>Next Build</h3>
            <p>Add due dates, owner assignment, and task detail editing.</p>
          </aside>
        </section>
      </section>
    </main>
  );
}
