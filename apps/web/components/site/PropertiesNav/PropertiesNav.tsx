const links = [
  { label: "Owners", href: "/properties/owners" },
  { label: "Rentals", href: "/properties/rentals" },
  { label: "Tenants", href: "/properties/tenants" },
  { label: "Pricing", href: "/properties/pricing" },
  { label: "Areas", href: "/properties/service-areas" },
  { label: "Portals", href: "/properties/portals" },
  { label: "Standards", href: "/properties/standards" },
  { label: "Policies", href: "/properties/policies" },
  { label: "Contact", href: "/koinonia/contact" }
];

export function PropertiesNav() {
  return (
    <nav className="koinonia-property-nav" aria-label="Koinonia Properties navigation">
      <a className="koinonia-property-brand" href="/properties">Koinonia Properties</a>
      <div className="koinonia-property-nav-links">
        {links.map((link) => (
          <a href={link.href} key={link.href}>{link.label}</a>
        ))}
      </div>
    </nav>
  );
}
