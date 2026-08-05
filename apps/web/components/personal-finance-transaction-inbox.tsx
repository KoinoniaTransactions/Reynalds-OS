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

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

type PersonalFinanceReconciliationFilter =
  | "all"
  | "unreviewed"
  | "reconciled";

const RECONCILIATION_FILTER_OPTIONS = [
  ["all", "All"],
  ["unreviewed", "Unreconciled"],
  ["reconciled", "Reconciled"]
] as const satisfies readonly [
  PersonalFinanceReconciliationFilter,
  string
][];

function reconciliationFilterLabel(
  value: PersonalFinanceReconciliationFilter
): string {
  return (
    RECONCILIATION_FILTER_OPTIONS.find(
      ([optionValue]) => optionValue === value
    )?.[1] ?? "All"
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

  const classifiedAndReviewedTransactions = useMemo(
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
          reconciliationFilter === "all" ||
          transaction.reviewStatus ===
            reconciliationFilter
      ),
    [
      classifiedAndReviewedTransactions,
      reconciliationFilter
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

  const description =
    transactions.length > 0
      ? `Showing ${filteredTransactions.length} of ${transactionTotal} ${
          transactionTotal === 1
            ? "transaction"
            : "transactions"
        } from the private local database. Classification filter: ${classificationFilterLabel}. Reviewed filter: ${reviewedFilterLabel}. Reconciliation filter: ${reconciliationViewLabel}. View filters do not change transactions; classification, reviewed, and reconciliation controls save separate changes.`
      : "Transactions stored in the private local database will appear here.";

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
              title="Show reviewed transactions"
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
              title="Show not-reviewed transactions"
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

          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                Classification
              </span>

              <span className={styles.inboxFilterMode}>
                View only
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

              <span className={styles.inboxFilterMode}>
                View only
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

              <span className={styles.inboxFilterMode}>
                View only
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
                    Save required
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
          {" "}
          and
          {" "}
          <strong>
            Reviewed: {reviewedFilterLabel}
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
