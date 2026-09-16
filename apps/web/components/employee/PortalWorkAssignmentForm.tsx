"use client";

import {
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent
} from "react";
import { TransactionObligationResolutionControls } from "./TransactionObligationResolutionControls";

export type PortalWorkAssignmentStaffOption = {
  id: string;
  name: string;
  role: string;
};

type PortalWorkAssignmentFormProps = {
  backupStaffUserId?: string | null;
  canAssign: boolean;
  primaryStaffUserId?: string | null;
  staffOptions: PortalWorkAssignmentStaffOption[];
  workItemId: string;
};

type StaffObligationItem = {
  id: string;
  label: string;
  category: string;
  dueDate?: string;
  state: "baseline" | "scheduled" | "due_soon" | "satisfied" | "passed_needs_review" | "superseded" | "not_applicable";
  sequence: number;
  sourceDocumentType?: string;
};

type StaffOperations = {
  lifecycle: string;
  needsReview: StaffObligationItem[];
  dueToday: StaffObligationItem[];
  dueSoon: StaffObligationItem[];
  upcoming: StaffObligationItem[];
  completed: number;
  currentObligations: number;
  nextMilestone?: StaffObligationItem;
  closingDate?: string;
};

export function PortalWorkAssignmentForm({
  backupStaffUserId,
  canAssign,
  primaryStaffUserId,
  staffOptions,
  workItemId
}: PortalWorkAssignmentFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentFocus = searchParams?.get("assignmentFocus");
  const primarySelectRef = useRef<HTMLSelectElement>(null);
  const backupSelectRef = useRef<HTMLSelectElement>(null);
  const [assignedStaffUserId, setAssignedStaffUserId] = useState(primaryStaffUserId ?? "");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [backupStaffId, setBackupStaffId] = useState(backupStaffUserId ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operations, setOperations] = useState<StaffOperations | null>(null);
  const disabled = !canAssign || staffOptions.length === 0 || isSubmitting;

  useEffect(() => {
    if (disabled) return;

    if (assignmentFocus === "backup") {
      backupSelectRef.current?.focus();
      return;
    }

    if (assignmentFocus === "primary") {
      primarySelectRef.current?.focus();
    }
  }, [assignmentFocus, disabled]);

  useEffect(() => {
    let cancelled = false;

    async function loadOperations() {
      try {
        const response = await fetch(
          `/api/employee/transactions/${encodeURIComponent(workItemId)}/projection`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { staff?: StaffOperations };
        if (!cancelled && payload.staff) setOperations(payload.staff);
      } catch {
        // Existing employee work controls remain usable if the projection is unavailable.
      }
    }

    void loadOperations();
    return () => {
      cancelled = true;
    };
  }, [workItemId]);

  async function submitAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/portal/work-items/${workItemId}/assignment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedStaffUserId,
          assignmentNote,
          backupStaffUserId: backupStaffId
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Assignment could not be updated.");
      }

      setAssignmentNote("");
      setMessage("Assignment updated.");

      if (pathname) {
        router.replace(`${pathname}#employee-action-center`, {
          scroll: true
        });
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {operations ? <StaffOperationsSummary operations={operations} workItemId={workItemId} /> : null}

      <form className="koinonia-work-assignment-form" onSubmit={submitAssignment}>
        <label>
          Primary
          <select
            disabled={disabled}
            ref={primarySelectRef}
            value={assignedStaffUserId}
            onChange={(event) => setAssignedStaffUserId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} - {staff.role}
              </option>
            ))}
          </select>
        </label>

        <label>
          Backup
          <select
            disabled={disabled}
            ref={backupSelectRef}
            value={backupStaffId}
            onChange={(event) => setBackupStaffId(event.target.value)}
          >
            <option value="">No backup</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} - {staff.role}
              </option>
            ))}
          </select>
        </label>

        <label>
          Note
          <textarea
            disabled={disabled}
            value={assignmentNote}
            onChange={(event) => setAssignmentNote(event.target.value)}
            placeholder="Internal handoff note, no credentials"
            rows={3}
          />
        </label>

        {error ? <small className="koinonia-work-assignment-status error">{error}</small> : null}
        {message ? <small className="koinonia-work-assignment-status success">{message}</small> : null}

        <button className="koinonia-access-action-button" disabled={disabled} type="submit">
          {isSubmitting ? "Saving..." : "Save Assignment"}
        </button>
      </form>
    </>
  );
}

function StaffOperationsSummary({
  operations,
  workItemId
}: {
  operations: StaffOperations;
  workItemId: string;
}) {
  const priorityItems = [
    ...operations.needsReview.map((item) => ({ ...item, bucket: "Needs Review" })),
    ...operations.dueToday.map((item) => ({ ...item, bucket: "Due Today" })),
    ...operations.dueSoon.map((item) => ({ ...item, bucket: "Due Soon" })),
    ...operations.upcoming.slice(0, 5).map((item) => ({ ...item, bucket: "Upcoming" }))
  ].slice(0, 10);

  return (
    <div className="koinonia-workspace-requirement-stack">
      <div className="koinonia-workspace-meta-grid employee">
        <article>
          <span>Lifecycle</span>
          <strong>{operations.lifecycle}</strong>
        </article>
        <article>
          <span>Needs Review</span>
          <strong>{operations.needsReview.length}</strong>
        </article>
        <article>
          <span>Due Today</span>
          <strong>{operations.dueToday.length}</strong>
        </article>
        <article>
          <span>Due Soon</span>
          <strong>{operations.dueSoon.length}</strong>
        </article>
        {operations.closingDate ? (
          <article>
            <span>Closing</span>
            <strong>{formatDate(operations.closingDate)}</strong>
          </article>
        ) : null}
      </div>

      {priorityItems.length ? (
        <div className="koinonia-workspace-list">
          {priorityItems.map((item) => (
            <article className="koinonia-workspace-list-item employee" key={`${item.id}:${item.bucket}`}>
              <div>
                <span>{item.bucket}</span>
                <h3>{item.label}</h3>
                <p>
                  {item.dueDate ? `Contract date: ${formatDate(item.dueDate)}.` : "No date recorded."}
                  {item.sourceDocumentType ? ` Source: ${item.sourceDocumentType}.` : ""}
                </p>
                {item.bucket === "Needs Review" ? (
                  <TransactionObligationResolutionControls
                    transactionId={workItemId}
                    obligationId={item.id}
                    label={item.label}
                    onResolved={() => window.location.reload()}
                  />
                ) : null}
              </div>
              <strong>{item.dueDate ? shortDate(item.dueDate) : item.state}</strong>
            </article>
          ))}
        </div>
      ) : (
        <p className="koinonia-employee-security-note">No active contractual deadline actions are currently identified.</p>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(timestamp));
}

function shortDate(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(timestamp));
}
