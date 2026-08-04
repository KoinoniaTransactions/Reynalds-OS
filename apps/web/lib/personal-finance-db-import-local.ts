import "server-only";

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

import type Database from "better-sqlite3";

import {
  createPersonalFinanceId,
  getPersonalFinanceDatabaseSummary,
  openPersonalFinanceDatabase,
  type PersonalFinanceAccountType,
  type PersonalFinanceDatabaseSummary,
} from "./personal-finance-db-local";
import {
  normalizeTransactionDescription,
  parseLocalPersonalFinanceTransactionCsv,
  type LocalPersonalFinanceTransaction,
} from "./personal-finance-transactions-local";

export type ImportLocalTransactionsOptions = {
  databasePath?: string;
  transactionDirectory?: string;
  sourceFiles?: readonly string[];
};

export type ImportedLocalTransactionFile = {
  sourceFile: string;
  sourceFileSha256: string;
  accountId: string;
  accountName: string;
  batchId: string;
  transactionCount: number;
  insertedTransactions: number;
  skippedTransactions: number;
  alreadyImported: boolean;
};

export type ImportLocalTransactionsResult = {
  files: ImportedLocalTransactionFile[];
  insertedBatches: number;
  insertedTransactions: number;
  skippedTransactions: number;
  databaseSummary: PersonalFinanceDatabaseSummary;
};

type AccountIdentity = {
  id: string;
  sourceKey: string;
  institution: string;
  name: string;
  accountType: PersonalFinanceAccountType;
  lastFour: string | null;
};

type SourceFileInput = {
  sourceFile: string;
  sourceFileSha256: string;
  transactions: LocalPersonalFinanceTransaction[];
};

type ExistingBatchRow = {
  id: string;
  account_id: string;
  transaction_count: number;
};

function findRepositoryRoot(
  startDirectory = process.cwd(),
): string {
  let currentDirectory = path.resolve(startDirectory);

  for (let depth = 0; depth < 12; depth += 1) {
    if (existsSync(path.join(currentDirectory, ".git"))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(
      currentDirectory,
    );

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  throw new Error(
    "Could not locate the repository root.",
  );
}

function getDefaultTransactionDirectory(): string {
  return path.join(
    findRepositoryRoot(),
    ".local",
    "personal-finance",
    "transactions",
  );
}

function safeSourceFileName(value: string): string {
  const sourceFile = path.basename(value);

  if (
    sourceFile !== value ||
    !sourceFile.toLowerCase().endsWith(".csv")
  ) {
    throw new Error(
      `Invalid transaction source file: ${value}`,
    );
  }

  return sourceFile;
}

async function listSourceFiles(
  transactionDirectory: string,
  requestedSourceFiles?: readonly string[],
): Promise<string[]> {
  if (requestedSourceFiles) {
    const sourceFiles = [
      ...new Set(
        requestedSourceFiles.map(
          safeSourceFileName,
        ),
      ),
    ].sort((left, right) =>
      left.localeCompare(right),
    );

    if (sourceFiles.length === 0) {
      throw new Error(
        "At least one transaction source file is required.",
      );
    }

    return sourceFiles;
  }

  const entries = await readdir(
    transactionDirectory,
    {
      withFileTypes: true,
    },
  );

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".csv"),
    )
    .map((entry) => entry.name)
    .sort((left, right) =>
      left.localeCompare(right),
    );
}

function sha256(value: Buffer): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function moneyToCents(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      `Invalid transaction amount: ${value}`,
    );
  }

  const amountCents = Math.round(value * 100);

  if (amountCents <= 0) {
    throw new Error(
      "Transaction amounts must be greater than zero.",
    );
  }

  return amountCents;
}

function signedAmountCents(
  transaction: LocalPersonalFinanceTransaction,
): number {
  const amountCents = moneyToCents(
    transaction.amount,
  );

  return transaction.direction === "inflow"
    ? amountCents
    : -amountCents;
}

function inferAccountType(
  accountName: string,
): PersonalFinanceAccountType {
  const normalized = normalizeTransactionDescription(
    accountName,
  );

  if (
    normalized.includes("CHECKING") ||
    normalized.includes("CHECK")
  ) {
    return "checking";
  }

  if (normalized.includes("SAVINGS")) {
    return "savings";
  }

  if (
    normalized.includes("CREDIT CARD") ||
    normalized.includes("VISA") ||
    normalized.includes("MASTERCARD") ||
    normalized.includes("AMERICAN EXPRESS") ||
    normalized.includes("AMEX") ||
    normalized.includes("DISCOVER")
  ) {
    return "credit_card";
  }

  if (
    normalized.includes("VENMO") ||
    normalized.includes("APPLE CASH") ||
    normalized.includes("CASH APP") ||
    normalized.includes("PAYPAL")
  ) {
    return "wallet";
  }

  if (normalized === "CASH") {
    return "cash";
  }

  return "other";
}

