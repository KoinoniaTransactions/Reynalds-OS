import { sharedContent } from "@/content/shared";
import { contactConfig, mailto, socialConfig } from "../../../config/contact.config";

export function Footer() {
  const footer = sharedContent.footer;
  const socialLinks = [
    { label: "Facebook", href: socialConfig.facebook },
    { label: "Instagram", href: socialConfig.instagram },
    { label: "TikTok", href: socialConfig.tiktok },
    { label: "LinkedIn", href: socialConfig.linkedin }
  ].filter((link) => Boolean(link.href));

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

          <nav aria-label="Koinonia social media" className="koinonia-footer-social">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Koinonia on ${link.label} (opens in a new tab)`}
                title={link.label}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36 }}
              >
                {link.label === "Instagram" ? (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg>
                ) : link.label === "Facebook" ? (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13.7 22v-8.8h3l.45-3.45H13.7V7.55c0-1 .28-1.67 1.72-1.67h1.83V2.8c-.32-.05-1.4-.14-2.66-.14-2.65 0-4.46 1.62-4.46 4.6v2.49h-3v3.45h3V22h3.57Z"/></svg>
                ) : link.label === "TikTok" ? (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.7 2c.2 2.25 1.55 3.6 3.75 3.75v3.5c-1.5.08-2.8-.34-3.75-1.1v7.38c0 4.08-2.84 6.47-6.25 6.47-3.46 0-6.2-2.58-6.2-5.88 0-3.6 2.84-6.07 6.85-5.9v3.52c-2.08-.28-3.32.77-3.32 2.38 0 1.44 1.13 2.39 2.58 2.39 1.42 0 2.55-.94 2.55-2.67V2h3.79Z"/></svg>
                ) : (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h3v12H3V9Zm5 0h3v1.7c.6-1.1 1.8-2 3.6-2 3.75 0 4.4 2.46 4.4 5.67V21h-3v-5.96c0-1.42-.02-3.25-2-3.25-2 0-2.3 1.56-2.3 3.15V21H8V9Z"/></svg>
                )}
              </a>
            ))}
          </nav>

          <a
            className="koinonia-footer-cta"
            href={footer.ctaHref}
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
