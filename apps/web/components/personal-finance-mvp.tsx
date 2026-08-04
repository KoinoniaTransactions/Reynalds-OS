import type {
  CSSProperties,
  ReactNode
} from "react";

import type {
  BudgetBill,
  PersonalFinanceMonth
} from "../lib/personal-finance-local";

type BillStatus =
  | "Paid"
  | "Partially paid"
  | "Unpaid"
  | "Over budget"
  | "No amount";

type PersonalFinanceMvpProps = {
  budget: PersonalFinanceMonth | null;
  unavailableReason?: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
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

function statusStyle(status: BillStatus): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 999,
    display: "inline-flex",
    fontSize: 12,
    fontWeight: 700,
    padding: "5px 9px",
    whiteSpace: "nowrap"
  };

  if (status === "Paid") {
    return {
      ...base,
      background: "rgba(34, 197, 94, 0.12)",
      color: "#15803d"
    };
  }

  if (status === "Partially paid") {
    return {
      ...base,
      background: "rgba(234, 179, 8, 0.15)",
      color: "#a16207"
    };
  }

  if (status === "Unpaid") {
    return {
      ...base,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#b91c1c"
    };
  }

  if (status === "Over budget") {
    return {
      ...base,
      background: "rgba(249, 115, 22, 0.14)",
      color: "#c2410c"
    };
  }

  return {
    ...base,
    background: "rgba(100, 116, 139, 0.12)",
    color: "#475569"
  };
}

function PersonalFinanceShell({
  children,
  topbarLabel
}: {
  children: ReactNode;
  topbarLabel: string;
}) {
  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">R</div>
          <div>
            <strong>ROS</strong>
            <span>Personal Finance</span>
          </div>
        </div>

        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/personal" className="active">
            Personal
          </a>
          <a href="/finance">Business Finance</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input
            placeholder="Local-only household budget"
            disabled
          />

          <button type="button" disabled>
            {topbarLabel}
          </button>

          <a
            className="ros-button-link"
            href="/dashboard"
          >
            Dashboard
          </a>
        </header>

        {children}
      </section>
    </main>
  );
}