function inferInstitution(
  accountName: string,
): string {
  const normalized = normalizeTransactionDescription(
    accountName,
  );

  const knownInstitutions: Array<{
    match: string;
    label: string;
  }> = [
    { match: "NAVY FEDERAL", label: "Navy Federal" },
    { match: "BANK OF AMERICA", label: "Bank of America" },
    { match: "AMERICAN EXPRESS", label: "American Express" },
    { match: "CAPITAL ONE", label: "Capital One" },
    { match: "WELLS FARGO", label: "Wells Fargo" },
    { match: "APPLE CASH", label: "Apple Cash" },
    { match: "CASH APP", label: "Cash App" },
    { match: "CHASE", label: "Chase" },
    { match: "CITI", label: "Citi" },
    { match: "DISCOVER", label: "Discover" },
    { match: "PAYPAL", label: "PayPal" },
    { match: "USAA", label: "USAA" },
    { match: "VENMO", label: "Venmo" },
  ];

  const known = knownInstitutions.find(
    (institution) =>
      normalized.includes(institution.match),
  );

  return known?.label ?? accountName.trim();
}

function deriveAccountIdentity(
  accountName: string,
): AccountIdentity {
  const trimmedName = accountName.trim();

  if (!trimmedName) {
    throw new Error(
      "Transaction account name is blank.",
    );
  }

  const normalizedName =
    normalizeTransactionDescription(trimmedName);

  if (!normalizedName) {
    throw new Error(
      "Transaction account name has no usable characters.",
    );
  }

  const lastFourMatch = trimmedName.match(
    /(?:^|\D)(\d{4})\s*$/,
  );

  const lastFour = lastFourMatch?.[1] ?? null;
  const sourceKey = normalizedName
    .toLowerCase()
    .replace(/\s+/g, ":");

  return {
    id: createPersonalFinanceId(
      "account",
      [sourceKey],
    ),
    sourceKey,
    institution: inferInstitution(trimmedName),
    name: trimmedName,
    accountType: inferAccountType(trimmedName),
    lastFour,
  };
}

function getSingleAccountName(
  transactions: readonly LocalPersonalFinanceTransaction[],
  sourceFile: string,
): string {
  const accountNames = new Map<string, string>();

  for (const transaction of transactions) {
    const accountName = transaction.accountName.trim();
    const normalized =
      normalizeTransactionDescription(accountName);

    if (!normalized) {
      throw new Error(
        `${sourceFile}: a transaction has a blank account name.`,
      );
    }

    accountNames.set(normalized, accountName);
  }

  if (accountNames.size !== 1) {
    throw new Error(
      `${sourceFile}: each normalized CSV must contain exactly one account; found ${accountNames.size}.`,
    );
  }

  return [...accountNames.values()][0] as string;
}

function statementRange(
  transactions: readonly LocalPersonalFinanceTransaction[],
): {
  start: string;
  end: string;
} {
  const dates = transactions
    .map((transaction) => transaction.postedDate)
    .sort((left, right) =>
      left.localeCompare(right),
    );

  const start = dates[0];
  const end = dates[dates.length - 1];

  if (!start || !end) {
    throw new Error(
      "A transaction file cannot be imported without transactions.",
    );
  }

  return {
    start,
    end,
  };
}

