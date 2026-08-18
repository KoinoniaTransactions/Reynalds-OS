"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type PortalDeadlineCompletionFormProps = {
  deadlineKey: string;
  deadlineLabel: string;
  disabled?: boolean;
  workItemId: string;
};

export function PortalDeadlineCompletionForm({
  deadlineKey,
  deadlineLabel,
  disabled = false,
  workItemId
}: PortalDeadlineCompletionFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;

  async function completeDeadline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/portal/work-items/${workItemId}/deadlines/${encodeURIComponent(
          deadlineKey
        )}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ note })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ?? "The deadline could not be marked complete."
        );
      }

      setNote("");
      setMessage(`${deadlineLabel} marked complete.`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The deadline could not be marked complete."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="koinonia-work-assignment-form"
      onSubmit={completeDeadline}
    >
      <label>
        Completion Note
        <textarea
          disabled={isDisabled}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional internal completion note"
          rows={2}
          value={note}
        />
      </label>

      {error ? (
        <small className="koinonia-work-assignment-status error">
          {error}
        </small>
      ) : null}

      {message ? (
        <small className="koinonia-work-assignment-status success">
          {message}
        </small>
      ) : null}

      <button
        className="koinonia-access-action-button"
        disabled={isDisabled}
        type="submit"
      >
        {isSubmitting ? "Completing..." : "Mark Deadline Complete"}
      </button>
    </form>
  );
}
