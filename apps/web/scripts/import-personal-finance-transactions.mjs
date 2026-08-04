#!/usr/bin/env node

import { rm, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import Module, { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptFile = fileURLToPath(import.meta.url);
const webRoot = path.resolve(path.dirname(scriptFile), "..");
const repoRoot = path.resolve(webRoot, "../..");

function parseArguments(values) {
  const result = {
    databasePath: path.join(
      repoRoot,
      ".local",
      "personal-finance",
      "personal-finance.sqlite3",
    ),
    transactionDirectory: path.join(
      repoRoot,
      ".local",
      "personal-finance",
      "transactions",
    ),
    sourceFiles: [],
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (value === "--") {
      continue;
    }

    if (value === "--database") {
      const databasePath = values[index + 1];

      if (!databasePath) {
        throw new Error(
          "--database requires a file path.",
        );
      }

      result.databasePath = path.resolve(databasePath);
      index += 1;
      continue;
    }

    if (value === "--transactions-dir") {
      const transactionDirectory =
        values[index + 1];

      if (!transactionDirectory) {
        throw new Error(
          "--transactions-dir requires a directory path.",
        );
      }

      result.transactionDirectory = path.resolve(
        transactionDirectory,
      );

      index += 1;
      continue;
    }

    if (value === "--source") {
      const sourceFile = values[index + 1];

      if (!sourceFile) {
        throw new Error(
          "--source requires a CSV filename.",
        );
      }

      result.sourceFiles.push(sourceFile);
      index += 1;
      continue;
    }

    if (value.startsWith("--")) {
      throw new Error(`Unknown option: ${value}`);
    }

    result.sourceFiles.push(value);
  }

  return result;
}

function compileImportRuntime(runtimeDirectory) {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "tsc",
      "lib/local-csv.ts",
      "lib/personal-finance-transactions-local.ts",
      "lib/personal-finance-db-local.ts",
      "lib/personal-finance-db-import-local.ts",
      "--target",
      "ES2022",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--esModuleInterop",
      "--skipLibCheck",
      "--types",
      "node",
      "--outDir",
      runtimeDirectory,
      "--noEmit",
      "false",
    ],
    {
      cwd: webRoot,
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  if (result.status !== 0) {
    const output = [
      result.stdout,
      result.stderr,
    ]
      .filter(Boolean)
      .join("\n")
      .trim();

    throw new Error(
      output
        ? `Import runtime compilation failed.\n${output}`
        : "Import runtime compilation failed.",
    );
  }
}

function integer(value) {
  return Number(value ?? 0);
}

async function main() {
  const options = parseArguments(
    process.argv.slice(2),
  );

  const runtimeDirectory = path.join(
    repoRoot,
    ".local",
    "personal-finance",
    ".runtime",
    "transaction-import",
  );

  await rm(runtimeDirectory, {
    recursive: true,
    force: true,
  });

  await mkdir(runtimeDirectory, {
    recursive: true,
    mode: 0o700,
  });

  compileImportRuntime(runtimeDirectory);

  const nodeModules = path.join(
    webRoot,
    "node_modules",
  );

  process.env.NODE_PATH = [
    nodeModules,
    process.env.NODE_PATH,
  ]
    .filter(Boolean)
    .join(path.delimiter);

  Module._initPaths();

  const originalLoad = Module._load;

  Module._load = function (
    request,
    parent,
    isMain,
  ) {
    if (request === "server-only") {
      return {};
    }

    return originalLoad.call(
      this,
      request,
      parent,
      isMain,
    );
  };

  const require = createRequire(import.meta.url);

  try {
    const {
      importLocalTransactionsIntoDatabase,
    } = require(
      path.join(
        runtimeDirectory,
        "personal-finance-db-import-local.js",
      ),
    );

    const {
      openPersonalFinanceDatabase,
    } = require(
      path.join(
        runtimeDirectory,
        "personal-finance-db-local.js",
      ),
    );

    process.env.ENABLE_LOCAL_PERSONAL_FINANCE =
      "true";

    const result =
      await importLocalTransactionsIntoDatabase({
        databasePath: options.databasePath,
        transactionDirectory:
          options.transactionDirectory,
        sourceFiles:
          options.sourceFiles.length > 0
            ? options.sourceFiles
            : undefined,
      });

    const database = openPersonalFinanceDatabase({
      databasePath: options.databasePath,
      readonly: true,
    });

    try {
      const state = database
        .prepare(`
          SELECT
            COUNT(*) AS transaction_count,

            SUM(
              CASE
                WHEN review_status = 'unreviewed'
                  THEN 1
                ELSE 0
              END
            ) AS unreviewed_count,

            SUM(
              CASE
                WHEN classification = 'unknown'
                  THEN 1
                ELSE 0
              END
            ) AS unknown_count,

            SUM(
              CASE
                WHEN amount_cents > 0
                  THEN amount_cents
                ELSE 0
              END
            ) AS inflow_cents,

            SUM(
              CASE
                WHEN amount_cents < 0
                  THEN -amount_cents
                ELSE 0
              END
            ) AS outflow_cents
          FROM transactions
        `)
        .get();

      const allocationState = database
        .prepare(`
          SELECT
            (SELECT COUNT(*) FROM transaction_links)
              AS transaction_links,

            (SELECT COUNT(*) FROM budget_allocations)
              AS budget_allocations
        `)
        .get();

      console.log(
        "PASS: Local transaction database import completed",
      );

      console.log(
        `Files processed: ${result.files.length}`,
      );

      console.log(
        `Inserted batches: ${result.insertedBatches}`,
      );

      console.log(
        `Inserted transactions: ${result.insertedTransactions}`,
      );

      console.log(
        `Skipped transactions: ${result.skippedTransactions}`,
      );

      console.log(
        `Accounts: ${result.databaseSummary.accounts}`,
      );

      console.log(
        `Import batches: ${result.databaseSummary.importBatches}`,
      );

      console.log(
        `Stored transactions: ${integer(state.transaction_count)}`,
      );

      console.log(
        `Unreviewed transactions: ${integer(state.unreviewed_count)}`,
      );

      console.log(
        `Unclassified transactions: ${integer(state.unknown_count)}`,
      );

      console.log(
        `Inflows: $${(
          integer(state.inflow_cents) / 100
        ).toFixed(2)}`,
      );

      console.log(
        `Outflows: $${(
          integer(state.outflow_cents) / 100
        ).toFixed(2)}`,
      );

      console.log(
        `Transaction links: ${integer(allocationState.transaction_links)}`,
      );

      console.log(
        `Budget allocations: ${integer(allocationState.budget_allocations)}`,
      );

      console.log(
        `Database: ${options.databasePath}`,
      );

      for (const file of result.files) {
        const status = file.alreadyImported
          ? "already imported"
          : "imported";

        console.log(
          `Source: ${file.sourceFile} (${status})`,
        );
      }
    } finally {
      database.close();
    }
  } finally {
    Module._load = originalLoad;
  }
}

main().catch((error) => {
  console.error(
    `ERROR: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`,
  );

  process.exitCode = 1;
});
