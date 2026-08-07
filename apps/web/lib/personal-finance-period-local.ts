import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  readPersonalFinanceIncomeWorkspace,
  seedPersonalFinanceIncomeFromLegacy
} from "./personal-finance-income-local";

import {
  personalFinanceNextPeriodKey,
  personalFinancePeriodKeyFromMonthLabel,
  personalFinancePeriodLabel
} from "./personal-finance-income-schedule";

import type {
  BudgetBill,
  PersonalFinanceMonth
} from "./personal-finance-local";

import {
  normalizePersonalFinancePeriodKey
} from "./personal-finance-period-types";

import type {
  BuildNextPersonalFinancePeriodOptions,
  PersonalFinancePeriodSourceKind,
  PersonalFinancePeriodStatus,
  PersonalFinancePeriodSummary,
  PreparedPersonalFinancePeriodWorkspace
} from "./personal-finance-period-types";

type PersonalFinanceDatabase =
  ReturnType<
    typeof openPersonalFinanceDatabase
  >;

type PeriodRow = {
  period_key: string;
  status: string;
  source_period_key: string | null;
  source_kind: string;
  source_file: string | null;
  month_end_goal_cents: number;
};

type PeriodBillRow = {
  id: string;
  period_key: string;
  budget_item_key: string;
  name: string;
  planned_amount_cents: number;
  paid_amount_cents: number;
  due_date: string | null;
  due_label: string;
  payment_method: string;
  carry_forward: number;
};

type PeriodAccountRow = {
  id: string;
  period_key: string;
  account_key: string;
  name: string;
  account_kind: "cash" | "credit";
  opening_balance_cents: number | null;
  current_balance_cents: number;
  closing_balance_cents: number | null;
  credit_limit_cents: number | null;
  minimum_payment_cents: number | null;
};

export function preparePersonalFinancePeriodWorkspace({
  legacyBudget,
  requestedPeriodKey
}: {
  legacyBudget: PersonalFinanceMonth | null;
  requestedPeriodKey: string | null;
}): PreparedPersonalFinancePeriodWorkspace {
  assertEnabled();

  if (legacyBudget) {
    seedLegacyPeriod(legacyBudget);
  }

  const database = openPeriodDatabase();

  let periods: PersonalFinancePeriodSummary[];
  let periodKey: string | null;

  try {
    periods = readPeriodSummaries(database);

    periodKey = choosePeriodKey({
      database,
      periods,
      requestedPeriodKey
    });

    const normalizedRequested =
      normalizePersonalFinancePeriodKey(
        requestedPeriodKey
      );

    if (
      periodKey &&
      normalizedRequested ===
        periodKey
    ) {
      writeSelectedPeriodKey(
        database,
        periodKey
      );
    }
  } finally {
    database.close();
  }

  if (!periodKey) {
    return {
      budget: null,
      periodKey: null,
      periods,
      reason:
        "No budget period exists yet. Import the private starting budget once to create the first month."
    };
  }

  return {
    budget:
      readPersonalFinancePeriodBudget(
        periodKey
      ),
    periodKey,
    periods,
    reason: null
  };
}

export function readPersonalFinancePeriodSummaries():
  PersonalFinancePeriodSummary[] {
  assertEnabled();

  const database = openPeriodDatabase();

  try {
    return readPeriodSummaries(database);
  } finally {
    database.close();
  }
}

export function readSelectedPersonalFinancePeriodKey():
  string | null {
  assertEnabled();

  const database = openPeriodDatabase();

  try {
    return readSelectedPeriodKey(database);
  } finally {
    database.close();
  }
}

export function selectPersonalFinancePeriod(
  periodKey: string
): void {
  assertEnabled();

  const normalized =
    requiredPeriodKey(periodKey);

  const database = openPeriodDatabase();

  try {
    const row =
      database.prepare(`
        SELECT period_key
        FROM pf_budget_periods
        WHERE period_key = ?
      `).get(normalized);

    if (!row) {
      throw new Error(
        "The selected budget month does not exist."
      );
    }

    writeSelectedPeriodKey(
      database,
      normalized
    );
  } finally {
    database.close();
  }
}

