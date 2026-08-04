import "server-only";

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  createCsvHeaderIndex,
  csvCell,
  parseLocalCsv
} from "./local-csv";

export type TransactionDirection =
  | "inflow"
  | "outflow";

export type LocalPersonalFinanceTransaction = {
  id: string;
  postedDate: string;
  description: string;
  normalizedDescription: string;
  amount: number;
  direction: TransactionDirection;
  accountName: string;
  sourceFile: string;
  fingerprint: string;
};

export type LocalTransactionImportIssue = {
  sourceFile: string;
  rowNumber: number | null;
  message: string;
};

export type LocalPersonalFinanceTransactionsResult = {
  transactions: LocalPersonalFinanceTransaction[];
  sourceFiles: string[];
  issues: LocalTransactionImportIssue[];
  reason: string | null;
};

export type ParsedLocalPersonalFinanceTransactionFile = {
  transactions: LocalPersonalFinanceTransaction[];
  issues: LocalTransactionImportIssue[];
};

const TRANSACTION_DIRECTORY = "transactions";

const DATE_HEADERS = [
  "date",
  "postdate",
  "posteddate",
  "postingdate",
  "transactiondate"
];

const DESCRIPTION_HEADERS = [
  "description",
  "memo",
  "name",
  "merchant",
  "details",
  "transactiondescription",
  "originaldescription"
];

const AMOUNT_HEADERS = [
  "amount",
  "transactionamount"
];

const DEBIT_HEADERS = [
  "debit",
  "debitamount",
  "withdrawal",
  "withdrawalamount",
  "charge",
  "chargeamount"
];

const CREDIT_HEADERS = [
  "credit",
  "creditamount",
  "deposit",
  "depositamount"
];

const DIRECTION_HEADERS = [
  "direction",
  "transactiontype",
  "type",
  "debitcredit"
];

const ACCOUNT_HEADERS = [
  "account",
  "accountname",
  "card",
  "cardname",
  "accountnumber"
];

const REFERENCE_HEADERS = [
  "id",
  "transactionid",
  "reference",
  "referencenumber",
  "confirmationnumber"
];

export async function loadLocalPersonalFinanceTransactions():
  Promise<LocalPersonalFinanceTransactionsResult> {
  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    return emptyResult(
      "Local personal finance is disabled."
    );
  }

  const directory = await findTransactionDirectory();

  if (!directory) {
    return emptyResult(
      "The private transaction directory was not found."
    );
  }

  const entries = await readdir(directory, {
    withFileTypes: true
  });

  const sourceFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".csv")
    )
    .map((entry) => entry.name)
    .sort((left, right) =>
      left.localeCompare(right)
    );

  if (sourceFiles.length === 0) {
    return {
      transactions: [],
      sourceFiles: [],
      issues: [],
      reason:
        "No transaction CSV files are present in the private transaction directory."
    };
  }

  const transactions:
    LocalPersonalFinanceTransaction[] = [];

  const issues: LocalTransactionImportIssue[] = [];
  const seenFingerprints = new Set<string>();

  for (const sourceFile of sourceFiles) {
    try {
      const contents = await readFile(
        path.join(directory, sourceFile),
        "utf8"
      );

      const parsed = parseLocalPersonalFinanceTransactionCsv(
        contents,
        sourceFile
      );

      issues.push(...parsed.issues);

      for (const transaction of parsed.transactions) {
        if (
          seenFingerprints.has(
            transaction.fingerprint
          )
        ) {
          continue;
        }

        seenFingerprints.add(
          transaction.fingerprint
        );

        transactions.push(transaction);
      }
    } catch (error) {
      issues.push({
        sourceFile,
        rowNumber: null,
        message:
          error instanceof Error
            ? error.message
            : "The transaction file could not be read."
      });
    }
  }

  transactions.sort(
    (left, right) =>
      right.postedDate.localeCompare(
        left.postedDate
      ) ||
      left.description.localeCompare(
        right.description
      ) ||
      left.id.localeCompare(right.id)
  );

  return {
    transactions,
    sourceFiles,
    issues,
    reason:
      transactions.length === 0
        ? "No valid transactions were loaded."
        : null
  };
}

