const ownerLinks = [
  { label: "Owner Services", href: "/owners" },
  { label: "Rental Analysis", href: "/rental-analysis", emphasis: true },
  { label: "Pricing & Scope", href: "/pricing" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Management Standards", href: "/standards" }
] as const;

const renterLinks = [
  { label: "Available Homes", href: "/rentals" },
  { label: "How to Apply", href: "/apply" },
  { label: "Rental Policies & Criteria", href: "/policies" }
] as const;

const residentLinks = [
  { label: "Resident Services", href: "/tenants" },
  { label: "Maintenance Help", href: "/maintenance" },
  { label: "Account & Portal Access", href: "/portals" },
  { label: "Resident Policies", href: "/policies" },
  { label: "Contact Support", href: "/contact" }
] as const;

type NavGroupProps = {
  label: string;
  links: readonly {
    label: string;
    href: string;
    emphasis?: boolean;
  }[];
};

function NavGroup({ label, links }: NavGroupProps) {
  return (
    <details className="koinonia-property-nav-group">
      <summary>{label}</summary>
      <div className="koinonia-property-nav-menu">
        {links.map((link) => (
          <a
            className={link.emphasis ? "emphasis" : undefined}
            href={link.href}
            key={`${label}-${link.href}-${link.label}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </details>
  );
}

export function PropertiesNav() {
  return (
    <nav
      className="koinonia-property-nav"
      aria-label="Koinonia Properties navigation"
    >
      <a className="koinonia-property-brand" href="/">
        Koinonia Properties
      </a>

      <div className="koinonia-property-nav-links">
        <NavGroup label="Owners" links={ownerLinks} />
        <NavGroup label="Find a Home" links={renterLinks} />
        <NavGroup label="Residents" links={residentLinks} />

        <a className="koinonia-property-nav-contact" href="/contact">
          Contact
        </a>

        <a className="koinonia-property-nav-cta" href="/rental-analysis">
          Request Rental Analysis
        </a>
      </div>
    </nav>
  );
}
