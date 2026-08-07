import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  createPersonalFinanceDemoBudget,
  readPersonalFinanceBootstrapMode
} from "./personal-finance-bootstrap-local";

export type BudgetBill = {
  id: string;
  name: string;
  budgeted: number;
  paid: number;
  remaining: number;
  due: string;
  paymentMethod: string;
};

export type IncomeEntry = {
  id: string;
  date: string;
  expected: number;
  received: number;
};

export type AccountSnapshot = {
  id: string;
  name: string;
  amount: number;
  emphasis?: boolean;
};

export type CreditAccount = {
  id: string;
  name: string;
  limit: number;
  balance: number;
  minimumPayment: number;
  available: number;
};

export type IrregularExpense = {
  id: string;
  name: string;
  amount: number | null;
  note: string;
};

export type PersonalFinanceMonth = {
  month: string;
  sourceFile: string;
  goal: number;
  totals: {
    expensesBudgeted: number;
    expensesPaid: number;
    billsRemaining: number;
    incomeExpected: number;
    incomeReceived: number;
    incomeRemaining: number;
    totalBankBalance: number;
    projectedEndingBalance: number;
    totalCreditLimit: number;
    totalCreditBalance: number;
    totalMinimumPayments: number;
    totalAvailableCredit: number;
  };
  bills: BudgetBill[];
  income: IncomeEntry[];
  accounts: AccountSnapshot[];
  creditAccounts: CreditAccount[];
  irregularExpenses: IrregularExpense[];
};

export type PersonalFinanceLoadResult = {
  budget: PersonalFinanceMonth | null;
  reason: string | null;
};

const LOCAL_FILE_NAME = "JM_Budget_July_2026.csv";

export async function loadLocalPersonalFinance(): Promise<PersonalFinanceLoadResult> {
  if (process.env.ENABLE_LOCAL_PERSONAL_FINANCE !== "true") {
    return {
      budget: null,
      reason:
        "Local personal finance is disabled. Enable it in apps/web/.env.local and restart the development server."
    };
  }

  try {
    const bootstrapMode =
      await readPersonalFinanceBootstrapMode();

    if (
      bootstrapMode ===
      "clean"
    ) {
      return {
        budget:
          null,

        reason:
          "Personal Finance is in clean launch mode. Legacy budget data is intentionally disabled."
      };
    }

    if (
      bootstrapMode ===
      "demo"
    ) {
      return {
        budget:
          createPersonalFinanceDemoBudget(),

        reason:
          null
      };
    }

    const source =
      await readLocalCsv();

    if (!source) {
      return {
        budget: null,
        reason:
          "The private budget CSV was not found in the ignored .local/personal-finance directory."
      };
    }

    return {
      budget: normalizeBudget(source.contents, source.fileName),
      reason: null
    };
  } catch (error) {
    console.error(
      "[personal-finance] Local budget could not be loaded:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      budget: null,
      reason:
        "The local Personal Finance bootstrap source could not be read or validated. Review the terminal for the parsing error."
    };
  }
}

