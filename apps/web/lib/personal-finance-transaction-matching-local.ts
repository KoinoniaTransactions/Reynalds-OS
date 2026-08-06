import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import {
  createPersonalFinanceId,
  getPersonalFinanceDatabasePath,
  openPersonalFinanceDatabase,
  type PersonalFinanceClassification,
  type PersonalFinanceReviewStatus,
  type PersonalFinanceTransactionLinkStatus
} from "./personal-finance-db-local";
import {
  loadLocalPersonalFinance,
  type PersonalFinanceMonth
} from "./personal-finance-local";

export type PersonalFinanceMatchConfidence =
  | "high"
  | "medium"
  | "low";

export type PersonalFinanceMatchEvidence =
  | "amount"
  | "description"
  | "date";

export type PersonalFinanceTargetSuggestion = {
  targetKey: string;
  targetLabel: string;
  targetType: "bill" | "income" | "category";
  confidence: number;
  confidenceLabel: PersonalFinanceMatchConfidence;
  recommendedAmountCents: number;
  evidence: PersonalFinanceMatchEvidence[];
  reasons: string[];
};

export type PersonalFinanceTransferCandidate = {
  transactionId: string;
  accountId: string;
  accountName: string;
  postedDate: string;
  displayDescription: string;
  amountCents: number;
  dayGap: number;
  confidence: number;
  confidenceLabel: PersonalFinanceMatchConfidence;
  reasons: string[];
  status: PersonalFinanceTransactionLinkStatus;
};

export type PersonalFinanceTransactionMatchingState = {
  transactionId: string;
  classification: PersonalFinanceClassification;
  reviewStatus: PersonalFinanceReviewStatus;
  suggestions: PersonalFinanceTargetSuggestion[];
  confidenceGap: number | null;
  isAmbiguous: boolean;
  transferCandidates: PersonalFinanceTransferCandidate[];
  confirmedTransfer: PersonalFinanceTransferCandidate | null;
};

export type UpdatePersonalFinanceTransferLinkOptions = {
  transactionId: string;
  counterpartTransactionId: string;
  status: Extract<
    PersonalFinanceTransactionLinkStatus,
    "confirmed" | "rejected"
  >;
  databasePath?: string;
};

export type PersonalFinanceTransferLinkUpdate =
  PersonalFinanceTransactionMatchingState & {
    changed: boolean;
    previousStatus:
      | PersonalFinanceTransactionLinkStatus
      | null;
  };

type TransactionRow = {
  id: string;
  account_id: string;
  account_name: string;
  posted_date: string;
  display_description: string;
  amount_cents: number;
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  reviewed_at: string | null;
};

type LinkRow = {
  id: string;
  status: PersonalFinanceTransactionLinkStatus;
  confidence: number | null;
};

type InvariantRow = {
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  reviewed_at: string | null;
  allocation_count: number;
};

type TargetCandidate = {
  key: string;
  label: string;
  type: "bill" | "income" | "category";
  amountCandidatesCents: number[];
  date: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TARGET_SUGGESTIONS = 5;
const MAX_TRANSFER_CANDIDATES = 12;

export const PERSONAL_FINANCE_TARGET_AMBIGUITY_GAP = 0.1;

const STOP_WORDS = new Set([
  "ach",
  "and",
  "card",
  "check",
  "debit",
  "deposit",
  "online",
  "payment",
  "pos",
  "purchase",
  "transaction",
  "transfer",
  "visa",
  "withdrawal",
  "with"
]);

function assertLocalPersonalFinanceEnabled(): void {
  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled."
    );
  }
}

function normalizedTransactionId(value: string): string {
  const transactionId = value.trim();

  if (!transactionId) {
    throw new Error(
      "A Personal Finance transaction ID is required."
    );
  }

  return transactionId;
}

function roundConfidence(value: number): number {
  return Math.round(
    Math.min(0.99, Math.max(0, value)) * 100
  ) / 100;
}

function confidenceLabel(
  confidence: number
): PersonalFinanceMatchConfidence {
  if (confidence >= 0.75) {
    return "high";
  }

  if (confidence >= 0.5) {
    return "medium";
  }

  return "low";
}

