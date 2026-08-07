import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  personalFinancePeriodLabel
} from "./personal-finance-income-schedule";

import {
  readPersonalFinancePeriodBudget
} from "./personal-finance-period-local";

import {
  normalizePersonalFinancePeriodKey
} from "./personal-finance-period-types";

import type {
  PersonalFinanceBillPayment,
  PersonalFinanceReconciliationAccount,
  PersonalFinanceReconciliationBill,
  PersonalFinanceReconciliationWorkspace,
  RecordPersonalFinanceBillPaymentInput,
  UpdatePersonalFinanceAccountBalanceInput
} from "./personal-finance-reconciliation-types";

type PersonalFinanceDatabase =
  ReturnType<
    typeof openPersonalFinanceDatabase
  >;

type AccountRow = {
  account_key: string;
  name: string;

  account_kind:
    "cash" | "credit";

  opening_balance_cents:
    number | null;

  current_balance_cents:
    number;

  closing_balance_cents:
    number | null;

  reconciled_at:
    string | null;

  credit_limit_cents:
    number | null;

  minimum_payment_cents:
    number | null;
};

type BillRow = {
  budget_item_key: string;
  name: string;

  planned_amount_cents:
    number;

  paid_amount_cents:
    number;

  due_date:
    string | null;

  due_label: string;
  payment_method: string;
};

type PaymentRow = {
  id: string;
  period_key: string;
  budget_item_key: string;
  amount_cents: number;
  paid_on: string;

  note:
    string | null;

  created_at: string;
};

export function readPersonalFinanceReconciliationWorkspace(
  periodKey: string
): PersonalFinanceReconciliationWorkspace {
  assertEnabled();

  const normalized =
    requiredPeriodKey(
      periodKey
    );

  ensurePeriodExists(
    normalized
  );

  const database =
    openPersonalFinanceDatabase();

  try {
    ensureReconciliationSchema(
      database
    );

    const accountRows =
      database
        .prepare(`
          SELECT
            account_key,
            name,
            account_kind,
            opening_balance_cents,
            current_balance_cents,
            closing_balance_cents,
            reconciled_at,
            credit_limit_cents,
            minimum_payment_cents
          FROM
            pf_period_accounts
          WHERE
            period_key = ?
          ORDER BY
            account_kind,
            name COLLATE NOCASE
        `)
        .all(
          normalized
        ) as AccountRow[];

    const billRows =
      database
        .prepare(`
          SELECT
            budget_item_key,
            name,
            planned_amount_cents,
            paid_amount_cents,
            due_date,
            due_label,
            payment_method
          FROM
            pf_period_bills
          WHERE
            period_key = ?
          ORDER BY
            COALESCE(
              due_date,
              '9999-12-31'
            ),
            name COLLATE NOCASE
        `)
        .all(
          normalized
        ) as BillRow[];

    const paymentRows =
      database
        .prepare(`
          SELECT
            id,
            period_key,
            budget_item_key,
            amount_cents,
            paid_on,
            note,
            created_at
          FROM
            pf_period_bill_payments
          WHERE
            period_key = ?
          ORDER BY
            paid_on DESC,
            created_at DESC
        `)
        .all(
          normalized
        ) as PaymentRow[];

    const paymentsByBill =
      new Map<
        string,
        PersonalFinanceBillPayment[]
      >();

    for (
      const row of paymentRows
    ) {
      const payment =
        mapPayment(
          row
        );

      const existing =
        paymentsByBill.get(
          row.budget_item_key
        );

      if (existing) {
        existing.push(
          payment
        );
      } else {
        paymentsByBill.set(
          row.budget_item_key,
          [
            payment
          ]
        );
      }
    }

    const accounts =
      accountRows.map(
        mapAccount
      );

    const bills =
      billRows.map(
        (row) =>
          mapBill(
            row,
            paymentsByBill.get(
              row.budget_item_key
            ) ?? []
          )
      );

    const cashAccounts =
      accounts.filter(
        (account) =>
          account.kind ===
          "cash"
      );

    const allCashClosed =
      cashAccounts.length > 0 &&
      cashAccounts.every(
        (account) =>
          account.closingBalance !==
          null
      );

    return {
      periodKey:
        normalized,

      periodLabel:
        personalFinancePeriodLabel(
          normalized
        ),

      accounts,

      bills,

      totals: {
        openingCash:
          sumMoney(
            cashAccounts.map(
              (account) =>
                account.openingBalance
            )
          ),

        currentCash:
          sumMoney(
            cashAccounts.map(
              (account) =>
                account.currentBalance
            )
          ),

        closedCash:
          allCashClosed
            ? sumMoney(
                cashAccounts.map(
                  (account) =>
                    account.closingBalance ??
                    0
                )
              )
            : null,

        plannedBills:
          sumMoney(
            bills.map(
              (bill) =>
                bill.planned
            )
          ),

        paidBills:
          sumMoney(
            bills.map(
              (bill) =>
                bill.paid
            )
          ),

        remainingBills:
          sumMoney(
            bills.map(
              (bill) =>
                bill.remaining
            )
          ),

        recordedPayments:
          sumMoney(
            paymentRows.map(
              (payment) =>
                fromCents(
                  payment.amount_cents
                )
            )
          )
      }
    };
  } finally {
    database.close();
  }
}