export function PersonalFinanceMvp({
  budget,
  unavailableReason
}: PersonalFinanceMvpProps) {
  if (!budget) {
    return (
      <PersonalFinanceShell topbarLabel="Local Only">
        <div className="ros-eyebrow">
          Personal Finance · Local Workspace
        </div>

        <h1>Personal Finance</h1>

        <p className="ros-subtitle">
          This workspace reads private budget data from an ignored
          local file and is unavailable on non-localhost requests.
        </p>

        <section
          className="ros-card"
          style={{ marginTop: 18 }}
        >
          <h2>Local budget is not available</h2>

          <p>
            {unavailableReason ??
              "The local budget file has not been configured."}
          </p>

          <p style={{ marginBottom: 0 }}>
            Expected local location:{" "}
            <code>
              .local/personal-finance/JM_Budget_July_2026.csv
            </code>
          </p>
        </section>
      </PersonalFinanceShell>
    );
  }

  const projectedEndingBalance =
    budget.totals.projectedEndingBalance;

  const goalGap = Math.max(
    budget.goal - projectedEndingBalance,
    0
  );

  const goalProgress =
    budget.goal > 0
      ? Math.min(
          Math.max(projectedEndingBalance, 0),
          budget.goal
        )
      : 0;

  const creditUtilization =
    budget.totals.totalCreditLimit > 0
      ? (budget.totals.totalCreditBalance /
          budget.totals.totalCreditLimit) *
        100
      : 0;

  const billCounts = budget.bills.reduce<
    Record<BillStatus, number>
  >(
    (counts, bill) => {
      const status = billStatus(bill);
      counts[status] += 1;
      return counts;
    },
    {
      "No amount": 0,
      "Over budget": 0,
      "Partially paid": 0,
      Paid: 0,
      Unpaid: 0
    }
  );

  return (
    <PersonalFinanceShell topbarLabel={budget.month}>
      <div className="ros-eyebrow">
        Personal Finance · Local Budget Data
      </div>

      <h1>{budget.month} Household Budget</h1>

      <p className="ros-subtitle">
        A local-only monthly position built from{" "}
        {budget.sourceFile}. The private CSV remains outside
        tracked application source.
      </p>

      <section
        className="ros-grid"
        style={{ marginBottom: 18 }}
      >
        <article className="ros-card">
          <span>Projected Month-End</span>
          <strong>
            {money(projectedEndingBalance)}
          </strong>
          <p>after remaining income and bills</p>
        </article>

        <article className="ros-card">
          <span>Bills Remaining</span>
          <strong>
            {money(budget.totals.billsRemaining)}
          </strong>
          <p>
            {billCounts.Unpaid} unpaid ·{" "}
            {billCounts["Partially paid"]} partial
          </p>
        </article>

        <article className="ros-card">
          <span>Income Remaining</span>
          <strong>
            {money(budget.totals.incomeRemaining)}
          </strong>
          <p>
            {money(budget.totals.incomeReceived)} received
          </p>
        </article>

        <article className="ros-card">
          <span>Current Bank Balance</span>
          <strong>
            {money(budget.totals.totalBankBalance)}
          </strong>
          <p>combined balance entered in the CSV</p>
        </article>
      </section>

      <section
        className="ros-card"
        style={{
          marginBottom: 18,
          marginTop: 18
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "space-between"
          }}
        >
          <div>
            <span>End-of-Month Goal</span>

            <h2 style={{ marginBottom: 6 }}>
              {money(budget.goal)} left over
            </h2>

            <p style={{ marginBottom: 0 }}>
              Current projection:{" "}
              <strong>
                {money(projectedEndingBalance)}
              </strong>
            </p>
          </div>

          <div style={{ minWidth: 220 }}>
            <span>Projected Goal Gap</span>

            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 8
              }}
            >
              {money(goalGap)}
            </strong>
          </div>
        </div>

        <progress
          max={budget.goal || 1}
          value={goalProgress}
          style={{
            marginTop: 18,
            width: "100%"
          }}
        />

        <p
          style={{
            marginBottom: 0,
            marginTop: 10
          }}
        >
          Calculation:{" "}
          {money(budget.totals.totalBankBalance)} bank
          balance +{" "}
          {money(budget.totals.incomeRemaining)} remaining
          income -{" "}
          {money(budget.totals.billsRemaining)} remaining
          bills = {money(projectedEndingBalance)}.
        </p>
      </section>

      <section className="ros-object-layout">
        <article className="ros-card">
          <h2>Income Schedule</h2>

          <div style={{ overflowX: "auto" }}>
            <table className="ros-table">
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
                        <strong>{income.date}</strong>
                      </td>
                      <td>{money(income.expected)}</td>
                      <td>{money(income.received)}</td>
                      <td>{money(remaining)}</td>
                      <td>
                        <span
                          style={statusStyle(
                            received ? "Paid" : "Unpaid"
                          )}
                        >
                          {received
                            ? "Received"
                            : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>
                    {money(
                      budget.totals.incomeExpected
                    )}
                  </th>
                  <th>
                    {money(
                      budget.totals.incomeReceived
                    )}
                  </th>
                  <th>
                    {money(
                      budget.totals.incomeRemaining
                    )}
                  </th>
                  <th />
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        <aside className="ros-card">
          <h2>Account Snapshot</h2>

          <div className="ros-form">
            {budget.accounts.map((account) => (
              <article
                className="ros-code"
                key={account.id}
              >
                <span>{account.name}</span>

                <strong
                  style={{
                    display: "block",
                    fontSize: account.emphasis
                      ? 26
                      : 20,
                    marginTop: 6
                  }}
                >
                  {money(account.amount)}
                </strong>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section
        className="ros-card"
        id="bills"
        style={{
          marginBottom: 18,
          marginTop: 18
        }}
      >
        <h2>Bills and Monthly Obligations</h2>

        <p>
          {billCounts.Paid} paid ·{" "}
          {billCounts["Partially paid"]} partially paid ·{" "}
          {billCounts.Unpaid} unpaid ·{" "}
          {billCounts["Over budget"]} over budget ·{" "}
          {billCounts["No amount"]} without an entered
          amount
        </p>

        <div style={{ overflowX: "auto" }}>
          <table className="ros-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>Budgeted</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Due</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {budget.bills.map((bill) => {
                const status = billStatus(bill);

                return (
                  <tr key={bill.id}>
                    <td>
                      <strong>{bill.name}</strong>
                    </td>
                    <td>{money(bill.budgeted)}</td>
                    <td>{money(bill.paid)}</td>
                    <td>{money(bill.remaining)}</td>
                    <td
                      style={{
                        whiteSpace: "nowrap"
                      }}
                    >
                      {bill.due}
                    </td>
                    <td>{bill.paymentMethod}</td>
                    <td>
                      <span
                        style={statusStyle(status)}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <th>Total</th>
                <th>
                  {money(
                    budget.totals.expensesBudgeted
                  )}
                </th>
                <th>
                  {money(
                    budget.totals.expensesPaid
                  )}
                </th>
                <th>
                  {money(
                    budget.totals.billsRemaining
                  )}
                </th>
                <th />
                <th />
                <th />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="ros-object-layout">
        <article className="ros-card">
          <h2>Credit Snapshot</h2>

          <p>
            Total utilization:{" "}
            <strong>
              {creditUtilization.toFixed(1)}%
            </strong>
          </p>

          <div style={{ overflowX: "auto" }}>
            <table className="ros-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Limit</th>
                  <th>Balance</th>
                  <th>Minimum</th>
                  <th>Available</th>
                </tr>
              </thead>

              <tbody>
                {budget.creditAccounts.map(
                  (account) => (
                    <tr key={account.id}>
                      <td>
                        <strong>
                          {account.name}
                        </strong>
                      </td>
                      <td>
                        {money(account.limit)}
                      </td>
                      <td>
                        {money(account.balance)}
                      </td>
                      <td>
                        {money(
                          account.minimumPayment
                        )}
                      </td>
                      <td>
                        {money(account.available)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>
                    {money(
                      budget.totals.totalCreditLimit
                    )}
                  </th>
                  <th>
                    {money(
                      budget.totals.totalCreditBalance
                    )}
                  </th>
                  <th>
                    {money(
                      budget.totals
                        .totalMinimumPayments
                    )}
                  </th>
                  <th>
                    {money(
                      budget.totals
                        .totalAvailableCredit
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        <aside className="ros-card">
          <h2>Irregular Expenses</h2>

          <div className="ros-form">
            {budget.irregularExpenses.map(
              (expense) => (
                <article
                  className="ros-code"
                  key={expense.id}
                >
                  <strong>{expense.name}</strong>

                  <p>
                    {expense.amount === null
                      ? "Amount not entered"
                      : money(expense.amount)}
                  </p>

                  <span>{expense.note}</span>
                </article>
              )
            )}
          </div>
        </aside>
      </section>

      <section
        className="ros-card"
        style={{
          marginBottom: 18,
          marginTop: 18
        }}
      >
        <h2>Local Data Notes</h2>

        <ul>
          <li>
            This page reads the CSV only on the local
            Next.js server.
          </li>
          <li>
            The CSV and local environment switch are
            ignored by Git.
          </li>
          <li>
            Non-localhost requests to this route return
            the application&apos;s not-found response.
          </li>
          <li>
            Several due dates in the source file are from
            earlier months and are displayed exactly as
            entered.
          </li>
          <li>
            No database or bank connection is active.
          </li>
        </ul>
      </section>
    </PersonalFinanceShell>
  );
}