function normalizedText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return Array.from(
    new Set(
      normalizedText(value)
        .split(" ")
        .filter(
          (token) =>
            token.length >= 3 &&
            !STOP_WORDS.has(token) &&
            !/^\d+$/.test(token)
        )
    )
  );
}

function monthParts(
  monthLabel: string
): { month: number; year: number } | null {
  const match = monthLabel
    .trim()
    .match(/^([A-Za-z]+)\s+(\d{4})$/);

  if (!match) {
    return null;
  }

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ];

  const month = monthNames.indexOf(
    match[1].toLowerCase()
  );

  if (month < 0) {
    return null;
  }

  return {
    month: month + 1,
    year: Number(match[2])
  };
}

function parseDate(
  value: string | null,
  budgetMonth: string
): Date | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || /not entered/i.test(trimmed)) {
    return null;
  }

  const iso = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (iso) {
    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    );
  }

  const us = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/
  );

  if (us) {
    const fallback = monthParts(budgetMonth);
    let year = us[3]
      ? Number(us[3])
      : fallback?.year ?? new Date().getFullYear();

    if (year < 100) {
      year += 2000;
    }

    return new Date(
      year,
      Number(us[1]) - 1,
      Number(us[2])
    );
  }

  const dayOnly = trimmed.match(/^(\d{1,2})$/);
  const fallback = monthParts(budgetMonth);

  if (dayOnly && fallback) {
    return new Date(
      fallback.year,
      fallback.month - 1,
      Number(dayOnly[1])
    );
  }

  return null;
}

function dayGap(
  left: string,
  right: string,
  budgetMonth = ""
): number | null {
  const leftDate = parseDate(left, budgetMonth);
  const rightDate = parseDate(right, budgetMonth);

  if (!leftDate || !rightDate) {
    return null;
  }

  return Math.round(
    Math.abs(
      leftDate.getTime() - rightDate.getTime()
    ) / DAY_MS
  );
}

function amountScore(
  transactionAmountCents: number,
  candidates: readonly number[]
): { score: number; reason: string | null } {
  const absoluteTransactionAmount =
    Math.abs(transactionAmountCents);

  const usable = candidates
    .map((value) => Math.abs(value))
    .filter((value) => value > 0);

  if (usable.length === 0) {
    return {
      score: 0,
      reason: null
    };
  }

  const difference = Math.min(
    ...usable.map(
      (candidate) =>
        Math.abs(
          absoluteTransactionAmount - candidate
        )
    )
  );

  if (difference <= 1) {
    return {
      score: 0.55,
      reason: "Amount is an exact match."
    };
  }

  if (difference <= 100) {
    return {
      score: 0.48,
      reason: "Amount is within $1.00."
    };
  }

  const ratio =
    difference /
    Math.max(absoluteTransactionAmount, 1);

  if (ratio <= 0.05) {
    return {
      score: 0.38,
      reason: "Amount is within 5%."
    };
  }

  if (ratio <= 0.15) {
    return {
      score: 0.22,
      reason: "Amount is within 15%."
    };
  }

  return {
    score: 0,
    reason: null
  };
}

function descriptionScore(
  description: string,
  targetLabel: string
): { score: number; reason: string | null } {
  const normalizedDescription =
    normalizedText(description);

  const normalizedTarget =
    normalizedText(targetLabel);

  if (
    normalizedTarget.length >= 4 &&
    normalizedDescription.includes(
      normalizedTarget
    )
  ) {
    return {
      score: 0.35,
      reason: "Description contains the target name."
    };
  }

  const targetTokens = tokens(targetLabel);

  if (targetTokens.length === 0) {
    return {
      score: 0,
      reason: null
    };
  }

  const transactionTokens = new Set(
    tokens(description)
  );

  const matched = targetTokens.filter((token) =>
    transactionTokens.has(token)
  ).length;

  if (matched === 0) {
    return {
      score: 0,
      reason: null
    };
  }

  const ratio = matched / targetTokens.length;

  return {
    score: 0.3 * ratio,
    reason:
      matched === targetTokens.length
        ? "Description matches the target words."
        : "Description shares target words."
  };
}