export function normalizeTransactionDescription(
  value: string
): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLocalPersonalFinanceTransactionCsv(
  input: string,
  sourceFile: string
): ParsedLocalPersonalFinanceTransactionFile {
  const rows = parseLocalCsv(input);

  if (rows.length === 0) {
    return {
      transactions: [],
      issues: [
        {
          sourceFile,
          rowNumber: null,
          message: "The CSV file is empty."
        }
      ]
    };
  }

  const headerRow = rows[0] ?? [];
  const headerIndex =
    createCsvHeaderIndex(headerRow);

  const dateIndex = findHeaderIndex(
    headerIndex,
    DATE_HEADERS
  );

  const descriptionIndex = findHeaderIndex(
    headerIndex,
    DESCRIPTION_HEADERS
  );

  const amountIndex = findHeaderIndex(
    headerIndex,
    AMOUNT_HEADERS
  );

  const debitIndex = findHeaderIndex(
    headerIndex,
    DEBIT_HEADERS
  );

  const creditIndex = findHeaderIndex(
    headerIndex,
    CREDIT_HEADERS
  );

  const directionIndex = findHeaderIndex(
    headerIndex,
    DIRECTION_HEADERS
  );

  const accountIndex = findHeaderIndex(
    headerIndex,
    ACCOUNT_HEADERS
  );

  const referenceIndex = findHeaderIndex(
    headerIndex,
    REFERENCE_HEADERS
  );

  const missingHeaders: string[] = [];

  if (dateIndex === null) {
    missingHeaders.push("date");
  }

  if (descriptionIndex === null) {
    missingHeaders.push("description");
  }

  if (
    amountIndex === null &&
    debitIndex === null &&
    creditIndex === null
  ) {
    missingHeaders.push(
      "amount or debit/credit"
    );
  }

  if (missingHeaders.length > 0) {
    return {
      transactions: [],
      issues: [
        {
          sourceFile,
          rowNumber: 1,
          message:
            `Missing required CSV headers: ${missingHeaders.join(
              ", "
            )}.`
        }
      ]
    };
  }

  const transactions:
    LocalPersonalFinanceTransaction[] = [];

  const issues: LocalTransactionImportIssue[] = [];
  const occurrenceCounts = new Map<
    string,
    number
  >();

  for (
    let rowIndex = 1;
    rowIndex < rows.length;
    rowIndex += 1
  ) {
    const row = rows[rowIndex];

    if (
      !row ||
      row.every(
        (value) => value.trim().length === 0
      )
    ) {
      continue;
    }

    try {
      const postedDate = parsePostedDate(
        csvCell(row, dateIndex as number)
      );

      const description = csvCell(
        row,
        descriptionIndex as number
      );

      if (!description) {
        throw new Error(
          "Transaction description is blank."
        );
      }

      const normalizedDescription =
        normalizeTransactionDescription(
          description
        );

      if (!normalizedDescription) {
        throw new Error(
          "Transaction description has no usable characters."
        );
      }

      const parsedAmount =
        parseTransactionAmount({
          row,
          amountIndex,
          debitIndex,
          creditIndex,
          directionIndex
        });

      const accountName =
        accountIndex === null
          ? accountNameFromFile(sourceFile)
          : csvCell(row, accountIndex) ||
            accountNameFromFile(sourceFile);

      const reference =
        referenceIndex === null
          ? ""
          : csvCell(row, referenceIndex);

      const baseFingerprint = [
        postedDate,
        normalizedDescription,
        parsedAmount.amount.toFixed(2),
        parsedAmount.direction,
        normalizeTransactionDescription(
          accountName
        )
      ].join("|");

      const occurrence =
        (occurrenceCounts.get(
          baseFingerprint
        ) ?? 0) + 1;

      occurrenceCounts.set(
        baseFingerprint,
        occurrence
      );

      const fingerprint = createFingerprint(
        [
          baseFingerprint,
          reference
            ? `reference:${reference}`
            : `occurrence:${occurrence}`
        ].join("|")
      );

      transactions.push({
        id: `transaction-${fingerprint}`,
        postedDate,
        description,
        normalizedDescription,
        amount: parsedAmount.amount,
        direction: parsedAmount.direction,
        accountName,
        sourceFile,
        fingerprint
      });
    } catch (error) {
      issues.push({
        sourceFile,
        rowNumber: rowIndex + 1,
        message:
          error instanceof Error
            ? error.message
            : "The transaction row is invalid."
      });
    }
  }

  return {
    transactions,
    issues
  };
}

