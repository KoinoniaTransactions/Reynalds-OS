import type {
  ReactNode
} from "react";

import {
  PersonalFinanceSectionNav
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

const navigation = [
  {
    label: "Overview",
    href: "/personal",
    className: styles.navOverview
  },
  {
    label: "Transactions",
    href: "/personal/transactions",
    className: styles.navTransactions
  },
  {
    label: "Bills",
    href: "/personal/bills",
    className: styles.navBills
  },
  {
    label: "Income",
    href: "/personal/income",
    className: styles.navIncome
  },
  {
    label: "Accounts",
    href: "/personal/accounts",
    className: styles.navAccounts
  },
  {
    label: "Rules",
    href: "/personal/rules",
    className: styles.navRules
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
            R
          </div>

          <div
            className={styles.brandCopy}
          >
            <span
              className={styles.brandName}
            >
              Personal Finance
            </span>

            <span
              className={
                styles.brandSubtitle
              }
            >
              Local budget workspace
            </span>
          </div>
        </div>

        <PersonalFinanceSectionNav
          items={navigation}
        />

        <div
          className={styles.railFooter}
        >
          <span
            className={
              styles.railFooterLabel
            }
          >
            Data source
          </span>

          <span
            className={
              styles.railFooterValue
            }
          >
            {sourceFile}
          </span>
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
              Personal Finance
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

          <div
            className={
              styles.headerMeta
            }
          >
            <a
              className={
                styles.headerRosLink
              }
              href="/dashboard"
            >
              ROS dashboard
            </a>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
