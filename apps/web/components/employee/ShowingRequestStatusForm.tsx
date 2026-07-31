"use client";

import { useState } from "react";
import { showingRequestStatuses } from "../../lib/showing-requests";

type ShowingRequestStatusFormProps = {
  currentStatus: string;
  disabled?: boolean;
  requestId: string;
};

type ShowingRequestStatusResponse = {
  error?: string;
  showingRequest?: {
    status: string;
  };
};

export function ShowingRequestStatusForm({
  currentStatus,
  disabled = false,
  requestId
}: ShowingRequestStatusFormProps) {
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
      const response = await fetch(`/api/portal/showing-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assignedProvider: String(formData.get("assignedProvider") ?? ""),
          confirmedWindow: String(formData.get("confirmedWindow") ?? ""),
          feedbackSummary: String(formData.get("feedbackSummary") ?? ""),
          notes: String(formData.get("notes") ?? ""),
          status: String(formData.get("status") ?? "")
        })
      });
      const payload = (await response.json()) as ShowingRequestStatusResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this showing request yet.");
      }

      form.reset();
      setSelectedStatus(normalizeStatus(payload.showingRequest?.status ?? selectedStatus));
      setStatus("success");
      setMessage("Showing status updated and recorded in the work history.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update this showing request yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="koinonia-showing-status-form" onSubmit={handleSubmit}>
      <label>
        Showing Status
        <select
          disabled={isDisabled}
          name="status"
          onChange={(event) => setSelectedStatus(normalizeStatus(event.target.value))}
          value={selectedStatus}
        >
          {showingRequestStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Assigned Provider
        <input
          disabled={isDisabled}
          name="assignedProvider"
          placeholder="Licensed provider or staff owner"
          type="text"
        />
      </label>

      <label>
        Confirmed Window
        <input
          disabled={isDisabled}
          name="confirmedWindow"
          placeholder="Confirmed date/time window"
          type="text"
        />
      </label>

      <label>
        Feedback Summary
        <textarea
          disabled={isDisabled}
          name="feedbackSummary"
          placeholder="Showing feedback or completion summary; no access codes"
          rows={2}
        />
      </label>

      <label>
        Staff Note
        <textarea
          disabled={isDisabled}
          name="notes"
          placeholder="Status note only; no passwords, gate codes, lockbox codes, or private access secrets"
          rows={2}
        />
      </label>

      <button className="koinonia-button primary" disabled={isDisabled} type="submit">
        {isSubmitting ? "Saving" : "Save Showing Status"}
      </button>

      {disabled ? (
        <p className="koinonia-showing-form-status error">
          Live showing storage must be available before staff showing updates can be saved.
        </p>
      ) : null}

      {message ? (
        <p className={`koinonia-showing-form-status ${status ?? ""}`}>{message}</p>
      ) : null}
    </form>
  );
}

function normalizeStatus(status: string): (typeof showingRequestStatuses)[number] {
  if (showingRequestStatuses.includes(status as (typeof showingRequestStatuses)[number])) {
    return status as (typeof showingRequestStatuses)[number];
  }

  if (status === "Scheduled") {
    return "Confirmed";
  }

  return "Needs Follow-up";
}
