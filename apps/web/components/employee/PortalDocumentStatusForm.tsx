"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions = [
  "Uploaded",
  "In Review",
  "Ready for Client Review",
  "Revision Requested",
  "Approved",
  "Sent",
  "Archived"
] as const;

type PortalDocumentStatusFormProps = {
  currentRequestedAction?: string | null;
  currentStatus: string;
  disabled?: boolean;
  documentId: string;
};

type PortalDocumentStatusResponse = {
  document?: {
    requestedAction: string | null;
    status: string;
  };
  error?: string;
};

export function PortalDocumentStatusForm({
  currentRequestedAction,
  currentStatus,
  disabled = false,
  documentId
}: PortalDocumentStatusFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [requestAction, setRequestAction] = useState(currentRequestedAction ?? "");
  const [selectedStatus, setSelectedStatus] = useState(normalizeStatus(currentStatus));
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch(`/api/portal/documents/${documentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notes: String(formData.get("notes") ?? ""),
          requestedAction:
            selectedStatus === "Approved"
              ? ""
              : String(formData.get("requestedAction") ?? ""),
          status: String(formData.get("status") ?? "")
        })
      });
      const payload = (await response.json()) as PortalDocumentStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this document yet.");
      }

      form.reset();
      setSelectedStatus(payload.document?.status ?? selectedStatus);
      setRequestAction(payload.document?.requestedAction ?? "");
      setStatus("success");
      setMessage("Document status updated and recorded in the file history.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this document yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-document-status-form" onSubmit={handleSubmit}>
      <label>
        Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => {
            const nextStatus = event.target.value;
            setSelectedStatus(nextStatus);

            if (nextStatus === "Approved") {
              setRequestAction("");
            }
          }}
          value={selectedStatus}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Next Action
        <input
          disabled={isDisabled || selectedStatus === "Approved"}
          name="requestedAction"
          onChange={(event) => setRequestAction(event.target.value)}
          placeholder={
            selectedStatus === "Approved"
              ? "Approved documents do not require a next action"
              : "What needs to happen next"
          }
          type="text"
          value={requestAction}
        />
        {selectedStatus === "Approved" ? (
          <small>
            Approving this document clears the outstanding action.
          </small>
        ) : null}
      </label>

      <label>
        Update Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Client-safe note; no passwords, card data, or access codes"
          rows={3}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Status"}
      </button>

      {disabled ? (
        <p className="koinonia-document-security-note employee">
          Live document storage must be available before staff status updates can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-document-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): string {
  return statusOptions.includes(status as (typeof statusOptions)[number]) ? status : "In Review";
}
