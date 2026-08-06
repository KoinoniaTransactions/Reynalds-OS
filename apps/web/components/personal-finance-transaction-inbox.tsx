"use client";

import {
  useMemo,
  useState
} from "react";

import type {
  PersonalFinanceInboxTransaction
} from "../lib/personal-finance-transaction-inbox-local";

import {
  filterPersonalFinanceTransactions,
  getPersonalFinanceClassificationFilterLabel,
  getPersonalFinanceReviewedFilterLabel,
  PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS,
  PERSONAL_FINANCE_REVIEWED_FILTER_OPTIONS,
  type PersonalFinanceClassificationFilter,
  type PersonalFinanceReviewedFilter
} from "../lib/personal-finance-transaction-filter";

import {
  PersonalFinanceTransactionClassificationSelect
} from "./personal-finance-transaction-classification-select";

import {
  PersonalFinanceTransactionReviewedControl
} from "./personal-finance-transaction-reviewed-control";

import {
  PersonalFinanceTransactionReconciliationControl
} from "./personal-finance-transaction-reconciliation-control";

import styles from "./personal-finance-mvp.module.css";

type Props = {
  transactions: PersonalFinanceInboxTransaction[];
  transactionTotal: number;
  reviewedTransactionCount: number;
  notReviewedTransactionCount: number;
  transactionReason?: string | null;
};

type PersonalFinanceReconciliationFilter =
  | "all"
  | "unreviewed"
  | "reconciled";

type PersonalFinanceMatchingFilter =
  | "all"
  | "needs-classification"
  | "needs-target"
  | "unpaired-transfer"
  | "reconciled";

const RECONCILIATION_FILTER_OPTIONS = [
  ["all", "All"],
  ["unreviewed", "Unreconciled"],
  ["reconciled", "Reconciled"]
] as const satisfies readonly [
  PersonalFinanceReconciliationFilter,
  string
][];

const MATCHING_FILTER_OPTIONS = [
  ["all", "All"],
  ["needs-classification", "Needs classification"],
  ["needs-target", "Needs target"],
  ["unpaired-transfer", "Unpaired transfer"],
  ["reconciled", "Reconciled"]
] as const satisfies readonly [
  PersonalFinanceMatchingFilter,
  string
][];

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

function reconciliationFilterLabel(
  value: PersonalFinanceReconciliationFilter
): string {
  return (
    RECONCILIATION_FILTER_OPTIONS.find(
      ([optionValue]) =>
        optionValue === value
    )?.[1] ?? "All"
  );
}

function matchingFilterLabel(
  value: PersonalFinanceMatchingFilter
): string {
  return (
    MATCHING_FILTER_OPTIONS.find(
      ([optionValue]) =>
        optionValue === value
    )?.[1] ?? "All"
  );
}

function needsBudgetTarget(
  transaction: PersonalFinanceInboxTransaction
): boolean {
  return (
    transaction.reviewStatus === "unreviewed" &&
    (
      transaction.classification === "expense" ||
      transaction.classification === "income" ||
      transaction.classification === "refund"
    )
  );
}

function isUnpairedTransfer(
  transaction: PersonalFinanceInboxTransaction
): boolean {
  return (
    transaction.classification === "transfer" &&
    transaction.confirmedTransferLink === null
  );
}

function matchesMatchingFilter(
  transaction: PersonalFinanceInboxTransaction,
  filter: PersonalFinanceMatchingFilter
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "needs-classification") {
    return transaction.classification === "unknown";
  }

  if (filter === "needs-target") {
    return needsBudgetTarget(transaction);
  }

  if (filter === "unpaired-transfer") {
    return isUnpairedTransfer(transaction);
  }

  return transaction.reviewStatus === "reconciled";
}

