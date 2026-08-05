import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import {
  getPersonalFinanceDatabasePath,
  openPersonalFinanceDatabase,
  type PersonalFinanceAccountType,
  type PersonalFinanceClassification,
  type PersonalFinanceReviewStatus
} from "./personal-finance-db-local";

export type PersonalFinanceInboxReviewFilter =
  | PersonalFinanceReviewStatus
  | "all";

export type PersonalFinanceTransactionInboxOptions = {
  databasePath?: string;
  reviewStatus?: PersonalFinanceInboxReviewFilter;
  accountId?: string;
  limit?: number;
  offset?: number;
};

export type PersonalFinanceInboxAllocationDetail = {
  targetLabel: string;
  amountCents: number;
  note: string | null;
};

export type PersonalFinanceInboxTransferLink = {
  linkId: string;
  transactionId: string;
  accountName: string;
  postedDate: string;
  displayDescription: string;
  amountCents: number;
  confidence: number | null;
};

export type PersonalFinanceInboxTransaction = {
  id: string;
  accountId: string;
  accountName: string;
  institution: string;
  accountType: PersonalFinanceAccountType;
  importBatchId: string;
  sourceFile: string;
  sourceReference: string | null;
  postedDate: string;
  originalDescription: string;
  displayDescription: string;
  amountCents: number;
  direction: "inflow" | "outflow";
  classification: PersonalFinanceClassification;
  reviewStatus: PersonalFinanceReviewStatus;
  reviewedAt: string | null;
  paymentChannel: string | null;
  checkNumber: string | null;
  note: string | null;
  allocationCount: number;
  allocatedAmountCents: number;
  allocationDetails:
    PersonalFinanceInboxAllocationDetail[];
  transactionLinkCount: number;
  confirmedTransferLink:
    | PersonalFinanceInboxTransferLink
    | null;
};

export type PersonalFinanceTransactionInboxSummary = {
  accounts: number;
  importBatches: number;
  transactions: number;
  unreviewedTransactions: number;
  reconciledTransactions: number;
  unclassifiedTransactions: number;
  reviewedTransactions: number;
  notReviewedTransactions: number;
  transactionLinks: number;
  budgetAllocations: number;
};

export type PersonalFinanceTransactionInboxResult = {
  transactions: PersonalFinanceInboxTransaction[];
  totalMatching: number;
  limit: number;
  offset: number;
  reviewStatus: PersonalFinanceInboxReviewFilter;
  accountId: string | null;
  summary: PersonalFinanceTransactionInboxSummary;
  reason: string | null;
};

type InboxTransactionRow = {
  id: string;
  account_id: string;
  account_name: string;
  institution: string;
  account_type: PersonalFinanceAccountType;
  import_batch_id: string;
  source_file_name: string;
  source_reference: string | null;
  posted_date: string;
  original_description: string;
  display_description: string;
  amount_cents: number;
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  reviewed_at: string | null;
  payment_channel: string | null;
  check_number: string | null;
  note: string | null;
  allocation_count: number;
  allocated_amount_cents: number;
  transaction_link_count: number;
};

type AllocationRow = {
  budget_item_label: string;
  amount_cents: number;
  note: string | null;
};

type TransferLinkRow = {
  link_id: string;
  confidence: number | null;
  counterpart_transaction_id: string;
  counterpart_account_name: string;
  counterpart_posted_date: string;
  counterpart_display_description: string;
  counterpart_amount_cents: number;
};

type CountRow = {
  count: number;
};

type SummaryRow = {
  accounts: number;
  import_batches: number;
  transactions: number;
  unreviewed_transactions: number;
  reconciled_transactions: number;
  unclassified_transactions: number;
  reviewed_transactions: number;
  not_reviewed_transactions: number;
  transaction_links: number;
  budget_allocations: number;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function normalizedLimit(
  value: number | undefined
): number {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(
      "Transaction Inbox limit must be a positive integer."
    );
  }

  return Math.min(value, MAX_LIMIT);
}

function normalizedOffset(
  value: number | undefined
): number {
  if (value === undefined) {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      "Transaction Inbox offset must be a non-negative integer."
    );
  }

  return value;
}

function normalizedReviewStatus(
  value:
    | PersonalFinanceInboxReviewFilter
    | undefined
): PersonalFinanceInboxReviewFilter {
  if (value === undefined) {
    return "unreviewed";
  }

  if (
    value !== "unreviewed" &&
    value !== "reconciled" &&
    value !== "all"
  ) {
    throw new Error(
      `Unsupported Transaction Inbox review status: ${value}`
    );
  }

  return value;
}

