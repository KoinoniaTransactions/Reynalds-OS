"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent
} from "react";

import styles from "./personal-finance-section-nav.module.css";

type PersonalFinanceSectionNavItem = {
  label: string;
  href: `#${string}`;
  className: string;
};

type PersonalFinanceSectionNavProps = {
  items: readonly PersonalFinanceSectionNavItem[];
};

const DEFAULT_SECTION = "#overview";
const SCROLL_ATTEMPTS = 24;
const SCROLL_RETRY_DELAY = 80;

function browserHash(): string {
  return window.location.hash || DEFAULT_SECTION;
}

function targetForHash(
  hash: string
): HTMLElement | null {
  const id = hash.replace(/^#/, "");

  if (!id) {
    return null;
  }

  return document.getElementById(id);
}

export function PersonalFinanceSectionNav({
  items
}: PersonalFinanceSectionNavProps) {
  const [activeHash, setActiveHash] =
    useState(DEFAULT_SECTION);

  const navRef =
    useRef<HTMLElement | null>(null);

  const scrollTargetIntoView =
    useCallback(
      (
        hash: string,
        behavior: ScrollBehavior
      ) => {
        let attempt = 0;
        let cancelled = false;
        let timer: number | undefined;

        const performScroll = () => {
          if (cancelled) {
            return;
          }

          const target =
            targetForHash(hash);

          if (target) {
            target.scrollIntoView({
              behavior,
              block: "start"
            });

            return;
          }

          attempt += 1;

          if (
            attempt < SCROLL_ATTEMPTS
          ) {
            timer = window.setTimeout(
              performScroll,
              SCROLL_RETRY_DELAY
            );
          }
        };

        performScroll();

        return () => {
          cancelled = true;

          if (timer !== undefined) {
            window.clearTimeout(timer);
          }
        };
      },
      []
    );

  const revealActiveTab =
    useCallback(
      (hash: string) => {
        const activeLink =
          navRef.current?.querySelector<
            HTMLAnchorElement
          >(
            `[data-section-href="${hash}"]`
          );

        activeLink?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      },
      []
    );

  useEffect(() => {
    if (
      "scrollRestoration" in
      window.history
    ) {
      window.history.scrollRestoration =
        "manual";
    }

    const initialHash = browserHash();

    setActiveHash(initialHash);

    const cancelInitialScroll =
      scrollTargetIntoView(
        initialHash,
        "auto"
      );

    const revealTimer =
      window.setTimeout(
        () =>
          revealActiveTab(
            initialHash
          ),
        120
      );

    const syncFromHash = () => {
      const hash = browserHash();

      setActiveHash(hash);

      scrollTargetIntoView(
        hash,
        "smooth"
      );

      revealActiveTab(hash);
    };

    window.addEventListener(
      "hashchange",
      syncFromHash
    );

    return () => {
      cancelInitialScroll();

      window.clearTimeout(
        revealTimer
      );

      window.removeEventListener(
        "hashchange",
        syncFromHash
      );
    };
  }, [
    revealActiveTab,
    scrollTargetIntoView
  ]);

  function navigate(
    event: MouseEvent<HTMLAnchorElement>,
    href: `#${string}`
  ) {
    event.preventDefault();

    setActiveHash(href);

    if (
      window.location.hash === href
    ) {
      scrollTargetIntoView(
        href,
        "smooth"
      );

      revealActiveTab(href);

      return;
    }

    window.history.pushState(
      null,
      "",
      href
    );

    window.dispatchEvent(
      new HashChangeEvent(
        "hashchange"
      )
    );
  }

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
          const active =
            activeHash === href;

          return (
            <a
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
              data-section-href={href}
              href={href}
              key={href}
              onClick={(event) =>
                navigate(event, href)
              }
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
            </a>
          );
        }
      )}
    </nav>
  );
}
