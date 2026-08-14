import { contactConfig, mailto } from "../../../config/contact.config";
import styles from "./Footer.module.css";

const footerContent = {
  companyName: "Koinonia Properties",
  positioning:
    "Property management built on clear communication, steady systems, and responsible care.",
  desktopExplore: [
    { label: "Owner Services", href: "/owners" },
    { label: "Rental Analysis", href: "/rental-analysis" },
    { label: "Available Homes", href: "/rentals" },
    { label: "Resident Services", href: "/tenants" },
    { label: "Maintenance Help", href: "/maintenance" },
    { label: "Service Areas", href: "/service-areas" },
    { label: "Contact", href: "/contact" }
  ],
  mobileGroups: [
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
        <circle cx="17.3" cy="6.8" r="1" className={styles.fillDot} />
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
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <section className={styles.brandSection}>
            <div className={styles.brandLockup}>
              <span className={styles.mark}>K</span>

              <div className={styles.brandText}>
                <strong>{serviceLine ?? footer.companyName}</strong>
                <span>Property Management</span>
              </div>
            </div>

            <p className={styles.description}>
              {supportLine ?? footer.positioning}
            </p>
          </section>

          <section className={styles.desktopExplore}>
            <h2 className={styles.sectionTitle}>Explore</h2>

            <nav aria-label="Koinonia Properties footer navigation" className={styles.exploreNav}>
              {footer.desktopExplore.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </section>

          <section className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Start the Conversation</h2>

            <nav aria-label="Contact Koinonia Properties" className={styles.contactPills}>
              <a href={mailto(contactConfig.consultationSubject)}>Email</a>
              <a href={contactConfig.phone.href}>Call</a>
              <a href={contactConfig.sms.href}>Text</a>
            </nav>

            <a className={styles.cta} href={footer.ctaHref}>
              {footer.ctaLabel}
            </a>

            <div
              aria-label="Koinonia Properties social profiles coming soon"
              className={styles.socials}
            >
              {socialProfiles.map((profile) => (
                <button
                  aria-label={`${profile} profile link coming soon`}
                  className={styles.socialButton}
                  disabled
                  key={profile}
                  title={`${profile} link coming soon`}
                  type="button"
                >
                  <SocialIcon profile={profile} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.mobileNavigation}>
          {footer.mobileGroups.map((group) => (
            <details className={styles.mobileGroup} key={group.title}>
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

      <div className={styles.bottom}>
        <div className={styles.faith}>
          <p>{footer.faith.line}</p>
          <small>{footer.faith.reference}</small>
        </div>

        <p className={styles.legal}>{footer.legal}</p>
      </div>
    </footer>
  );
}