function dateScore(
  transactionDate: string,
  targetDate: string | null,
  budgetMonth: string
): { score: number; reason: string | null } {
  if (!targetDate) {
    return {
      score: 0,
      reason: null
    };
  }

  const gap = dayGap(
    transactionDate,
    targetDate,
    budgetMonth
  );

  if (gap === null) {
    return {
      score: 0,
      reason: null
    };
  }

  if (gap === 0) {
    return {
      score: 0.15,
      reason: "Date is an exact match."
    };
  }

  if (gap <= 3) {
    return {
      score: 0.12,
      reason: "Date is within 3 days."
    };
  }

  if (gap <= 7) {
    return {
      score: 0.08,
      reason: "Date is within 7 days."
    };
  }

  if (gap <= 14) {
    return {
      score: 0.04,
      reason: "Date is within 14 days."
    };
  }

  return {
    score: 0,
    reason: null
  };
}

function budgetTargets(
  budget: PersonalFinanceMonth,
  classification: PersonalFinanceClassification
): TargetCandidate[] {
  if (classification === "income") {
    return budget.income.map((entry) => {
      const remaining =
        entry.expected - entry.received;

      return {
        key: `income:${entry.id}`,
        label: `Income ${entry.date}`,
        type: "income" as const,
        amountCandidatesCents: [
          Math.round(
            (remaining > 0
              ? remaining
              : entry.expected) * 100
          )
        ],
        date: entry.date
      };
    });
  }

  if (
    classification !== "expense" &&
    classification !== "refund"
  ) {
    return [];
  }

  return [
    ...budget.bills.map((bill) => ({
      key: `bill:${bill.id}`,
      label: bill.name,
      type: "bill" as const,
      amountCandidatesCents: [
        Math.round(bill.remaining * 100),
        Math.round(bill.budgeted * 100)
      ],
      date: bill.due
    })),
    ...budget.irregularExpenses.map((expense) => ({
      key: `category:${expense.id}`,
      label: expense.name,
      type: "category" as const,
      amountCandidatesCents:
        expense.amount === null
          ? []
          : [Math.round(expense.amount * 100)],
      date: null
    }))
  ];
}

function targetSuggestions({
  transaction,
  budget
}: {
  transaction: TransactionRow;
  budget: PersonalFinanceMonth | null;
}): PersonalFinanceTargetSuggestion[] {
  if (!budget) {
    return [];
  }

  return budgetTargets(
    budget,
    transaction.classification
  )
    .map((target) => {
      const amount = amountScore(
        transaction.amount_cents,
        target.amountCandidatesCents
      );

      const description = descriptionScore(
        transaction.display_description,
        target.label
      );

      const date = dateScore(
        transaction.posted_date,
        target.date,
        budget.month
      );

      const reasons = [
        amount.reason,
        description.reason,
        date.reason
      ].filter(
        (reason): reason is string =>
          reason !== null
      );

      const evidence = [
        amount.reason === null
          ? null
          : "amount" as const,
        description.reason === null
          ? null
          : "description" as const,
        date.reason === null
          ? null
          : "date" as const
      ].filter(
        (
          item
        ): item is PersonalFinanceMatchEvidence =>
          item !== null
      );

      const confidence = roundConfidence(
        amount.score +
        description.score +
        date.score
      );

      return {
        targetKey: target.key,
        targetLabel: target.label,
        targetType: target.type,
        confidence,
        confidenceLabel:
          confidenceLabel(confidence),
        recommendedAmountCents:
          transaction.amount_cents,
        evidence,
        reasons
      };
    })
    .filter(
      (suggestion) =>
        suggestion.confidence >= 0.22
    )
    .sort(
      (left, right) =>
        right.confidence - left.confidence ||
        left.targetLabel.localeCompare(
          right.targetLabel
        )
    )
    .slice(0, MAX_TARGET_SUGGESTIONS);
}

export function personalFinanceTargetSuggestionMetadata(
  suggestions: ReadonlyArray<
    Pick<PersonalFinanceTargetSuggestion, "confidence">
  >
): {
  confidenceGap: number | null;
  isAmbiguous: boolean;
} {
  if (suggestions.length < 2) {
    return {
      confidenceGap: null,
      isAmbiguous: false
    };
  }

  const rankedConfidences = suggestions
    .map((suggestion) => suggestion.confidence)
    .sort((left, right) => right - left);

  const firstConfidence =
    rankedConfidences[0];
  const secondConfidence =
    rankedConfidences[1];

  if (
    firstConfidence === undefined ||
    secondConfidence === undefined
  ) {
    return {
      confidenceGap: null,
      isAmbiguous: false
    };
  }

  const confidenceGap = roundConfidence(
    Math.max(
      0,
      firstConfidence - secondConfidence
    )
  );

  return {
    confidenceGap,
    isAmbiguous:
      confidenceGap <
      PERSONAL_FINANCE_TARGET_AMBIGUITY_GAP
  };
}