export function createNextPersonalFinancePeriod(
  periodKey: string,
  options:
    BuildNextPersonalFinancePeriodOptions = {}
): {
  created: boolean;
  period: PersonalFinancePeriodSummary;
} {
  assertEnabled();

  const sourcePeriodKey =
    requiredPeriodKey(periodKey);

  const targetPeriodKey =
    personalFinanceNextPeriodKey(
      sourcePeriodKey
    );

  const carryBills =
    options.carryBills !== false;

  const carryAccounts =
    options.carryAccounts !== false;

  const carryGoal =
    options.carryGoal !== false;

  const database = openPeriodDatabase();

  let created = false;

  try {
    const build =
      database.transaction(() => {
        const sourcePeriod =
          database.prepare(`
            SELECT
              period_key,
              status,
              source_period_key,
              source_kind,
              source_file,
              month_end_goal_cents
            FROM pf_budget_periods
            WHERE period_key = ?
          `).get(
            sourcePeriodKey
          ) as PeriodRow | undefined;

        if (!sourcePeriod) {
          throw new Error(
            "The source budget month does not exist."
          );
        }

        const existing =
          database.prepare(`
            SELECT period_key
            FROM pf_budget_periods
            WHERE period_key = ?
          `).get(
            targetPeriodKey
          );

        if (existing) {
          writeSelectedPeriodKey(
            database,
            targetPeriodKey
          );

          return false;
        }

        database.prepare(`
          INSERT INTO pf_budget_periods (
            period_key,
            status,
            source_period_key,
            source_kind,
            source_file,
            month_end_goal_cents
          )
          VALUES (
            ?,
            'draft',
            ?,
            'built',
            'personal-finance.sqlite3',
            ?
          )
        `).run(
          targetPeriodKey,
          sourcePeriodKey,
          carryGoal
            ? sourcePeriod
                .month_end_goal_cents
            : 0
        );

        if (carryBills) {
          copyBillsIntoNextPeriod({
            database,
            sourcePeriodKey,
            targetPeriodKey
          });
        }

        if (carryAccounts) {
          copyAccountsIntoNextPeriod({
            database,
            sourcePeriodKey,
            targetPeriodKey
          });
        }

        writeSelectedPeriodKey(
          database,
          targetPeriodKey
        );

        return true;
      });

    created = build.immediate();
  } finally {
    database.close();
  }

  readPersonalFinanceIncomeWorkspace(
    targetPeriodKey
  );

  const period =
    readPersonalFinancePeriodSummaries()
      .find(
        (item) =>
          item.periodKey ===
          targetPeriodKey
      );

  if (!period) {
    throw new Error(
      "The new budget month could not be read after creation."
    );
  }

  return {
    created,
    period
  };
}

