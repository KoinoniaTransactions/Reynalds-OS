"use client";

import { useState } from "react";
import { brandContent } from "@/content/brand";

const navigationItems = [
  {
    label: "Home",
    href: brandContent.navigation.home
  },
  {
    label: "Services",
    href: brandContent.navigation.services
  },
  {
    label: "About",
    href: brandContent.navigation.about
  },
  {
    label: "Contact",
    href: brandContent.navigation.contact
  }
] as const;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="koinonia-header">
      <div className="koinonia-header-inner">
        <a
          className="koinonia-header-brand"
          href={brandContent.navigation.home}
          aria-label="Koinonia home"
          onClick={closeMenu}
        >
          <span className="koinonia-header-mark">K</span>

          <span className="koinonia-header-brand-text">
            <strong>{brandContent.company.name}</strong>
            <span>{brandContent.company.tagline}</span>
          </span>
        </a>

        <button
          className="koinonia-header-menu-button"
          type="button"
          aria-label={isOpen ? "Close Koinonia navigation menu" : "Open Koinonia navigation menu"}
          aria-expanded={isOpen}
          aria-controls="koinonia-header-menu"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div
          id="koinonia-header-menu"
          className={`koinonia-header-menu${isOpen ? " open" : ""}`}
        >
          <nav className="koinonia-header-nav" aria-label="Koinonia main navigation">
            {navigationItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
          </nav>

          <a
            className="koinonia-header-cta"
            href={brandContent.navigation.contact}
            onClick={closeMenu}
          >
            {brandContent.cta.primaryLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
