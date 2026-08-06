import "server-only";

import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

export const PERSONAL_FINANCE_SCHEMA_VERSION = 2;

export type PersonalFinanceAccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "wallet"
  | "cash"
  | "other";

export type PersonalFinanceClassification =
  | "unknown"
  | "expense"
  | "income"
  | "refund"
  | "transfer"
  | "duplicate"
  | "ignored";

export type PersonalFinanceReviewStatus =
  | "unreviewed"
  | "reconciled";

export type PersonalFinanceTransactionLinkType =
  | "transfer"
  | "duplicate"
  | "related";

export type PersonalFinanceTransactionLinkStatus =
  | "suggested"
  | "confirmed"
  | "rejected";

export type PersonalFinanceDatabaseSummary = {
  accounts: number;
  importBatches: number;
  transactions: number;
  transactionLinks: number;
  budgetAllocations: number;
};

export type OpenPersonalFinanceDatabaseOptions = {
  databasePath?: string;
  readonly?: boolean;
};

const PERSONAL_FINANCE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS pf_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;

  INSERT INTO pf_meta (
    key,
    value
  )
  VALUES (
    'schema_version',
    '${PERSONAL_FINANCE_SCHEMA_VERSION}'
  )
  ON CONFLICT(key) DO NOTHING;

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    source_key TEXT NOT NULL UNIQUE,
    institution TEXT NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (
      account_type IN (
        'checking',
        'savings',
        'credit_card',
        'wallet',
        'cash',
        'other'
      )
    ),
    last_four TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (
      is_active IN (0, 1)
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS import_batches (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    importer_key TEXT NOT NULL,
    source_file_name TEXT NOT NULL,
    source_file_sha256 TEXT NOT NULL UNIQUE,
    statement_start TEXT,
    statement_end TEXT,
    transaction_count INTEGER NOT NULL CHECK (
      transaction_count >= 0
    ),
    inflow_cents INTEGER NOT NULL DEFAULT 0 CHECK (
      inflow_cents >= 0
    ),
    outflow_cents INTEGER NOT NULL DEFAULT 0 CHECK (
      outflow_cents >= 0
    ),
    imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id)
      REFERENCES accounts(id)
      ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    import_batch_id TEXT NOT NULL,
    source_fingerprint TEXT NOT NULL UNIQUE,
    source_reference TEXT,
    posted_date TEXT NOT NULL,
    authorized_date TEXT,
    original_description TEXT NOT NULL,
    display_description TEXT,
    amount_cents INTEGER NOT NULL CHECK (
      amount_cents <> 0
    ),
    classification TEXT NOT NULL DEFAULT 'unknown' CHECK (
      classification IN (
        'unknown',
        'expense',
        'income',
        'refund',
        'transfer',
        'duplicate',
        'ignored'
      )
    ),
    review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (
      review_status IN (
        'unreviewed',
        'reconciled'
      )
    ),
    reviewed_at TEXT,
    payment_channel TEXT,
    check_number TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id)
      REFERENCES accounts(id)
      ON DELETE RESTRICT,

    FOREIGN KEY (import_batch_id)
      REFERENCES import_batches(id)
      ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS transaction_links (
    id TEXT PRIMARY KEY,
    transaction_a_id TEXT NOT NULL,
    transaction_b_id TEXT NOT NULL,
    link_type TEXT NOT NULL CHECK (
      link_type IN (
        'transfer',
        'duplicate',
        'related'
      )
    ),
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (
      status IN (
        'suggested',
        'confirmed',
        'rejected'
      )
    ),
    canonical_transaction_id TEXT,
    confidence REAL CHECK (
      confidence IS NULL OR (
        confidence >= 0 AND
        confidence <= 1
      )
    ),
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TEXT,

    CHECK (
      transaction_a_id <> transaction_b_id
    ),

    CHECK (
      transaction_a_id < transaction_b_id
    ),

    CHECK (
      canonical_transaction_id IS NULL OR
      canonical_transaction_id = transaction_a_id OR
      canonical_transaction_id = transaction_b_id
    ),

    UNIQUE (
      transaction_a_id,
      transaction_b_id,
      link_type
    ),

    FOREIGN KEY (transaction_a_id)
      REFERENCES transactions(id)
      ON DELETE CASCADE,

    FOREIGN KEY (transaction_b_id)
      REFERENCES transactions(id)
      ON DELETE CASCADE,

    FOREIGN KEY (canonical_transaction_id)
      REFERENCES transactions(id)
      ON DELETE RESTRICT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS obligation_homes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (
      kind IN (
        'home',
        'vehicle',
        'household',
        'debt',
        'other'
      )
    ),
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS obligations (
    id TEXT PRIMARY KEY,
    home_id TEXT,
    budget_item_key TEXT,
    name TEXT NOT NULL,
    obligation_type TEXT NOT NULL CHECK (
      obligation_type IN (
        'mortgage',
        'rent',
        'auto',
        'utility',
        'insurance',
        'credit_card',
        'loan',
        'subscription',
        'tax',
        'membership',
        'other'
      )
    ),
    provider TEXT,
    account_last_four TEXT,
    expected_amount_cents INTEGER CHECK (
      expected_amount_cents IS NULL OR
      expected_amount_cents >= 0
    ),
    due_day INTEGER CHECK (
      due_day IS NULL OR
      (
        due_day >= 1 AND
        due_day <= 31
      )
    ),
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (
      frequency IN (
        'weekly',
        'biweekly',
        'monthly',
        'quarterly',
        'semiannual',
        'annual',
        'variable'
      )
    ),
    payment_method TEXT NOT NULL DEFAULT 'manual' CHECK (
      payment_method IN (
        'autopay',
        'bank_bill_pay',
        'provider_website',
        'phone',
        'check',
        'manual',
        'other'
      )
    ),
    funding_account_id TEXT,
    funding_account_label TEXT,
    payment_url TEXT,
    is_autopay INTEGER NOT NULL DEFAULT 0 CHECK (
      is_autopay IN (0, 1)
    ),
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (
      is_active IN (0, 1)
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (home_id)
      REFERENCES obligation_homes(id)
      ON DELETE SET NULL,

    FOREIGN KEY (funding_account_id)
      REFERENCES accounts(id)
      ON DELETE SET NULL
  ) STRICT;

  CREATE INDEX IF NOT EXISTS
    obligations_home_due_index
  ON obligations (
    home_id,
    is_active,
    due_day
  );

  CREATE INDEX IF NOT EXISTS
    obligations_budget_item_index
  ON obligations (
    budget_item_key
  );

  CREATE INDEX IF NOT EXISTS
    obligations_funding_account_index
  ON obligations (
    funding_account_id,
    is_active
  );

  CREATE TABLE IF NOT EXISTS budget_allocations (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    budget_month TEXT NOT NULL,
    budget_item_key TEXT NOT NULL,
    budget_item_label TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (
      amount_cents <> 0
    ),
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id)
      REFERENCES transactions(id)
      ON DELETE CASCADE
  ) STRICT;

  CREATE INDEX IF NOT EXISTS
    transactions_account_date_index
  ON transactions (
    account_id,
    posted_date DESC
  );

  CREATE INDEX IF NOT EXISTS
    transactions_review_index
  ON transactions (
    review_status,
    posted_date DESC
  );

  CREATE INDEX IF NOT EXISTS
    transactions_classification_index
  ON transactions (
    classification,
    posted_date DESC
  );

  CREATE INDEX IF NOT EXISTS
    import_batches_account_index
  ON import_batches (
    account_id,
    statement_start,
    statement_end
  );

  CREATE INDEX IF NOT EXISTS
    transaction_links_status_index
  ON transaction_links (
    status,
    link_type
  );

  CREATE INDEX IF NOT EXISTS
    budget_allocations_budget_index
  ON budget_allocations (
    budget_month,
    budget_item_key
  );

  CREATE INDEX IF NOT EXISTS
    budget_allocations_transaction_index
  ON budget_allocations (
    transaction_id
  );
`;

function findRepositoryRoot(
  startDirectory = process.cwd(),
): string {
  let currentDirectory = path.resolve(startDirectory);

  for (let depth = 0; depth < 12; depth += 1) {
    if (
      existsSync(path.join(currentDirectory, ".git"))
    ) {
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

function hasPersonalFinanceSchema(
  database: Database.Database,
): boolean {
  const row = database
    .prepare(`
      SELECT 1
      FROM sqlite_master
      WHERE
        type = 'table' AND
        name = 'pf_meta'
    `)
    .get();

  return Boolean(row);
}

function readSchemaVersion(
  database: Database.Database,
): string | undefined {
  if (!hasPersonalFinanceSchema(database)) {
    return undefined;
  }

  const row = database
    .prepare(`
      SELECT value
      FROM pf_meta
      WHERE key = 'schema_version'
    `)
    .get() as { value: string } | undefined;

  return row?.value;
}

function verifySchemaVersion(
  database: Database.Database,
): void {
  const actualVersion = readSchemaVersion(database);
  const expectedVersion = String(
    PERSONAL_FINANCE_SCHEMA_VERSION,
  );

  if (actualVersion !== expectedVersion) {
    throw new Error(
      [
        "Unsupported Personal Finance database schema.",
        `Expected version ${expectedVersion}.`,
        `Received ${actualVersion ?? "none"}.`,
      ].join(" "),
    );
  }
}

export function getPersonalFinanceDatabasePath(): string {
  const configuredPath =
    process.env.PERSONAL_FINANCE_DB_PATH?.trim();

  if (configuredPath) {
    return path.resolve(configuredPath);
  }

  return path.join(
    findRepositoryRoot(),
    ".local",
    "personal-finance",
    "personal-finance.sqlite3",
  );
}

export function createPersonalFinanceId(
  prefix: string,
  values: readonly unknown[],
): string {
  const normalizedPrefix = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalizedPrefix) {
    throw new Error(
      "A valid Personal Finance ID prefix is required.",
    );
  }

  const digest = createHash("sha256")
    .update(
      values
        .map((value) => String(value))
        .join("\u001f"),
    )
    .digest("hex")
    .slice(0, 24);

  return `${normalizedPrefix}_${digest}`;
}

export function applyPersonalFinanceSchema(
  database: Database.Database,
): void {
  const hasExistingSchema =
    hasPersonalFinanceSchema(database);

  const existingVersion =
    readSchemaVersion(database);

  const expectedVersion = String(
    PERSONAL_FINANCE_SCHEMA_VERSION,
  );

  if (
    hasExistingSchema &&
    existingVersion !== expectedVersion
  ) {
    throw new Error(
      [
        "Personal Finance database migration required.",
        `Expected version ${expectedVersion}.`,
        `Received ${existingVersion ?? "none"}.`,
        "Run pnpm personal:migrate:database.",
      ].join(" "),
    );
  }

  const applySchema = database.transaction(() => {
    database.exec(PERSONAL_FINANCE_SCHEMA_SQL);
    database.pragma(
      `user_version = ${PERSONAL_FINANCE_SCHEMA_VERSION}`,
    );
  });

  applySchema.immediate();
  verifySchemaVersion(database);
}

export function openPersonalFinanceDatabase(
  options: OpenPersonalFinanceDatabaseOptions = {},
): Database.Database {
  const databasePath = path.resolve(
    options.databasePath ??
      getPersonalFinanceDatabasePath(),
  );

  const readonly = options.readonly ?? false;

  if (!readonly) {
    const directory = path.dirname(databasePath);
    const directoryAlreadyExisted =
      existsSync(directory);

    mkdirSync(directory, {
      recursive: true,
      mode: 0o700,
    });

    if (!directoryAlreadyExisted) {
      chmodSync(directory, 0o700);
    }
  }

  const database = new Database(databasePath, {
    readonly,
    fileMustExist: readonly,
  });

  try {
    database.pragma("foreign_keys = ON");
    database.pragma("busy_timeout = 5000");

    if (readonly) {
      database.pragma("query_only = ON");
      verifySchemaVersion(database);
    } else {
      database.pragma("journal_mode = WAL");
      database.pragma("synchronous = NORMAL");

      applyPersonalFinanceSchema(database);
      chmodSync(databasePath, 0o600);
    }

    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

export function getPersonalFinanceDatabaseSummary(
  database: Database.Database,
): PersonalFinanceDatabaseSummary {
  const row = database
    .prepare(`
      SELECT
        (
          SELECT COUNT(*)
          FROM accounts
        ) AS accounts,

        (
          SELECT COUNT(*)
          FROM import_batches
        ) AS import_batches,

        (
          SELECT COUNT(*)
          FROM transactions
        ) AS transactions,

        (
          SELECT COUNT(*)
          FROM transaction_links
        ) AS transaction_links,

        (
          SELECT COUNT(*)
          FROM budget_allocations
        ) AS budget_allocations
    `)
    .get() as {
      accounts: number;
      import_batches: number;
      transactions: number;
      transaction_links: number;
      budget_allocations: number;
    };

  return {
    accounts: row.accounts,
    importBatches: row.import_batches,
    transactions: row.transactions,
    transactionLinks: row.transaction_links,
    budgetAllocations: row.budget_allocations,
  };
}
