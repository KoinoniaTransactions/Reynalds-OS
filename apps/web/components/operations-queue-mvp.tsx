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
};

type WalmartTanksCommunication = {
  gmailId: string;
  subject: string;
  sender: string;
  sentAt?: string;
  storeNumber?: string;
  workOrderNumber?: string;
  purchaseOrderNumber?: string;
  city?: string;
  state?: string;
  matchConfidence?: string;
  reviewReason?: string;
  displayUrl?: string;
  snippet?: string;
  attachmentNames?: string[];
};

type WorkFilter = "all" | "attention" | "walmart-tanks" | "acc" | "uco" | "pw" | "review" | "ready";

type LiveDataStatus = {
  source: string;
  label: string;
  mailboxPath: string;
  indexedMessageCount: number;
  hasMoreIndexedMessages: boolean;
  filedCommunications: number;
  reviewQueueItems: number;
  workItemCount: number;
  storeCount: number;
  liveStatus: string;
  nextStep: string;
  hostingStatus: string;
};

type ServiceLineSummary = {
  name: string;
  total: number;
  attention: number;
  communications: number;
  review: number;
};

type ReviewInboxItem = WalmartTanksCommunication & {
  workItemId: string;
  workItemName: string;
  reviewCategory: string;
};

type DashboardBucket = {
  key: Exclude<WorkFilter, "all" | "attention" | "walmart-tanks">;
  label: string;
  count: number;
  note: string;
};

function getCommunications(data: Record<string, unknown>): WalmartTanksCommunication[] {
  return Array.isArray(data.communications) ? (data.communications as WalmartTanksCommunication[]) : [];
}

function getReviewQueue(data: Record<string, unknown>): WalmartTanksCommunication[] {
  return Array.isArray(data.reviewQueue) ? (data.reviewQueue as WalmartTanksCommunication[]) : [];
}

function asText(value: unknown, fallback = "Not set") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatLocation(city?: unknown, state?: unknown) {
  const cityText = asText(city, "");
  const stateText = asText(state, "");

  if (!cityText && !stateText) return "Location TBD";
  return [cityText, stateText].filter(Boolean).join(", ");
}

function getReviewCategory(communication: WalmartTanksCommunication) {
  const reviewText = [
    communication.reviewReason,
    communication.subject,
    communication.sender,
    communication.snippet
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!communication.city && !communication.state && /city|state|location|address/.test(reviewText)) return "Needs city/state";
  if (/multiple|multi-store|several stores|store numbers|split/.test(reviewText)) return "Multi-store";
  if (/statement|invoice|vendor|remit|balance/.test(reviewText)) return "Vendor statement";
  if (/no job|not a job|newsletter|marketing|notification|receipt/.test(reviewText)) return "Non-job";
  return "Manual review";
}

function getMissingEvidence(data: Record<string, unknown>, communications: WalmartTanksCommunication[]) {
  const missing: string[] = [];
  const documentationRequired = Array.isArray(data.documentationRequired) ? data.documentationRequired : [];
  const attachmentCount = communications.reduce((total, communication) => total + (communication.attachmentNames?.length ?? 0), 0);

  if (!data.storeNumber) missing.push("store number");
  if (!data.workOrderNumber) missing.push("work order");
  if (!data.crewLead) missing.push("crew lead");
  if (!communications.length) missing.push("customer/job communication");
  if (documentationRequired.length && attachmentCount === 0) missing.push("completion attachments");
  if (String(data.invoiceStatus ?? "").toLowerCase().includes("not ready")) missing.push("invoice readiness");

  return missing;
}

