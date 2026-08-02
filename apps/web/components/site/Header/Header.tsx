"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { brandContent } from "@/content/brand";

const publicNavigationItems = [
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
    label: "Portal",
    href: brandContent.navigation.client,
    description: "Secure workspace"
  }
] as const;

const clientNavigationItems = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    description: "Active work and updates"
  },
  {
    label: "Documents",
    href: "/client/documents",
    description: "Files and approvals"
  },
  {
    label: "Billing",
    href: "/client/billing",
    description: "Payment and account setup"
  }
] as const;

const employeeNavigationItems = [
  {
    label: "Dashboard",
    href: "/employee/dashboard",
    description: "Staff operating workspace"
  },
  {
    label: "Documents",
    href: "/employee/documents",
    description: "Document workflows"
  },
  {
    label: "Billing",
    href: "/employee/billing",
    description: "Billing operations"
  }
] as const;

type HeaderProps = {
  canAccessClientPortal?: boolean;
  canAccessEmployeePortal?: boolean;
};

export function Header({
  canAccessClientPortal = false,
  canAccessEmployeePortal = false
}: HeaderProps = {}) {
  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isClientPortalPage =
    pathname === "/client" || pathname.startsWith("/client/");

  const isEmployeePortalPage =
    pathname === "/employee" || pathname.startsWith("/employee/");

  const isPortalPage = isClientPortalPage || isEmployeePortalPage;

  const navigationItems = isClientPortalPage
    ? clientNavigationItems
    : isEmployeePortalPage
      ? employeeNavigationItems
      : publicNavigationItems;

  const portalSwitch =
    isClientPortalPage && canAccessEmployeePortal
      ? {
          href: "/employee/dashboard",
          label: "Employee Portal",
          description: "Switch to staff workspace"
        }
      : isEmployeePortalPage && canAccessClientPortal
        ? {
            href: "/client/dashboard",
            label: "Client Portal",
            description: "Switch to client workspace"
          }
        : null;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`koinonia-header${isMenuOpen ? " menu-open" : ""}`}>
      <div className="koinonia-header-inner">
        <a
          className="koinonia-header-brand"
          href={isPortalPage ? navigationItems[0].href : brandContent.navigation.home}
          aria-label={
            isPortalPage
              ? "Koinonia portal dashboard"
              : "Koinonia home"
          }
          onClick={closeMenu}
        >
          <span className="koinonia-header-mark" aria-hidden="true">
            K
          </span>

          <span className="koinonia-header-brand-text">
            <strong>{brandContent.company.name}</strong>
            <span>
              {isClientPortalPage
                ? "Client Workspace"
                : isEmployeePortalPage
                  ? "Employee Workspace"
                  : brandContent.company.tagline}
            </span>
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
            aria-label={
              isPortalPage
                ? "Koinonia portal navigation"
                : "Koinonia website navigation"
            }
          >
            {navigationItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                <span className="koinonia-header-nav-label">
                  {item.label}
                </span>

                <span className="koinonia-header-nav-description">
                  {item.description}
                </span>
              </a>
            ))}

            {portalSwitch ? (
              <a href={portalSwitch.href} onClick={closeMenu}>
                <span className="koinonia-header-nav-label">
                  {portalSwitch.label}
                </span>

                <span className="koinonia-header-nav-description">
                  {portalSwitch.description}
                </span>
              </a>
            ) : null}
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