function readTransaction(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string
): TransactionRow | undefined {
  return database.prepare(`
    SELECT
      t.id,
      t.account_id,
      account.name AS account_name,
      t.posted_date,
      COALESCE(
        NULLIF(t.display_description, ''),
        t.original_description
      ) AS display_description,
      t.amount_cents,
      t.classification,
      t.review_status,
      t.reviewed_at
    FROM transactions t
    INNER JOIN accounts account
      ON account.id = t.account_id
    WHERE t.id = ?
  `).get(transactionId) as
    | TransactionRow
    | undefined;
}

function sortedPair(
  left: string,
  right: string
): [string, string] {
  return left < right
    ? [left, right]
    : [right, left];
}

function readTransferLink(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  leftId: string,
  rightId: string
): LinkRow | undefined {
  const [transactionAId, transactionBId] =
    sortedPair(leftId, rightId);

  return database.prepare(`
    SELECT
      id,
      status,
      confidence
    FROM transaction_links
    WHERE
      transaction_a_id = ? AND
      transaction_b_id = ? AND
      link_type = 'transfer'
  `).get(
    transactionAId,
    transactionBId
  ) as LinkRow | undefined;
}

function transferSignal(
  value: string
): boolean {
  return /(?:transfer|zelle|venmo|cash app|paypal|ach|payment)/i.test(
    value
  );
}

function transferCandidateFromRow({
  database,
  source,
  counterpart
}: {
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >;
  source: TransactionRow;
  counterpart: TransactionRow;
}): PersonalFinanceTransferCandidate {
  const gap =
    dayGap(
      source.posted_date,
      counterpart.posted_date
    ) ?? 7;

  let confidence = 0.65;
  const reasons = [
    "Amount is exactly opposite across two accounts."
  ];

  if (gap === 0) {
    confidence += 0.2;
    reasons.push("Transactions posted on the same day.");
  } else if (gap <= 2) {
    confidence += 0.15;
    reasons.push("Transactions posted within 2 days.");
  } else {
    confidence += 0.05;
    reasons.push("Transactions posted within 7 days.");
  }

  if (
    transferSignal(source.display_description) ||
    transferSignal(counterpart.display_description)
  ) {
    confidence += 0.1;
    reasons.push(
      "Description contains a transfer signal."
    );
  }

  const normalizedConfidence =
    roundConfidence(confidence);

  const link = readTransferLink(
    database,
    source.id,
    counterpart.id
  );

  return {
    transactionId: counterpart.id,
    accountId: counterpart.account_id,
    accountName: counterpart.account_name,
    postedDate: counterpart.posted_date,
    displayDescription:
      counterpart.display_description,
    amountCents: counterpart.amount_cents,
    dayGap: gap,
    confidence:
      link?.confidence ??
      normalizedConfidence,
    confidenceLabel: confidenceLabel(
      link?.confidence ??
      normalizedConfidence
    ),
    reasons,
    status: link?.status ?? "suggested"
  };
}

function transferCandidates(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  source: TransactionRow
): PersonalFinanceTransferCandidate[] {
  if (source.classification !== "transfer") {
    return [];
  }

  const rows = database.prepare(`
    SELECT
      t.id,
      t.account_id,
      account.name AS account_name,
      t.posted_date,
      COALESCE(
        NULLIF(t.display_description, ''),
        t.original_description
      ) AS display_description,
      t.amount_cents,
      t.classification,
      t.review_status,
      t.reviewed_at
    FROM transactions t
    INNER JOIN accounts account
      ON account.id = t.account_id
    WHERE
      t.id <> @transactionId AND
      t.account_id <> @accountId AND
      t.amount_cents = @oppositeAmount AND
      ABS(
        julianday(t.posted_date) -
        julianday(@postedDate)
      ) <= 7 AND
      t.classification NOT IN (
        'duplicate',
        'ignored'
      )
    ORDER BY
      ABS(
        julianday(t.posted_date) -
        julianday(@postedDate)
      ) ASC,
      t.posted_date ASC,
      t.id ASC
    LIMIT @limit
  `).all({
    transactionId: source.id,
    accountId: source.account_id,
    oppositeAmount: -source.amount_cents,
    postedDate: source.posted_date,
    limit: MAX_TRANSFER_CANDIDATES
  }) as TransactionRow[];

  return rows.map((counterpart) =>
    transferCandidateFromRow({
      database,
      source,
      counterpart
    })
  );
}

