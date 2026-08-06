"use client";

import Link from "next/link";

import {
  usePathname
} from "next/navigation";

import {
  useEffect,
  useRef
} from "react";

import styles from "./personal-finance-section-nav.module.css";

type PersonalFinanceSectionNavItem = {
  label: string;
  shortLabel: string;
  icon: string;
  href: string;
};

export type PersonalFinanceSectionNavGroup = {
  label: string;
  items:
    readonly PersonalFinanceSectionNavItem[];
};

type Props = {
  groups:
    readonly PersonalFinanceSectionNavGroup[];
};

function pathnameFromHref(
  href: string
): string {
  return href.split("#")[0] || "/";
}

export function PersonalFinanceSectionNav({
  groups
}: Props) {
  const pathname = usePathname();

  const navRef =
    useRef<HTMLElement | null>(null);

  useEffect(() => {
    const activeLink =
      navRef.current?.querySelector<
        HTMLAnchorElement
      >('[aria-current="page"]');

    activeLink?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }, [pathname]);

  return (
    <nav
      aria-label="J&M finance sections"
      className={styles.nav}
      ref={navRef}
    >
      {groups.map((group) => (
        <section
          className={styles.group}
          key={group.label}
        >
          <h2
            className={styles.groupLabel}
          >
            {group.label}
          </h2>

          <div
            className={styles.groupLinks}
          >
            {group.items.map((item) => {
              const targetPath =
                pathnameFromHref(
                  item.href
                );

              const active =
                pathname === targetPath;

              return (
                <Link
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    styles.link,
                    active
                      ? styles.active
                      : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  href={item.href}
                  key={item.href}
                  title={item.label}
                >
                  <span
                    aria-hidden="true"
                    className={styles.icon}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={styles.label}
                  >
                    {item.label}
                  </span>

                  <span
                    className={
                      styles.mobileLabel
                    }
                  >
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
