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

function reconciliationStatusLabel(
  value: PersonalFinanceInboxTransaction["reviewStatus"]
): string {
  return value === "reconciled"
    ? "Reconciled"
    : "Unreconciled";
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

  const filteredTransactions = useMemo(
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

  const classificationFilterLabel =
    getPersonalFinanceClassificationFilterLabel(
      classificationFilter
    );

  const reviewedFilterLabel =
    getPersonalFinanceReviewedFilterLabel(
      reviewedFilter
    );

  const description =
    transactions.length > 0
      ? `Showing ${filteredTransactions.length} of ${transactionTotal} unreconciled ${
          transactionTotal === 1
            ? "transaction"
            : "transactions"
        } from the private local database. Classification filter: ${classificationFilterLabel}. Reviewed filter: ${reviewedFilterLabel}. View filters do not change transactions; classification and reviewed controls save separate changes.`
      : "Unreconciled transactions stored in the private local database will appear here.";

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
            <span className={styles.inboxReviewMetric}>
              <span className={styles.inboxReviewMetricLabel}>
                Reviewed
              </span>

              <strong className={styles.inboxReviewMetricValue}>
                {reviewedTransactionCount}
              </strong>
            </span>

            <span className={styles.inboxReviewMetric}>
              <span className={styles.inboxReviewMetricLabel}>
                Not reviewed
              </span>

              <strong className={styles.inboxReviewMetricValue}>
                {notReviewedTransactionCount}
              </strong>
            </span>
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
                <th>Reconciliation</th>
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
                      <span
                        className={`${styles.status} ${
                          transaction.reviewStatus ===
                          "reconciled"
                            ? styles.statusPaid
                            : styles.statusPartial
                        }`}
                      >
                        {reconciliationStatusLabel(
                          transaction.reviewStatus
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : transactions.length > 0 ? (
        <div className={styles.inboxFilterEmpty}>
          No loaded unreconciled transactions match
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
            "No unreconciled transactions are currently stored in the private database."}
        </div>
      )}
    </section>
  );
}
