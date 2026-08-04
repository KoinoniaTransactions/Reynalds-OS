#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PDFParse } from "pdf-parse";

const scriptFile = fileURLToPath(import.meta.url);
const webRoot = path.resolve(path.dirname(scriptFile), "..");
const repoRoot = path.resolve(webRoot, "../..");

function parseArguments(values) {
  const result = {
    input: null,
    output: null,
    dryRun: false,
    force: false
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (value === "--") {
      continue;
    }

    if (value === "--dry-run") {
      result.dryRun = true;
      continue;
    }

    if (value === "--force") {
      result.force = true;
      continue;
    }

    if (value === "--output") {
      const output = values[index + 1];

      if (!output) {
        throw new Error("--output requires a file path.");
      }

      result.output = output;
      index += 1;
      continue;
    }

    if (value.startsWith("--")) {
      throw new Error(`Unknown option: ${value}`);
    }

    if (result.input) {
      throw new Error(
        `Unexpected second input file: ${value}`
      );
    }

    result.input = value;
  }

  if (!result.input) {
    throw new Error(
      "Usage: node convert-navy-federal-statement.mjs " +
        "<statement.pdf> [--dry-run] [--output file.csv] [--force]"
    );
  }

  return result;
}

function normalizedLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function fullYear(value) {
  const year = Number(value);

  return year < 100 ? 2000 + year : year;
}