export function readPersonalFinancePeriodBudget(
  periodKey: string
): PersonalFinanceMonth {
  assertEnabled();

  const normalized =
    requiredPeriodKey(periodKey);

  const database = openPeriodDatabase();

  let period: PeriodRow;
  let billRows: PeriodBillRow[];
  let accountRows: PeriodAccountRow[];

  try {
    const readPeriod =
      database.prepare(`
        SELECT
          period_key,
          status,
          source_period_key,
          source_kind,
          source_file,
          month_end_goal_cents
        FROM pf_budget_periods
        WHERE period_key = ?
      `).get(
        normalized
      ) as PeriodRow | undefined;

    if (!readPeriod) {
      throw new Error(
        "The requested budget month does not exist."
      );
    }

    period = readPeriod;

    billRows =
      database.prepare(`
        SELECT
          id,
          period_key,
          budget_item_key,
          name,
          planned_amount_cents,
          paid_amount_cents,
          due_date,
          due_label,
          payment_method,
          carry_forward
        FROM pf_period_bills
        WHERE period_key = ?
        ORDER BY
          COALESCE(
            due_date,
            '9999-12-31'
          ),
          name COLLATE NOCASE
      `).all(
        normalized
      ) as PeriodBillRow[];

    accountRows =
      database.prepare(`
        SELECT
          id,
          period_key,
          account_key,
          name,
          account_kind,
          opening_balance_cents,
          current_balance_cents,
          credit_limit_cents,
          minimum_payment_cents
        FROM pf_period_accounts
        WHERE period_key = ?
        ORDER BY
          account_kind,
          name COLLATE NOCASE
      `).all(
        normalized
      ) as PeriodAccountRow[];
  } finally {
    database.close();
  }

  const incomeWorkspace =
    readPersonalFinanceIncomeWorkspace(
      normalized
    );

  const bills: BudgetBill[] =
    billRows.map((bill) => {
      const budgeted =
        fromCents(
          bill.planned_amount_cents
        );

      const paid =
        fromCents(
          bill.paid_amount_cents
        );

      return {
        id: bill.budget_item_key,
        name: bill.name,
        budgeted,
        paid,
        remaining:
          roundMoney(
            budgeted - paid
          ),
        due:
          bill.due_date
            ? displayIsoDate(
                bill.due_date
              )
            : bill.due_label,
        paymentMethod:
          bill.payment_method
      };
    });

  const cashRows =
    accountRows.filter(
      (account) =>
        account.account_kind ===
        "cash"
    );

  const creditRows =
    accountRows.filter(
      (account) =>
        account.account_kind ===
        "credit"
    );

  const accounts =
    cashRows.map(
      (account) => ({
        id: account.account_key,
        name: account.name,
        amount:
          fromCents(
            account
              .current_balance_cents
          ),
        emphasis: false
      })
    );

  const creditAccounts =
    creditRows.map((account) => {
      const limit =
        fromCents(
          account.credit_limit_cents ??
          0
        );

      const balance =
        fromCents(
          account.current_balance_cents
        );

      const minimumPayment =
        fromCents(
          account.minimum_payment_cents ??
          0
        );

      return {
        id: account.account_key,
        name: account.name,
        limit,
        balance,
        minimumPayment,
        available:
          roundMoney(
            Math.max(
              limit - balance,
              0
            )
          )
      };
    });

  const expensesBudgeted =
    sumMoney(
      bills.map(
        (bill) =>
          bill.budgeted
      )
    );

  const expensesPaid =
    sumMoney(
      bills.map(
        (bill) =>
          bill.paid
      )
    );

  const billsRemaining =
    sumMoney(
      bills.map(
        (bill) =>
          bill.remaining
      )
    );

  const totalBankBalance =
    sumMoney(
      accounts.map(
        (account) =>
          account.amount
      )
    );

  const totalCreditLimit =
    sumMoney(
      creditAccounts.map(
        (account) =>
          account.limit
      )
    );

  const totalCreditBalance =
    sumMoney(
      creditAccounts.map(
        (account) =>
          account.balance
      )
    );

  const totalMinimumPayments =
    sumMoney(
      creditAccounts.map(
        (account) =>
          account.minimumPayment
      )
    );

  const totalAvailableCredit =
    sumMoney(
      creditAccounts.map(
        (account) =>
          account.available
      )
    );

  const projectedEndingBalance =
    roundMoney(
      totalBankBalance +
      incomeWorkspace.totals.pending -
      billsRemaining
    );

  return {
    month:
      personalFinancePeriodLabel(
        normalized
      ),
    sourceFile:
      period.source_file ??
      "personal-finance.sqlite3",
    goal:
      fromCents(
        period.month_end_goal_cents
      ),
    totals: {
      expensesBudgeted,
      expensesPaid,
      billsRemaining,
      incomeExpected:
        incomeWorkspace
          .totals
          .expected,
      incomeReceived:
        incomeWorkspace
          .totals
          .received,
      incomeRemaining:
        incomeWorkspace
          .totals
          .pending,
      totalBankBalance,
      projectedEndingBalance,
      totalCreditLimit,
      totalCreditBalance,
      totalMinimumPayments,
      totalAvailableCredit
    },
    bills,
    income:
      incomeWorkspace
        .occurrences
        .map(
          (occurrence) => ({
            id: occurrence.id,
            date:
              displayIsoDate(
                occurrence
                  .expectedDate
              ),
            expected:
              occurrence.expected,
            received:
              occurrence.received
          })
        ),
    accounts,
    creditAccounts,
    irregularExpenses: []
  };
}

export function carryPersonalFinanceDueDate({
  dueDate,
  dueLabel,
  targetPeriodKey
}: {
  dueDate: string | null;
  dueLabel: string;
  targetPeriodKey: string;
}): string | null {
  const target =
    requiredPeriodKey(
      targetPeriodKey
    );

  let day: number | null =
    null;

  if (
    dueDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      dueDate
    )
  ) {
    day =
      Number(
        dueDate.slice(
          8,
          10
        )
      );
  }

  if (
    day === null ||
    !Number.isInteger(day)
  ) {
    day =
      dayFromDueLabel(
        dueLabel
      );
  }

  if (day === null) {
    return null;
  }

  return isoDateForPeriodDay(
    target,
    day
  );
}

