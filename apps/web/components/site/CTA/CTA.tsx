import { contactConfig, mailto } from "../../../config/contact.config";

export function CTA() {
  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-cta">
          <div className="koinonia-eyebrow">Start the Conversation</div>
          <h2 className="koinonia-heading">Ready to simplify your next transaction?</h2>
          <p className="koinonia-copy">
            When you are ready for organized, dependable real estate support, Koinonia is ready to help.
          </p>
          <div className="koinonia-actions" style={{ justifyContent: "center" }}>
            <a className="koinonia-button primary" href="/koinonia/contact">Schedule a Consultation</a>
            <a className="koinonia-button secondary" href={mailto(contactConfig.consultationSubject)}>Email Koinonia</a>
          </div>
        </div>
      </div>
    </section>
  );
}
