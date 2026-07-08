import { sharedContent } from "@/content/shared";
import { contactConfig, mailto } from "../../../config/contact.config";

export function CTA() {
  const cta = sharedContent.cta;

  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-cta">
          <div className="koinonia-eyebrow">{cta.eyebrow}</div>
          <h2 className="koinonia-heading">{cta.title}</h2>
          <p className="koinonia-copy">{cta.body}</p>
          <div className="koinonia-actions" style={{ justifyContent: "center" }}>
            <a className="koinonia-button primary" href={cta.primaryHref}>
              {cta.primaryLabel}
            </a>
            <a className="koinonia-button secondary" href={mailto(contactConfig.consultationSubject)}>
              {cta.secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}