function seedLegacyPeriod(
  budget: PersonalFinanceMonth
): string {
  const periodKey =
    personalFinancePeriodKeyFromMonthLabel(
      budget.month
    );

  if (!periodKey) {
    throw new Error(
      "The imported budget month could not be converted to a period key."
    );
  }

  const database = openPeriodDatabase();

  try {
    const seed =
      database.transaction(() => {
        database.prepare(`
          INSERT OR IGNORE INTO
            pf_budget_periods (
              period_key,
              status,
              source_period_key,
              source_kind,
              source_file,
              month_end_goal_cents
            )
          VALUES (
            ?,
            'active',
            NULL,
            'imported',
            ?,
            ?
          )
        `).run(
          periodKey,
          budget.sourceFile,
          toCents(
            Math.max(
              budget.goal,
              0
            )
          )
        );

        seedLegacyBills(
          database,
          periodKey,
          budget
        );

        seedLegacyAccounts(
          database,
          periodKey,
          budget
        );

        database.prepare(`
          INSERT INTO pf_meta (
            key,
            value
          )
          VALUES (
            'selected_period_key',
            ?
          )
          ON CONFLICT(key)
          DO NOTHING
        `).run(periodKey);
      });

    seed.immediate();
  } finally {
    database.close();
  }

  seedPersonalFinanceIncomeFromLegacy({
    periodKey,
    entries: budget.income
  });

  return periodKey;
}

function seedLegacyBills(
  database: PersonalFinanceDatabase,
  periodKey: string,
  budget: PersonalFinanceMonth
): void {
  const insert =
    database.prepare(`
      INSERT OR IGNORE INTO
        pf_period_bills (
          id,
          period_key,
          budget_item_key,
          name,
          planned_amount_cents,
          paid_amount_cents,
          due_date,
          due_label,
          payment_method,
          carry_forward,
          source_kind
        )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        1,
        'imported'
      )
    `);

  for (const bill of budget.bills) {
    insert.run(
      createPersonalFinanceId(
        "period_bill",
        [
          periodKey,
          bill.id
        ]
      ),
      periodKey,
      bill.id,
      bill.name,
      toCents(
        Math.max(
          bill.budgeted,
          0
        )
      ),
      toCents(
        Math.max(
          bill.paid,
          0
        )
      ),
      dueDateFromLegacyLabel(
        bill.due,
        periodKey
      ),
      bill.due,
      bill.paymentMethod
    );
  }
}

function seedLegacyAccounts(
  database: PersonalFinanceDatabase,
  periodKey: string,
  budget: PersonalFinanceMonth
): void {
  const insert =
    database.prepare(`
      INSERT OR IGNORE INTO
        pf_period_accounts (
          id,
          period_key,
          account_key,
          name,
          account_kind,
          opening_balance_cents,
          current_balance_cents,
          credit_limit_cents,
          minimum_payment_cents,
          source_kind,
          carried_from_period
        )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        NULL,
        ?,
        ?,
        ?,
        'imported',
        NULL
      )
    `);

  const cashAccounts =
    budget.accounts.filter(
      (account) =>
        !account.emphasis
    );

  let importedCashTotal = 0;

  for (
    const account of cashAccounts
  ) {
    importedCashTotal =
      roundMoney(
        importedCashTotal +
        account.amount
      );

    insert.run(
      createPersonalFinanceId(
        "period_account",
        [
          periodKey,
          account.id
        ]
      ),
      periodKey,
      account.id,
      account.name,
      "cash",
      toCents(account.amount),
      null,
      null
    );
  }

  const cashDifference =
    roundMoney(
      budget.totals
        .totalBankBalance -
      importedCashTotal
    );

  if (
    cashAccounts.length === 0 ||
    Math.abs(cashDifference) >=
      0.01
  ) {
    const adjustment =
      cashAccounts.length === 0
        ? budget.totals
            .totalBankBalance
        : cashDifference;

    insert.run(
      createPersonalFinanceId(
        "period_account",
        [
          periodKey,
          "imported-cash-adjustment"
        ]
      ),
      periodKey,
      "imported-cash-adjustment",
      cashAccounts.length === 0
        ? "Imported cash balance"
        : "Imported cash adjustment",
      "cash",
      toCents(adjustment),
      null,
      null
    );
  }

  for (
    const account of
      budget.creditAccounts
  ) {
    insert.run(
      createPersonalFinanceId(
        "period_account",
        [
          periodKey,
          account.id
        ]
      ),
      periodKey,
      account.id,
      account.name,
      "credit",
      toCents(
        account.balance
      ),
      toCents(
        Math.max(
          account.limit,
          0
        )
      ),
      toCents(
        Math.max(
          account.minimumPayment,
          0
        )
      )
    );
  }
}

