import { contactConfig, mailto } from "../../../config/contact.config";

const footerContent = {
  companyName: "Koinonia Properties",
  positioning:
    "Property management built on clear communication, steady systems, and responsible care.",
  groups: [
    {
      title: "Owners",
      links: [
        { label: "Owner Services", href: "/owners" },
        { label: "Rental Analysis", href: "/rental-analysis" },
        { label: "Pricing & Scope", href: "/pricing" },
        { label: "Service Areas", href: "/service-areas" },
        { label: "Management Standards", href: "/standards" }
      ]
    },
    {
      title: "Find a Home",
      links: [
        { label: "Available Homes", href: "/rentals" },
        { label: "How to Apply", href: "/apply" },
        { label: "Rental Policies & Criteria", href: "/policies" }
      ]
    },
    {
      title: "Residents",
      links: [
        { label: "Resident Services", href: "/tenants" },
        { label: "Maintenance Help", href: "/maintenance" },
        { label: "Account & Portal Access", href: "/portals" },
        { label: "Resident Policies", href: "/policies" }
      ]
    },
    {
      title: "Koinonia",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Vendor Information", href: "/vendors" }
      ]
    }
  ],
  ctaHref: "/rental-analysis",
  ctaLabel: "Request Rental Analysis",
  faith: {
    line: "Bear one another’s burdens. Work heartily, as for the Lord.",
    reference: "Galatians 6:2 · Colossians 3:23"
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
    <footer className="koinonia-footer properties-footer">
      <div className="koinonia-footer-inner properties-footer-inner">
        <div className="properties-footer-lead" style={{ gridColumn: "1 / -1" }}>
          <div className="properties-footer-brand-block">
            <div className="koinonia-footer-brand properties-footer-brand">
              <span className="koinonia-footer-mark">K</span>

              <div>
                <strong>{serviceLine ?? footer.companyName}</strong>
                <p>Property Management</p>
              </div>
            </div>

            <p className="properties-footer-positioning">
              {supportLine ?? footer.positioning}
            </p>
          </div>

          <div className="properties-footer-actions">
            <a className="koinonia-footer-cta properties-footer-cta" href={footer.ctaHref}>
              {footer.ctaLabel}
            </a>

            <nav
              aria-label="Contact Koinonia Properties"
              className="properties-footer-contact"
            >
              <a href={mailto(contactConfig.consultationSubject)}>Email</a>
              <span aria-hidden="true">·</span>
              <a href={contactConfig.phone.href}>Call</a>
              <span aria-hidden="true">·</span>
              <a href={contactConfig.sms.href}>Text</a>
            </nav>
          </div>
        </div>

        <div
          className="properties-footer-navigation properties-footer-navigation-desktop"
          aria-label="Koinonia Properties footer navigation"
          style={{ gridColumn: "1 / -1" }}
        >
          {footer.groups.map((group) => (
            <section className="properties-footer-group" key={group.title}>
              <h2>{group.title}</h2>

              <nav aria-label={`Koinonia ${group.title} footer navigation`}>
                {group.links.map((item) => (
                  <a key={`${group.title}-${item.href}-${item.label}`} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </section>
          ))}
        </div>

        <div
          className="properties-footer-navigation properties-footer-navigation-mobile"
          style={{ gridColumn: "1 / -1" }}
        >
          {footer.groups.map((group) => (
            <details className="properties-footer-mobile-group" key={group.title}>
              <summary>{group.title}</summary>

              <nav aria-label={`Koinonia ${group.title} footer navigation`}>
                {group.links.map((item) => (
                  <a key={`${group.title}-${item.href}-${item.label}`} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </details>
          ))}
        </div>
      </div>

      <div className="koinonia-footer-bottom properties-footer-bottom">
        <div className="properties-footer-faith">
          <p>{footer.faith.line}</p>
          <small>{footer.faith.reference}</small>
        </div>

        <p className="properties-footer-legal">{footer.legal}</p>
      </div>
    </footer>
  );
}
