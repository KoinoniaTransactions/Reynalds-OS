import { contactConfig, mailto } from "../../../config/contact.config";

const footerContent = {
  companyName: "Koinonia Properties",
  tagline: "Clear property management for owners and residents.",
  description:
    "Organized leasing support, maintenance coordination, owner communication, and resident support for rental property operations.",
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
      title: "Renters",
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
      <div className="koinonia-footer-inner properties-footer-inner">
        <div className="koinonia-footer-main properties-footer-main">
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

          <div className="koinonia-footer-contact properties-footer-contact">
            <a href={mailto(contactConfig.consultationSubject)}>Email</a>
            <a href={contactConfig.phone.href}>Call</a>
            <a href={contactConfig.sms.href}>Text</a>
          </div>

          <a className="koinonia-footer-cta" href={footer.ctaHref}>
            {footer.ctaLabel}
          </a>
        </div>

        {footer.groups.map((group) => (
          <div className="koinonia-footer-section" key={group.title}>
            <h2>{group.title}</h2>

            <nav aria-label={`Koinonia ${group.title} footer navigation`}>
              {group.links.map((item) => (
                <a key={`${group.title}-${item.href}-${item.label}`} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        ))}
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