async function budgetForMatching(
  providedBudget:
    | PersonalFinanceMonth
    | undefined,
  classification: PersonalFinanceClassification
): Promise<PersonalFinanceMonth | null> {
  if (
    classification !== "expense" &&
    classification !== "income" &&
    classification !== "refund"
  ) {
    return null;
  }

  if (providedBudget) {
    return providedBudget;
  }

  const result = await loadLocalPersonalFinance();

  return result.budget;
}

export async function readPersonalFinanceTransactionMatching({
  transactionId: rawTransactionId,
  databasePath: configuredDatabasePath,
  budget: providedBudget
}: {
  transactionId: string;
  databasePath?: string;
  budget?: PersonalFinanceMonth;
}): Promise<PersonalFinanceTransactionMatchingState> {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    rawTransactionId
  );

  const databasePath = path.resolve(
    configuredDatabasePath ??
      getPersonalFinanceDatabasePath()
  );

  if (!existsSync(databasePath)) {
    throw new Error(
      "The private Personal Finance database was not found."
    );
  }

  const database = openPersonalFinanceDatabase({
    databasePath,
    readonly: true
  });

  try {
    const transaction = readTransaction(
      database,
      transactionId
    );

    if (!transaction) {
      throw new Error(
        "The Personal Finance transaction was not found."
      );
    }

    const budget = await budgetForMatching(
      providedBudget,
      transaction.classification
    );

    const candidates = transferCandidates(
      database,
      transaction
    );

    const suggestions = targetSuggestions({
      transaction,
      budget
    });

    const suggestionMetadata =
      personalFinanceTargetSuggestionMetadata(
        suggestions
      );

    return {
      transactionId: transaction.id,
      classification:
        transaction.classification,
      reviewStatus: transaction.review_status,
      suggestions,
      confidenceGap:
        suggestionMetadata.confidenceGap,
      isAmbiguous:
        suggestionMetadata.isAmbiguous,
      transferCandidates: candidates,
      confirmedTransfer:
        candidates.find(
          (candidate) =>
            candidate.status === "confirmed"
        ) ?? null
    };
  } finally {
    database.close();
  }
}

function readInvariant(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string
): InvariantRow {
  const row = database.prepare(`
    SELECT
      t.classification,
      t.review_status,
      t.reviewed_at,
      (
        SELECT COUNT(*)
        FROM budget_allocations allocation
        WHERE allocation.transaction_id = t.id
      ) AS allocation_count
    FROM transactions t
    WHERE t.id = ?
  `).get(transactionId) as
    | InvariantRow
    | undefined;

  if (!row) {
    throw new Error(
      "The Personal Finance transaction was not found."
    );
  }

  return row;
}

function assertInvariantEqual(
  before: InvariantRow,
  after: InvariantRow
): void {
  if (
    before.classification !==
      after.classification ||
    before.review_status !==
      after.review_status ||
    before.reviewed_at !==
      after.reviewed_at ||
    before.allocation_count !==
      after.allocation_count
  ) {
    throw new Error(
      "Transfer pairing must not change classification, reconciliation, reviewed state, or budget allocations."
    );
  }
}