async function readLocalCsv(): Promise<{
  contents: string;
  fileName: string;
} | null> {
  const overridePath = process.env.PERSONAL_FINANCE_CSV_PATH?.trim();

  const candidates = Array.from(
    new Set(
      [
        overridePath,
        path.resolve(
          process.cwd(),
          ".local",
          "personal-finance",
          LOCAL_FILE_NAME
        ),
        path.resolve(
          process.cwd(),
          "..",
          ".local",
          "personal-finance",
          LOCAL_FILE_NAME
        ),
        path.resolve(
          process.cwd(),
          "..",
          "..",
          ".local",
          "personal-finance",
          LOCAL_FILE_NAME
        )
      ].filter((candidate): candidate is string => Boolean(candidate))
    )
  );

  for (const candidate of candidates) {
    try {
      return {
        contents: await readFile(candidate, "utf8"),
        fileName: path.basename(candidate)
      };
    } catch (error) {
      if (getErrorCode(error) === "ENOENT") {
        continue;
      }

      throw error;
    }
  }

  return null;
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

function normalizeBudget(
  csvContents: string,
  sourceFile: string
): PersonalFinanceMonth {
  const rows = parseCsv(csvContents);

  if (rows.length < 52) {
    throw new Error(
      `Expected at least 52 CSV rows but found ${rows.length}.`
    );
  }

  const makeId = createIdFactory();

  const bills: BudgetBill[] = [];

  for (const row of rows.slice(1, 31)) {
    const name = cell(row, 0);

    if (!name) {
      continue;
    }

    bills.push({
      id: makeId(`bill-${name}`),
      name,
      budgeted: amount(cell(row, 1)),
      paid: amount(cell(row, 2)),
      remaining: amount(cell(row, 4)),
      due: cell(row, 3) || "Not entered",
      paymentMethod: cell(row, 5) || "Not entered"
    });
  }

  const income: IncomeEntry[] = [];
  const accounts: AccountSnapshot[] = [];
  const creditAccounts: CreditAccount[] = [];

  for (const [index, row] of rows.slice(37, 43).entries()) {
    const date = cell(row, 0);

    if (date) {
      income.push({
        id: `income-${index + 1}`,
        date,
        expected: amount(cell(row, 1)),
        received: amount(cell(row, 2))
      });
    }

    const accountName = cell(row, 3);

    if (accountName) {
      accounts.push({
        id: makeId(`account-${accountName}`),
        name: accountName,
        amount: amount(cell(row, 4)),
        emphasis: accountName.toLowerCase() === "tot bank bal"
      });
    }

    const creditLimit = amount(cell(row, 6));

    if (creditLimit > 0) {
      const creditNumber = creditAccounts.length + 1;

      creditAccounts.push({
        id: `credit-account-${creditNumber}`,
        name: `Credit account ${creditNumber}`,
        limit: creditLimit,
        balance: amount(cell(row, 7)),
        minimumPayment: amount(cell(row, 8)),
        available: amount(cell(row, 10))
      });
    }
  }

  const billTotalsRow = rows[32];
  const summaryTotalsRow = rows[45];

  const totals: PersonalFinanceMonth["totals"] = {
    expensesBudgeted: amount(cell(billTotalsRow, 1)),
    expensesPaid: amount(cell(billTotalsRow, 2)),
    billsRemaining: amount(cell(billTotalsRow, 4)),
    incomeExpected: amount(cell(rows[46], 1)),
    incomeReceived: amount(cell(rows[47], 1)),
    incomeRemaining: amount(cell(rows[48], 1)),
    totalBankBalance: amount(cell(summaryTotalsRow, 4)),
    projectedEndingBalance: amount(cell(rows[49], 1)),
    totalCreditLimit: amount(cell(summaryTotalsRow, 6)),
    totalCreditBalance: amount(cell(summaryTotalsRow, 7)),
    totalMinimumPayments: amount(cell(summaryTotalsRow, 8)),
    totalAvailableCredit: amount(cell(summaryTotalsRow, 10))
  };

  const irregularExpenses: IrregularExpense[] = [];

  for (const row of rows.slice(1, 36)) {
    const name = cell(row, 6);

    if (!name || name.toLowerCase() === "totals") {
      continue;
    }

    const matchingBill = bills.find(
      (bill) => bill.name.toLowerCase() === name.toLowerCase()
    );

    irregularExpenses.push({
      id: makeId(`irregular-${name}`),
      name,
      amount: matchingBill?.budgeted ?? null,
      note: matchingBill
        ? "Also recorded in the monthly bill list."
        : "The source CSV lists this expense without an amount."
    });
  }

  const goalText = cell(rows[51], 0);
  const goalMatch = goalText.match(/-?[\d,]+(?:\.\d+)?/);
  const goal = goalMatch ? amount(goalMatch[0]) : 0;

  const budget: PersonalFinanceMonth = {
    month: "July 2026",
    sourceFile,
    goal,
    totals,
    bills,
    income,
    accounts,
    creditAccounts,
    irregularExpenses
  };

  validateBudget(budget);

  return budget;
}

function validateBudget(budget: PersonalFinanceMonth): void {
  assertMoneyEqual(
    "budgeted expenses",
    sumMoney(budget.bills.map((bill) => bill.budgeted)),
    budget.totals.expensesBudgeted
  );

  assertMoneyEqual(
    "paid expenses",
    sumMoney(budget.bills.map((bill) => bill.paid)),
    budget.totals.expensesPaid
  );

  assertMoneyEqual(
    "remaining bills",
    sumMoney(budget.bills.map((bill) => bill.remaining)),
    budget.totals.billsRemaining
  );

  assertMoneyEqual(
    "expected income",
    sumMoney(budget.income.map((entry) => entry.expected)),
    budget.totals.incomeExpected
  );

  assertMoneyEqual(
    "received income",
    sumMoney(budget.income.map((entry) => entry.received)),
    budget.totals.incomeReceived
  );

  assertMoneyEqual(
    "remaining income",
    sumMoney(
      budget.income.map(
        (entry) => entry.expected - entry.received
      )
    ),
    budget.totals.incomeRemaining
  );

  assertMoneyEqual(
    "projected ending balance",
    budget.totals.totalBankBalance +
      budget.totals.incomeRemaining -
      budget.totals.billsRemaining,
    budget.totals.projectedEndingBalance
  );

  assertMoneyEqual(
    "credit limit",
    sumMoney(
      budget.creditAccounts.map((account) => account.limit)
    ),
    budget.totals.totalCreditLimit
  );

  assertMoneyEqual(
    "credit balance",
    sumMoney(
      budget.creditAccounts.map((account) => account.balance)
    ),
    budget.totals.totalCreditBalance
  );

  assertMoneyEqual(
    "available credit",
    sumMoney(
      budget.creditAccounts.map((account) => account.available)
    ),
    budget.totals.totalAvailableCredit
  );
}

function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (!inQuotes && character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (
      !inQuotes &&
      (character === "\n" || character === "\r")
    ) {
      if (
        character === "\r" &&
        text[index + 1] === "\n"
      ) {
        index += 1;
      }

      row.push(field);
      rows.push(row);

      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    throw new Error("The CSV ended inside a quoted field.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function cell(row: string[], index: number): string {
  return row[index]?.trim() ?? "";
}

function amount(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const parenthesized =
    trimmed.startsWith("(") && trimmed.endsWith(")");

  const normalized = trimmed
    .replace(/[$,()]/g, "")
    .trim();

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid currency value encountered.`);
  }

  return roundMoney(parenthesized ? -parsed : parsed);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sumMoney(values: number[]): number {
  return roundMoney(
    values.reduce((total, value) => total + value, 0)
  );
}

function assertMoneyEqual(
  label: string,
  actual: number,
  expected: number
): void {
  if (roundMoney(actual) !== roundMoney(expected)) {
    throw new Error(
      `CSV validation failed for ${label}.`
    );
  }
}

function createIdFactory(): (value: string) => string {
  const counts = new Map<string, number>();

  return (value: string) => {
    const base =
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "item";

    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);

    return count === 1 ? base : `${base}-${count}`;
  };
}