function isoDate(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function parseStatementPeriod(text) {
  const normalized = text.replace(/\s+/g, " ");

  const match = normalized.match(
    /Statement Period\s+(\d{2})\/(\d{2})\/(\d{2,4})\s*-\s*(\d{2})\/(\d{2})\/(\d{2,4})/
  );

  if (!match) {
    throw new Error(
      "The Navy Federal statement period could not be found."
    );
  }

  const start = {
    month: Number(match[1]),
    day: Number(match[2]),
    year: fullYear(match[3])
  };

  const end = {
    month: Number(match[4]),
    day: Number(match[5]),
    year: fullYear(match[6])
  };

  return {
    start,
    end,
    startIso: isoDate(start.year, start.month, start.day),
    endIso: isoDate(end.year, end.month, end.day)
  };
}

function postingDate(month, day, period) {
  let year = period.start.year;

  if (period.start.year !== period.end.year) {
    const postingKey = month * 100 + day;
    const startKey =
      period.start.month * 100 + period.start.day;

    year =
      postingKey >= startKey
        ? period.start.year
        : period.end.year;
  }

  return isoDate(year, month, day);
}

function splitPages(text) {
  const marker = /^Page\s+(\d+)\s+of\s+(\d+)\s*$/gm;
  const matches = [...text.matchAll(marker)];

  if (matches.length === 0) {
    throw new Error(
      "No Navy Federal page markers were found."
    );
  }

  return matches.map((match, index) => {
    const start = match.index;
    const end =
      index + 1 < matches.length
        ? matches[index + 1].index
        : text.length;

    return {
      pageNumber: Number(match[1]),
      pageCount: Number(match[2]),
      text: text.slice(start, end)
    };
  });
}

function cents(value) {
  const normalized = value.replace(/,/g, "");
  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid money value: ${value}`);
  }

  return Math.round(amount * 100);
}

function dollars(valueInCents) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency"
  }).format(valueInCents / 100);
}

function accountDisplayName(label, accountNumber) {
  return [
    "Navy Federal",
    label.trim(),
    accountNumber.slice(-4)
  ].join(" ");
}

function parseTransactionPage(page, period) {
  const lines = normalizedLines(page.text);

  const itemPaidPattern =
    /^\d{2}-\d{2}\s+(?:POS|ATMO)\s+[\d,]+\.\d{2}$/;

  const descriptions = [];

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (
      line.startsWith("For ") ||
      line.startsWith("Date Transaction Detail") ||
      itemPaidPattern.test(line)
    ) {
      break;
    }

    const match = line.match(
      /^(\d{2})-(\d{2})\s+(.+)$/
    );

    if (!match) {
      continue;
    }

    const detail = match[3].trim();

    if (
      detail === "Beginning Balance" ||
      detail === "Ending Balance" ||
      detail === "No Transactions This Period"
    ) {
      continue;
    }

    descriptions.push({
      postedDate: postingDate(
        Number(match[1]),
        Number(match[2]),
        period
      ),
      description: detail
    });
  }

  if (descriptions.length === 0) {
    return null;
  }

  const accountIndex = lines.findIndex((line) =>
    /^.+?\s+-\s+\d{6,}$/.test(line)
  );

  if (accountIndex === -1) {
    throw new Error(
      `Page ${page.pageNumber}: checking account heading was not found.`
    );
  }

  const accountMatch = lines[accountIndex].match(
    /^(.+?)\s+-\s+(\d{6,})$/
  );

  if (!accountMatch) {
    throw new Error(
      `Page ${page.pageNumber}: checking account heading is invalid.`
    );
  }

  const accountLabel = accountMatch[1].trim();
  const accountNumber = accountMatch[2];

  const ownerIndex = lines.findIndex(
    (line, index) =>
      index > accountIndex &&
      line.startsWith("Joint Owner")
  );

  if (ownerIndex === -1) {
    throw new Error(
      `Page ${page.pageNumber}: transaction amount section was not found.`
    );
  }

  const amountRows = [];

  for (
    let index = ownerIndex + 1;
    index < lines.length;
    index += 1
  ) {
    const line = lines[index];

    if (
      line === "Statement Period" ||
      line.startsWith("Joint Owner") ||
      line === "Items Paid"
    ) {
      break;
    }

    const match = line.match(
      /^([\d,]+\.\d{2})\s+([\d,]+\.\d{2})(?:\s+(-))?$/
    );

    if (!match) {
      continue;
    }

    amountRows.push({
      amountCents: cents(match[1]),
      balanceCents: cents(match[2]),
      direction: match[3] === "-" ? "outflow" : "inflow"
    });
  }

  if (descriptions.length !== amountRows.length) {
    throw new Error(
      `Page ${page.pageNumber}: found ` +
        `${descriptions.length} descriptions but ` +
        `${amountRows.length} amount rows.`
    );
  }

  const transactions = descriptions.map(
    (description, index) => {
      const amount = amountRows[index];

      const reference = createHash("sha256")
        .update(
          [
            period.startIso,
            period.endIso,
            accountNumber.slice(-4),
            page.pageNumber,
            index + 1,
            description.postedDate,
            description.description,
            amount.amountCents,
            amount.direction
          ].join("|")
        )
        .digest("hex")
        .slice(0, 24);

      return {
        date: description.postedDate,
        description: description.description,
        amountCents: amount.amountCents,
        direction: amount.direction,
        account: accountDisplayName(
          accountLabel,
          accountNumber
        ),
        reference
      };
    }
  );

  return {
    accountLabel,
    accountNumber,
    transactions
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseAccountSummary(text, accountNumber) {
  const normalized = text.replace(/\s+/g, " ");

  const pattern = new RegExp(
    `${escapeRegExp(accountNumber)}\\s+` +
      "\\$([\\d,]+\\.\\d{2})\\s+" +
      "\\$([\\d,]+\\.\\d{2})\\s+" +
      "\\$([\\d,]+\\.\\d{2})\\s+" +
      "\\$([\\d,]+\\.\\d{2})"
  );

  const match = normalized.match(pattern);

  if (!match) {
    throw new Error(
      "The checking-account summary totals could not be found."
    );
  }

  return {
    beginningCents: cents(match[1]),
    creditCents: cents(match[2]),
    debitCents: cents(match[3]),
    endingCents: cents(match[4])
  };
}

function sumTransactions(transactions, direction) {
  return transactions
    .filter(
      (transaction) =>
        transaction.direction === direction
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amountCents,
      0
    );
}

function assertCents(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(
      `${label} did not reconcile: ` +
        `${dollars(actual)} parsed versus ` +
        `${dollars(expected)} on the statement.`
    );
  }
}

function csvCell(value) {
  const text = String(value);

  if (!/[",\r\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function makeCsv(transactions) {
  const rows = [
    [
      "date",
      "description",
      "amount",
      "direction",
      "account",
      "reference"
    ]
  ];

  for (const transaction of transactions) {
    rows.push([
      transaction.date,
      transaction.description,
      (
        transaction.amountCents / 100
      ).toFixed(2),
      transaction.direction,
      transaction.account,
      transaction.reference
    ]);
  }

  return (
    rows
      .map((row) => row.map(csvCell).join(","))
      .join("\n") + "\n"
  );
}

async function main() {
  const argumentsResult = parseArguments(
    process.argv.slice(2)
  );

  const inputPath = path.resolve(argumentsResult.input);
  const pdfData = await readFile(inputPath);
  const parser = new PDFParse({ data: pdfData });

  let text;

  try {
    const result = await parser.getText();
    text = result.text ?? "";
  } finally {
    await parser.destroy();
  }

  if (!text.trim()) {
    throw new Error(
      "The PDF did not contain extractable text."
    );
  }

  const period = parseStatementPeriod(text);
  const pages = splitPages(text);

  const parsedPages = pages
    .map((page) =>
      parseTransactionPage(page, period)
    )
    .filter(Boolean);

  if (parsedPages.length === 0) {
    throw new Error(
      "No checking-account transaction pages were found."
    );
  }

  const accountNumbers = new Set(
    parsedPages.map((page) => page.accountNumber)
  );

  if (accountNumbers.size !== 1) {
    throw new Error(
      "More than one checking account was detected."
    );
  }

  const accountNumber = parsedPages[0].accountNumber;
  const accountLabel = parsedPages[0].accountLabel;

  const transactions = parsedPages.flatMap(
    (page) => page.transactions
  );

  const summary = parseAccountSummary(
    text,
    accountNumber
  );

  const inflowCents = sumTransactions(
    transactions,
    "inflow"
  );

  const outflowCents = sumTransactions(
    transactions,
    "outflow"
  );

  const calculatedEndingCents =
    summary.beginningCents +
    inflowCents -
    outflowCents;

  assertCents(
    "Deposits and credits",
    inflowCents,
    summary.creditCents
  );

  assertCents(
    "Withdrawals and debits",
    outflowCents,
    summary.debitCents
  );

  assertCents(
    "Ending balance",
    calculatedEndingCents,
    summary.endingCents
  );

  const accountName = accountDisplayName(
    accountLabel,
    accountNumber
  );

  const defaultName = [
    "navy-federal",
    accountLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    accountNumber.slice(-4),
    period.startIso,
    "to",
    period.endIso
  ].join("-") + ".csv";

  const outputPath = path.resolve(
    argumentsResult.output ??
      path.join(
        repoRoot,
        ".local",
        "personal-finance",
        "transactions",
        defaultName
      )
  );

  console.log("PASS: Navy Federal statement parsed");
  console.log(
    `Statement period: ${period.startIso} to ${period.endIso}`
  );
  console.log(`Account: ${accountName}`);
  console.log(`Transactions: ${transactions.length}`);
  console.log(
    `Inflows: ${dollars(inflowCents)}`
  );
  console.log(
    `Outflows: ${dollars(outflowCents)}`
  );
  console.log(
    `Beginning balance: ${dollars(summary.beginningCents)}`
  );
  console.log(
    `Ending balance: ${dollars(summary.endingCents)}`
  );
  console.log(
    "PASS: Statement totals reconcile exactly"
  );

  if (argumentsResult.dryRun) {
    console.log("DRY RUN: No CSV was written.");
    console.log(`Planned output: ${outputPath}`);
    return;
  }

  await mkdir(path.dirname(outputPath), {
    recursive: true,
    mode: 0o700
  });

  const csv = makeCsv(transactions);

  await writeFile(outputPath, csv, {
    encoding: "utf8",
    flag: argumentsResult.force ? "w" : "wx",
    mode: 0o600
  });

  console.log(`CSV written: ${outputPath}`);
}

main().catch((error) => {
  console.error(
    `ERROR: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`
  );

  process.exitCode = 1;
});