export function updatePersonalFinanceAccountCurrentBalance(
  periodKey: string,
  input:
    UpdatePersonalFinanceAccountBalanceInput
): PersonalFinanceReconciliationWorkspace {
  return updateAccountBalance({
    periodKey,
    input,
    closeAccount:
      false
  });
}

export function closePersonalFinanceAccountBalance(
  periodKey: string,
  input:
    UpdatePersonalFinanceAccountBalanceInput
): PersonalFinanceReconciliationWorkspace {
  return updateAccountBalance({
    periodKey,
    input,
    closeAccount:
      true
  });
}

export function recordPersonalFinanceBillPayment(
  periodKey: string,
  input:
    RecordPersonalFinanceBillPaymentInput
): PersonalFinanceReconciliationWorkspace {
  assertEnabled();

  const normalized =
    requiredPeriodKey(
      periodKey
    );

  ensurePeriodExists(
    normalized
  );

  const budgetItemKey =
    requiredText(
      input.budgetItemKey,
      "Bill"
    );

  const amount =
    requiredPositiveMoney(
      input.amount,
      "Payment amount"
    );

  const paidOn =
    requiredDate(
      input.paidOn,
      "Payment date"
    );

  const note =
    optionalText(
      input.note
    );

  const database =
    openPersonalFinanceDatabase();

  try {
    ensureReconciliationSchema(
      database
    );

    const save =
      database.transaction(
        () => {
          const bill =
            database
              .prepare(`
                SELECT
                  budget_item_key
                FROM
                  pf_period_bills
                WHERE
                  period_key = ? AND
                  budget_item_key = ?
              `)
              .get(
                normalized,
                budgetItemKey
              );

          if (!bill) {
            throw new Error(
              "The selected monthly bill was not found."
            );
          }

          const amountCents =
            toCents(
              amount
            );

          const paymentId =
            createPersonalFinanceId(
              "period_bill_payment",
              [
                normalized,
                budgetItemKey,
                paidOn,
                String(
                  amountCents
                ),
                new Date()
                  .toISOString()
              ]
            );

          database
            .prepare(`
              INSERT INTO
                pf_period_bill_payments (
                  id,
                  period_key,
                  budget_item_key,
                  amount_cents,
                  paid_on,
                  note
                )
              VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
              )
            `)
            .run(
              paymentId,
              normalized,
              budgetItemKey,
              amountCents,
              paidOn,
              note
            );

          database
            .prepare(`
              UPDATE
                pf_period_bills
              SET
                paid_amount_cents =
                  paid_amount_cents + ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE
                period_key = ? AND
                budget_item_key = ?
            `)
            .run(
              amountCents,
              normalized,
              budgetItemKey
            );
        }
      );

    save.immediate();
  } finally {
    database.close();
  }

  return readPersonalFinanceReconciliationWorkspace(
    normalized
  );
}

function updateAccountBalance({
  periodKey,
  input,
  closeAccount
}: {
  periodKey: string;

  input:
    UpdatePersonalFinanceAccountBalanceInput;

  closeAccount: boolean;
}): PersonalFinanceReconciliationWorkspace {
  assertEnabled();

  const normalized =
    requiredPeriodKey(
      periodKey
    );

  ensurePeriodExists(
    normalized
  );

  const accountKey =
    requiredText(
      input.accountKey,
      "Account"
    );

  const balance =
    requiredMoney(
      input.balance,
      "Account balance"
    );

  const database =
    openPersonalFinanceDatabase();

  try {
    ensureReconciliationSchema(
      database
    );

    const update =
      database.transaction(
        () => {
          const account =
            database
              .prepare(`
                SELECT
                  account_key
                FROM
                  pf_period_accounts
                WHERE
                  period_key = ? AND
                  account_key = ?
              `)
              .get(
                normalized,
                accountKey
              );

          if (!account) {
            throw new Error(
              "The selected monthly account was not found."
            );
          }

          const balanceCents =
            toCents(
              balance
            );

          if (closeAccount) {
            database
              .prepare(`
                UPDATE
                  pf_period_accounts
                SET
                  current_balance_cents = ?,
                  closing_balance_cents = ?,
                  reconciled_at =
                    CURRENT_TIMESTAMP,
                  updated_at =
                    CURRENT_TIMESTAMP
                WHERE
                  period_key = ? AND
                  account_key = ?
              `)
              .run(
                balanceCents,
                balanceCents,
                normalized,
                accountKey
              );
          } else {
            database
              .prepare(`
                UPDATE
                  pf_period_accounts
                SET
                  current_balance_cents = ?,
                  reconciled_at =
                    CURRENT_TIMESTAMP,
                  updated_at =
                    CURRENT_TIMESTAMP
                WHERE
                  period_key = ? AND
                  account_key = ?
              `)
              .run(
                balanceCents,
                normalized,
                accountKey
              );
          }
        }
      );

    update.immediate();
  } finally {
    database.close();
  }

  return readPersonalFinanceReconciliationWorkspace(
    normalized
  );
}

