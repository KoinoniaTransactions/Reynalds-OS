#!/usr/bin/env node

import {
  chmodSync,
  existsSync,
  mkdirSync
} from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const FROM_VERSION = 1;
const TO_VERSION = 2;

function findRepositoryRoot(
  startDirectory = process.cwd()
) {
  let currentDirectory =
    path.resolve(startDirectory);

  for (
    let depth = 0;
    depth < 12;
    depth += 1
  ) {
    if (
      existsSync(
        path.join(currentDirectory, ".git")
      )
    ) {
      return currentDirectory;
    }

    const parentDirectory =
      path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  throw new Error(
    "Could not locate the repository root."
  );
}

function argumentValue(name) {
  const argumentIndex =
    process.argv.indexOf(name);

  if (argumentIndex === -1) {
    return undefined;
  }

  const value =
    process.argv[argumentIndex + 1];

  if (
    !value ||
    value.startsWith("--")
  ) {
    throw new Error(
      `A value is required after ${name}.`
    );
  }

  return value;
}

function databasePath() {
  const configuredPath =
    argumentValue("--database") ??
    process.env.PERSONAL_FINANCE_DB_PATH
      ?.trim();

  if (configuredPath) {
    return path.resolve(configuredPath);
  }

  return path.join(
    findRepositoryRoot(),
    ".local",
    "personal-finance",
    "personal-finance.sqlite3"
  );
}

function backupDirectory(
  resolvedDatabasePath
) {
  const configuredDirectory =
    argumentValue("--backup-directory");

  if (configuredDirectory) {
    return path.resolve(
      configuredDirectory
    );
  }

  return path.join(
    path.dirname(resolvedDatabasePath),
    "backups"
  );
}

function hasTable(database, tableName) {
  return Boolean(
    database
      .prepare(`
        SELECT 1
        FROM sqlite_master
        WHERE
          type = 'table' AND
          name = ?
      `)
      .get(tableName)
  );
}

function readSchemaVersion(database) {
  if (!hasTable(database, "pf_meta")) {
    return undefined;
  }

  return database
    .prepare(`
      SELECT value
      FROM pf_meta
      WHERE key = 'schema_version'
    `)
    .pluck()
    .get();
}

function transactionColumns(database) {
  return database
    .pragma("table_info(transactions)")
    .map((column) => column.name);
}

function databaseState(database) {
  return database
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
        ) AS budget_allocations,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE reviewed_at IS NOT NULL
        ) AS reviewed_transactions
    `)
    .get();
}

function preMigrationState(database) {
  return database
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
    .get();
}

function sameCoreCounts(before, after) {
  return (
    before.accounts === after.accounts &&
    before.import_batches ===
      after.import_batches &&
    before.transactions ===
      after.transactions &&
    before.transaction_links ===
      after.transaction_links &&
    before.budget_allocations ===
      after.budget_allocations
  );
}

function timestampForFileName() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+$/, "")
    .replace("T", "-");
}

async function createBackup(
  database,
  resolvedDatabasePath
) {
  const directory = backupDirectory(
    resolvedDatabasePath
  );

  mkdirSync(directory, {
    recursive: true,
    mode: 0o700
  });

  chmodSync(directory, 0o700);

  const backupPath = path.join(
    directory,
    `personal-finance-v1-backup-${timestampForFileName()}.sqlite3`
  );

  await database.backup(backupPath);
  chmodSync(backupPath, 0o600);

  return backupPath;
}

const resolvedDatabasePath =
  databasePath();

const skipBackup =
  process.argv.includes("--no-backup");

if (!existsSync(resolvedDatabasePath)) {
  throw new Error(
    "The private Personal Finance database was not found."
  );
}

const database = new Database(
  resolvedDatabasePath
);

try {
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");

  const currentVersion =
    readSchemaVersion(database);

  const userVersion =
    database.pragma(
      "user_version",
      {
        simple: true
      }
    );

  const columns =
    transactionColumns(database);

  if (currentVersion === String(TO_VERSION)) {
    if (
      userVersion !== TO_VERSION ||
      !columns.includes("reviewed_at")
    ) {
      throw new Error(
        "Version 2 schema metadata is inconsistent."
      );
    }

    const state =
      databaseState(database);

    console.log(
      "Migration status: already current"
    );
    console.log(
      `Schema version: ${TO_VERSION}`
    );
    console.log(
      `Transactions: ${state.transactions}`
    );
    console.log(
      `Reviewed transactions: ${state.reviewed_transactions}`
    );
    console.log(
      `Transaction links: ${state.transaction_links}`
    );
    console.log(
      `Budget allocations: ${state.budget_allocations}`
    );

    process.exitCode = 0;
  } else {
    if (
      currentVersion !==
        String(FROM_VERSION) ||
      userVersion !== FROM_VERSION
    ) {
      throw new Error(
        [
          "Unsupported Personal Finance database schema.",
          `Expected version ${FROM_VERSION}.`,
          `Received metadata ${currentVersion ?? "none"}`,
          `and user_version ${userVersion}.`
        ].join(" ")
      );
    }

    if (columns.includes("reviewed_at")) {
      throw new Error(
        "Version 1 unexpectedly already contains reviewed_at."
      );
    }

    const before =
      preMigrationState(database);

    let backupPath = null;

    if (!skipBackup) {
      backupPath = await createBackup(
        database,
        resolvedDatabasePath
      );
    }

    const migrate =
      database.transaction(() => {
        database.exec(`
          ALTER TABLE transactions
          ADD COLUMN reviewed_at TEXT
        `);

        const updateResult =
          database
            .prepare(`
              UPDATE pf_meta
              SET value = ?
              WHERE
                key = 'schema_version' AND
                value = ?
            `)
            .run(
              String(TO_VERSION),
              String(FROM_VERSION)
            );

        if (updateResult.changes !== 1) {
          throw new Error(
            "Schema metadata was not updated."
          );
        }

        database.pragma(
          `user_version = ${TO_VERSION}`
        );
      });

    migrate.immediate();

    const migratedVersion =
      readSchemaVersion(database);

    const migratedUserVersion =
      database.pragma(
        "user_version",
        {
          simple: true
        }
      );

    const migratedColumns =
      transactionColumns(database);

    const after =
      databaseState(database);

    if (
      migratedVersion !==
        String(TO_VERSION) ||
      migratedUserVersion !== TO_VERSION ||
      !migratedColumns.includes(
        "reviewed_at"
      ) ||
      !sameCoreCounts(before, after) ||
      after.reviewed_transactions !== 0
    ) {
      throw new Error(
        "Post-migration verification failed."
      );
    }

    chmodSync(
      resolvedDatabasePath,
      0o600
    );

    console.log(
      "Migration status: migrated"
    );

    if (backupPath) {
      console.log(
        `Backup: ${backupPath}`
      );
    } else {
      console.log(
        "Backup: skipped"
      );
    }

    console.log(
      `Schema version: ${TO_VERSION}`
    );
    console.log(
      `Transactions: ${after.transactions}`
    );
    console.log(
      `Reviewed transactions: ${after.reviewed_transactions}`
    );
    console.log(
      `Transaction links: ${after.transaction_links}`
    );
    console.log(
      `Budget allocations: ${after.budget_allocations}`
    );
  }
} finally {
  database.close();
}
