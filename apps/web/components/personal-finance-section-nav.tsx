"use client";

import {
  useEffect,
  useState
} from "react";

import styles from "./personal-finance-mvp.module.css";

type PersonalFinanceSectionNavItem = {
  label: string;
  href: `#${string}`;
  className: string;
};

type PersonalFinanceSectionNavProps = {
  items: readonly PersonalFinanceSectionNavItem[];
};

const DEFAULT_SECTION = "#overview";

function currentSectionHash(): string {
  if (typeof window === "undefined") {
    return DEFAULT_SECTION;
  }

  return window.location.hash || DEFAULT_SECTION;
}

export function PersonalFinanceSectionNav({
  items
}: PersonalFinanceSectionNavProps) {
  const [activeHash, setActiveHash] =
    useState(DEFAULT_SECTION);

  useEffect(() => {
    const syncActiveSection = () => {
      setActiveHash(currentSectionHash());
    };

    syncActiveSection();

    window.addEventListener(
      "hashchange",
      syncActiveSection
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        syncActiveSection
      );
    };
  }, []);

  return (
    <nav
      className={styles.nav}
      aria-label="Personal finance sections"
    >
      {items.map(
        ({
          label,
          href,
          className
        }) => {
          const active = activeHash === href;

          return (
            <a
              aria-current={
                active ? "page" : undefined
              }
              className={`${styles.navLink} ${className} ${
                active
                  ? styles.navLinkActive
                  : ""
              }`}
              href={href}
              key={href}
            >
              <span className={styles.navDot} />

              <span className={styles.navLabel}>
                {label}
              </span>
            </a>
          );
        }
      )}
    </nav>
  );
}
