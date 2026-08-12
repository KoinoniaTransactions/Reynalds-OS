import { contactConfig, mailto } from "../../../config/contact.config";


const footerContent = {
  companyName: "Koinonia Properties",
  tagline: "Clear property management for owners and residents.",
  description:
    "Organized leasing support, maintenance coordination, owner communication, and resident support for rental property operations.",
  navigationTitle: "Property Management",
  navigation: [
    { label: "Owners", href: "/owners" },
    { label: "Tenants", href: "/tenants" },
    { label: "Rentals", href: "/rentals" },
    { label: "Maintenance", href: "/maintenance" },
    { label: "Pricing", href: "/pricing" },
    { label: "Standards", href: "/standards" }
  ],
  contactTitle: "Contact",
  ctaHref: "/rental-analysis",
  ctaLabel: "Request Rental Analysis",
  verse: {
    line: "Serving owners and residents with clarity and care.",
    reference: "Koinonia Properties"
  },
  legal:
    `Copyright ${new Date().getFullYear()} Koinonia Properties. All rights reserved.`
} as const;

type FooterProps = {
  serviceLine?: string;
  supportLine?: string;
};

export function Footer({ serviceLine, supportLine }: FooterProps = {}) {
  const footer = footerContent;

  return (
    <footer className="koinonia-footer">
      <div className="koinonia-footer-inner">
        <div className="koinonia-footer-main">
          <div className="koinonia-footer-brand">
            <span className="koinonia-footer-mark">K</span>

            <div>
              <strong>{serviceLine ?? footer.companyName}</strong>
              <p>{supportLine ?? footer.tagline}</p>
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

            >
              Call
            </a>

            <a
              href={contactConfig.sms.href}

            >
              Text
            </a>
          </div>

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