export async function updatePersonalFinanceTransferLink(
  options: UpdatePersonalFinanceTransferLinkOptions
): Promise<PersonalFinanceTransferLinkUpdate> {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    options.transactionId
  );

  const counterpartTransactionId =
    normalizedTransactionId(
      options.counterpartTransactionId
    );

  if (
    transactionId ===
    counterpartTransactionId
  ) {
    throw new Error(
      "A transfer cannot be paired with itself."
    );
  }

  if (
    options.status !== "confirmed" &&
    options.status !== "rejected"
  ) {
    throw new Error(
      "A valid transfer link status is required."
    );
  }

  const databasePath = path.resolve(
    options.databasePath ??
      getPersonalFinanceDatabasePath()
  );

  if (!existsSync(databasePath)) {
    throw new Error(
      "The private Personal Finance database was not found."
    );
  }

  const database = openPersonalFinanceDatabase({
    databasePath
  });

  let previousStatus:
    | PersonalFinanceTransactionLinkStatus
    | null = null;

  try {
    const source = readTransaction(
      database,
      transactionId
    );

    const counterpart = readTransaction(
      database,
      counterpartTransactionId
    );

    if (!source || !counterpart) {
      throw new Error(
        "The Personal Finance transaction was not found."
      );
    }

    if (source.classification !== "transfer") {
      throw new Error(
        "Only a transfer-classified transaction can confirm a transfer pair."
      );
    }

    if (
      source.account_id ===
      counterpart.account_id
    ) {
      throw new Error(
        "Transfer pairs must use different accounts."
      );
    }

    if (
      source.amount_cents !==
      -counterpart.amount_cents
    ) {
      throw new Error(
        "Transfer pair amounts must be exactly opposite."
      );
    }

    const gap = dayGap(
      source.posted_date,
      counterpart.posted_date
    );

    if (gap === null || gap > 7) {
      throw new Error(
        "Transfer pairs must post within 7 days."
      );
    }

    const candidate = transferCandidateFromRow({
      database,
      source,
      counterpart
    });

    const [transactionAId, transactionBId] =
      sortedPair(
        transactionId,
        counterpartTransactionId
      );

    const existing = readTransferLink(
      database,
      transactionId,
      counterpartTransactionId
    );

    previousStatus = existing?.status ?? null;

    if (options.status === "confirmed") {
      const conflicting = database.prepare(`
        SELECT id
        FROM transaction_links
        WHERE
          link_type = 'transfer' AND
          status = 'confirmed' AND
          (
            transaction_a_id IN (?, ?) OR
            transaction_b_id IN (?, ?)
          ) AND
          NOT (
            transaction_a_id = ? AND
            transaction_b_id = ?
          )
        LIMIT 1
      `).get(
        transactionAId,
        transactionBId,
        transactionAId,
        transactionBId,
        transactionAId,
        transactionBId
      ) as { id: string } | undefined;

      if (conflicting) {
        throw new Error(
          "One of these transactions already has a confirmed transfer pair."
        );
      }
    }

    const sourceBefore = readInvariant(
      database,
      transactionId
    );

    const counterpartBefore = readInvariant(
      database,
      counterpartTransactionId
    );

    const linkId = createPersonalFinanceId(
      "transaction_link",
      [
        transactionAId,
        transactionBId,
        "transfer"
      ]
    );

    const applyLink = database.transaction(() => {
      database.prepare(`
        INSERT INTO transaction_links (
          id,
          transaction_a_id,
          transaction_b_id,
          link_type,
          status,
          confidence,
          note,
          confirmed_at
        )
        VALUES (
          ?,
          ?,
          ?,
          'transfer',
          ?,
          ?,
          ?,
          CASE
            WHEN ? = 'confirmed'
              THEN CURRENT_TIMESTAMP
            ELSE NULL
          END
        )
        ON CONFLICT (
          transaction_a_id,
          transaction_b_id,
          link_type
        )
        DO UPDATE SET
          status = excluded.status,
          confidence = excluded.confidence,
          note = excluded.note,
          confirmed_at = excluded.confirmed_at
      `).run(
        linkId,
        transactionAId,
        transactionBId,
        options.status,
        candidate.confidence,
        options.status === "confirmed"
          ? "Confirmed by the user."
          : "Rejected by the user.",
        options.status
      );
    });

    applyLink.immediate();

    assertInvariantEqual(
      sourceBefore,
      readInvariant(
        database,
        transactionId
      )
    );

    assertInvariantEqual(
      counterpartBefore,
      readInvariant(
        database,
        counterpartTransactionId
      )
    );
  } finally {
    database.close();
  }

  const state =
    await readPersonalFinanceTransactionMatching({
      transactionId,
      databasePath
    });

  return {
    ...state,
    changed:
      previousStatus !== options.status,
    previousStatus
  };
}