function emptySummary(): PersonalFinanceTransactionInboxSummary {
  return {
    accounts: 0,
    importBatches: 0,
    transactions: 0,
    unreviewedTransactions: 0,
    reconciledTransactions: 0,
    unclassifiedTransactions: 0,
    reviewedTransactions: 0,
    notReviewedTransactions: 0,
    transactionLinks: 0,
    budgetAllocations: 0
  };
}

function emptyResult({
  limit,
  offset,
  reviewStatus,
  accountId,
  reason
}: {
  limit: number;
  offset: number;
  reviewStatus: PersonalFinanceInboxReviewFilter;
  accountId: string | null;
  reason: string;
}): PersonalFinanceTransactionInboxResult {
  return {
    transactions: [],
    totalMatching: 0,
    limit,
    offset,
    reviewStatus,
    accountId,
    summary: emptySummary(),
    reason
  };
}

function allocationFromRow(
  row: AllocationRow
): PersonalFinanceInboxAllocationDetail {
  return {
    targetLabel: row.budget_item_label,
    amountCents: row.amount_cents,
    note: row.note
  };
}

function transferLinkFromRow(
  row: TransferLinkRow | undefined
): PersonalFinanceInboxTransferLink | null {
  if (!row) {
    return null;
  }

  return {
    linkId: row.link_id,
    transactionId:
      row.counterpart_transaction_id,
    accountName:
      row.counterpart_account_name,
    postedDate:
      row.counterpart_posted_date,
    displayDescription:
      row.counterpart_display_description,
    amountCents:
      row.counterpart_amount_cents,
    confidence: row.confidence
  };
}

function transactionFromRow({
  row,
  allocations,
  transferLink
}: {
  row: InboxTransactionRow;
  allocations: AllocationRow[];
  transferLink: TransferLinkRow | undefined;
}): PersonalFinanceInboxTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    accountName: row.account_name,
    institution: row.institution,
    accountType: row.account_type,
    importBatchId: row.import_batch_id,
    sourceFile: row.source_file_name,
    sourceReference: row.source_reference,
    postedDate: row.posted_date,
    originalDescription:
      row.original_description,
    displayDescription:
      row.display_description,
    amountCents: row.amount_cents,
    direction:
      row.amount_cents > 0
        ? "inflow"
        : "outflow",
    classification: row.classification,
    reviewStatus: row.review_status,
    reviewedAt: row.reviewed_at,
    paymentChannel: row.payment_channel,
    checkNumber: row.check_number,
    note: row.note,
    allocationCount: row.allocation_count,
    allocatedAmountCents:
      row.allocated_amount_cents,
    allocationDetails:
      allocations.map(allocationFromRow),
    transactionLinkCount:
      row.transaction_link_count,
    confirmedTransferLink:
      transferLinkFromRow(transferLink)
  };
}

