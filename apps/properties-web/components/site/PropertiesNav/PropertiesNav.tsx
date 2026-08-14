"use client";

import { useState } from "react";

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
  onNavigate?: () => void;
};

function NavGroup({ label, links, onNavigate }: NavGroupProps) {
  return (
    <details className="koinonia-property-nav-group">
      <summary>{label}</summary>
      <div className="koinonia-property-nav-menu">
        {links.map((link) => (
          <a
            className={link.emphasis ? "emphasis" : undefined}
            href={link.href}
            key={`${label}-${link.href}-${link.label}`}
            onClick={() => onNavigate?.()}
          >
            {link.label}
          </a>
        ))}
      </div>
    </details>
  );
}

export function PropertiesNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <nav
      className="koinonia-property-nav"
      aria-label="Koinonia Properties navigation"
    >
      <a
        aria-label="Koinonia Properties home"
        className="koinonia-property-brand koinonia-header-brand"
        href="/"
        onClick={closeMobileMenu}
      >
        <span className="koinonia-header-mark" aria-hidden="true">
          K
        </span>

        <span className="koinonia-header-brand-text">
          <strong>Koinonia Properties</strong>
          <span>Property Management</span>
        </span>
      </a>

      <button
        aria-controls="koinonia-property-navigation-menu"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        className="koinonia-property-nav-toggle"
        onClick={() => setMobileOpen((open) => !open)}
        type="button"
      >
        <span className="koinonia-property-nav-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className={`koinonia-property-nav-links${mobileOpen ? " is-open" : ""}`}
        id="koinonia-property-navigation-menu"
      >
        <NavGroup
          label="Owners"
          links={ownerLinks}
          onNavigate={closeMobileMenu}
        />
        <NavGroup
          label="Find a Home"
          links={renterLinks}
          onNavigate={closeMobileMenu}
        />
        <NavGroup
          label="Residents"
          links={residentLinks}
          onNavigate={closeMobileMenu}
        />

        <a
          className="koinonia-property-nav-contact"
          href="/contact"
          onClick={closeMobileMenu}
        >
          Contact
        </a>

        <a
          className="koinonia-property-nav-cta"
          href="/rental-analysis"
          onClick={closeMobileMenu}
        >
          Request Rental Analysis
        </a>
      </div>
    </nav>
  );
}
