"use client";

import { useState } from "react";
import type { AccessRequestStatus } from "../../lib/access-requests";

const accessRequestStatusOptions = [
  "Access Needed",
  "Waiting on Client",
  "Client Says Granted",
  "Blocked",
  "No Longer Needed"
] as const satisfies readonly AccessRequestStatus[];

type AccessRequestStatusFormProps = {
  currentStatus: string;
  disabled?: boolean;
  requestId: string;
};

type AccessRequestStatusResponse = {
  accessRequest?: {
    status: string;
  };
  error?: string;
};

export function AccessRequestStatusForm({
  currentStatus,
  disabled = false,
  requestId
}: AccessRequestStatusFormProps) {
  const [message, setMessage] = useState<string | null>(null);
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
      const response = await fetch(`/api/portal/access-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notes: String(formData.get("notes") ?? ""),
          status: String(formData.get("status") ?? "")
        })
      });
      const payload = (await response.json()) as AccessRequestStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this access request yet.");
      }

      form.reset();
      setSelectedStatus(normalizeStatus(payload.accessRequest?.status ?? selectedStatus));
      setStatus("success");
      setMessage("Access request status updated and recorded in the work history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this access request yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-showing-status-form" onSubmit={handleSubmit}>
      <label>
        Access Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => setSelectedStatus(normalizeStatus(event.target.value))}
          value={selectedStatus}
        >
          {accessRequestStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Staff Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Status note only; no passwords, usernames, access codes, recovery codes, API keys, or private login details"
          rows={2}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Access Status"}
      </button>

      {disabled ? (
        <p className="koinonia-showing-form-status error">
          Live access request storage must be available before staff updates can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-showing-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): AccessRequestStatus {
  return accessRequestStatusOptions.includes(status as AccessRequestStatus)
    ? (status as AccessRequestStatus)
    : "Access Needed";
}
