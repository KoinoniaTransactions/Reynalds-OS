import type { ReactNode } from "react";

import type {
  BudgetBill,
  PersonalFinanceMonth
} from "../lib/personal-finance-local";

import type {
  PersonalFinanceInboxTransaction
} from "../lib/personal-finance-transaction-inbox-local";

import {
  PersonalFinanceTransactionInbox
} from "./personal-finance-transaction-inbox";
import {
  PersonalFinanceSectionNav
} from "./personal-finance-section-nav";
import {
  PersonalFinanceObligationWorkspace
} from "./personal-finance-obligation-workspace";
import styles from "./personal-finance-mvp.module.css";

type BillStatus =
  | "Paid"
  | "Partially paid"
  | "Unpaid"
  | "Over budget"
  | "No amount";

type AttentionTone = "critical" | "warning" | "info";

type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  signal: string;
  tone: AttentionTone;
  amount?: number;
};

type CashFlowItem = {
  id: string;
  title: string;
  detail: string;
  dateLabel: string;
  amount: number;
  kind: "income" | "bill";
  sortValue: number;
};

type PersonalFinanceMvpProps = {
  budget: PersonalFinanceMonth | null;
  unavailableReason?: string | null;
  transactions?: PersonalFinanceInboxTransaction[];
  transactionTotal?: number;
  transactionAccountCount?: number;
  unclassifiedTransactionCount?: number;
  reviewedTransactionCount?: number;
  notReviewedTransactionCount?: number;
  transactionReason?: string | null;
};

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

function sumMoney(values: number[]): number {
  return Math.round(
    values.reduce((total, value) => total + value, 0) * 100
  ) / 100;
}

function billStatus(bill: BudgetBill): BillStatus {
  if (bill.budgeted === 0 && bill.paid === 0) {
    return "No amount";
  }

  if (bill.remaining < 0 || bill.paid > bill.budgeted) {
    return "Over budget";
  }

  if (bill.remaining <= 0) {
    return "Paid";
  }

  if (bill.paid > 0) {
    return "Partially paid";
  }

  return "Unpaid";
}

function statusClassName(status: BillStatus): string {
  const classNames = [styles.status];

  if (status === "Paid") {
    classNames.push(styles.statusPaid);
  } else if (status === "Partially paid") {
    classNames.push(styles.statusPartial);
  } else if (status === "Unpaid") {
    classNames.push(styles.statusUnpaid);
  } else if (status === "Over budget") {
    classNames.push(styles.statusOver);
  } else {
    classNames.push(styles.statusMissing);
  }

  return classNames.join(" ");
}

function attentionClassName(tone: AttentionTone): string {
  const classNames = [styles.attentionItem];

  if (tone === "critical") {
    classNames.push(styles.attentionCritical);
  } else if (tone === "warning") {
    classNames.push(styles.attentionWarning);
  } else {
    classNames.push(styles.attentionInfo);
  }

  return classNames.join(" ");
}

function valueClassName(value: number): string {
  if (value > 0) {
    return `${styles.heroValue} ${styles.positive}`;
  }

  if (value < 0) {
    return `${styles.heroValue} ${styles.negative}`;
  }

  return `${styles.heroValue} ${styles.neutral}`;
}

function dateSortValue(
  label: string,
  budgetMonth: number,
  budgetYear: number
): number {
  const trimmed = label.trim();

  if (!trimmed || trimmed.toLowerCase() === "not entered") {
    return Number.MAX_SAFE_INTEGER;
  }

  const numericDate = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/
  );

  if (numericDate) {
    const month = Number(numericDate[1]) - 1;
    const day = Number(numericDate[2]);

    let year = numericDate[3]
      ? Number(numericDate[3])
      : budgetYear;

    if (year < 100) {
      year += 2000;
    }

    return new Date(year, month, day).getTime();
  }

  const dayOnly = trimmed.match(
    /^(?:due\s*)?(\d{1,2})(?:st|nd|rd|th)?$/i
  );

  if (dayOnly) {
    return new Date(
      budgetYear,
      budgetMonth,
      Number(dayOnly[1])
    ).getTime();
  }

  const parsed = Date.parse(`${trimmed} ${budgetYear}`);

  return Number.isNaN(parsed)
    ? Number.MAX_SAFE_INTEGER
    : parsed;
}

