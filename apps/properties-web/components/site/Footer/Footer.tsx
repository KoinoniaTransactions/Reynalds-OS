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

const socialProfiles = ["Facebook", "Instagram", "TikTok"] as const;

type SocialProfile = (typeof socialProfiles)[number];

type FooterProps = {
  serviceLine?: string;
  supportLine?: string;
};

function SocialIcon({ profile }: { profile: SocialProfile }) {
  if (profile === "Facebook") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H7.4v3h2.8v8h3.4Z" />
      </svg>
    );
  }

  if (profile === "Instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.3" cy="6.8" r="1" className="fill-dot" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14.2 4v9.2a4.2 4.2 0 1 1-3.6-4.1v2.8a1.6 1.6 0 1 0 1 1.5V4h2.6Zm0 0c.4 2.1 1.6 3.5 3.8 4v2.7a7.2 7.2 0 0 1-3.8-1.3V4Z" />
    </svg>
  );
}

export function Footer({ serviceLine, supportLine }: FooterProps = {}) {
  const footer = footerContent;

  return (
    <footer className="koinonia-footer properties-footer">
      <div className="koinonia-footer-inner properties-footer-inner">
        <div className="properties-footer-lead">
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

            <div className="properties-footer-contact">
              <a href={mailto(contactConfig.consultationSubject)}>
                {contactConfig.email}
              </a>

              <div className="properties-footer-phone-actions">
                <a href={contactConfig.phone.href}>
                  Call {contactConfig.phone.display}
                </a>
                <span aria-hidden="true">·</span>
                <a href={contactConfig.sms.href}>
                  Text {contactConfig.sms.display}
                </a>
              </div>
            </div>

            <div
              aria-label="Koinonia Properties social profiles coming soon"
              className="properties-footer-socials"
            >
              {socialProfiles.map((profile) => (
                <button
                  aria-label={`${profile} profile link coming soon`}
                  className="properties-footer-social-button"
                  disabled
                  key={profile}
                  title={`${profile} link coming soon`}
                  type="button"
                >
                  <SocialIcon profile={profile} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="properties-footer-navigation properties-footer-navigation-desktop"
          aria-label="Koinonia Properties footer navigation"
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

        <div className="properties-footer-navigation properties-footer-navigation-mobile">
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
