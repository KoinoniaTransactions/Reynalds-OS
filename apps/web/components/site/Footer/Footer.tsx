import { contactConfig, mailto } from "../../../config/contact.config";

export function Footer() {
  return (
    <footer className="koinonia-footer">
      <div className="koinonia-footer-inner">
        <div>
          <strong>Koinonia</strong>
          <div style={{ color: "#cfcfcf", marginTop: 4 }}>Real estate operations support for Realtors.</div>
          <div className="koinonia-footer-contact">
            <a href={mailto()}>Email</a>
            <a href={contactConfig.phone.href} aria-disabled={contactConfig.phone.isPlaceholder ? "true" : undefined}>Phone</a>
            <a href={contactConfig.sms.href} aria-disabled={contactConfig.sms.isPlaceholder ? "true" : undefined}>Text</a>
          </div>
        </div>
        <nav aria-label="Koinonia footer navigation">
          <a href="/koinonia">Home</a>
          <a href="/koinonia/services">Services</a>
          <a href="/koinonia/about">About</a>
          <a href="/koinonia/contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