function PersonalFinanceFrame({
  children,
  monthLabel,
  sourceFile
}: {
  children: ReactNode;
  monthLabel: string;
  sourceFile: string;
}) {
  const navigation = [
    {
      label: "Overview",
      href: "#overview",
      className: styles.navOverview
    },
    {
      label: "Transactions",
      href: "#transaction-inbox",
      className: styles.navTransactions
    },
    {
      label: "Bills",
      href: "#bills",
      className: styles.navBills
    },
    {
      label: "Income",
      href: "#income",
      className: styles.navIncome
    },
    {
      label: "Accounts",
      href: "#accounts",
      className: styles.navAccounts
    },
    {
      label: "Rules",
      href: "#rules",
      className: styles.navRules
    }
  ] as const;

  return (
    <main className={styles.app}>
      <aside className={styles.rail}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>R</div>

          <div className={styles.brandCopy}>
            <span className={styles.brandName}>
              Personal Finance
            </span>

            <span className={styles.brandSubtitle}>
              Local budget workspace
            </span>
          </div>
        </div>

        <PersonalFinanceSectionNav
          items={navigation}
        />

        <div className={styles.railFooter}>
          <span className={styles.railFooterLabel}>
            Data source
          </span>

          <span className={styles.railFooterValue}>
            {sourceFile}
          </span>

        </div>
      </aside>

      <section className={styles.workspace}>
        <div className={styles.workspaceBar}>
          <div className={styles.workspaceContext}>
            <span
              aria-hidden="true"
              className={styles.workspaceStatusDot}
            />

            <span>Personal Finance</span>

            <span aria-hidden="true">/</span>

            <strong>{monthLabel}</strong>
          </div>

          <div className={styles.workspaceBarActions}>
            <span className={styles.privateWorkspaceBadge}>
              Private local workspace
            </span>

            <a
              className={styles.workspaceAction}
              href="#transaction-inbox"
            >
              Review transactions
            </a>
          </div>
        </div>

        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>
              Household command center
            </p>

            <h1 className={styles.title}>
              {monthLabel}
            </h1>

            <p className={styles.subtitle}>
              Understand the current position, resolve what
              needs attention, and plan the rest of the month
              from one private workspace.
            </p>
          </div>

          <div className={styles.headerMeta}>
            <a
              className={styles.headerRosLink}
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

export function PersonalFinanceMvp({
  budget,
  unavailableReason,
  transactions = [],
  transactionTotal = 0,
  reviewedTransactionCount = 0,
  notReviewedTransactionCount = 0,
  transactionReason = null
}: PersonalFinanceMvpProps) {
  if (!budget) {
    return (
      <PersonalFinanceFrame
        monthLabel="Personal Finance"
        sourceFile="No local file loaded"
      >
        <section className={styles.unavailable}>
          <h2 className={styles.unavailableTitle}>
            Local budget is not available
          </h2>

          <p className={styles.unavailableText}>
            {unavailableReason ??
              "The local budget file has not been configured."}
          </p>

          <code className={styles.code}>
            .local/personal-finance/JM_Budget_July_2026.csv
          </code>
        </section>
      </PersonalFinanceFrame>
    );
  }

  const projectedEndingBalance =
    budget.totals.projectedEndingBalance;

  const safeToSpend = Math.max(
    budget.totals.totalBankBalance -
      budget.totals.billsRemaining,
    0
  );

  const goalGap = Math.max(
    budget.goal - projectedEndingBalance,
    0
  );

  const goalProgress = Math.min(
    Math.max(projectedEndingBalance, 0),
    Math.max(budget.goal, 1)
  );

  const overBudgetBills = budget.bills.filter(
    (bill) => billStatus(bill) === "Over budget"
  );

  const partiallyPaidBills = budget.bills.filter(
    (bill) => billStatus(bill) === "Partially paid"
  );

  const unpaidBills = budget.bills.filter(
    (bill) => billStatus(bill) === "Unpaid"
  );

  const noAmountBills = budget.bills.filter(
    (bill) => billStatus(bill) === "No amount"
  );

  const pendingIncome = budget.income.filter(
    (income) => income.expected - income.received > 0
  );

  const overBudgetAmount = sumMoney(
    overBudgetBills.map((bill) =>
      Math.max(
        bill.paid - bill.budgeted,
        Math.abs(Math.min(bill.remaining, 0))
      )
    )
  );

  const partialRemaining = sumMoney(
    partiallyPaidBills.map((bill) =>
      Math.max(bill.remaining, 0)
    )
  );

  const unpaidRemaining = sumMoney(
    unpaidBills.map((bill) =>
      Math.max(bill.remaining, 0)
    )
  );

  const pendingIncomeAmount = sumMoney(
    pendingIncome.map(
      (income) => income.expected - income.received
    )
  );

  const attentionItems: AttentionItem[] = [];

  if (goalGap > 0) {
    attentionItems.push({
      id: "goal-gap",
      title: "Month-end goal is short",
      detail:
        "The current projection is below the amount you want left at month-end.",
      href: "#overview",
      signal: "!",
      tone: "critical",
      amount: goalGap
    });
  }

  if (overBudgetBills.length > 0) {
    attentionItems.push({
      id: "over-budget",
      title: `${overBudgetBills.length} ${
        overBudgetBills.length === 1 ? "bill is" : "bills are"
      } over budget`,
      detail:
        "Recorded payments exceed the planned amount for these obligations.",
      href: "#bills",
      signal: "!",
      tone: "critical",
      amount: overBudgetAmount
    });
  }

  if (partiallyPaidBills.length > 0) {
    attentionItems.push({
      id: "partially-paid",
      title: `${partiallyPaidBills.length} partially paid ${
        partiallyPaidBills.length === 1 ? "bill" : "bills"
      }`,
      detail:
        "These obligations still have a remaining amount recorded in the plan.",
      href: "#bills",
      signal: "~",
      tone: "warning",
      amount: partialRemaining
    });
  }

  if (unpaidBills.length > 0) {
    attentionItems.push({
      id: "unpaid",
      title: `${unpaidBills.length} unpaid ${
        unpaidBills.length === 1 ? "bill" : "bills"
      }`,
      detail:
        "These obligations currently have no payment recorded.",
      href: "#bills",
      signal: "!",
      tone: "critical",
      amount: unpaidRemaining
    });
  }

  if (pendingIncome.length > 0) {
    attentionItems.push({
      id: "pending-income",
      title: `${pendingIncome.length} pending income ${
        pendingIncome.length === 1 ? "entry" : "entries"
      }`,
      detail:
        "These expected deposits are not yet recorded as received.",
      href: "#income",
      signal: "+",
      tone: "info",
      amount: pendingIncomeAmount
    });
  }

  if (noAmountBills.length > 0) {
    attentionItems.push({
      id: "missing-amounts",
      title: `${noAmountBills.length} ${
        noAmountBills.length === 1 ? "bill has" : "bills have"
      } no amount`,
      detail:
        "These obligations cannot be included accurately until an amount is entered.",
      href: "#bills",
      signal: "?",
      tone: "warning"
    });
  }

  if (attentionItems.length === 0) {
    attentionItems.push({
      id: "all-clear",
      title: "No plan exceptions are currently flagged",
      detail:
        "The current budget has no unpaid, partial, over-budget, or missing entries.",
      href: "#overview",
      signal: "✓",
      tone: "info"
    });
  }

  const monthDate = new Date(`1 ${budget.month}`);

  const budgetMonth = Number.isNaN(monthDate.getTime())
    ? new Date().getMonth()
    : monthDate.getMonth();

  const budgetYear = Number.isNaN(monthDate.getTime())
    ? new Date().getFullYear()
    : monthDate.getFullYear();

  const cashFlowItems: CashFlowItem[] = [
    ...pendingIncome.map((income) => ({
      id: `cash-income-${income.id}`,
      title: "Expected income",
      detail: "Pending deposit from the monthly plan",
      dateLabel: income.date,
      amount: income.expected - income.received,
      kind: "income" as const,
      sortValue: dateSortValue(
        income.date,
        budgetMonth,
        budgetYear
      )
    })),
    ...budget.bills
      .filter((bill) => bill.remaining > 0)
      .map((bill) => ({
        id: `cash-bill-${bill.id}`,
        title: bill.name,
        detail: `${bill.paymentMethod} · ${billStatus(bill)}`,
        dateLabel: bill.due,
        amount: bill.remaining,
        kind: "bill" as const,
        sortValue: dateSortValue(
          bill.due,
          budgetMonth,
          budgetYear
        )
      }))
  ]
    .sort((left, right) => {
      if (left.sortValue !== right.sortValue) {
        return left.sortValue - right.sortValue;
      }

      if (left.kind !== right.kind) {
        return left.kind === "income" ? -1 : 1;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, 12);

  const creditUtilization =
    budget.totals.totalCreditLimit > 0
      ? (budget.totals.totalCreditBalance /
          budget.totals.totalCreditLimit) *
        100
      : 0;

  const cashAccounts = budget.accounts.filter(
    (account) => !account.emphasis
  );

  const financialGuardrails = [
    {
      id: "localhost",
      symbol: "L",
      title: "Localhost only",
      description:
        "Requests outside the local environment return the application not-found response."
    },
    {
      id: "private-source",
      symbol: "P",
      title: "Private source excluded from Git",
      description:
        "Household financial data remains in the ignored local data directory."
    },
    {
      id: "no-external-connection",
      symbol: "N",
      title: "No external financial connection",
      description:
        "No bank, card, cloud account, or third-party financial service is connected."
    },
    {
      id: "advisory-matching",
      symbol: "A",
      title: "Advisory matching only",
      description:
        "Suggestions never classify, allocate, reconcile, review, or confirm transfers automatically."
    }
  ] as const;

  return (
    <PersonalFinanceFrame
      monthLabel={`${budget.month} budget`}
      sourceFile={budget.sourceFile}
    >
      <section
        className={`${styles.hero} ${styles.heroModern} ${styles.sectionAnchor}`}
        id="overview"
      >
        <div className={styles.heroPrimary}>
          <div className={styles.heroTopline}>
            <span className={styles.label}>
              Projected month-end
            </span>

            <span
              className={`${styles.heroStatus} ${
                goalGap > 0
                  ? styles.heroStatusAttention
                  : styles.heroStatusPositive
              }`}
            >
              {goalGap > 0
                ? "Attention needed"
                : "On track"}
            </span>
          </div>

          <strong
            className={valueClassName(
              projectedEndingBalance
            )}
          >
            {money(projectedEndingBalance)}
          </strong>

          <p className={styles.heroDescription}>
            The expected balance after pending income and
            every remaining bill in the current plan.
          </p>

          <div
            aria-label="Projection breakdown"
            className={styles.heroBreakdown}
          >
            <span>
              <small>Cash available</small>

              <strong>
                {money(
                  budget.totals.totalBankBalance
                )}
              </strong>
            </span>

            <span>
              <small>Pending income</small>

              <strong className={styles.positive}>
                +
                {money(
                  budget.totals.incomeRemaining
                )}
              </strong>
            </span>

            <span>
              <small>Remaining bills</small>

              <strong className={styles.negative}>
                -
                {money(
                  budget.totals.billsRemaining
                )}
              </strong>
            </span>
          </div>
        </div>

        <div className={styles.heroGoal}>
          <div className={styles.goalHeader}>
            <div>
              <span className={styles.label}>
                Month-end target
              </span>

              <strong className={styles.goalValue}>
                {money(budget.goal)}
              </strong>
            </div>

            <span
              className={
                goalGap > 0
                  ? styles.goalGap
                  : styles.goalMet
              }
            >
              {goalGap > 0
                ? `${money(goalGap)} short`
                : "Target met"}
            </span>
          </div>

          <div className={styles.goalProgressHeader}>
            <span>Projection progress</span>

            <strong>
              {budget.goal > 0
                ? `${Math.round(
                    (
                      goalProgress /
                      budget.goal
                    ) * 100
                  )}%`
                : "—"}
            </strong>
          </div>

          <progress
            className={styles.progress}
            max={Math.max(budget.goal, 1)}
            value={goalProgress}
          />

          <div className={styles.goalScale}>
            <span>
              Projected{" "}
              <strong>
                {money(projectedEndingBalance)}
              </strong>
            </span>

            <span>
              Target{" "}
              <strong>
                {money(budget.goal)}
              </strong>
            </span>
          </div>

        </div>
      </section>

      <section
        className={styles.metrics}
        aria-label="Budget summary"
      >
        <div className={`${styles.metric} ${styles.metricCash}`}>
          <span className={styles.label}>
            Available now
          </span>

          <strong className={styles.metricValue}>
            {money(budget.totals.totalBankBalance)}
          </strong>

          <span className={styles.metricNote}>
            Combined bank balance entered in the CSV
          </span>
        </div>

        <div className={`${styles.metric} ${styles.metricSpend}`}>
          <span className={styles.label}>
            Safe to spend
          </span>

          <strong
            className={`${styles.metricValue} ${
              safeToSpend > 0
                ? styles.positive
                : styles.negative
            }`}
          >
            {money(safeToSpend)}
          </strong>

          <span className={styles.metricNote}>
            Current cash minus every remaining bill
          </span>
        </div>

        <div className={`${styles.metric} ${styles.metricBills}`}>
          <span className={styles.label}>
            Bills remaining
          </span>

          <strong
            className={`${styles.metricValue} ${styles.negative}`}
          >
            {money(budget.totals.billsRemaining)}
          </strong>

          <span className={styles.metricNote}>
            {unpaidBills.length} unpaid ·{" "}
            {partiallyPaidBills.length} partial
          </span>
        </div>

        <div className={`${styles.metric} ${styles.metricIncome}`}>
          <span className={styles.label}>
            Income pending
          </span>

          <strong
            className={`${styles.metricValue} ${styles.positive}`}
          >
            {money(budget.totals.incomeRemaining)}
          </strong>

          <span className={styles.metricNote}>
            {money(budget.totals.incomeReceived)} already
            recorded as received
          </span>
        </div>
      </section>

      <div className={styles.primaryGrid}>
        <section
          className={`${styles.panel} ${styles.attentionPanel}`}
        >
          <header className={styles.panelHeader}>
            <div className={styles.panelHeaderCopy}>
              <h2 className={styles.panelTitle}>
                Needs attention
              </h2>

              <p className={styles.panelDescription}>
                Exceptions that could change your current
                month-end result.
              </p>
            </div>

            <span className={styles.countBadge}>
              {attentionItems.length}
            </span>
          </header>

          <div className={styles.attentionList}>
            {attentionItems.map((item) => (
              <a
                className={attentionClassName(item.tone)}
                href={item.href}
                key={item.id}
              >
                <span className={styles.attentionSignal}>
                  {item.signal}
                </span>

                <span className={styles.attentionMain}>
                  <span className={styles.attentionTitle}>
                    {item.title}
                  </span>

                  <span className={styles.attentionDetail}>
                    {item.detail}
                  </span>
                </span>

                {typeof item.amount === "number" ? (
                  <span className={styles.attentionValue}>
                    {money(item.amount)}
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        </section>

        <section
          className={`${styles.panel} ${styles.cashFlowPanel}`}
        >
          <header className={styles.panelHeader}>
            <div className={styles.panelHeaderCopy}>
              <h2 className={styles.panelTitle}>
                Upcoming cash flow
              </h2>

              <p className={styles.panelDescription}>
                Pending deposits and remaining bills in
                date order when a date can be read.
              </p>
            </div>

            <span className={styles.countBadge}>
              {cashFlowItems.length}
            </span>
          </header>

          {cashFlowItems.length > 0 ? (
            <div className={styles.cashFlowList}>
              {cashFlowItems.map((item) => (
                <div
                  className={styles.cashFlowRow}
                  key={item.id}
                >
                  <span className={styles.cashFlowDate}>
                    {item.dateLabel}
                  </span>

                  <span
                    className={`${styles.cashFlowMarker} ${
                      item.kind === "income"
                        ? styles.cashFlowIncome
                        : styles.cashFlowBill
                    }`}
                  />

                  <span className={styles.cashFlowCopy}>
                    <span className={styles.cashFlowTitle}>
                      {item.title}
                    </span>

                    <span className={styles.cashFlowDetail}>
                      {item.detail}
                    </span>
                  </span>

                  <span
                    className={`${styles.cashFlowAmount} ${
                      item.kind === "income"
                        ? styles.positive
                        : styles.negative
                    }`}
                  >
                    {item.kind === "income" ? "+" : "-"}
                    {money(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyList}>
              No pending cash-flow items are recorded.
            </div>
          )}
        </section>
      </div>

      <PersonalFinanceTransactionInbox
        transactions={transactions}
        transactionTotal={transactionTotal}
        reviewedTransactionCount={
          reviewedTransactionCount
        }
        notReviewedTransactionCount={
          notReviewedTransactionCount
        }
        transactionReason={transactionReason}
      />

      <PersonalFinanceObligationWorkspace
        bills={budget.bills}
        totals={{
          planned: budget.totals.expensesBudgeted,
          paid: budget.totals.expensesPaid,
          remaining: budget.totals.billsRemaining
        }}
      />

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor}`}
        id="income"
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderCopy}>
            <h2 className={styles.panelTitle}>
              Income schedule
            </h2>

            <p className={styles.panelDescription}>
              Expected deposits and what has already
              arrived this month.
            </p>
          </div>

          <span className={styles.countBadge}>
            {budget.income.length}
          </span>
        </header>

        <div className={styles.planList}>
          {budget.income.map((income) => {
            const remaining = Math.max(
              income.expected -
                income.received,
              0
            );

            const received =
              remaining === 0;

            const progressMaximum = Math.max(
              income.expected,
              income.received,
              1
            );

            const progressValue = Math.min(
              Math.max(
                income.received,
                0
              ),
              progressMaximum
            );

            const progressPercent =
              income.expected > 0
                ? Math.round(
                    (
                      income.received /
                      income.expected
                    ) * 100
                  )
                : null;

            return (
              <article
                className={styles.planRow}
                key={income.id}
              >
                <div className={styles.planIdentity}>
                  <strong>{income.date}</strong>

                  <span>
                    Expected household income
                  </span>
                </div>

                <div
                  className={
                    styles.planProgressWrap
                  }
                >
                  <div
                    className={
                      styles.planProgressMeta
                    }
                  >
                    <span>Deposit progress</span>

                    <strong>
                      {progressPercent === null
                        ? "—"
                        : `${progressPercent}%`}
                    </strong>
                  </div>

                  <progress
                    className={`${styles.planProgress} ${styles.planProgressIncome}`}
                    max={progressMaximum}
                    value={progressValue}
                  />
                </div>

                <div
                  className={
                    styles.planAmountGroup
                  }
                >
                  <span>
                    <small>Expected</small>
                    <strong>
                      {money(income.expected)}
                    </strong>
                  </span>

                  <span>
                    <small>Received</small>
                    <strong
                      className={
                        styles.positive
                      }
                    >
                      {money(income.received)}
                    </strong>
                  </span>

                  <span>
                    <small>Remaining</small>
                    <strong>
                      {money(remaining)}
                    </strong>
                  </span>
                </div>

                <span
                  className={statusClassName(
                    received
                      ? "Paid"
                      : "Unpaid"
                  )}
                >
                  {received
                    ? "Received"
                    : "Pending"}
                </span>
              </article>
            );
          })}
        </div>

        <footer className={styles.planTotals}>
          <div>
            <span>Expected</span>
            <strong>
              {money(
                budget.totals.incomeExpected
              )}
            </strong>
          </div>

          <div>
            <span>Received</span>
            <strong className={styles.positive}>
              {money(
                budget.totals.incomeReceived
              )}
            </strong>
          </div>

          <div>
            <span>Pending</span>
            <strong>
              {money(
                budget.totals.incomeRemaining
              )}
            </strong>
          </div>
        </footer>
      </section>

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor} ${styles.portfolioSection}`}
        id="accounts"
      >
        <header
          className={`${styles.panelHeader} ${styles.portfolioHeader}`}
        >
          <div className={styles.panelHeaderCopy}>
            <span className={styles.sectionKicker}>
              Financial position
            </span>

            <h2 className={styles.panelTitle}>
              Accounts and credit
            </h2>

            <p className={styles.panelDescription}>
              Current cash, revolving balances, available
              credit, and minimum obligations in one view.
            </p>
          </div>

          <div className={styles.portfolioUtilization}>
            <strong>
              {creditUtilization.toFixed(1)}%
            </strong>

            <span>credit utilized</span>
          </div>
        </header>

        <div
          aria-label="Financial position summary"
          className={styles.portfolioSummary}
        >
          <article>
            <span>Cash on hand</span>

            <strong className={styles.positive}>
              {money(
                budget.totals.totalBankBalance
              )}
            </strong>

            <small>
              Across {cashAccounts.length}{" "}
              {cashAccounts.length === 1
                ? "cash account"
                : "cash accounts"}
            </small>
          </article>

          <article>
            <span>Credit balance</span>

            <strong>
              {money(
                budget.totals.totalCreditBalance
              )}
            </strong>

            <small>
              Of{" "}
              {money(
                budget.totals.totalCreditLimit
              )}{" "}
              total limit
            </small>
          </article>

          <article>
            <span>Available credit</span>

            <strong>
              {money(
                budget.totals.totalAvailableCredit
              )}
            </strong>

            <small>
              Remaining revolving capacity
            </small>
          </article>

          <article>
            <span>Minimum payments</span>

            <strong>
              {money(
                budget.totals.totalMinimumPayments
              )}
            </strong>

            <small>
              Current recorded minimums
            </small>
          </article>
        </div>

        <div className={styles.portfolioGrid}>
          <section className={styles.portfolioPane}>
            <header className={styles.portfolioPaneHeader}>
              <div>
                <span>Cash accounts</span>

                <strong>
                  Bank balances
                </strong>
              </div>

              <small>
                {cashAccounts.length}
              </small>
            </header>

            {cashAccounts.length > 0 ? (
              <div className={styles.cashAccountGrid}>
                {cashAccounts.map((account) => (
                  <article
                    className={
                      styles.cashAccountCard
                    }
                    key={account.id}
                  >
                    <span
                      aria-hidden="true"
                      className={
                        styles.accountAvatar
                      }
                    >
                      {account.name
                        .trim()
                        .charAt(0)
                        .toUpperCase() || "A"}
                    </span>

                    <span
                      className={
                        styles.cashAccountCopy
                      }
                    >
                      <strong>
                        {account.name}
                      </strong>

                      <small>
                        Current balance
                      </small>
                    </span>

                    <strong
                      className={
                        styles.cashAccountValue
                      }
                    >
                      {money(account.amount)}
                    </strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.portfolioEmpty}>
                No individual cash accounts are recorded.
              </div>
            )}

            <footer className={styles.portfolioTotal}>
              <span>Total bank balance</span>

              <strong>
                {money(
                  budget.totals.totalBankBalance
                )}
              </strong>
            </footer>
          </section>

          <section className={styles.portfolioPane}>
            <header className={styles.portfolioPaneHeader}>
              <div>
                <span>Revolving accounts</span>

                <strong>
                  Credit exposure
                </strong>
              </div>

              <small>
                {budget.creditAccounts.length}
              </small>
            </header>

            {budget.creditAccounts.length > 0 ? (
              <div className={styles.creditPortfolioList}>
                {budget.creditAccounts.map((account) => {
                  const accountUtilization =
                    account.limit > 0
                      ? (account.balance /
                          account.limit) *
                        100
                      : 0;

                  const displayedUtilization =
                    Math.round(accountUtilization);

                  return (
                    <article
                      className={
                        styles.creditPortfolioCard
                      }
                      key={account.id}
                    >
                      <header
                        className={
                          styles.creditPortfolioHeader
                        }
                      >
                        <div>
                          <strong>
                            {account.name}
                          </strong>

                          <span>
                            {displayedUtilization}%
                            utilized
                          </span>
                        </div>

                        <strong>
                          {money(account.balance)}
                        </strong>
                      </header>

                      <progress
                        aria-label={`${account.name} utilization`}
                        className={
                          styles.creditPortfolioProgress
                        }
                        max={100}
                        value={Math.min(
                          Math.max(
                            accountUtilization,
                            0
                          ),
                          100
                        )}
                      />

                      <div
                        className={
                          styles.creditPortfolioMetrics
                        }
                      >
                        <span>
                          <small>Limit</small>

                          <strong>
                            {money(account.limit)}
                          </strong>
                        </span>

                        <span>
                          <small>Available</small>

                          <strong>
                            {money(account.available)}
                          </strong>
                        </span>

                        <span>
                          <small>Minimum</small>

                          <strong>
                            {money(
                              account.minimumPayment
                            )}
                          </strong>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.portfolioEmpty}>
                No revolving accounts are recorded.
              </div>
            )}
          </section>
        </div>
      </section>

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor} ${styles.controlSection}`}
        id="rules"
      >
        <header
          className={`${styles.panelHeader} ${styles.controlHeader}`}
        >
          <div className={styles.panelHeaderCopy}>
            <span className={styles.sectionKicker}>
              Privacy and oversight
            </span>

            <h2 className={styles.panelTitle}>
              Controls and review
            </h2>

            <p className={styles.panelDescription}>
              Operating guardrails and financial items
              that still need a deliberate decision.
            </p>
          </div>

          <span className={styles.reviewQueueCount}>
            {budget.irregularExpenses.length}{" "}
            {budget.irregularExpenses.length === 1
              ? "review item"
              : "review items"}
          </span>
        </header>

        <div className={styles.controlGrid}>
          <section className={styles.controlPane}>
            <header className={styles.controlPaneHeader}>
              <div>
                <span>System boundaries</span>

                <strong>
                  Active guardrails
                </strong>
              </div>

              <small>
                {financialGuardrails.length}
              </small>
            </header>

            <div className={styles.controlList}>
              {financialGuardrails.map(
                (guardrail) => (
                  <article
                    className={styles.controlRow}
                    key={guardrail.id}
                  >
                    <span
                      aria-hidden="true"
                      className={styles.controlIcon}
                    >
                      {guardrail.symbol}
                    </span>

                    <span className={styles.controlCopy}>
                      <strong>
                        {guardrail.title}
                      </strong>

                      <small>
                        {guardrail.description}
                      </small>
                    </span>

                    <span className={styles.controlState}>
                      Active
                    </span>
                  </article>
                )
              )}
            </div>
          </section>

          <section
            className={`${styles.controlPane} ${styles.reviewPane}`}
          >
            <header className={styles.controlPaneHeader}>
              <div>
                <span>Decision queue</span>

                <strong>
                  Irregular expenses
                </strong>
              </div>

              <small>
                {budget.irregularExpenses.length}
              </small>
            </header>

            {budget.irregularExpenses.length > 0 ? (
              <div className={styles.reviewQueue}>
                {budget.irregularExpenses.map(
                  (expense) => (
                    <article
                      className={
                        styles.reviewQueueItem
                      }
                      key={expense.id}
                    >
                      <span
                        aria-hidden="true"
                        className={
                          styles.reviewQueueSignal
                        }
                      >
                        ?
                      </span>

                      <span
                        className={
                          styles.reviewQueueCopy
                        }
                      >
                        <strong>
                          {expense.name}
                        </strong>

                        <small>
                          {expense.note}
                        </small>
                      </span>

                      <span
                        className={
                          styles.reviewQueueMeta
                        }
                      >
                        <strong>
                          {expense.amount === null
                            ? "Amount missing"
                            : money(
                                expense.amount
                              )}
                        </strong>

                        <small>
                          Needs review
                        </small>
                      </span>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div className={styles.portfolioEmpty}>
                No irregular expenses are waiting for
                review.
              </div>
            )}
          </section>
        </div>
      </section>
    </PersonalFinanceFrame>
  );
}