export async function loadPersonalFinanceTransactionInbox(
  options: PersonalFinanceTransactionInboxOptions = {}
): Promise<PersonalFinanceTransactionInboxResult> {
  const limit = normalizedLimit(options.limit);
  const offset = normalizedOffset(options.offset);

  const reviewStatus = normalizedReviewStatus(
    options.reviewStatus
  );

  const accountId =
    options.accountId?.trim() || null;

  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    return emptyResult({
      limit,
      offset,
      reviewStatus,
      accountId,
      reason:
        "Local personal finance is disabled."
    });
  }

  const databasePath = path.resolve(
    options.databasePath ??
      getPersonalFinanceDatabasePath()
  );

  if (!existsSync(databasePath)) {
    return emptyResult({
      limit,
      offset,
      reviewStatus,
      accountId,
      reason:
        "The private Personal Finance database was not found."
    });
  }

  const conditions: string[] = [];

  const parameters: Array<
    string | number
  > = [];

  if (reviewStatus !== "all") {
    conditions.push("t.review_status = ?");
    parameters.push(reviewStatus);
  }

  if (accountId) {
    conditions.push("t.account_id = ?");
    parameters.push(accountId);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const database = openPersonalFinanceDatabase({
    databasePath,
    readonly: true
  });

  try {
    const summaryRow = database.prepare(`
      SELECT
        (SELECT COUNT(*) FROM accounts)
          AS accounts,

        (SELECT COUNT(*) FROM import_batches)
          AS import_batches,

        (SELECT COUNT(*) FROM transactions)
          AS transactions,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE review_status = 'unreviewed'
        ) AS unreviewed_transactions,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE review_status = 'reconciled'
        ) AS reconciled_transactions,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE classification = 'unknown'
        ) AS unclassified_transactions,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE reviewed_at IS NOT NULL
        ) AS reviewed_transactions,

        (
          SELECT COUNT(*)
          FROM transactions
          WHERE reviewed_at IS NULL
        ) AS not_reviewed_transactions,

        (SELECT COUNT(*) FROM transaction_links)
          AS transaction_links,

        (SELECT COUNT(*) FROM budget_allocations)
          AS budget_allocations
    `).get() as SummaryRow;

    const totalMatchingRow = database.prepare(`
      SELECT COUNT(*) AS count
      FROM transactions t
      ${whereClause}
    `).get(...parameters) as CountRow;

    const rows = database.prepare(`
      SELECT
        t.id,
        t.account_id,
        account.name AS account_name,
        account.institution,
        account.account_type,
        t.import_batch_id,
        batch.source_file_name,
        t.source_reference,
        t.posted_date,
        t.original_description,
        COALESCE(
          NULLIF(t.display_description, ''),
          t.original_description
        ) AS display_description,
        t.amount_cents,
        t.classification,
        t.review_status,
        t.reviewed_at,
        t.payment_channel,
        t.check_number,
        t.note,

        (
          SELECT COUNT(*)
          FROM budget_allocations allocation
          WHERE allocation.transaction_id = t.id
        ) AS allocation_count,

        COALESCE(
          (
            SELECT SUM(allocation.amount_cents)
            FROM budget_allocations allocation
            WHERE allocation.transaction_id = t.id
          ),
          0
        ) AS allocated_amount_cents,

        (
          SELECT COUNT(*)
          FROM transaction_links link
          WHERE
            link.transaction_a_id = t.id OR
            link.transaction_b_id = t.id
        ) AS transaction_link_count

      FROM transactions t

      INNER JOIN accounts account
        ON account.id = t.account_id

      INNER JOIN import_batches batch
        ON batch.id = t.import_batch_id

      ${whereClause}

      ORDER BY
        t.posted_date DESC,
        t.created_at DESC,
        t.id ASC

      LIMIT ?
      OFFSET ?
    `).all(
      ...parameters,
      limit,
      offset
    ) as InboxTransactionRow[];

    const readAllocations = database.prepare(`
      SELECT
        budget_item_label,
        amount_cents,
        note
      FROM budget_allocations
      WHERE transaction_id = ?
      ORDER BY
        budget_item_label ASC,
        id ASC
    `);

    const readConfirmedTransfer =
      database.prepare(`
        SELECT
          link.id AS link_id,
          link.confidence,
          counterpart.id
            AS counterpart_transaction_id,
          counterpart_account.name
            AS counterpart_account_name,
          counterpart.posted_date
            AS counterpart_posted_date,
          COALESCE(
            NULLIF(
              counterpart.display_description,
              ''
            ),
            counterpart.original_description
          ) AS counterpart_display_description,
          counterpart.amount_cents
            AS counterpart_amount_cents
        FROM transaction_links link
        INNER JOIN transactions counterpart
          ON counterpart.id = CASE
            WHEN
              link.transaction_a_id =
                @transactionId
              THEN link.transaction_b_id
            ELSE link.transaction_a_id
          END
        INNER JOIN accounts counterpart_account
          ON counterpart_account.id =
            counterpart.account_id
        WHERE
          link.link_type = 'transfer' AND
          link.status = 'confirmed' AND
          (
            link.transaction_a_id =
              @transactionId OR
            link.transaction_b_id =
              @transactionId
          )
        ORDER BY
          link.confirmed_at DESC,
          link.id ASC
        LIMIT 1
      `);

    return {
      transactions: rows.map((row) =>
        transactionFromRow({
          row,
          allocations:
            readAllocations.all(
              row.id
            ) as AllocationRow[],
          transferLink:
            readConfirmedTransfer.get({
              transactionId: row.id
            }) as
              | TransferLinkRow
              | undefined
        })
      ),
      totalMatching: totalMatchingRow.count,
      limit,
      offset,
      reviewStatus,
      accountId,
      summary: {
        accounts: summaryRow.accounts,
        importBatches:
          summaryRow.import_batches,
        transactions:
          summaryRow.transactions,
        unreviewedTransactions:
          summaryRow.unreviewed_transactions,
        reconciledTransactions:
          summaryRow.reconciled_transactions,
        unclassifiedTransactions:
          summaryRow.unclassified_transactions,
        reviewedTransactions:
          summaryRow.reviewed_transactions,
        notReviewedTransactions:
          summaryRow.not_reviewed_transactions,
        transactionLinks:
          summaryRow.transaction_links,
        budgetAllocations:
          summaryRow.budget_allocations
      },
      reason: null
    };
  } finally {
    database.close();
  }
}