function AllocationDetails({
  transaction
}: {
  transaction: PersonalFinanceInboxTransaction;
}) {
  if (
    transaction.allocationDetails.length === 0
  ) {
    return null;
  }

  return (
    <div className={styles.reconciliationDetails}>
      <span className={styles.reconciliationDetailsTitle}>
        {transaction.allocationDetails.length === 1
          ? "Allocation"
          : `${transaction.allocationDetails.length} allocations`}
      </span>

      <ul className={styles.allocationSummaryList}>
        {transaction.allocationDetails.map(
          (allocation, index) => (
            <li
              className={styles.allocationSummaryItem}
              key={`${transaction.id}-allocation-${index}`}
            >
              <span>
                {allocation.targetLabel}
              </span>

              <strong>
                {money(
                  Math.abs(
                    allocation.amountCents
                  ) / 100
                )}
              </strong>

              {allocation.note ? (
                <small title={allocation.note}>
                  {allocation.note}
                </small>
              ) : null}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function TransferPairDetails({
  transaction
}: {
  transaction: PersonalFinanceInboxTransaction;
}) {
  const link =
    transaction.confirmedTransferLink;

  if (!link) {
    return null;
  }

  return (
    <div className={styles.transferPairSummary}>
      <span className={styles.reconciliationDetailsTitle}>
        Confirmed pair
      </span>

      <strong title={link.displayDescription}>
        {link.accountName}
      </strong>

      <small>
        {link.postedDate}
        {" · "}
        {money(
          Math.abs(link.amountCents) / 100
        )}
      </small>
    </div>
  );
}

export function PersonalFinanceTransactionInbox({
  transactions,
  transactionTotal,
  reviewedTransactionCount,
  notReviewedTransactionCount,
  transactionReason = null
}: Props) {
  const [
    classificationFilter,
    setClassificationFilter
  ] = useState<PersonalFinanceClassificationFilter>(
    "all"
  );

  const [
    reviewedFilter,
    setReviewedFilter
  ] = useState<PersonalFinanceReviewedFilter>(
    "all"
  );

  const [
    reconciliationFilter,
    setReconciliationFilter
  ] = useState<PersonalFinanceReconciliationFilter>(
    "unreviewed"
  );

  const [
    matchingFilter,
    setMatchingFilter
  ] = useState<PersonalFinanceMatchingFilter>(
    "all"
  );

  const counts = useMemo(
    () => ({
      unreconciled:
        transactions.filter(
          (transaction) =>
            transaction.reviewStatus ===
              "unreviewed"
        ).length,
      reconciled:
        transactions.filter(
          (transaction) =>
            transaction.reviewStatus ===
              "reconciled"
        ).length,
      needsTarget:
        transactions.filter(
          needsBudgetTarget
        ).length,
      unpairedTransfer:
        transactions.filter(
          isUnpairedTransfer
        ).length
    }),
    [transactions]
  );

  const classifiedAndReviewedTransactions =
    useMemo(
      () =>
        filterPersonalFinanceTransactions(
          transactions,
          classificationFilter,
          reviewedFilter
        ),
      [
        transactions,
        classificationFilter,
        reviewedFilter
      ]
    );

  const filteredTransactions = useMemo(
    () =>
      classifiedAndReviewedTransactions.filter(
        (transaction) =>
          (
            reconciliationFilter === "all" ||
            transaction.reviewStatus ===
              reconciliationFilter
          ) &&
          matchesMatchingFilter(
            transaction,
            matchingFilter
          )
      ),
    [
      classifiedAndReviewedTransactions,
      reconciliationFilter,
      matchingFilter
    ]
  );

  const classificationFilterLabel =
    getPersonalFinanceClassificationFilterLabel(
      classificationFilter
    );

  const reviewedFilterLabel =
    getPersonalFinanceReviewedFilterLabel(
      reviewedFilter
    );

  const reconciliationViewLabel =
    reconciliationFilterLabel(
      reconciliationFilter
    );

  const matchingViewLabel =
    matchingFilterLabel(matchingFilter);

  const description =
    transactions.length > 0
      ? `Showing ${filteredTransactions.length} of ${transactionTotal} ${
          transactionTotal === 1
            ? "transaction"
            : "transactions"
        } from the private local database. Classification: ${classificationFilterLabel}. Reviewed: ${reviewedFilterLabel}. Reconciliation: ${reconciliationViewLabel}. Matching: ${matchingViewLabel}. View filters do not change transactions.`
      : "Transactions stored in the private local database will appear here.";

  function showReconciliation(
    value: PersonalFinanceReconciliationFilter
  ) {
    setReconciliationFilter(value);
    setMatchingFilter("all");
  }

  function showMatching(
    value: PersonalFinanceMatchingFilter
  ) {
    setReconciliationFilter("all");
    setMatchingFilter(value);
  }

  return (
    <section
      className={`${styles.panel} ${styles.sectionPanel} ${styles.sectionAnchor}`}
      id="transaction-inbox"
    >
      <header className={styles.panelHeader}>
        <div className={styles.panelHeaderCopy}>
          <h2 className={styles.panelTitle}>
            Transaction inbox
          </h2>

          <p className={styles.panelDescription}>
            {description}
          </p>
        </div>

        <div className={styles.inboxHeaderActions}>
          <div
            aria-label="Transaction review progress"
            className={styles.inboxReviewProgress}
            role="group"
          >
            <button
              aria-label={`Show ${reviewedTransactionCount} reviewed transactions`}
              aria-pressed={
                reviewedFilter === "reviewed"
              }
              className={`${styles.inboxReviewMetric} ${
                reviewedFilter === "reviewed"
                  ? styles.inboxReviewMetricActive
                  : ""
              }`}
              type="button"
              onClick={() => {
                setReviewedFilter("reviewed");
              }}
            >
              <span className={styles.inboxReviewMetricLabel}>
                Reviewed
              </span>

              <strong className={styles.inboxReviewMetricValue}>
                {reviewedTransactionCount}
              </strong>
            </button>

            <button
              aria-label={`Show ${notReviewedTransactionCount} not-reviewed transactions`}
              aria-pressed={
                reviewedFilter === "not-reviewed"
              }
              className={`${styles.inboxReviewMetric} ${
                reviewedFilter === "not-reviewed"
                  ? styles.inboxReviewMetricActive
                  : ""
              }`}
              type="button"
              onClick={() => {
                setReviewedFilter("not-reviewed");
              }}
            >
              <span className={styles.inboxReviewMetricLabel}>
                Not reviewed
              </span>

              <strong className={styles.inboxReviewMetricValue}>
                {notReviewedTransactionCount}
              </strong>
            </button>
          </div>

          <div
            aria-label="Transaction reconciliation progress"
            className={`${styles.inboxReviewProgress} ${styles.inboxMatchingProgress}`}
            role="group"
          >
            {[
              {
                label: "Unreconciled",
                count: counts.unreconciled,
                active:
                  reconciliationFilter ===
                    "unreviewed" &&
                  matchingFilter === "all",
                action: () =>
                  showReconciliation(
                    "unreviewed"
                  )
              },
              {
                label: "Reconciled",
                count: counts.reconciled,
                active:
                  reconciliationFilter ===
                    "reconciled" &&
                  matchingFilter === "all",
                action: () =>
                  showReconciliation(
                    "reconciled"
                  )
              },
              {
                label: "Needs target",
                count: counts.needsTarget,
                active:
                  matchingFilter ===
                    "needs-target",
                action: () =>
                  showMatching("needs-target")
              },
              {
                label: "Unpaired",
                count:
                  counts.unpairedTransfer,
                active:
                  matchingFilter ===
                    "unpaired-transfer",
                action: () =>
                  showMatching(
                    "unpaired-transfer"
                  )
              }
            ].map((metric) => (
              <button
                aria-pressed={metric.active}
                className={`${styles.inboxReviewMetric} ${
                  metric.active
                    ? styles.inboxReviewMetricActive
                    : ""
                }`}
                key={metric.label}
                type="button"
                onClick={metric.action}
              >
                <span className={styles.inboxReviewMetricLabel}>
                  {metric.label}
                </span>

                <strong className={styles.inboxReviewMetricValue}>
                  {metric.count}
                </strong>
              </button>
            ))}
          </div>

          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                Classification
              </span>

            </span>

            <select
              aria-label="Filter the inbox view by transaction classification"
              className={styles.inboxFilterSelect}
              value={classificationFilter}
              onChange={(event) => {
                setClassificationFilter(
                  event.target
                    .value as PersonalFinanceClassificationFilter
                );
              }}
            >
              {PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                Reviewed
              </span>

            </span>

            <select
              aria-label="Filter the inbox view by reviewed state"
              className={styles.inboxFilterSelect}
              value={reviewedFilter}
              onChange={(event) => {
                setReviewedFilter(
                  event.target
                    .value as PersonalFinanceReviewedFilter
                );
              }}
            >
              {PERSONAL_FINANCE_REVIEWED_FILTER_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                Reconciliation
              </span>

            </span>

            <select
              aria-label="Filter the inbox view by reconciliation state"
              className={styles.inboxFilterSelect}
              value={reconciliationFilter}
              onChange={(event) => {
                setReconciliationFilter(
                  event.target
                    .value as PersonalFinanceReconciliationFilter
                );
              }}
            >
              {RECONCILIATION_FILTER_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                Matching
              </span>

            </span>

            <select
              aria-label="Filter the inbox view by matching status"
              className={styles.inboxFilterSelect}
              value={matchingFilter}
              onChange={(event) => {
                setMatchingFilter(
                  event.target
                    .value as PersonalFinanceMatchingFilter
                );
              }}
            >
              {MATCHING_FILTER_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <span className={styles.countBadge}>
            {filteredTransactions.length}
          </span>
        </div>
      </header>

      {filteredTransactions.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Account</th>
                <th>Amount</th>
                <th>
                  <span className={styles.editableColumnHeading}>
                    Classification
                  </span>

                  <span className={styles.editableColumnSubheading}>
                    Auto-saves
                  </span>
                </th>
                <th>
                  <span className={styles.editableColumnHeading}>
                    Reviewed
                  </span>

                  <span className={styles.reviewedColumnSubheading}>
                    Separate state
                  </span>
                </th>
                <th>
                  <span className={styles.editableColumnHeading}>
                    Reconciliation
                  </span>

                  <span className={styles.reviewedColumnSubheading}>
                    Budget link
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map(
                (transaction) => (
                  <tr
                    key={`inbox-${transaction.id}`}
                  >
                    <td>
                      {transaction.postedDate}
                    </td>

                    <td>
                      <span className={styles.tableName}>
                        {transaction.displayDescription}
                      </span>

                      <br />

                      <span className={styles.tableMuted}>
                        {transaction.sourceFile}
                      </span>
                    </td>

                    <td>
                      {transaction.accountName}
                    </td>

                    <td
                      className={
                        transaction.direction ===
                        "inflow"
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {transaction.direction ===
                      "inflow"
                        ? "+"
                        : "-"}
                      {money(
                        Math.abs(
                          transaction.amountCents
                        ) / 100
                      )}
                    </td>

                    <td>
                      <PersonalFinanceTransactionClassificationSelect
                        transactionId={
                          transaction.id
                        }
                        classification={
                          transaction.classification
                        }
                      />
                    </td>

                    <td>
                      <PersonalFinanceTransactionReviewedControl
                        transactionId={
                          transaction.id
                        }
                        reviewedAt={
                          transaction.reviewedAt
                        }
                      />
                    </td>

                    <td>
                      <AllocationDetails
                        transaction={transaction}
                      />

                      <TransferPairDetails
                        transaction={transaction}
                      />

                      <PersonalFinanceTransactionReconciliationControl
                        transactionId={
                          transaction.id
                        }
                        classification={
                          transaction.classification
                        }
                        reviewStatus={
                          transaction.reviewStatus
                        }
                        amountCents={
                          transaction.amountCents
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : transactions.length > 0 ? (
        <div className={styles.inboxFilterEmpty}>
          No loaded transactions match
          {" "}
          <strong>
            Classification: {classificationFilterLabel}
          </strong>
          {", "}
          <strong>
            Reviewed: {reviewedFilterLabel}
          </strong>
          {", "}
          <strong>
            Reconciliation: {reconciliationViewLabel}
          </strong>
          {", and "}
          <strong>
            Matching: {matchingViewLabel}
          </strong>
          .
        </div>
      ) : (
        <div className={styles.emptyList}>
          {transactionReason ??
            "No transactions are currently stored in the private database."}
        </div>
      )}
    </section>
  );
}
