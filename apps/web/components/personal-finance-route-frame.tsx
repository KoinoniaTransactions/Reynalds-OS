import type {
  ReactNode
} from "react";

import {
  PersonalFinanceSectionNav,
  type PersonalFinanceSectionNavGroup
} from "./personal-finance-section-nav";

import styles from "./personal-finance-mvp.module.css";

type Props = {
  children: ReactNode;
  eyebrow: string;
  monthLabel: string;
  sourceFile: string;
  subtitle: string;
  title: string;
};

const navigation:
  readonly PersonalFinanceSectionNavGroup[] = [
    {
      label: "Plan",
      items: [
        {
          label: "Overview",
          shortLabel: "Overview",
          icon: "⌂",
          href: "/personal"
        },
        {
          label: "Bills",
          shortLabel: "Bills",
          icon: "✓",
          href: "/personal/bills"
        },
        {
          label: "Income",
          shortLabel: "Income",
          icon: "+",
          href: "/personal/income"
        }
      ]
    },
    {
      label: "Money",
      items: [
        {
          label: "Transactions",
          shortLabel: "Activity",
          icon: "↔",
          href: "/personal/transactions"
        },
        {
          label: "Accounts",
          shortLabel: "Accounts",
          icon: "▤",
          href: "/personal/accounts"
        },
        {
          label: "Net Worth",
          shortLabel: "Net Worth",
          icon: "↗",
          href: "/personal/net-worth"
        }
      ]
    },
    {
      label: "Setup",
      items: [
        {
          label: "Rules",
          shortLabel: "Rules",
          icon: "⚙",
          href: "/personal/rules"
        }
      ]
    }
  ] as const;

export function PersonalFinanceRouteFrame({
  children,
  eyebrow,
  monthLabel,
  sourceFile,
  subtitle,
  title
}: Props) {
  return (
    <main className={styles.app}>
      <aside className={styles.rail}>
        <div className={styles.brand}>
          <div
            className={styles.brandMark}
          >
            J&amp;M
          </div>

          <div
            className={styles.brandCopy}
          >
            <span
              className={styles.brandName}
            >
              Reynalds Finances
            </span>

            <span
              className={
                styles.brandSubtitle
              }
            >
              Our money, clearly organized
            </span>
          </div>
        </div>

        <PersonalFinanceSectionNav
          groups={navigation}
        />

        <div
          className={styles.railFooter}
        >
          <span
            aria-hidden="true"
            className={
              styles.railFooterIcon
            }
          >
            ●
          </span>

          <div
            className={
              styles.railFooterCopy
            }
          >
            <span
              className={
                styles.railFooterLabel
              }
            >
              Local data
            </span>

            <span
              className={
                styles.railFooterValue
              }
              title={sourceFile}
            >
              {sourceFile}
            </span>
          </div>
        </div>
      </aside>

      <section
        className={styles.workspace}
      >
        <div
          className={
            styles.workspaceBar
          }
        >
          <div
            className={
              styles.workspaceContext
            }
          >
            <span
              aria-hidden="true"
              className={
                styles.workspaceStatusDot
              }
            />

            <span>
              J&amp;M Finances
            </span>

            <span aria-hidden="true">
              /
            </span>

            <strong>
              {monthLabel}
            </strong>
          </div>

          <div
            className={
              styles.workspaceBarActions
            }
          >
            <span
              className={
                styles.privateWorkspaceBadge
              }
            >
              Private local workspace
            </span>

            <a
              className={
                styles.workspaceAction
              }
              href="/personal/transactions"
            >
              Review transactions
            </a>
          </div>
        </div>

        <header
          className={styles.header}
        >
          <div
            className={
              styles.headerCopy
            }
          >
            <p
              className={styles.eyebrow}
            >
              {eyebrow}
            </p>

            <h1
              className={styles.title}
            >
              {title}
            </h1>

            <p
              className={styles.subtitle}
            >
              {subtitle}
            </p>
          </div>

        </header>

        {children}
      </section>
    </main>
  );
}
