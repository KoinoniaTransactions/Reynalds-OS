"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { getMarketingAttribution } from "../../../lib/marketingAttribution";
import { trackConsultationLead } from "../MarketingTracking/MarketingTracking";

type ConsultationOption = {
  readonly title: string;
  readonly body: string;
  readonly bestWhen: string;
  readonly subject: string;
};

type ConsultationSchedulerButtonProps = {
  options: readonly ConsultationOption[];
  availability: string;
  title: string;
  lead: string;
  selectorLabel: string;
  selectorHelper: string;
  buttonLabel: string;
};

type IntakeFormState = {
  name: string;
  email: string;
  phone: string;
  requestedDate: string;
  requestedTime: string;
  notes: string;
  website: string;
};

type SubmissionState =
  | { kind: "idle"; message: string }
  | { kind: "submitting"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const consultationTimes = [
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM"
];

const initialFormState: IntakeFormState = {
  name: "",
  email: "",
  phone: "",
  requestedDate: "",
  requestedTime: "",
  notes: "",
  website: ""
};

function formatDateForInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isWeekendDate(value: string) {
  if (!value) return false;

  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();

  return day === 0 || day === 6;
}

export function ConsultationSchedulerButton({
  options,
  availability,
  title,
  lead,
  selectorLabel,
  selectorHelper,
  buttonLabel
}: ConsultationSchedulerButtonProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(options[0]?.title ?? "");
  const [form, setForm] = useState<IntakeFormState>(initialFormState);
  const [status, setStatus] = useState<SubmissionState>({
    kind: "idle",
    message: ""
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.title === selectedTitle) ?? options[0],
    [options, selectedTitle]
  );

  const minimumDate = formatDateForInput(new Date());
  const isSubmitting = status.kind === "submitting";

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.classList.add("koinonia-modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("koinonia-modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!selectedOption) {
    return null;
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function closeModal() {
    if (isSubmitting) return;

    setIsOpen(false);
    setStatus({ kind: "idle", message: "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isWeekendDate(form.requestedDate)) {
      setStatus({
        kind: "error",
        message: "Please choose a Monday–Friday consultation date."
      });
      return;
    }

    const attribution = getMarketingAttribution();

    setStatus({
      kind: "submitting",
      message: "Sending your consultation request..."
    });

    try {
      const response = await fetch("/api/koinonia/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          consultationType: selectedOption.title,
          consultationSubject: selectedOption.subject,
          preferredDate: form.requestedDate,
          preferredTime: form.requestedTime,
          attribution,
          ...form
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        );
      }

      setStatus({
        kind: "success",
        message:
          typeof data.message === "string"
            ? data.message
            : "Your consultation request has been sent. Koinonia will follow up with next steps."
      });

      trackConsultationLead({
        consultationType: selectedOption.title,
        utmSource: attribution.utmSource,
        utmCampaign: attribution.utmCampaign
      });

      setForm(initialFormState);
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
      });
    }
  }

  return (
    <>
      <article className="koinonia-consultation-compact-card">
        <div>
          <div className="koinonia-eyebrow">Consultation Scheduler</div>
          <h3>{title}</h3>
          <p>{lead}</p>
          <span>{availability}</span>
        </div>

        <button
          className="koinonia-button primary"
          type="button"
          onClick={() => {
            setIsOpen(true);
            setStatus({ kind: "idle", message: "" });
          }}
        >
          {buttonLabel}
        </button>
      </article>

      {isOpen ? (
        <div className="koinonia-modal-shell" role="presentation">
          <button
            className="koinonia-modal-scrim"
            type="button"
            aria-label="Close consultation form"
            onClick={closeModal}
          />

          <section
            className="koinonia-consultation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <div className="koinonia-consultation-modal-header">
              <div>
                <div className="koinonia-eyebrow">Consultation Request</div>
                <h2 id={titleId}>Schedule a Consultation</h2>
                <p id={descriptionId}>{selectorHelper}</p>
              </div>

              <button
                className="koinonia-modal-close"
                type="button"
                aria-label="Close consultation form"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="koinonia-consultation-form" onSubmit={handleSubmit}>
              <input
                className="koinonia-honeypot"
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="koinonia-form-grid">
                <label className="koinonia-form-full">
                  <span>{selectorLabel}</span>
                  <select
                    value={selectedOption.title}
                    onChange={(event) => setSelectedTitle(event.target.value)}
                  >
                    {options.map((option) => (
                      <option key={option.title} value={option.title}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="koinonia-form-full koinonia-consultation-selected-summary">
                  <strong>{selectedOption.body}</strong>
                  <p>{selectedOption.bestWhen}</p>
                </div>

                <label>
                  <span>Name</span>
                  <input
                    required
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    required
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    required
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="Best callback number"
                  />
                </label>

                <label>
                  <span>Date</span>
                  <input
                    required
                    name="requestedDate"
                    type="date"
                    min={minimumDate}
                    value={form.requestedDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>Time</span>
                  <select
                    required
                    name="requestedTime"
                    value={form.requestedTime}
                    onChange={handleChange}
                  >
                    <option value="">Choose a time window</option>
                    {consultationTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="koinonia-form-full">
                  <span>What should we talk through?</span>
                  <textarea
                    required
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Share timing, transaction status, showing needs, document needs, or anything else that would help Koinonia prepare."
                  />
                </label>
              </div>

              <div className="koinonia-consultation-modal-note">
                Consultations are currently available Monday–Friday, 9:00 AM–5:00 PM.
              </div>

              {status.message ? (
                <div className={`koinonia-form-status ${status.kind}`}>
                  {status.message}
                </div>
              ) : null}

              <div className="koinonia-consultation-modal-actions">
                <button
                  className="koinonia-button secondary"
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  className="koinonia-button primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Consultation Request"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
