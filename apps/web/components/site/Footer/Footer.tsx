import { sharedContent } from "@/content/shared";
import { contactConfig, mailto } from "../../../config/contact.config";

export function Footer() {
  const footer = sharedContent.footer;

  return (
    <footer className="koinonia-footer">
      <div className="koinonia-footer-inner">
        <div className="koinonia-footer-main">
          <div className="koinonia-footer-brand">
            <span className="koinonia-footer-mark">K</span>

            <div>
              <strong>{footer.companyName}</strong>
              <p>{footer.tagline}</p>
            </div>
          </div>

          <p className="koinonia-footer-description">
            {footer.description}
          </p>
        </div>

        <div className="koinonia-footer-section">
          <h2>{footer.navigationTitle}</h2>

          <nav aria-label="Koinonia footer navigation">
            {footer.navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="koinonia-footer-section">
          <h2>{footer.contactTitle}</h2>

          <div className="koinonia-footer-contact">
            <a href={mailto(contactConfig.consultationSubject)}>
              Email
            </a>

            <a
              href={contactConfig.phone.href}
              aria-disabled={contactConfig.phone.isPlaceholder ? "true" : undefined}
            >
              Call
            </a>

            <a
              href={contactConfig.sms.href}
              aria-disabled={contactConfig.sms.isPlaceholder ? "true" : undefined}
            >
              Text
            </a>
          </div>

          <a
            className="koinonia-footer-cta"
            href={mailto(contactConfig.consultationSubject)}
          >
            {footer.ctaLabel}
          </a>
        </div>
      </div>

      <div className="koinonia-footer-bottom">
        <p>
          <span>{footer.verse.line}</span>
          <small>{footer.verse.reference}</small>
        </p>

        <p>{footer.legal}</p>
      </div>
    </footer>
  );
}
