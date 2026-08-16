"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  relatedObjectId?: string | null;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
};

type RelatedObject = {
  id: string;
  objectType: string;
  name: string;
};

type QueueItem = {
  task: Task;
  relationship: RelatedObject;
};

type QueueGroup = "Overdue" | "Today" | "Upcoming" | "Unscheduled";

type Props = {
  refreshKey?: number;
  selectedRelationshipId?: string;
  onOpenRelationship: (relationshipId: string) => Promise<void> | void;
  onTaskChanged?: (relationshipId: string) => Promise<void> | void;
};

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dueDateKey(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return localDateKey(date);
}

function groupForTask(task: Task, today: string): QueueGroup {
  const due = dueDateKey(task.dueAt);
  if (!due) return "Unscheduled";
  if (due < today) return "Overdue";
  if (due === today) return "Today";
  return "Upcoming";
}

function formatDueDate(value?: string | null): string {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  });
}

export function RelationshipFollowUpQueue({
  refreshKey = 0,
  selectedRelationshipId,
  onOpenRelationship,
  onTaskChanged
}: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");
  const [workingTaskId, setWorkingTaskId] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const response = await fetch("/api/tasks?status=Open");
      if (response.status === 403) {
        setAccessDenied(true);
        setItems([]);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load relationship follow-ups.");
      }

      const data = await response.json();
      const tasks = (data.tasks ?? []) as Task[];
      const relatedObjects = (data.relatedObjects ?? []) as RelatedObject[];
      const relationshipMap = new Map(
        relatedObjects
          .filter((object) => object.objectType === "Relationship")
          .map((object) => [object.id, object])
      );

      setItems(
        tasks.flatMap((task) => {
          if (!task.relatedObjectId) return [];
          const relationship = relationshipMap.get(task.relatedObjectId);
          return relationship ? [{ task, relationship }] : [];
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, refreshKey]);

  const grouped = useMemo(() => {
    const today = localDateKey();
    const groups: Record<QueueGroup, QueueItem[]> = {
      Overdue: [],
      Today: [],
      Upcoming: [],
      Unscheduled: []
    };

    for (const item of items) {
      groups[groupForTask(item.task, today)].push(item);
    }

    const byDueThenName = (a: QueueItem, b: QueueItem) => {
      const aDue = a.task.dueAt ? new Date(a.task.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.task.dueAt ? new Date(b.task.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;
      return a.relationship.name.localeCompare(b.relationship.name);
    };

    for (const group of Object.values(groups)) {
      group.sort(byDueThenName);
    }

    return groups;
  }, [items]);

  async function completeTask(item: QueueItem) {
    setWorkingTaskId(item.task.id);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${item.task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Complete" })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to complete follow-up.");
      }

      setItems((current) => current.filter((entry) => entry.task.id !== item.task.id));
      await onTaskChanged?.(item.relationship.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setWorkingTaskId("");
    }
  }

  const groupOrder: QueueGroup[] = ["Overdue", "Today", "Upcoming", "Unscheduled"];

  return (
    <article className="ros-card" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div className="ros-eyebrow">Staff workflow</div>
          <h2 style={{ marginBottom: 6 }}>Relationship Follow-Up Queue</h2>
          <p style={{ marginTop: 0 }}>
            Open staff follow-ups tied to CRM relationships. Client portal requests are not shown here.
          </p>
        </div>
        <button type="button" onClick={() => void loadQueue()} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Queue"}
        </button>
      </div>

      {accessDenied ? (
        <p>Follow-up queue is available to staff roles with task access.</p>
      ) : null}
      {error ? <p className="ros-error">{error}</p> : null}

      {!accessDenied ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {groupOrder.map((groupName) => {
            const groupItems = grouped[groupName];
            return (
              <section key={groupName} className="ros-panel" style={{ minWidth: 0 }}>
                <h3 style={{ marginTop: 0 }}>{groupName} · {groupItems.length}</h3>
                {!loading && groupItems.length === 0 ? <p>Nothing here.</p> : null}
                <div style={{ display: "grid", gap: 10 }}>
                  {groupItems.map((item) => (
                    <div
                      key={item.task.id}
                      style={{
                        borderTop: "1px solid rgba(127, 127, 127, 0.25)",
                        paddingTop: 10,
                        opacity: workingTaskId === item.task.id ? 0.6 : 1
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => void onOpenRelationship(item.relationship.id)}
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <strong>
                          {item.relationship.name}
                          {selectedRelationshipId === item.relationship.id ? " · Open" : ""}
                        </strong>
                      </button>
                      <p style={{ margin: "8px 0 4px" }}>{item.task.title}</p>
                      <small>
                        {formatDueDate(item.task.dueAt)} · {item.task.priority}
                      </small>
                      <div className="ros-actions" style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => void onOpenRelationship(item.relationship.id)}
                        >
                          Open Relationship
                        </button>
                        <button
                          type="button"
                          onClick={() => void completeTask(item)}
                          disabled={Boolean(workingTaskId)}
                        >
                          {workingTaskId === item.task.id ? "Completing..." : "Complete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