function copyBillsIntoNextPeriod({
  database,
  sourcePeriodKey,
  targetPeriodKey
}: {
  database: PersonalFinanceDatabase;
  sourcePeriodKey: string;
  targetPeriodKey: string;
}): void {
  const bills =
    database.prepare(`
      SELECT
        id,
        period_key,
        budget_item_key,
        name,
        planned_amount_cents,
        paid_amount_cents,
        due_date,
        due_label,
        payment_method,
        carry_forward
      FROM pf_period_bills
      WHERE
        period_key = ? AND
        carry_forward = 1
      ORDER BY id
    `).all(
      sourcePeriodKey
    ) as PeriodBillRow[];

  const insert =
    database.prepare(`
      INSERT INTO pf_period_bills (
        id,
        period_key,
        budget_item_key,
        name,
        planned_amount_cents,
        paid_amount_cents,
        due_date,
        due_label,
        payment_method,
        carry_forward,
        source_kind
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        0,
        ?,
        ?,
        ?,
        ?,
        'carried'
      )
    `);

  for (const bill of bills) {
    const dueDate =
      carryPersonalFinanceDueDate({
        dueDate:
          bill.due_date,
        dueLabel:
          bill.due_label,
        targetPeriodKey
      });

    insert.run(
      createPersonalFinanceId(
        "period_bill",
        [
          targetPeriodKey,
          bill.budget_item_key
        ]
      ),
      targetPeriodKey,
      bill.budget_item_key,
      bill.name,
      bill.planned_amount_cents,
      dueDate,
      dueDate
        ? displayIsoDate(
            dueDate
          )
        : bill.due_label,
      bill.payment_method,
      bill.carry_forward
    );
  }
}

function copyAccountsIntoNextPeriod({
  database,
  sourcePeriodKey,
  targetPeriodKey
}: {
  database: PersonalFinanceDatabase;
  sourcePeriodKey: string;
  targetPeriodKey: string;
}): void {
  const accounts =
    database.prepare(`
      SELECT
        id,
        period_key,
        account_key,
        name,
        account_kind,
        opening_balance_cents,
        current_balance_cents,
        closing_balance_cents,
        credit_limit_cents,
        minimum_payment_cents
      FROM pf_period_accounts
      WHERE period_key = ?
      ORDER BY id
    `).all(
      sourcePeriodKey
    ) as PeriodAccountRow[];

  const insert =
    database.prepare(`
      INSERT INTO pf_period_accounts (
        id,
        period_key,
        account_key,
        name,
        account_kind,
        opening_balance_cents,
        current_balance_cents,
        credit_limit_cents,
        minimum_payment_cents,
        source_kind,
        carried_from_period
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'carried',
        ?
      )
    `);

  for (
    const account of accounts
  ) {
    const carryBalance =
      account.closing_balance_cents ??
      account.current_balance_cents;

    insert.run(
      createPersonalFinanceId(
        "period_account",
        [
          targetPeriodKey,
          account.account_key
        ]
      ),
      targetPeriodKey,
      account.account_key,
      account.name,
      account.account_kind,
      carryBalance,
      carryBalance,
      account.credit_limit_cents,
      account.minimum_payment_cents,
      sourcePeriodKey
    );
  }
}

