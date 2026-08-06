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
  href: string;
  className: string;
};

type Props = {
  items: readonly PersonalFinanceSectionNavItem[];
};

function pathnameFromHref(
  href: string
): string {
  return href.split("#")[0] || "/";
}

export function PersonalFinanceSectionNav({
  items
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
      aria-label="Personal finance sections"
      className={styles.nav}
      ref={navRef}
    >
      {items.map(
        ({
          label,
          href,
          className
        }) => {
          const targetPath =
            pathnameFromHref(href);

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
                className,
                active
                  ? styles.active
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
              href={href}
              key={href}
            >
              <span
                aria-hidden="true"
                className={styles.dot}
              />

              <span
                className={styles.label}
              >
                {label}
              </span>
            </Link>
          );
        }
      )}
    </nav>
  );
}
