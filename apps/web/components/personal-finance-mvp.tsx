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
    ["Overview", "#overview"],
    ["Transactions", "#transaction-inbox"],
    ["Bills", "#bills"],
    ["Income", "#income"],
    ["Accounts", "#accounts"],
    ["Rules", "#rules"]
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

        <nav
          className={styles.nav}
          aria-label="Personal finance sections"
        >
          {navigation.map(([label, href]) => (
            <a
              className={styles.navLink}
              href={href}
              key={href}
            >
              <span className={styles.navDot} />
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.railFooter}>
          <span className={styles.railFooterLabel}>
            Data source
          </span>

          <span className={styles.railFooterValue}>
            {sourceFile}
          </span>

          <a className={styles.rosLink} href="/dashboard">
            Return to ROS
          </a>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>
              Household command center
            </p>

            <h1 className={styles.title}>
              {monthLabel}
            </h1>

            <p className={styles.subtitle}>
              See what is available, what needs attention,
              and what is expected next without digging
              through disconnected cards.
            </p>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.localBadge}>
              Local only
            </span>

            <span className={styles.monthBadge}>
              {monthLabel}
            </span>
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

  return (
    <PersonalFinanceFrame
      monthLabel={`${budget.month} budget`}
      sourceFile={budget.sourceFile}
    >
      <section
        className={`${styles.hero} ${styles.sectionAnchor}`}
        id="overview"
      >
        <div className={styles.heroPrimary}>
          <span className={styles.label}>
            Projected month-end
          </span>

          <strong
            className={valueClassName(
              projectedEndingBalance
            )}
          >
            {money(projectedEndingBalance)}
          </strong>

          <p className={styles.heroDescription}>
            Current bank balances plus pending income,
            minus every bill still recorded as remaining.
          </p>
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

          <progress
            className={styles.progress}
            max={Math.max(budget.goal, 1)}
            value={goalProgress}
          />

          <p className={styles.goalFormula}>
            {money(budget.totals.totalBankBalance)} bank
            balance +{" "}
            {money(budget.totals.incomeRemaining)} pending
            income -{" "}
            {money(budget.totals.billsRemaining)} remaining
            bills.
          </p>
        </div>
      </section>

      <section
        className={styles.metrics}
        aria-label="Budget summary"
      >
        <div className={styles.metric}>
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

        <div className={styles.metric}>
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

        <div className={styles.metric}>
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

        <div className={styles.metric}>
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
        <section className={styles.panel}>
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

        <section className={styles.panel}>
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

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor}`}
        id="bills"
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderCopy}>
            <h2 className={styles.panelTitle}>
              Bills and obligations
            </h2>

            <p className={styles.panelDescription}>
              {budget.bills.length} entries ·{" "}
              {money(budget.totals.expensesBudgeted)} planned ·{" "}
              {money(budget.totals.expensesPaid)} recorded
              as paid.
            </p>
          </div>

          <span className={styles.countBadge}>
            {budget.bills.length}
          </span>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bill</th>
                <th>Budgeted</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Due</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {budget.bills.map((bill) => {
                const status = billStatus(bill);

                return (
                  <tr key={bill.id}>
                    <td>
                      <span className={styles.tableName}>
                        {bill.name}
                      </span>
                    </td>

                    <td>{money(bill.budgeted)}</td>
                    <td>{money(bill.paid)}</td>

                    <td
                      className={
                        bill.remaining > 0
                          ? styles.negative
                          : styles.positive
                      }
                    >
                      {money(bill.remaining)}
                    </td>

                    <td>{bill.due}</td>
                    <td>{bill.paymentMethod}</td>

                    <td>
                      <span
                        className={statusClassName(status)}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className={styles.tableTotal}>
                <td>Total</td>

                <td>
                  {money(
                    budget.totals.expensesBudgeted
                  )}
                </td>

                <td>
                  {money(budget.totals.expensesPaid)}
                </td>

                <td>
                  {money(budget.totals.billsRemaining)}
                </td>

                <td />
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

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
              Expected deposits and the amount currently
              recorded as received.
            </p>
          </div>

          <span className={styles.countBadge}>
            {budget.income.length}
          </span>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {budget.income.map((income) => {
                const remaining = Math.max(
                  income.expected - income.received,
                  0
                );

                const received = remaining === 0;

                return (
                  <tr key={income.id}>
                    <td>
                      <span className={styles.tableName}>
                        {income.date}
                      </span>
                    </td>

                    <td>{money(income.expected)}</td>
                    <td>{money(income.received)}</td>

                    <td
                      className={
                        remaining > 0
                          ? styles.positive
                          : styles.neutral
                      }
                    >
                      {money(remaining)}
                    </td>

                    <td>
                      <span
                        className={statusClassName(
                          received ? "Paid" : "Unpaid"
                        )}
                      >
                        {received ? "Received" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className={styles.tableTotal}>
                <td>Total</td>

                <td>
                  {money(budget.totals.incomeExpected)}
                </td>

                <td>
                  {money(budget.totals.incomeReceived)}
                </td>

                <td>
                  {money(budget.totals.incomeRemaining)}
                </td>

                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor}`}
        id="accounts"
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderCopy}>
            <h2 className={styles.panelTitle}>
              Accounts
            </h2>

            <p className={styles.panelDescription}>
              Cash position and credit exposure from the
              current monthly snapshot.
            </p>
          </div>

          <span className={styles.countBadge}>
            {budget.accounts.length +
              budget.creditAccounts.length}
          </span>
        </header>

        <div className={styles.detailGrid}>
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              Bank balances
            </h3>

            <div className={styles.accountList}>
              {budget.accounts.map((account) => (
                <div
                  className={styles.accountRow}
                  key={account.id}
                >
                  <span className={styles.accountName}>
                    {account.name}
                  </span>

                  <strong
                    className={`${styles.accountAmount} ${
                      account.emphasis
                        ? styles.accountEmphasis
                        : ""
                    }`}
                  >
                    {money(account.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              Credit accounts ·{" "}
              {creditUtilization.toFixed(1)}% utilized
            </h3>

            <div className={styles.creditList}>
              {budget.creditAccounts.map((account) => (
                <div
                  className={styles.creditRow}
                  key={account.id}
                >
                  <div className={styles.creditHeader}>
                    <span className={styles.creditName}>
                      {account.name}
                    </span>

                    <strong
                      className={styles.creditBalance}
                    >
                      {money(account.balance)}
                    </strong>
                  </div>

                  <progress
                    className={styles.creditProgress}
                    max={Math.max(account.limit, 1)}
                    value={Math.min(
                      account.balance,
                      account.limit
                    )}
                  />

                  <div className={styles.creditMeta}>
                    <span>
                      {money(account.available)} available
                    </span>

                    <span>
                      {money(account.minimumPayment)} minimum
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor}`}
        id="rules"
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderCopy}>
            <h2 className={styles.panelTitle}>
              Rules and review
            </h2>

            <p className={styles.panelDescription}>
              Current privacy boundaries plus irregular
              expenses that need clearer classification.
            </p>
          </div>
        </header>

        <div className={styles.rulesLayout}>
          <div className={styles.ruleColumn}>
            <h3 className={styles.subsectionTitle}>
              Active local rules
            </h3>

            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <span className={styles.ruleIndicator} />

                <span>
                  <span className={styles.ruleTitle}>
                    Localhost only
                  </span>

                  <span
                    className={styles.ruleDescription}
                  >
                    Non-localhost requests return the
                    application not-found response.
                  </span>
                </span>
              </div>

              <div className={styles.ruleItem}>
                <span className={styles.ruleIndicator} />

                <span>
                  <span className={styles.ruleTitle}>
                    Private CSV excluded from Git
                  </span>

                  <span
                    className={styles.ruleDescription}
                  >
                    Household data stays under the ignored
                    .local directory.
                  </span>
                </span>
              </div>

              <div className={styles.ruleItem}>
                <span className={styles.ruleIndicator} />

                <span>
                  <span className={styles.ruleTitle}>
                    No external financial connection
                  </span>

                  <span
                    className={styles.ruleDescription}
                  >
                    No bank, card, database, or cloud account
                    is connected.
                  </span>
                </span>
              </div>

              <div className={styles.ruleItem}>
                <span className={styles.ruleIndicator} />

                <span>
                  <span className={styles.ruleTitle}>
                    Smart matching not active yet
                  </span>

                  <span
                    className={styles.ruleDescription}
                  >
                    Current paid and received values come
                    only from the monthly plan.
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.irregularColumn}>
            <h3 className={styles.subsectionTitle}>
              Irregular expense review
            </h3>

            <div className={styles.irregularList}>
              {budget.irregularExpenses.map((expense) => (
                <div
                  className={styles.irregularRow}
                  key={expense.id}
                >
                  <span>
                    <span className={styles.irregularName}>
                      {expense.name}
                    </span>

                    <span className={styles.irregularNote}>
                      {expense.note}
                    </span>
                  </span>

                  <strong
                    className={styles.irregularAmount}
                  >
                    {expense.amount === null
                      ? "No amount"
                      : money(expense.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PersonalFinanceFrame>
  );
}