function openPeriodDatabase():
  PersonalFinanceDatabase {
  const database =
    openPersonalFinanceDatabase();

  try {
    ensurePeriodSchema(database);
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

function ensurePeriodSchema(
  database: PersonalFinanceDatabase
): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS
      pf_budget_periods (
        period_key TEXT PRIMARY KEY,

        status TEXT NOT NULL
          DEFAULT 'draft'
          CHECK (
            status IN (
              'draft',
              'active',
              'closed',
              'archived'
            )
          ),

        source_period_key TEXT,

        source_kind TEXT NOT NULL
          CHECK (
            source_kind IN (
              'imported',
              'built',
              'manual'
            )
          ),

        source_file TEXT,

        month_end_goal_cents
          INTEGER NOT NULL
          DEFAULT 0
          CHECK (
            month_end_goal_cents >= 0
          ),

        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
          source_period_key
        )
          REFERENCES
            pf_budget_periods(
              period_key
            )
          ON DELETE SET NULL
      ) STRICT;

    CREATE TABLE IF NOT EXISTS
      pf_period_bills (
        id TEXT PRIMARY KEY,

        period_key TEXT NOT NULL,

        budget_item_key TEXT NOT NULL,

        name TEXT NOT NULL,

        planned_amount_cents
          INTEGER NOT NULL
          DEFAULT 0
          CHECK (
            planned_amount_cents >= 0
          ),

        paid_amount_cents
          INTEGER NOT NULL
          DEFAULT 0
          CHECK (
            paid_amount_cents >= 0
          ),

        due_date TEXT,

        due_label TEXT NOT NULL
          DEFAULT 'Not entered',

        payment_method TEXT NOT NULL
          DEFAULT 'Not entered',

        carry_forward INTEGER NOT NULL
          DEFAULT 1
          CHECK (
            carry_forward IN (
              0,
              1
            )
          ),

        source_kind TEXT NOT NULL
          CHECK (
            source_kind IN (
              'imported',
              'carried',
              'manual'
            )
          ),

        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
          period_key
        )
          REFERENCES
            pf_budget_periods(
              period_key
            )
          ON DELETE CASCADE,

        UNIQUE (
          period_key,
          budget_item_key
        )
      ) STRICT;

    CREATE INDEX IF NOT EXISTS
      pf_period_bills_period_index
    ON pf_period_bills (
      period_key,
      due_date,
      name
    );

    CREATE TABLE IF NOT EXISTS
      pf_period_accounts (
        id TEXT PRIMARY KEY,

        period_key TEXT NOT NULL,

        account_key TEXT NOT NULL,

        name TEXT NOT NULL,

        account_kind TEXT NOT NULL
          CHECK (
            account_kind IN (
              'cash',
              'credit'
            )
          ),

        opening_balance_cents INTEGER,

        current_balance_cents
          INTEGER NOT NULL
          DEFAULT 0,

        closing_balance_cents INTEGER,

        reconciled_at TEXT,

        credit_limit_cents INTEGER
          CHECK (
            credit_limit_cents
              IS NULL OR
            credit_limit_cents >= 0
          ),

        minimum_payment_cents INTEGER
          CHECK (
            minimum_payment_cents
              IS NULL OR
            minimum_payment_cents >= 0
          ),

        source_kind TEXT NOT NULL
          CHECK (
            source_kind IN (
              'imported',
              'carried',
              'manual'
            )
          ),

        carried_from_period TEXT,

        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
          period_key
        )
          REFERENCES
            pf_budget_periods(
              period_key
            )
          ON DELETE CASCADE,

        FOREIGN KEY (
          carried_from_period
        )
          REFERENCES
            pf_budget_periods(
              period_key
            )
          ON DELETE SET NULL,

        UNIQUE (
          period_key,
          account_key
        )
      ) STRICT;

    CREATE INDEX IF NOT EXISTS
      pf_period_accounts_period_index
    ON pf_period_accounts (
      period_key,
      account_kind,
      name
    );
  `);

  ensurePeriodAccountReconciliationColumns(
    database
  );
}

function ensurePeriodAccountReconciliationColumns(
  database: PersonalFinanceDatabase
): void {
  const columns =
    database
      .prepare(
        "PRAGMA table_info(pf_period_accounts)"
      )
      .all() as
      {
        name: string;
      }[];

  const names =
    new Set(
      columns.map(
        (column) =>
          column.name
      )
    );

  if (
    !names.has(
      "closing_balance_cents"
    )
  ) {
    database.exec(`
      ALTER TABLE
        pf_period_accounts
      ADD COLUMN
        closing_balance_cents INTEGER;
    `);
  }

  if (
    !names.has(
      "reconciled_at"
    )
  ) {
    database.exec(`
      ALTER TABLE
        pf_period_accounts
      ADD COLUMN
        reconciled_at TEXT;
    `);
  }

  database.exec(`
    UPDATE
      pf_period_accounts
    SET
      opening_balance_cents =
        current_balance_cents
    WHERE
      opening_balance_cents
        IS NULL;
  `);
}

function readPeriodSummaries(
  database: PersonalFinanceDatabase
): PersonalFinancePeriodSummary[] {
  const rows =
    database.prepare(`
      SELECT
        period_key,
        status,
        source_period_key,
        source_kind,
        source_file,
        month_end_goal_cents
      FROM pf_budget_periods
      ORDER BY period_key
    `).all() as PeriodRow[];

  return rows.map(
    (row) => ({
      periodKey:
        row.period_key,
      periodLabel:
        personalFinancePeriodLabel(
          row.period_key
        ),
      status:
        row.status as
          PersonalFinancePeriodStatus,
      sourcePeriodKey:
        row.source_period_key,
      sourceKind:
        row.source_kind as
          PersonalFinancePeriodSourceKind,
      sourceFile:
        row.source_file,
      monthEndGoal:
        fromCents(
          row.month_end_goal_cents
        )
    })
  );
}

function choosePeriodKey({
  database,
  periods,
  requestedPeriodKey
}: {
  database: PersonalFinanceDatabase;
  periods: PersonalFinancePeriodSummary[];
  requestedPeriodKey: string | null;
}): string | null {
  const requested =
    normalizePersonalFinancePeriodKey(
      requestedPeriodKey
    );

  if (
    requested &&
    periods.some(
      (period) =>
        period.periodKey ===
        requested
    )
  ) {
    return requested;
  }

  const persisted =
    readSelectedPeriodKey(
      database
    );

  if (
    persisted &&
    periods.some(
      (period) =>
        period.periodKey ===
        persisted
    )
  ) {
    return persisted;
  }

  const active =
    periods.find(
      (period) =>
        period.status ===
        "active"
    );

  if (active) {
    return active.periodKey;
  }

  return (
    periods.at(-1)
      ?.periodKey ??
    null
  );
}

function readSelectedPeriodKey(
  database: PersonalFinanceDatabase
): string | null {
  const row =
    database.prepare(`
      SELECT value
      FROM pf_meta
      WHERE
        key =
          'selected_period_key'
    `).get() as
      | {
          value: string;
        }
      | undefined;

  return normalizePersonalFinancePeriodKey(
    row?.value
  );
}

function writeSelectedPeriodKey(
  database: PersonalFinanceDatabase,
  periodKey: string
): void {
  database.prepare(`
    INSERT INTO pf_meta (
      key,
      value
    )
    VALUES (
      'selected_period_key',
      ?
    )
    ON CONFLICT(key)
    DO UPDATE SET
      value = excluded.value
  `).run(periodKey);
}

function dueDateFromLegacyLabel(
  dueLabel: string,
  periodKey: string
): string | null {
  const day =
    dayFromDueLabel(
      dueLabel
    );

  return day === null
    ? null
    : isoDateForPeriodDay(
        periodKey,
        day
      );
}

function dayFromDueLabel(
  value: string
): number | null {
  const normalized =
    value.trim();

  if (
    !normalized ||
    normalized.toLowerCase() ===
      "not entered"
  ) {
    return null;
  }

  const iso =
    normalized.match(
      /^\d{4}-\d{2}-(\d{2})$/
    );

  if (iso) {
    return Number(iso[1]);
  }

  const numeric =
    normalized.match(
      /^\d{1,2}\/(\d{1,2})(?:\/\d{2,4})?$/
    );

  if (numeric) {
    return Number(
      numeric[1]
    );
  }

  const dayOnly =
    normalized.match(
      /(?:due\s*)?(\d{1,2})(?:st|nd|rd|th)?/i
    );

  if (!dayOnly) {
    return null;
  }

  const parsed =
    Number(dayOnly[1]);

  return (
    parsed >= 1 &&
    parsed <= 31
  )
    ? parsed
    : null;
}

function isoDateForPeriodDay(
  periodKey: string,
  requestedDay: number
): string {
  const [
    yearText,
    monthText
  ] =
    periodKey.split("-");

  const year =
    Number(yearText);

  const month =
    Number(monthText);

  const lastDay =
    new Date(
      Date.UTC(
        year,
        month,
        0
      )
    ).getUTCDate();

  const day =
    Math.min(
      Math.max(
        requestedDay,
        1
      ),
      lastDay
    );

  return [
    String(year),
    String(month)
      .padStart(
        2,
        "0"
      ),
    String(day)
      .padStart(
        2,
        "0"
      )
  ].join("-");
}

function displayIsoDate(
  value: string
): string {
  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return value;
  }

  return `${Number(
    match[2]
  )}/${Number(
    match[3]
  )}/${match[1]}`;
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

function assertEnabled(): void {
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
      (total, value) =>
        total + value,
      0
    )
  );
}
