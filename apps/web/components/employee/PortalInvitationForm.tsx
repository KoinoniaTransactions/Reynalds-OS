"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type PortalInvitationFormProps = {
  storageReady: boolean;
};

type InvitationFormState = {
  billingStatus: string;
  clientName: string;
  email: string;
  name: string;
  packageName: string;
  roleName: string;
  sendProviderInvitation: boolean;
};

const initialFormState: InvitationFormState = {
  billingStatus: "Billing setup needed",
  clientName: "",
  email: "",
  name: "",
  packageName: "Transaction Coordination Plus",
  roleName: "Client",
  sendProviderInvitation: false
};

const roleOptions = [
  "Client",
  "Operations",
  "Transaction Coordinator",
  "Contract Support",
  "Showing Provider",
  "Customer Success",
  "Finance",
  "Viewer"
];

const packageOptions = [
  "Transaction Coordination Plus",
  "Contract & Document Support",
  "Licensed Showing Coverage",
  "Monthly Operations Partnership",
  "Pay-at-Closing Coordination",
  "Custom Scope"
];

const billingOptions = [
  "Billing setup needed",
  "Prepay due",
  "Payment method ready",
  "Pay after close",
  "Per showing",
  "Custom billing"
];

export function PortalInvitationForm({ storageReady }: PortalInvitationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<InvitationFormState>(initialFormState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setError("Production storage is not connected yet.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portal/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name || undefined,
          redirectUrl: form.roleName === "Client" ? "/client/dashboard" : "/employee/dashboard",
          roleName: form.roleName,
          sendProviderInvitation: form.sendProviderInvitation,
          serviceContext: {
            billingStatus: form.billingStatus,
            clientName: form.clientName || undefined,
            packageName: form.packageName,
            source: "employee-access-workspace"
          }
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Invitation could not be created.");
      }

      setForm(initialFormState);
      setMessage(
        form.sendProviderInvitation
          ? "Invitation record created and provider invite requested."
          : "Invitation record created."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invitation could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof InvitationFormState>(field: K, value: InvitationFormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <section className="koinonia-employee-request-card">
      <p className="koinonia-eyebrow">Create Access</p>
      <form className="koinonia-access-form" onSubmit={submitInvitation}>
        <label>
          Name
          <input
            value={form.name}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Client or staff name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
            required
          />
        </label>

        <label>
          Role
          <select
            value={form.roleName}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("roleName", event.target.value)}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label>
          Client or Team
          <input
            value={form.clientName}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("clientName", event.target.value)}
            placeholder="Client account"
          />
        </label>

        <label>
          Package
          <select
            value={form.packageName}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("packageName", event.target.value)}
          >
            {packageOptions.map((packageName) => (
              <option key={packageName} value={packageName}>
                {packageName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Billing
          <select
            value={form.billingStatus}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("billingStatus", event.target.value)}
          >
            {billingOptions.map((billingStatus) => (
              <option key={billingStatus} value={billingStatus}>
                {billingStatus}
              </option>
            ))}
          </select>
        </label>

        <label className="koinonia-access-checkbox">
          <input
            type="checkbox"
            checked={form.sendProviderInvitation}
            disabled={!storageReady || isSubmitting}
            onChange={(event) => updateField("sendProviderInvitation", event.target.checked)}
          />
          Send managed login invite now
        </label>

        {error ? <p className="koinonia-access-form-status error">{error}</p> : null}
        {message ? <p className="koinonia-access-form-status success">{message}</p> : null}

        <button className="koinonia-button primary" type="submit" disabled={!storageReady || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Invitation"}
        </button>
      </form>
    </section>
  );
}
