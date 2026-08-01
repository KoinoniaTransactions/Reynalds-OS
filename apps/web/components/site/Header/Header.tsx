"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { brandContent } from "@/content/brand";

const navigationItems = [
  {
    label: "Home",
    href: brandContent.navigation.home,
    description: "Start with the overview"
  },
  {
    label: "Services",
    href: brandContent.navigation.services,
    description: "Explore support options"
  },
  {
    label: "About",
    href: brandContent.navigation.about,
    description: "Learn the purpose"
  },
  {
    label: "Contact",
    href: brandContent.navigation.contact,
    description: "Start the conversation"
  },
  {
    label: "Client Login",
    href: brandContent.navigation.client,
    description: "Portal access"
  }
] as const;

export function Header() {
  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPortalPage =
    pathname === "/client" ||
    pathname.startsWith("/client/") ||
    pathname === "/employee" ||
    pathname.startsWith("/employee/");

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`koinonia-header${isMenuOpen ? " menu-open" : ""}`}>
      <div className="koinonia-header-inner">
        <a
          className="koinonia-header-brand"
          href={brandContent.navigation.home}
          aria-label="Koinonia home"
          onClick={closeMenu}
        >
          <span className="koinonia-header-mark" aria-hidden="true">
            K
          </span>

          <span className="koinonia-header-brand-text">
            <strong>{brandContent.company.name}</strong>
            <span>{brandContent.company.tagline}</span>
          </span>
        </a>

        <button
          className="koinonia-header-menu-button"
          type="button"
          aria-label={
            isMenuOpen
              ? "Close Koinonia navigation"
              : "Open Koinonia navigation"
          }
          aria-expanded={isMenuOpen}
          aria-controls="koinonia-header-menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div
          className={`koinonia-header-menu${isMenuOpen ? " open" : ""}`}
          id="koinonia-header-menu"
        >
          <nav
            className="koinonia-header-nav"
            aria-label="Koinonia navigation"
          >
            {navigationItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                <span className="koinonia-header-nav-label">{item.label}</span>
                <span className="koinonia-header-nav-description">
                  {item.description}
                </span>
              </a>
            ))}
          </nav>

          {isPortalPage ? (
            <form action="/sign-out" method="post">
              <button
                className="koinonia-header-cta"
                type="submit"
                onClick={closeMenu}
              >
                <span>Sign Out</span>
                <span className="koinonia-header-cta-detail">
                  End this secure portal session
                </span>
              </button>
            </form>
          ) : (
            <a
              className="koinonia-header-cta"
              href={brandContent.cta.primaryHref}
              onClick={closeMenu}
            >
              <span>{brandContent.cta.primaryLabel}</span>
              <span className="koinonia-header-cta-detail">
                Start with a clear next step
              </span>
            </a>
          )}
        </div>
      </div>

      <button
        className="koinonia-header-scrim"
        type="button"
        aria-label="Close Koinonia navigation"
        hidden={!isMenuOpen}
        onClick={closeMenu}
      />
    </header>
  );
}
