"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PortalAccessActionButtonProps = {
  confirmation: string;
  endpoint: string;
  label: string;
  successMessage: string;
};

export function PortalAccessActionButton({
  confirmation,
  endpoint,
  label,
  successMessage
}: PortalAccessActionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runAction() {
    if (!window.confirm(confirmation)) {
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Action could not be completed.");
      }

      setMessage(successMessage);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="koinonia-access-action">
      <button
        className="koinonia-access-action-button"
        type="button"
        disabled={isSubmitting}
        onClick={() => void runAction()}
      >
        {isSubmitting ? "Working..." : label}
      </button>
      {message ? <small className="koinonia-access-action-status success">{message}</small> : null}
      {error ? <small className="koinonia-access-action-status error">{error}</small> : null}
    </div>
  );
}
