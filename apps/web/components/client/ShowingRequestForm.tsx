"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ShowingRequestFormProps = {
  storageReady: boolean;
};

type ShowingRequestFormState = {
  authorization: boolean;
  buyerContact: string;
  buyerName: string;
  notes: string;
  preferredWindow: string;
  propertyAddress: string;
  serviceLevel: string;
};

const initialFormState: ShowingRequestFormState = {
  authorization: false,
  buyerContact: "",
  buyerName: "",
  notes: "",
  preferredWindow: "",
  propertyAddress: "",
  serviceLevel: "Showing coverage"
};

const serviceLevels = [
  "Showing coverage",
  "Schedule client showing",
  "Buyer tour coordination",
  "Rush showing review",
  "Showing follow-up"
];

export function ShowingRequestForm({ storageReady }: ShowingRequestFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ShowingRequestFormState>(initialFormState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitShowingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setError("Showing request storage is not connected yet.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portal/showing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorization: form.authorization,
          buyerContact: form.buyerContact || undefined,
          buyerName: form.buyerName || undefined,
          notes: form.notes || undefined,
          preferredWindow: form.preferredWindow,
          propertyAddress: form.propertyAddress,
          serviceLevel: form.serviceLevel
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Showing request could not be created.");
      }

      setForm(initialFormState);
      setMessage("Showing request created.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Showing request could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof ShowingRequestFormState>(field: K, value: ShowingRequestFormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <section className="koinonia-client-request-card">
      <p className="koinonia-eyebrow">Request Showing</p>
      <form className="koinonia-showing-form" onSubmit={submitShowingRequest}>
        <label>
          Property
          <input
            value={form.propertyAddress}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("propertyAddress", event.target.value)}
            placeholder="Property address"
            required
          />
        </label>

        <label>
          Timing
          <input
            value={form.preferredWindow}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("preferredWindow", event.target.value)}
            placeholder="Preferred showing window"
            required
          />
        </label>

        <label>
          Request Type
          <select
            value={form.serviceLevel}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("serviceLevel", event.target.value)}
          >
            {serviceLevels.map((serviceLevel) => (
              <option key={serviceLevel} value={serviceLevel}>
                {serviceLevel}
              </option>
            ))}
          </select>
        </label>

        <label>
          Buyer or Client
          <input
            value={form.buyerName}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("buyerName", event.target.value)}
            placeholder="Buyer/client name"
          />
        </label>

        <label>
          Contact
          <input
            value={form.buyerContact}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("buyerContact", event.target.value)}
            placeholder="Approved phone or email"
          />
        </label>

        <label>
          Notes
          <textarea
            value={form.notes}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Scheduling preferences only"
            rows={4}
          />
        </label>

        <label className="koinonia-showing-checkbox">
          <input
            type="checkbox"
            checked={form.authorization}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("authorization", event.target.checked)}
          />
          Koinonia may contact the buyer/client for scheduling
        </label>

        {error ? <p className="koinonia-showing-form-status error">{error}</p> : null}
        {message ? <p className="koinonia-showing-form-status success">{message}</p> : null}

        <button className="koinonia-button primary" type="submit" disabled={!storageReady || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </section>
  );
}