function ensurePeriodExists(
  periodKey: string
): void {
  readPersonalFinancePeriodBudget(
    periodKey
  );
}

function ensureReconciliationSchema(
  database:
    PersonalFinanceDatabase
): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS
      pf_period_bill_payments (
        id TEXT PRIMARY KEY,

        period_key TEXT NOT NULL,

        budget_item_key TEXT NOT NULL,

        amount_cents
          INTEGER NOT NULL
          CHECK (
            amount_cents > 0
          ),

        paid_on TEXT NOT NULL,

        note TEXT,

        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
          period_key
        )
          REFERENCES
            pf_budget_periods(
              period_key
            )
          ON DELETE CASCADE
      ) STRICT;

    CREATE INDEX IF NOT EXISTS
      pf_period_bill_payments_period_index
    ON pf_period_bill_payments (
      period_key,
      budget_item_key,
      paid_on
    );
  `);
}

function mapAccount(
  row: AccountRow
): PersonalFinanceReconciliationAccount {
  return {
    accountKey:
      row.account_key,

    name:
      row.name,

    kind:
      row.account_kind,

    openingBalance:
      fromCents(
        row.opening_balance_cents ??
        row.current_balance_cents
      ),

    currentBalance:
      fromCents(
        row.current_balance_cents
      ),

    closingBalance:
      row.closing_balance_cents ===
      null
        ? null
        : fromCents(
            row.closing_balance_cents
          ),

    reconciledAt:
      row.reconciled_at,

    creditLimit:
      row.credit_limit_cents ===
      null
        ? null
        : fromCents(
            row.credit_limit_cents
          ),

    minimumPayment:
      row.minimum_payment_cents ===
      null
        ? null
        : fromCents(
            row.minimum_payment_cents
          )
  };
}

function mapBill(
  row: BillRow,
  payments:
    PersonalFinanceBillPayment[]
): PersonalFinanceReconciliationBill {
  const planned =
    fromCents(
      row.planned_amount_cents
    );

  const paid =
    fromCents(
      row.paid_amount_cents
    );

  return {
    budgetItemKey:
      row.budget_item_key,

    name:
      row.name,

    planned,

    paid,

    remaining:
      roundMoney(
        planned - paid
      ),

    dueDate:
      row.due_date,

    dueLabel:
      row.due_label,

    paymentMethod:
      row.payment_method,

    payments
  };
}

function mapPayment(
  row: PaymentRow
): PersonalFinanceBillPayment {
  return {
    id:
      row.id,

    periodKey:
      row.period_key,

    budgetItemKey:
      row.budget_item_key,

    amount:
      fromCents(
        row.amount_cents
      ),

    paidOn:
      row.paid_on,

    note:
      row.note,

    createdAt:
      row.created_at
  };
}

function requiredPeriodKey(
  value: string
): string {
  const normalized =
    normalizePersonalFinancePeriodKey(
      value
    );

  if (!normalized) {
    throw new Error(
      "Budget month must use YYYY-MM."
    );
  }

  return normalized;
}

function requiredText(
  value: unknown,
  label: string
): string {
  const text =
    optionalText(
      value
    );

  if (!text) {
    throw new Error(
      `${label} is required.`
    );
  }

  return text;
}

function optionalText(
  value: unknown
): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const text =
    String(
      value
    ).trim();

  return text || null;
}

function requiredMoney(
  value: unknown,
  label: string
): number {
  const text =
    requiredText(
      value,
      label
    )
      .replace(
        /[$,\s]/g,
        ""
      );

  const parsed =
    Number(
      text
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  return roundMoney(
    parsed
  );
}

function requiredPositiveMoney(
  value: unknown,
  label: string
): number {
  const amount =
    requiredMoney(
      value,
      label
    );

  if (amount <= 0) {
    throw new Error(
      `${label} must be greater than zero.`
    );
  }

  return amount;
}

function requiredDate(
  value: unknown,
  label: string
): string {
  const text =
    requiredText(
      value,
      label
    );

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  const year =
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

  const day =
    Number(
      match[3]
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  return text;
}

function assertEnabled():
  void {
  if (
    process.env
      .ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled."
    );
  }
}

function toCents(
  value: number
): number {
  return Math.round(
    value * 100
  );
}

function fromCents(
  value: number
): number {
  return roundMoney(
    value / 100
  );
}

function roundMoney(
  value: number
): number {
  return (
    Math.round(
      value * 100
    ) / 100
  );
}

function sumMoney(
  values: number[]
): number {
  return roundMoney(
    values.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    )
  );
}
