"use client";

import { useEffect, useState } from "react";

const ownerLinks = [
  { label: "Owner Services", href: "/owners" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free Rental Analysis", href: "/rental-analysis", emphasis: true },
  { label: "Owner FAQ", href: "/owner-faq" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Castle Rock", href: "/property-management/castle-rock" },
  { label: "Parker", href: "/property-management/parker" }
] as const;

const rentalLinks = [
  { label: "Available Homes", href: "/rentals" },
  { label: "How to Apply", href: "/apply" },
  { label: "Rental Policies", href: "/policies" }
] as const;

const residentLinks = [
  { label: "Resident Services", href: "/tenants" },
  { label: "Maintenance Request", href: "/maintenance" },
  { label: "Portal Login", href: "/portals" },
  { label: "Policies", href: "/policies" }
] as const;

const aboutLinks = [
  { label: "About & Team", href: "/about" },
  { label: "For Real Estate Agents", href: "/for-agents" },
  { label: "Buying & Selling", href: "/real-estate" },
  { label: "Vendors", href: "/vendors" }
] as const;

type NavGroupLabel = "Owners" | "Rentals" | "Residents" | "About";

type NavGroupProps = {
  label: NavGroupLabel;
  links: readonly {
    label: string;
    href: string;
    emphasis?: boolean;
  }[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

function NavGroup({
  label,
  links,
  isOpen,
  onToggle,
  onNavigate
}: NavGroupProps) {
  return (
    <details className="koinonia-property-nav-group" open={isOpen}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
      >
        {label}
      </summary>
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
  const [openGroup, setOpenGroup] = useState<NavGroupLabel | null>(null);

  useEffect(() => {
    if (!openGroup) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        setOpenGroup(null);
        return;
      }

      if (!target.closest(".koinonia-property-nav-group")) {
        setOpenGroup(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGroup]);

  const closeNavigation = () => {
    setMobileOpen(false);
    setOpenGroup(null);
  };

  const toggleGroup = (label: NavGroupLabel) => {
    setOpenGroup((current) => (current === label ? null : label));
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
        onClick={closeNavigation}
      >
        <span className="koinonia-header-mark" aria-hidden="true">
          K
        </span>

        <span className="koinonia-header-brand-text">
          <strong>Koinonia Properties</strong>
          <span>Real Estate & Property Management</span>
        </span>
      </a>

      <button
        aria-controls="koinonia-property-navigation-menu"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        className="koinonia-property-nav-toggle"
        onClick={() => {
          setOpenGroup(null);
          setMobileOpen((open) => !open);
        }}
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
          isOpen={openGroup === "Owners"}
          onToggle={() => toggleGroup("Owners")}
          onNavigate={closeNavigation}
        />
        <a
          className="koinonia-property-nav-contact"
          href="/home-not-selling"
          onClick={closeNavigation}
        >
          Home Not Selling
        </a>
        <NavGroup
          label="Rentals"
          links={rentalLinks}
          isOpen={openGroup === "Rentals"}
          onToggle={() => toggleGroup("Rentals")}
          onNavigate={closeNavigation}
        />
        <NavGroup
          label="Residents"
          links={residentLinks}
          isOpen={openGroup === "Residents"}
          onToggle={() => toggleGroup("Residents")}
          onNavigate={closeNavigation}
        />
        <NavGroup
          label="About"
          links={aboutLinks}
          isOpen={openGroup === "About"}
          onToggle={() => toggleGroup("About")}
          onNavigate={closeNavigation}
        />

        <a className="koinonia-property-nav-contact" href="/contact" onClick={closeNavigation}>Contact</a>

        <a
          className="koinonia-property-nav-contact koinonia-property-nav-login"
          href="/portals"
          onClick={closeNavigation}
        >
          Login
        </a>

        <a
          className="koinonia-property-nav-cta"
          href="/rental-analysis"
          onClick={closeNavigation}
        >
          Free Rental Analysis
        </a>
      </div>
    </nav>
  );
}