function parseTransactionAmount({
  row,
  amountIndex,
  debitIndex,
  creditIndex,
  directionIndex
}: {
  row: readonly string[];
  amountIndex: number | null;
  debitIndex: number | null;
  creditIndex: number | null;
  directionIndex: number | null;
}): {
  amount: number;
  direction: TransactionDirection;
} {
  const debit =
    debitIndex === null
      ? 0
      : parseOptionalMoney(
          csvCell(row, debitIndex)
        );

  const credit =
    creditIndex === null
      ? 0
      : parseOptionalMoney(
          csvCell(row, creditIndex)
        );

  if (debit !== 0 && credit !== 0) {
    throw new Error(
      "Both debit and credit amounts are present."
    );
  }

  if (debit !== 0) {
    return {
      amount: absoluteMoney(debit),
      direction: "outflow"
    };
  }

  if (credit !== 0) {
    return {
      amount: absoluteMoney(credit),
      direction: "inflow"
    };
  }

  if (amountIndex === null) {
    throw new Error(
      "Transaction amount is blank."
    );
  }

  const signedAmount = parseRequiredMoney(
    csvCell(row, amountIndex)
  );

  if (signedAmount === 0) {
    throw new Error(
      "Transaction amount cannot be zero."
    );
  }

  const explicitDirection =
    directionIndex === null
      ? null
      : parseDirection(
          csvCell(row, directionIndex)
        );

  return {
    amount: absoluteMoney(signedAmount),
    direction:
      explicitDirection ??
      (signedAmount < 0
        ? "outflow"
        : "inflow")
  };
}

function parseDirection(
  value: string
): TransactionDirection | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]+/g, "");

  if (!normalized) {
    return null;
  }

  if (
    [
      "credit",
      "deposit",
      "income",
      "inflow",
      "received"
    ].includes(normalized)
  ) {
    return "inflow";
  }

  if (
    [
      "debit",
      "withdrawal",
      "expense",
      "outflow",
      "purchase",
      "charge"
    ].includes(normalized)
  ) {
    return "outflow";
  }

  throw new Error(
    `Unrecognized transaction direction: ${value}`
  );
}

function parsePostedDate(value: string): string {
  const trimmed = value.trim();

  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/
  );

  if (isoMatch) {
    return validatedDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }

  const usMatch = trimmed.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})/
  );

  if (usMatch) {
    let year = Number(usMatch[3]);

    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }

    return validatedDate(
      year,
      Number(usMatch[1]),
      Number(usMatch[2])
    );
  }

  throw new Error(
    `Unsupported transaction date: ${value}`
  );
}

function validatedDate(
  year: number,
  month: number,
  day: number
): string {
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(
      "Transaction date is invalid."
    );
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function parseOptionalMoney(
  value: string
): number {
  return value.trim()
    ? parseMoney(value)
    : 0;
}

function parseRequiredMoney(
  value: string
): number {
  if (!value.trim()) {
    throw new Error(
      "Transaction amount is blank."
    );
  }

  return parseMoney(value);
}

function parseMoney(value: string): number {
  const trimmed = value.trim();

  const negativeByParentheses =
    trimmed.startsWith("(") &&
    trimmed.endsWith(")");

  const cleaned = trimmed
    .replace(/[,$\s()]/g, "")
    .replace(/^\+/, "");

  const numeric = Number(cleaned);

  if (!Number.isFinite(numeric)) {
    throw new Error(
      `Invalid transaction amount: ${value}`
    );
  }

  const signed =
    negativeByParentheses
      ? -Math.abs(numeric)
      : numeric;

  return Math.round(signed * 100) / 100;
}

function absoluteMoney(value: number): number {
  return Math.round(
    Math.abs(value) * 100
  ) / 100;
}

function findHeaderIndex(
  index: ReadonlyMap<string, number>,
  aliases: readonly string[]
): number | null {
  for (const alias of aliases) {
    const match = index.get(alias);

    if (match !== undefined) {
      return match;
    }
  }

  return null;
}

function accountNameFromFile(
  sourceFile: string
): string {
  return sourceFile
    .replace(/\.csv$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Imported account";
}

function createFingerprint(
  value: string
): string {
  return createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 24);
}

async function findTransactionDirectory():
  Promise<string | null> {
  const candidates = Array.from(
    new Set([
      path.resolve(
        process.cwd(),
        ".local",
        "personal-finance",
        TRANSACTION_DIRECTORY
      ),
      path.resolve(
        process.cwd(),
        "..",
        ".local",
        "personal-finance",
        TRANSACTION_DIRECTORY
      ),
      path.resolve(
        process.cwd(),
        "..",
        "..",
        ".local",
        "personal-finance",
        TRANSACTION_DIRECTORY
      )
    ])
  );

  for (const candidate of candidates) {
    try {
      await readdir(candidate);
      return candidate;
    } catch (error) {
      const code = getErrorCode(error);

      if (
        code === "ENOENT" ||
        code === "ENOTDIR"
      ) {
        continue;
      }

      throw error;
    }
  }

  return null;
}

function getErrorCode(
  error: unknown
): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code = (
      error as { code?: unknown }
    ).code;

    return typeof code === "string"
      ? code
      : null;
  }

  return null;
}

function emptyResult(
  reason: string
): LocalPersonalFinanceTransactionsResult {
  return {
    transactions: [],
    sourceFiles: [],
    issues: [],
    reason
  };
}
