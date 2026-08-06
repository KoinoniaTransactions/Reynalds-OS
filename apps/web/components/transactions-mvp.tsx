"use client";

import type {
  FormEvent
} from "react";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  brainState
} from "../lib/brain";

import {
  Sidebar
} from "./dashboard/Sidebar";

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction?: string | null;
  data?: Record<string, unknown> | null;
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

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
};

const HEALTH_OPTIONS = [
  "Healthy",
  "Attention",
  "Critical"
];

const STATUS_OPTIONS = [
  "Intake",
  "Active",
  "Under Contract",
  "Closing Prep",
  "Closing Ready",
  "Closed",
  "Archived"
];

function healthClassName(
  health: string
): string {
  if (health === "Critical") {
    return "ros-health-critical";
  }

  if (health === "Attention") {
    return "ros-health-attention";
  }

  return "ros-health-healthy";
}

function dateLabel(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric"
    }
  ).format(date);
}

export function TransactionsMvp() {
  const [
    transactions,
    setTransactions
  ] = useState<RosObject[]>([]);

  const [
    selected,
    setSelected
  ] = useState<RosObject | null>(
    null
  );

  const [
    tasks,
    setTasks
  ] = useState<Task[]>([]);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    taskTitle,
    setTaskTitle
  ] = useState("");

  const [
    health,
    setHealth
  ] = useState("Healthy");

  const [
    status,
    setStatus
  ] = useState("Active");

  const [
    error,
    setError
  ] = useState("");

  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);

  const [
    isSaving,
    setIsSaving
  ] = useState(false);

  const [
    isCreatingTask,
    setIsCreatingTask
  ] = useState(false);

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        [
          transaction.name,
          transaction.status,
          transaction.health,
          transaction.nextAction ?? ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
    );
  }, [transactions, search]);

  const criticalCount = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.health === "Critical"
      ).length,
    [transactions]
  );

  const openTasks = tasks.filter(
    (task) =>
      task.status !== "Complete"
  );

  const relatedObjects = selected
    ? [
        ...(selected.sourceLinks ?? []).map(
          (link) => ({
            id: link.id,
            relationshipType:
              link.relationshipType,
            object: link.targetObject
          })
        ),
        ...(selected.targetLinks ?? []).map(
          (link) => ({
            id: link.id,
            relationshipType:
              link.relationshipType,
            object: link.sourceObject
          })
        )
      ]
    : [];

  async function loadTasks(
    relatedObjectId: string
  ) {
    const response = await fetch(
      `/api/tasks?relatedObjectId=${encodeURIComponent(
        relatedObjectId
      )}`
    );

    if (!response.ok) {
      setTasks([]);
      return;
    }

    const data = await response.json();

    setTasks(data.tasks ?? []);
  }

  async function loadTransaction(
    id: string
  ) {
    setError("");

    try {
      const response = await fetch(
        `/api/objects/${encodeURIComponent(
          id
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "The transaction could not be loaded."
        );
      }

      const data = await response.json();
      const nextObject =
        data.object as RosObject;

      setSelected(nextObject);
      setHealth(
        nextObject.health ?? "Healthy"
      );
      setStatus(
        nextObject.status ?? "Active"
      );

      await loadTasks(id);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The transaction could not be loaded."
      );
    }
  }

  async function loadTransactions({
    preferredId,
    showRefresh = true
  }: {
    preferredId?: string;
    showRefresh?: boolean;
  } = {}) {
    if (showRefresh) {
      setIsRefreshing(true);
    }

    setError("");

    try {
      const response = await fetch(
        "/api/objects?objectType=Transaction"
      );

      if (!response.ok) {
        throw new Error(
          "Transactions could not be loaded."
        );
      }

      const data = await response.json();

      const nextTransactions =
        (data.objects ?? []) as RosObject[];

      setTransactions(nextTransactions);

      const currentId =
        preferredId ??
        selected?.id ??
        nextTransactions[0]?.id;

      if (currentId) {
        const stillExists =
          nextTransactions.some(
            (transaction) =>
              transaction.id === currentId
          );

        await loadTransaction(
          stillExists
            ? currentId
            : nextTransactions[0]!.id
        );
      } else {
        setSelected(null);
        setTasks([]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Transactions could not be loaded."
      );
    } finally {
      if (showRefresh) {
        setIsRefreshing(false);
      }
    }
  }

  async function updateTransaction({
    nextStatus = status,
    nextHealth = health
  }: {
    nextStatus?: string;
    nextHealth?: string;
  }) {
    if (
      !selected ||
      isSaving
    ) {
      return;
    }

    const transactionId =
      selected.id;

    const previousStatus =
      status;

    const previousHealth =
      health;

    setStatus(nextStatus);
    setHealth(nextHealth);
    setIsSaving(true);
    setError("");

    setSelected(
      (current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              health: nextHealth
            }
          : current
    );

    setTransactions(
      (current) =>
        current.map(
          (transaction) =>
            transaction.id ===
            transactionId
              ? {
                  ...transaction,
                  status: nextStatus,
                  health: nextHealth
                }
              : transaction
        )
    );

    try {
      const response = await fetch(
        `/api/objects/${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "PATCH",
          headers: {
            "content-type":
              "application/json"
          },
          body: JSON.stringify({
            status: nextStatus,
            health: nextHealth,
            nextAction:
              selected.nextAction ?? ""
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "The transaction could not be updated."
        );
      }
    } catch (updateError) {
      setStatus(previousStatus);
      setHealth(previousHealth);

      setSelected(
        (current) =>
          current
            ? {
                ...current,
                status:
                  previousStatus,
                health:
                  previousHealth
              }
            : current
      );

      setTransactions(
        (current) =>
          current.map(
            (transaction) =>
              transaction.id ===
              transactionId
                ? {
                    ...transaction,
                    status:
                      previousStatus,
                    health:
                      previousHealth
                  }
                : transaction
          )
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "The transaction could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createTransactionTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !selected ||
      !taskTitle.trim() ||
      isCreatingTask
    ) {
      return;
    }

    setIsCreatingTask(true);
    setError("");

    try {
      const response = await fetch(
        "/api/tasks",
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json"
          },
          body: JSON.stringify({
            relatedObjectId:
              selected.id,
            title:
              taskTitle.trim(),
            priority:
              health === "Critical"
                ? "High"
                : "Normal",
            status: "Open"
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "The task could not be created."
        );
      }

      setTaskTitle("");

      await loadTasks(selected.id);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "The task could not be created."
      );
    } finally {
      setIsCreatingTask(false);
    }
  }

  useEffect(() => {
    void loadTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="ros-app ros-app-modern ros-transactions-modern">
      <Sidebar
        version={brainState.version}
        workspace="Transactions"
      />

      <section className="ros-main">
        <header className="ros-workspace-topbar">
          <div className="ros-context-path">
            <span
              aria-hidden="true"
              className="ros-status-dot"
            />

            <span>Reynalds OS</span>
            <span aria-hidden="true">/</span>
            <strong>Transactions</strong>
          </div>

          <div className="ros-workspace-top-actions">
            <label className="ros-workspace-search">
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.7"
                />
              </svg>

              <input
                aria-label="Search transactions"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                }}
              />
            </label>

            <button
              aria-label="Refresh transactions"
              className="ros-icon-button"
              disabled={isRefreshing}
              title="Refresh transactions"
              type="button"
              onClick={() => {
                void loadTransactions();
              }}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
              >
                <path
                  d="M20 11a8 8 0 1 0-2.34 5.66M20 11V5m0 6h-6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            <a
              className="ros-primary-link"
              href="/objects"
            >
              <span aria-hidden="true">＋</span>
              New
            </a>
          </div>
        </header>

        <header className="ros-workspace-heading">
          <div>
            <div className="ros-eyebrow">
              Transaction Operations
            </div>

            <h1>Transaction Center</h1>

            <p className="ros-subtitle">
              Review files, update their
              health, and act on the work
              that needs attention.
            </p>
          </div>

          <span className="ros-workspace-count">
            {transactions.length}
            {" "}
            {transactions.length === 1
              ? "file"
              : "files"}
          </span>
        </header>

        {error ? (
          <div
            className="ros-inline-alert"
            role="alert"
          >
            <div>
              <strong>
                Transaction action failed
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
              }}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <section
          aria-label="Transaction status summary"
          className="ros-workspace-summary"
        >
          <article>
            <span>Files</span>
            <strong>
              {transactions.length}
            </strong>
          </article>

          <article>
            <span>Critical</span>
            <strong
              className={
                criticalCount > 0
                  ? "ros-summary-critical"
                  : ""
              }
            >
              {criticalCount}
            </strong>
          </article>

          <article>
            <span>Open tasks</span>
            <strong>
              {openTasks.length}
            </strong>
          </article>

          <article>
            <span>Related</span>
            <strong>
              {relatedObjects.length}
            </strong>
          </article>
        </section>

        <section className="ros-master-detail">
          <article className="ros-record-list">
            <header className="ros-record-list-header">
              <div>
                <span className="ros-section-kicker">
                  Files
                </span>

                <h2>
                  {search
                    ? "Search results"
                    : "All transactions"}
                </h2>
              </div>

              <span>
                {filtered.length}
              </span>
            </header>

            <div className="ros-record-list-body">
              {filtered.length === 0 ? (
                <div className="ros-record-empty">
                  <strong>
                    No transactions found
                  </strong>

                  <span>
                    Try another search or create
                    a Transaction object.
                  </span>
                </div>
              ) : (
                filtered.map(
                  (transaction) => {
                    const active =
                      selected?.id ===
                      transaction.id;

                    return (
                      <button
                        aria-pressed={active}
                        className={`ros-record-row ${
                          active
                            ? "ros-record-row-active"
                            : ""
                        }`}
                        key={transaction.id}
                        type="button"
                        onClick={() => {
                          void loadTransaction(
                            transaction.id
                          );
                        }}
                      >
                        <span className="ros-record-row-main">
                          <strong>
                            {transaction.name}
                          </strong>

                          <small>
                            {transaction.nextAction ??
                              "No next action recorded"}
                          </small>
                        </span>

                        <span className="ros-record-row-meta">
                          <span
                            className={`ros-health-dot ${healthClassName(
                              transaction.health
                            )}`}
                          />

                          <span>
                            {transaction.status}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className="ros-row-arrow"
                        >
                          →
                        </span>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </article>

          <aside className="ros-record-detail">
            {!selected ? (
              <div className="ros-detail-empty">
                <span aria-hidden="true">
                  ↗
                </span>

                <strong>
                  Select a transaction
                </strong>

                <p>
                  File details and actions will
                  appear here.
                </p>
              </div>
            ) : (
              <>
                <header className="ros-record-detail-header">
                  <div>
                    <span className="ros-section-kicker">
                      Selected file
                    </span>

                    <h2>{selected.name}</h2>

                    <small>{selected.id}</small>
                  </div>

                  <span
                    className={`ros-detail-health ${healthClassName(
                      health
                    )}`}
                  >
                    {health}
                  </span>
                </header>

                <section className="ros-auto-save-fields">
                  <label>
                    <span>Status</span>

                    <select
                      disabled={isSaving}
                      value={status}
                      onChange={(event) => {
                        void updateTransaction({
                          nextStatus:
                            event.target.value
                        });
                      }}
                    >
                      {STATUS_OPTIONS.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Health</span>

                    <select
                      disabled={isSaving}
                      value={health}
                      onChange={(event) => {
                        void updateTransaction({
                          nextHealth:
                            event.target.value
                        });
                      }}
                    >
                      {HEALTH_OPTIONS.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <span
                    className="ros-auto-save-state"
                    role="status"
                  >
                    {isSaving
                      ? "Saving..."
                      : "Changes auto-save"}
                  </span>
                </section>

                <section className="ros-next-action">
                  <span>Next action</span>

                  <strong>
                    {selected.nextAction ??
                      "No next action recorded"}
                  </strong>
                </section>

                <section className="ros-detail-section">
                  <header>
                    <div>
                      <span>Tasks</span>
                      <strong>
                        {openTasks.length} open
                      </strong>
                    </div>
                  </header>

                  <form
                    className="ros-quick-entry"
                    onSubmit={
                      createTransactionTask
                    }
                  >
                    <input
                      aria-label="New task title"
                      disabled={isCreatingTask}
                      placeholder="Add a task and press Enter"
                      value={taskTitle}
                      onChange={(event) => {
                        setTaskTitle(
                          event.target.value
                        );
                      }}
                    />

                    <button
                      aria-label="Create task"
                      disabled={
                        isCreatingTask ||
                        !taskTitle.trim()
                      }
                      title="Create task"
                      type="submit"
                    >
                      {isCreatingTask
                        ? "…"
                        : "＋"}
                    </button>
                  </form>

                  {tasks.length === 0 ? (
                    <p className="ros-detail-muted">
                      No tasks yet.
                    </p>
                  ) : (
                    <div className="ros-task-list">
                      {tasks.map((task) => (
                        <div
                          className="ros-task-row"
                          key={task.id}
                        >
                          <span
                            className={`ros-task-priority ${
                              task.priority ===
                              "High"
                                ? "ros-task-priority-high"
                                : ""
                            }`}
                          >
                            {task.priority}
                          </span>

                          <strong>
                            {task.title}
                          </strong>

                          <small>
                            {task.status}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <details className="ros-detail-disclosure">
                  <summary>
                    <span>
                      Related objects
                    </span>

                    <strong>
                      {relatedObjects.length}
                    </strong>
                  </summary>

                  {relatedObjects.length === 0 ? (
                    <p className="ros-detail-muted">
                      No related objects yet.
                    </p>
                  ) : (
                    <div className="ros-related-list">
                      {relatedObjects.map(
                        (related) => (
                          <div
                            key={related.id}
                          >
                            <span>
                              {
                                related.relationshipType
                              }
                            </span>

                            <strong>
                              {
                                related.object.name
                              }
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </details>

                <details className="ros-detail-disclosure">
                  <summary>
                    <span>Timeline</span>

                    <strong>
                      {selected.events?.length ??
                        0}
                    </strong>
                  </summary>

                  {selected.events?.length ? (
                    <div className="ros-timeline-list">
                      {selected.events.map(
                        (event) => (
                          <div
                            key={event.id}
                          >
                            <span>
                              {dateLabel(
                                event.createdAt
                              )}
                            </span>

                            <p>
                              <strong>
                                {event.eventType}
                              </strong>
                              {" · "}
                              {event.summary}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="ros-detail-muted">
                      No timeline events yet.
                    </p>
                  )}
                </details>
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