async function readSourceFile(
  transactionDirectory: string,
  sourceFile: string,
): Promise<SourceFileInput> {
  const filePath = path.join(
    transactionDirectory,
    sourceFile,
  );

  const contents = await readFile(filePath);
  const parsed =
    parseLocalPersonalFinanceTransactionCsv(
      contents.toString("utf8"),
      sourceFile,
    );

  if (parsed.issues.length > 0) {
    const details = parsed.issues
      .slice(0, 5)
      .map((issue) => {
        const location =
          issue.rowNumber === null
            ? sourceFile
            : `${sourceFile} row ${issue.rowNumber}`;

        return `${location}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(
      `Transaction CSV validation failed. ${details}`,
    );
  }

  if (parsed.transactions.length === 0) {
    throw new Error(
      `${sourceFile}: no valid transactions were found.`,
    );
  }

  return {
    sourceFile,
    sourceFileSha256: sha256(contents),
    transactions: parsed.transactions,
  };
}

function upsertAccount(
  database: Database.Database,
  identity: AccountIdentity,
): void {
  database
    .prepare(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type,
        last_four
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_key) DO UPDATE SET
        institution = excluded.institution,
        name = excluded.name,
        account_type = CASE
          WHEN accounts.account_type = 'other'
            THEN excluded.account_type
          ELSE accounts.account_type
        END,
        last_four = COALESCE(
          accounts.last_four,
          excluded.last_four
        ),
        updated_at = CURRENT_TIMESTAMP
    `)
    .run(
      identity.id,
      identity.sourceKey,
      identity.institution,
      identity.name,
      identity.accountType,
      identity.lastFour,
    );
}

function importSourceFile(
  database: Database.Database,
  input: SourceFileInput,
): ImportedLocalTransactionFile {
  const existingBatch = database
    .prepare(`
      SELECT
        id,
        account_id,
        transaction_count
      FROM import_batches
      WHERE source_file_sha256 = ?
    `)
    .get(
      input.sourceFileSha256,
    ) as ExistingBatchRow | undefined;

  if (existingBatch) {
    return {
      sourceFile: input.sourceFile,
      sourceFileSha256: input.sourceFileSha256,
      accountId: existingBatch.account_id,
      accountName: getSingleAccountName(
        input.transactions,
        input.sourceFile,
      ),
      batchId: existingBatch.id,
      transactionCount:
        existingBatch.transaction_count,
      insertedTransactions: 0,
      skippedTransactions:
        input.transactions.length,
      alreadyImported: true,
    };
  }

  const accountName = getSingleAccountName(
    input.transactions,
    input.sourceFile,
  );

  const accountIdentity =
    deriveAccountIdentity(accountName);

  const range = statementRange(
    input.transactions,
  );

  const inflowCents = input.transactions
    .filter(
      (transaction) =>
        transaction.direction === "inflow",
    )
    .reduce(
      (total, transaction) =>
        total + moneyToCents(transaction.amount),
      0,
    );

  const outflowCents = input.transactions
    .filter(
      (transaction) =>
        transaction.direction === "outflow",
    )
    .reduce(
      (total, transaction) =>
        total + moneyToCents(transaction.amount),
      0,
    );

  const batchId = createPersonalFinanceId(
    "batch",
    [input.sourceFileSha256],
  );

  const insertFile = database.transaction(() => {
    upsertAccount(database, accountIdentity);

    database
      .prepare(`
        INSERT INTO import_batches (
          id,
          account_id,
          importer_key,
          source_file_name,
          source_file_sha256,
          statement_start,
          statement_end,
          transaction_count,
          inflow_cents,
          outflow_cents
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        batchId,
        accountIdentity.id,
        "normalized-csv-v1",
        input.sourceFile,
        input.sourceFileSha256,
        range.start,
        range.end,
        input.transactions.length,
        inflowCents,
        outflowCents,
      );

    const insertTransaction = database.prepare(`
      INSERT INTO transactions (
        id,
        account_id,
        import_batch_id,
        source_fingerprint,
        posted_date,
        original_description,
        amount_cents
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_fingerprint) DO NOTHING
    `);

    let insertedTransactions = 0;

    for (const transaction of input.transactions) {
      const result = insertTransaction.run(
        createPersonalFinanceId(
          "transaction",
          [transaction.fingerprint],
        ),
        accountIdentity.id,
        batchId,
        transaction.fingerprint,
        transaction.postedDate,
        transaction.description,
        signedAmountCents(transaction),
      );

      insertedTransactions += result.changes;
    }

    return insertedTransactions;
  });

  const insertedTransactions = insertFile.immediate();

  return {
    sourceFile: input.sourceFile,
    sourceFileSha256: input.sourceFileSha256,
    accountId: accountIdentity.id,
    accountName,
    batchId,
    transactionCount: input.transactions.length,
    insertedTransactions,
    skippedTransactions:
      input.transactions.length -
      insertedTransactions,
    alreadyImported: false,
  };
}

export async function importLocalTransactionsIntoDatabase(
  options: ImportLocalTransactionsOptions = {},
): Promise<ImportLocalTransactionsResult> {
  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled.",
    );
  }

  const transactionDirectory = path.resolve(
    options.transactionDirectory ??
      getDefaultTransactionDirectory(),
  );

  const sourceFiles = await listSourceFiles(
    transactionDirectory,
    options.sourceFiles,
  );

  if (sourceFiles.length === 0) {
    throw new Error(
      "No normalized transaction CSV files were found.",
    );
  }

  const inputs = await Promise.all(
    sourceFiles.map((sourceFile) =>
      readSourceFile(
        transactionDirectory,
        sourceFile,
      ),
    ),
  );

  const database = openPersonalFinanceDatabase({
    databasePath: options.databasePath,
  });

  try {
    const files = inputs.map((input) =>
      importSourceFile(database, input),
    );

    return {
      files,
      insertedBatches: files.filter(
        (file) => !file.alreadyImported,
      ).length,
      insertedTransactions: files.reduce(
        (total, file) =>
          total + file.insertedTransactions,
        0,
      ),
      skippedTransactions: files.reduce(
        (total, file) =>
          total + file.skippedTransactions,
        0,
      ),
      databaseSummary:
        getPersonalFinanceDatabaseSummary(database),
    };
  } finally {
    database.close();
  }
}
