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
  const disabled = !canAssign || staffOptions.length === 0 || isSubmitting;

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (assignmentFocus === "backup") {
      backupSelectRef.current?.focus();
      return;
    }

    if (assignmentFocus === "primary") {
      primarySelectRef.current?.focus();
    }
  }, [assignmentFocus, disabled]);

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
  );
}
