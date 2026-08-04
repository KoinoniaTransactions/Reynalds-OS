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
  PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS,
  type PersonalFinanceClassificationFilter
} from "../lib/personal-finance-transaction-filter";

import {
  PersonalFinanceTransactionClassificationSelect
} from "./personal-finance-transaction-classification-select";

import styles from "./personal-finance-mvp.module.css";

type Props = {
  transactions: PersonalFinanceInboxTransaction[];
  transactionTotal: number;
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

function reviewStatusLabel(
  value: PersonalFinanceInboxTransaction["reviewStatus"]
): string {
  return value === "reconciled"
    ? "Reconciled"
    : "Unreviewed";
}

export function PersonalFinanceTransactionInbox({
  transactions,
  transactionTotal,
  transactionReason = null
}: Props) {
  const [
    classificationFilter,
    setClassificationFilter
  ] = useState<PersonalFinanceClassificationFilter>(
    "all"
  );

  const filteredTransactions = useMemo(
    () =>
      filterPersonalFinanceTransactions(
        transactions,
        classificationFilter
      ),
    [
      transactions,
      classificationFilter
    ]
  );

  const filterLabel =
    getPersonalFinanceClassificationFilterLabel(
      classificationFilter
    );

  const description =
    transactions.length > 0
      ? `Showing ${filteredTransactions.length} of ${transactionTotal} unreviewed ${
          transactionTotal === 1
            ? "transaction"
            : "transactions"
        } from the private local database. View filter: ${filterLabel}. The view filter does not change transactions; row classification menus save changes.`
      : "Unreviewed transactions stored in the private local database will appear here.";

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
          <label className={styles.inboxFilterControl}>
            <span className={styles.inboxFilterLabelRow}>
              <span className={styles.inboxFilterLabel}>
                View filter
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
                <th>Review status</th>
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
                      <span
                        className={`${styles.status} ${
                          transaction.reviewStatus ===
                          "reconciled"
                            ? styles.statusPaid
                            : styles.statusPartial
                        }`}
                      >
                        {reviewStatusLabel(
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
          No loaded unreviewed transactions match the
          {" "}
          <strong>{filterLabel}</strong>
          {" "}
          classification filter.
        </div>
      ) : (
        <div className={styles.emptyList}>
          {transactionReason ??
            "No unreviewed transactions are currently stored in the private database."}
        </div>
      )}
    </section>
  );
}