function getSearchText(item: RosObject) {
  const data = item.data ?? {};
  const communications = getCommunications(data);
  const reviewQueue = getReviewQueue(data);

  return [
    item.name,
    item.status,
    item.health,
    item.nextAction ?? "",
    data.serviceLine,
    data.workType,
    data.workOrderNumber,
    data.sourceSystem,
    data.phase,
    ...communications.flatMap((communication) => [communication.subject, communication.sender]),
    ...reviewQueue.flatMap((communication) => [communication.subject, communication.sender, communication.reviewReason])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getDashboardBuckets(items: RosObject[]): DashboardBucket[] {
  const isAcc = (item: RosObject) => /\bacc\b|gauge|new oil|hydraulic|morrison/i.test(getSearchText(item));
  const isUco = (item: RosObject) => /\buco\b|used cooking oil|grease tank|caddy|fog bin/i.test(getSearchText(item));
  const isPw = (item: RosObject) => /wmpw|paperwork|jotform|completion|lxretail|workflow|permit|document/i.test(getSearchText(item));
  const isReadyInvoice = (item: RosObject) => String(item.data?.invoiceStatus ?? "").toLowerCase().includes("review");

  return [
    { key: "acc", label: "ACC", count: items.filter(isAcc).length, note: "tank, gauge, hydraulic, and new-oil work" },
    { key: "uco", label: "UCO", count: items.filter(isUco).length, note: "used cooking oil, caddy, and grease work" },
    { key: "pw", label: "PW", count: items.filter(isPw).length, note: "paperwork, workflow, permit, and completion docs" },
    { key: "review", label: "Review", count: items.filter((item) => getReviewQueue(item.data ?? {}).length > 0).length, note: "unmatched or split-needed email filing" },
    { key: "ready", label: "Ready to Invoice", count: items.filter(isReadyInvoice).length, note: "completion packets marked for invoice review" }
  ];
}

function formatDate(value?: string) {
  if (!value) return "Date not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function getServiceLineSummaries(items: RosObject[]): ServiceLineSummary[] {
  const summaries = new Map<string, ServiceLineSummary>();

  for (const item of items) {
    const data = item.data ?? {};
    const name = asText(data.serviceLine, "Unassigned");
    const communications = getCommunications(data);
    const reviewQueue = getReviewQueue(data);
    const current = summaries.get(name) ?? { name, total: 0, attention: 0, communications: 0, review: 0 };

    current.total += 1;
    current.communications += communications.length;
    current.review += reviewQueue.length;
    if (["Critical", "Watch", "Attention"].includes(item.health)) current.attention += 1;
    summaries.set(name, current);
  }

  return Array.from(summaries.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export function OperationsQueueMvp() {
  const [objects, setObjects] = useState<RosObject[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState("all");
  const [liveDataStatus, setLiveDataStatus] = useState<LiveDataStatus | null>(null);

  async function loadObjects() {
    setError("");

    try {
      const response = await fetch("/api/objects?objectType=rb.work_item&workspaceId=wks_reynalds_brothers");
      if (!response.ok) throw new Error("Failed to load Reynalds Brothers work items.");
      const data = await response.json();
      const loadedObjects = data.objects ?? [];
      setObjects(loadedObjects);
      setSelectedId((current) => current || loadedObjects[0]?.id || "");

      const liveResponse = await fetch("/api/reynalds-brothers/live-data");
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        setLiveDataStatus(liveData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadObjects();
  }, []);

  const workItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filteredBySearch = q
      ? objects.filter((item) =>
      [item.name, item.status, item.health, item.nextAction ?? "", JSON.stringify(item.data ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(q)
      )
      : objects;

    return filteredBySearch.filter((item) => {
      const data = item.data ?? {};
      const communications = getCommunications(data);
      const reviewQueue = getReviewQueue(data);
      const missingEvidence = getMissingEvidence(data, communications);

      if (filter === "attention") return ["Critical", "Watch", "Attention"].includes(item.health);
      if (filter === "walmart-tanks") return data.serviceLine === "WalMart Tanks";
      if (filter === "acc") return getDashboardBuckets([item]).some((bucket) => bucket.key === "acc" && bucket.count > 0);
      if (filter === "uco") return getDashboardBuckets([item]).some((bucket) => bucket.key === "uco" && bucket.count > 0);
      if (filter === "pw") return getDashboardBuckets([item]).some((bucket) => bucket.key === "pw" && bucket.count > 0);
      if (filter === "review") return reviewQueue.length > 0;
      if (filter === "ready") return String(data.invoiceStatus ?? "").toLowerCase().includes("review") || (communications.length > 0 && missingEvidence.length === 0);
      return true;
    });
  }, [filter, objects, search]);

  const dashboardBuckets = getDashboardBuckets(objects);
  const criticalItems = workItems.filter((item) => ["Critical", "Watch", "Attention"].includes(item.health));
  const waitingItems = workItems.filter((item) => item.status.toLowerCase().includes("waiting"));
  const planningItems = workItems.filter((item) => item.status.toLowerCase().includes("planning"));
  const activeItems = workItems.filter((item) => !["Complete", "Closed", "Archived"].includes(item.status));
  const communicationCount = workItems.reduce((total, item) => total + getCommunications(item.data ?? {}).length, 0);
  const reviewItems = workItems.filter((item) => getReviewQueue(item.data ?? {}).length);
  const serviceLines = getServiceLineSummaries(objects);
  const reviewInbox = objects.flatMap((item) =>
    getReviewQueue(item.data ?? {}).map((communication) => ({
      ...communication,
      workItemId: item.id,
      workItemName: item.name,
      reviewCategory: getReviewCategory(communication)
    }))
  );
  const reviewCategoryCounts = reviewInbox.reduce<Record<string, number>>((counts, item) => {
    counts[item.reviewCategory] = (counts[item.reviewCategory] ?? 0) + 1;
    return counts;
  }, {});
  const filteredReviewInbox = reviewCategoryFilter === "all"
    ? reviewInbox
    : reviewInbox.filter((item) => item.reviewCategory === reviewCategoryFilter);
  const evidenceReadyCount = objects.filter((item) => {
    const communications = getCommunications(item.data ?? {});
    return communications.length > 0 && getMissingEvidence(item.data ?? {}, communications).length === 0;
  }).length;
  const crewAssignedCount = objects.filter((item) => Boolean(item.data?.crewLead)).length;
  const invoiceReviewCount = objects.filter((item) => String(item.data?.invoiceStatus ?? "").toLowerCase().includes("review")).length;
  const selectedItem = workItems.find((item) => item.id === selectedId) ?? workItems[0] ?? null;
  const selectedData = selectedItem?.data ?? {};
  const selectedCommunications = selectedItem ? getCommunications(selectedData) : [];
  const selectedReviewQueue = selectedItem ? getReviewQueue(selectedData) : [];
  const selectedMissingEvidence = selectedItem ? getMissingEvidence(selectedData, selectedCommunications) : [];
  const latestCommunication = selectedCommunications
    .slice()
    .sort((a, b) => String(b.sentAt ?? "").localeCompare(String(a.sentAt ?? "")))[0];

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">RB</div>
          <div>
            <strong>Reynalds Brothers</strong>
            <span>Operations Center</span>
          </div>
        </div>

        <nav>
          <a href="/">Command Center</a>
          <a href="/operations" className="active">Operations</a>
          <a href="/objects">Object Explorer</a>
          <a href="/workflows">Workflows</a>
          <a href="/copilot">AI Copilot</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs, stores, service lines, cities..."
          />
          <button onClick={() => void loadObjects()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Open Object Engine</a>
        </header>

        <div className="ros-eyebrow">RB-001 · Operational OS</div>
        <h1>Reynalds Brothers Operations Center</h1>
        <p className="ros-subtitle">
          Daily command console for active field work, job health, next actions, and operational attention.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="ros-panel" style={{ marginBottom: 18 }}>
          <div className="ros-filters" aria-label="Reynalds Brothers work filters">
            {[
              ["all", "All Work"],
              ["attention", "Needs Attention"],
              ["walmart-tanks", "WalMart Tanks"],
              ["acc", "ACC"],
              ["uco", "UCO"],
              ["pw", "PW"],
              ["review", "Email Review"],
              ["ready", "Ready to Invoice"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value as WorkFilter)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          {dashboardBuckets.map((bucket) => (
            <button
              key={bucket.key}
              className={`ros-card${filter === bucket.key ? " active" : ""}`}
              onClick={() => setFilter(bucket.key)}
              type="button"
            >
              <span>{bucket.label}</span>
              <strong>{bucket.count}</strong>
              <p>{bucket.note}</p>
            </button>
          ))}
        </section>

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Active Jobs</span>
            <strong>{activeItems.length}</strong>
            <p>open work items</p>
          </article>

          <article className="ros-card">
            <span>Needs Attention</span>
            <strong>{criticalItems.length}</strong>
            <p>watch, attention, or critical</p>
          </article>

          <article className="ros-card">
            <span>Planning</span>
            <strong>{planningItems.length}</strong>
            <p>scope and preparation</p>
          </article>

          <article className="ros-card">
            <span>Communications</span>
            <strong>{communicationCount}</strong>
            <p>WalMart Tanks emails filed</p>
          </article>

          <article className="ros-card">
            <span>Email Review</span>
            <strong>{reviewItems.length}</strong>
            <p>job cards with unmatched mail</p>
          </article>
        </section>

        <section className="ros-intel-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <h2>Service Lines</h2>
            <div className="ros-mini-grid">
              {serviceLines.map((line) => (
                <button
                  key={line.name}
                  className="ros-mini-tile"
                  onClick={() => {
                    setSearch(line.name === "Unassigned" ? "" : line.name);
                    setFilter(line.name === "WalMart Tanks" ? "walmart-tanks" : "all");
                  }}
                  type="button"
                >
                  <strong>{line.name}</strong>
                  <span>{line.total} jobs · {line.attention} attention · {line.communications} emails</span>
                </button>
              ))}
            </div>
          </article>

          <article className="ros-card">
            <h2>Evidence Coverage</h2>
            <div className="ros-evidence-grid">
              <span>
                <strong>{evidenceReadyCount}</strong>
                Ready
              </span>
              <span>
                <strong>{crewAssignedCount}</strong>
                Crew set
              </span>
              <span>
                <strong>{invoiceReviewCount}</strong>
                Invoice review
              </span>
              <span>
                <strong>{reviewInbox.length}</strong>
                Unmatched emails
              </span>
            </div>
          </article>
        </section>

        {liveDataStatus ? (
          <section className="ros-card" style={{ marginBottom: 18 }}>
            <div className="ros-section-title">
              <div>
                <div className="ros-eyebrow">Live Data</div>
                <h2>{liveDataStatus.label} Gmail Feed</h2>
              </div>
              <span className="ros-status-pill">{liveDataStatus.liveStatus}</span>
            </div>
            <div className="ros-evidence-grid">
              <span>
                <strong>{liveDataStatus.indexedMessageCount}</strong>
                Gmail IDs indexed{liveDataStatus.hasMoreIndexedMessages ? "+" : ""}
              </span>
              <span>
                <strong>{liveDataStatus.filedCommunications}</strong>
                Filed communications
              </span>
              <span>
                <strong>{liveDataStatus.reviewQueueItems}</strong>
                Review queue
              </span>
              <span>
                <strong>{liveDataStatus.storeCount}</strong>
                Stores represented
              </span>
            </div>
            <p>{liveDataStatus.nextStep}</p>
            <p>{liveDataStatus.hostingStatus}</p>
          </section>
        ) : null}

        {reviewInbox.length ? (
          <section className="ros-card" style={{ marginBottom: 18 }}>
            <div className="ros-section-title">
              <div>
                <div className="ros-eyebrow">Review Inbox</div>
                <h2>Unmatched WalMart Tanks Mail</h2>
              </div>
              <button type="button" onClick={() => setFilter("review")}>Show Review Jobs</button>
            </div>
            <div className="ros-filters" aria-label="Review category filters" style={{ marginBottom: 14 }}>
              <button
                className={reviewCategoryFilter === "all" ? "active" : ""}
                onClick={() => setReviewCategoryFilter("all")}
                type="button"
              >
                All Review
              </button>
              {Object.entries(reviewCategoryCounts).map(([category, count]) => (
                <button
                  key={category}
                  className={reviewCategoryFilter === category ? "active" : ""}
                  onClick={() => setReviewCategoryFilter(category)}
                  type="button"
                >
                  {category} ({count})
                </button>
              ))}
            </div>
            <div className="ros-review-strip">
              {filteredReviewInbox.map((item) => (
                <button
                  key={item.gmailId}
                  className="ros-review-item"
                  onClick={() => {
                    setFilter("review");
                    setSelectedId(item.workItemId);
                  }}
                  type="button"
                >
                  <strong>{item.subject}</strong>
                  <span>{item.reviewCategory} · {item.sender}</span>
                  <small>
                    {item.workItemName}
                    {item.storeNumber ? ` · Store ${item.storeNumber}` : ""}
                    {item.workOrderNumber ? ` · WO ${item.workOrderNumber}` : ""}
                    {item.purchaseOrderNumber ? ` · PO ${item.purchaseOrderNumber}` : ""}
                  </small>
                </button>
              ))}
            </div>
            <div className="ros-evidence-grid" style={{ marginTop: 14 }}>
              {Object.entries(reviewCategoryCounts).map(([category, count]) => (
                <span key={category}>
                  <strong>{count}</strong>
                  {category}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="ros-object-layout">
          <article className="ros-card">
            <h2>Work Command Queue</h2>
            {workItems.length === 0 ? <p>No Reynalds Brothers work items found.</p> : null}

            <div style={{ display: "grid", gap: 14 }}>
              {workItems.map((item) => {
                const data = item.data ?? {};
                const customer = String(data.customer ?? "Customer TBD");
                const storeNumber = String(data.storeNumber ?? "");
                const city = String(data.city ?? "");
                const state = String(data.state ?? "");
                const serviceLine = String(data.serviceLine ?? "Service Line TBD");
                const workType = String(data.workType ?? "Work Type TBD");
                const workOrderNumber = String(data.workOrderNumber ?? "WO TBD");
                const purchaseOrderNumber = String(data.purchaseOrderNumber ?? "PO TBD");
                const usevNumber = String(data.usevNumber ?? data.usev ?? "USEV TBD");
                const siteName = String(data.siteName ?? "Site TBD");
                const phase = String(data.phase ?? item.status);
                const crewLead = String(data.crewLead ?? "Unassigned");
                const invoiceStatus = String(data.invoiceStatus ?? "Not Ready");
                const communications = getCommunications(data);
                const reviewQueue = getReviewQueue(data);
                const missingEvidence = getMissingEvidence(data, communications);
                const latestItemCommunication = communications
                  .slice()
                  .sort((a, b) => String(b.sentAt ?? "").localeCompare(String(a.sentAt ?? "")))[0];

                return (
                  <button
                    key={item.id}
                    className={`ros-work-row${selectedItem?.id === item.id ? " active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                    type="button"
                  >
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {customer}
                        {storeNumber ? ` · Store ${storeNumber}` : ""}
                        {` · ${formatLocation(city, state)}`}
                      </small>
                    </span>
                    <span>
                      <b>{serviceLine}</b>
                      <small>{siteName} · {workType}</small>
                    </span>
                    <span>
                      <b>{phase}</b>
                      <small>{workOrderNumber} · {purchaseOrderNumber} · {usevNumber}</small>
                    </span>
                    <span>
                      <b>{item.health}</b>
                      <small>{item.status} · {item.nextAction ?? "Next action TBD"}</small>
                    </span>
                    <span>
                      <b>{communications.length} email{communications.length === 1 ? "" : "s"}</b>
                      <small>
                        {latestItemCommunication ? formatDate(latestItemCommunication.sentAt) : reviewQueue.length ? `${reviewQueue.length} review` : missingEvidence.length ? `${missingEvidence.length} missing` : "No filed email"}
                      </small>
                    </span>
                    <span>
                      <b>{crewLead}</b>
                      <small>{invoiceStatus}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="ros-card">
            {selectedItem ? (
              <>
                <div className="ros-eyebrow">{asText(selectedData.serviceLine, "Work Item")}</div>
                <h2>{selectedItem.name}</h2>
                <p>{selectedItem.nextAction ?? "No next action set."}</p>

                <table className="ros-table">
                  <tbody>
                    <tr>
                      <th>Store</th>
                      <td>{asText(selectedData.storeNumber)}</td>
                    </tr>
                    <tr>
                      <th>Customer</th>
                      <td>{asText(selectedData.customer)}</td>
                    </tr>
                    <tr>
                      <th>WO</th>
                      <td>{asText(selectedData.workOrderNumber)}</td>
                    </tr>
                    <tr>
                      <th>PO</th>
                      <td>{asText(selectedData.purchaseOrderNumber)}</td>
                    </tr>
                    <tr>
                      <th>USEV</th>
                      <td>{asText(selectedData.usevNumber ?? selectedData.usev)}</td>
                    </tr>
                    <tr>
                      <th>Site</th>
                      <td>
                        {asText(selectedData.siteName)}
                        <span>{formatLocation(selectedData.city, selectedData.state)}</span>
                      </td>
                    </tr>
                    <tr>
                      <th>Phase</th>
                      <td>{asText(selectedData.phase, selectedItem.status)}</td>
                    </tr>
                    <tr>
                      <th>Crew</th>
                      <td>{asText(selectedData.crewLead, "Unassigned")}</td>
                    </tr>
                    <tr>
                      <th>Next</th>
                      <td>{selectedItem.nextAction ?? "No next action set."}</td>
                    </tr>
                    <tr>
                      <th>Invoice</th>
                      <td>{asText(selectedData.invoiceStatus)}</td>
                    </tr>
                    <tr>
                      <th>Latest Email</th>
                      <td>{latestCommunication ? formatDate(latestCommunication.sentAt) : "No filed email"}</td>
                    </tr>
                  </tbody>
                </table>

                <h3 style={{ marginTop: 22 }}>Communications</h3>
                {selectedCommunications.length ? (
                  <ul className="ros-plain-list">
                    {selectedCommunications.map((communication) => (
                      <li key={communication.gmailId}>
                        <strong>{communication.subject}</strong>
                        <span>
                          {communication.sender} · {formatDate(communication.sentAt)}
                          {communication.workOrderNumber ? ` · WO ${communication.workOrderNumber}` : ""}
                          {communication.purchaseOrderNumber ? ` · PO ${communication.purchaseOrderNumber}` : ""}
                        </span>
                        {communication.attachmentNames?.length ? <small>{communication.attachmentNames.join(", ")}</small> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No filed communications yet.</p>
                )}

                <h3 style={{ marginTop: 22 }}>Readiness</h3>
                {selectedMissingEvidence.length ? (
                  <ul className="ros-plain-list">
                    {selectedMissingEvidence.map((item) => (
                      <li key={item}>
                        <strong>Missing {item}</strong>
                        <span>Needed before this work item can be treated as operationally complete.</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>This work item has the core evidence needed for the current live test.</p>
                )}

                {selectedReviewQueue.length ? (
                  <>
                    <h3 style={{ marginTop: 22 }}>Review Queue</h3>
                    <ul className="ros-plain-list">
                      {selectedReviewQueue.map((communication) => (
                        <li key={communication.gmailId}>
                          <strong>{communication.subject}</strong>
                          <span>
                            {getReviewCategory(communication)} · {communication.sender}
                            {communication.storeNumber ? ` · Store ${communication.storeNumber}` : ""}
                            {communication.workOrderNumber ? ` · WO ${communication.workOrderNumber}` : ""}
                            {communication.purchaseOrderNumber ? ` · PO ${communication.purchaseOrderNumber}` : ""}
                          </span>
                          <small>{communication.reviewReason ?? "Needs manual filing."}</small>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : (
              <p>Select a work item to inspect the job card.</p>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
