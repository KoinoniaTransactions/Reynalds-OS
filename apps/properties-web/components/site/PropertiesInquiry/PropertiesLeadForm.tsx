"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { mailto } from "../../../config/contact.config";

type InquiryKind = "owner" | "rental" | "buyer" | "seller" | "general";

type TurnstileClient = {
  render: (container: HTMLElement, config: { sitekey: string; theme: "auto" }) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

function getTurnstile(): TurnstileClient | undefined {
  return (window as Window & { turnstile?: TurnstileClient }).turnstile;
}

const labels: Record<InquiryKind, string> = {
  owner: "Property management inquiry",
  rental: "Rental analysis request",
  buyer: "Buying a home",
  seller: "Selling a home",
  general: "General question"
};

const available =
  process.env.NEXT_PUBLIC_PROPERTIES_INQUIRIES_ENABLED === "true" &&
  Boolean(process.env.NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY);

export function PropertiesLeadForm({ kind }: { kind: InquiryKind }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [response, setResponse] = useState("");
  const challengeContainer = useRef<HTMLDivElement>(null);
  const challengeId = useRef<string | null>(null);

  useEffect(() => {
    if (!available) return;
    // A single shared Turnstile script serves every form on a page.
    // Rendering each widget independently avoids a missing challenge when
    // both buyer and seller forms mount on /real-estate.
    const renderWhenReady = () => {
      const client = getTurnstile();
      const container = challengeContainer.current;
      const sitekey = process.env.NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY;
      if (client && container && sitekey && !challengeId.current) {
        challengeId.current = client.render(container, { sitekey, theme: "auto" }) ?? null;
      }
    };
    renderWhenReady();
    const timer = window.setInterval(renderWhenReady, 500);
    return () => {
      window.clearInterval(timer);
      if (challengeId.current) {
        getTurnstile()?.remove(challengeId.current);
        challengeId.current = null;
      }
    };
  }, []);

  function renderChallenge() {
    const client = getTurnstile();
    const container = challengeContainer.current;
    const sitekey = process.env.NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY;
    if (client && container && sitekey && !challengeId.current) {
      challengeId.current = client.render(container, { sitekey, theme: "auto" }) ?? null;
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || state === "sending") return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const turnstileToken = String(fields.get("cf-turnstile-response") ?? "");
    if (!turnstileToken) {
      setState("error");
      setResponse("Please complete the verification step.");
      return;
    }
    setState("sending");
    setResponse("");
    try {
      const result = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: fields.get("name"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          propertyAddress: fields.get("propertyAddress"),
          message: fields.get("message"),
          website: fields.get("website"),
          turnstileToken
        })
      });
      const answer = await result.json() as { ok?: boolean; message?: string };
      if (!result.ok || !answer.ok) throw new Error(answer.message || "Submission failed.");
      setState("success");
      setResponse(answer.message || "Your inquiry has been submitted.");
      form.reset();
    } catch (error) {
      setState("error");
      setResponse(error instanceof Error ? error.message : "Please contact us directly.");
      // Turnstile tokens expire and can only be verified once.
      if (challengeId.current) getTurnstile()?.reset(challengeId.current);
    }
  }

  if (!available) {
    return (
      <div className="properties-lead-form properties-lead-form-unavailable">
        <h3>Start a conversation</h3>
        <p>Online requests are not available yet. Reach us directly and tell us a little about your plans.</p>
        <a className="koinonia-button primary" href={mailto("Koinonia Properties - " + labels[kind])}>
          Email Koinonia Properties
        </a>
      </div>
    );
  }

  return (
    <div className="properties-lead-form">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={renderChallenge}
        strategy="afterInteractive"
      />
      <h3>{labels[kind]}</h3>
      {state === "success" ? (
        <p className="properties-lead-notice" role="status">{response}</p>
      ) : (
        <form onSubmit={submit}>
          <div className="properties-lead-row">
            <label>
              Your name <span aria-hidden="true">*</span>
              <input name="name" autoComplete="name" maxLength={110} required />
            </label>
            <label>
              Email <span aria-hidden="true">*</span>
              <input type="email" name="email" autoComplete="email" maxLength={180} required />
            </label>
          </div>
          <div className="properties-lead-row">
            <label>
              Phone (optional)
              <input type="tel" name="phone" autoComplete="tel" maxLength={40} />
            </label>
            <label>
              Property address (if applicable)
              <input name="propertyAddress" maxLength={250} autoComplete="street-address" />
            </label>
          </div>
          <label>
            How can we help? <span aria-hidden="true">*</span>
            <textarea name="message" rows={4} minLength={12} maxLength={1600} required
              placeholder="A few details about your property, plans, or timing" />
          </label>
          <div className="properties-lead-trap" aria-hidden="true">
            <label>Website <input name="website" autoComplete="off" tabIndex={-1} /></label>
          </div>
          <div ref={challengeContainer} />
          <p className="properties-lead-privacy">We use this information to respond to your inquiry. Please don't include payment details, identification numbers, or sensitive account information.</p>
          <button className="koinonia-button primary" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Submitting..." : "Send Inquiry"}
          </button>
          {state === "error" ? (
            <p className="properties-lead-error" role="alert">
              {response} You can also <a href={mailto("Koinonia Properties - " + labels[kind])}>email us directly</a>.
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
