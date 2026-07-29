"use client";

import { useState } from "react";

type AccessRequestFormProps = {
  storageReady: boolean;
};

export function AccessRequestForm({ storageReady }: AccessRequestFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setStatus("error");
      setMessage("Access request storage is not available yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setStatus(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/portal/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accessPurpose: formData.get("accessPurpose"),
          clientName: formData.get("clientName"),
          notes: formData.get("notes"),
          permissionLevel: formData.get("permissionLevel"),
          platformName: formData.get("platformName"),
          relatedWorkName: formData.get("relatedWorkName"),
          status: formData.get("status")
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save this access request yet.");
      }

      event.currentTarget.reset();
      setStatus("success");
      setMessage("Access update saved. Koinonia can review the safe access next step.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save this access request yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !storageReady || isSubmitting;

  return (
    <section className="koinonia-client-request-card">
      <p className="koinonia-eyebrow">Access Update</p>
      <form className="koinonia-access-request-form" onSubmit={handleSubmit}>
        <label>
          Platform
          <select disabled={disabled} name="platformName" required>
            <option value="Transaction platform">Transaction platform</option>
            <option value="Forms workspace">Forms workspace</option>
            <option value="E-signature platform">E-signature platform</option>
            <option value="CRM or operations tool">CRM or operations tool</option>
            <option value="Brokerage or MLS system">Brokerage or MLS system</option>
            <option value="Other approved system">Other approved system</option>
          </select>
        </label>

        <label>
          Purpose
          <select disabled={disabled} name="accessPurpose" required>
            <option value="Prepare contract or document support">
              Prepare contract or document support
            </option>
            <option value="Track transaction deadlines">Track transaction deadlines</option>
            <option value="Upload or retrieve approved forms">Upload or retrieve approved forms</option>
            <option value="Coordinate showing support">Coordinate showing support</option>
            <option value="Support CRM or monthly operations">Support CRM or monthly operations</option>
          </select>
        </label>

        <label>
          Access Type
          <select disabled={disabled} name="permissionLevel">
            <option value="Transaction coordinator access">Transaction coordinator access</option>
            <option value="Team or assistant access">Team or assistant access</option>
            <option value="Read-only access">Read-only access</option>
            <option value="Document-prep access">Document-prep access</option>
            <option value="Scheduling access">Scheduling access</option>
          </select>
        </label>

        <label>
          Status
          <select disabled={disabled} name="status">
            <option value="Access Needed">I need instructions</option>
            <option value="Waiting on Client">I am working on it</option>
            <option value="Client Says Granted">I granted delegated access</option>
            <option value="Blocked">This is blocked</option>
            <option value="No Longer Needed">No longer needed</option>
          </select>
        </label>

        <label>
          Client or Team
          <input disabled={disabled} name="clientName" placeholder="Client/team name" type="text" />
        </label>

        <label>
          Work Item
          <input disabled={disabled} name="relatedWorkName" placeholder="Transaction or request" type="text" />
        </label>

        <label>
          Notes
          <textarea
            disabled={disabled}
            name="notes"
            placeholder="Use instructions only; no passwords, usernames, or access codes"
            rows={4}
          />
        </label>

        <button className="koinonia-button primary" disabled={disabled} type="submit">
          {isSubmitting ? "Saving" : "Save Access Update"}
        </button>

        {!storageReady ? (
          <p className="koinonia-client-security-note">
            Access updates will save once production storage is reachable.
          </p>
        ) : null}

        {message ? (
          <p className={`koinonia-access-request-form-status ${status ?? ""}`}>{message}</p>
        ) : null}
      </form>
    </section>
  );
}
