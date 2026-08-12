const links = [
  { label: "Owners", href: "/owners" },
  { label: "Rentals", href: "/rentals" },
  { label: "Tenants", href: "/tenants" },
  { label: "Pricing", href: "/pricing" },
  { label: "Areas", href: "/service-areas" },
  { label: "Portals", href: "/portals" },
  { label: "Standards", href: "/standards" },
  { label: "Policies", href: "/policies" },
  { label: "Contact", href: "/contact" }
];

export function PropertiesNav() {
  return (
    <nav
      className="koinonia-property-nav"
      aria-label="Koinonia Properties navigation"
    >
      <a
        className="koinonia-property-brand"
        href="/"
      >
        Koinonia Properties
      </a>

      <div className="koinonia-property-nav-links">
        {links.map((link) => (
          <a
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
