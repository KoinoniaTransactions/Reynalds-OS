"use client";

import {
  useEffect,
  useState,
  type FormEvent
} from "react";

import {
  useRouter
} from "next/navigation";

import type {
  PersonalFinanceReconciliationBill,
  PersonalFinanceReconciliationWorkspace
} from "../lib/personal-finance-reconciliation-types";

import styles from "./personal-finance-bill-reconciliation-workspace.module.css";

type Props = {
  initialWorkspace:
    PersonalFinanceReconciliationWorkspace;
};

type ReconciliationResponse = {
  workspace?:
    PersonalFinanceReconciliationWorkspace;

  error?:
    string;
};

function money(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      currency: "USD",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency"
    }
  ).format(
    value
  );
}

function displayDate(
  value: string
): string {
  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return value;
  }

  return `${Number(
    match[2]
  )}/${Number(
    match[3]
  )}/${match[1]}`;
}

function defaultPaymentDate(
  periodKey: string
): string {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const today =
    `${year}-${month}-${day}`;

  return today.startsWith(
    `${periodKey}-`
  )
    ? today
    : `${periodKey}-01`;
}

function statusLabel(
  bill:
    PersonalFinanceReconciliationBill
): string {
  if (
    bill.remaining < 0
  ) {
    return "Over plan";
  }

  if (
    bill.remaining <= 0
  ) {
    return "Paid";
  }

  if (
    bill.paid > 0
  ) {
    return "Partial";
  }

  return "Unpaid";
}

export function PersonalFinanceBillReconciliationWorkspace({
  initialWorkspace
}: Props) {
  const router =
    useRouter();

  const [
    workspace,
    setWorkspace
  ] =
    useState(
      initialWorkspace
    );

  const [
    busyBillKey,
    setBusyBillKey
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError
  ] =
    useState<
      string | null
    >(null);

  const [
    notice,
    setNotice
  ] =
    useState<
      string | null
    >(null);

  useEffect(
    () => {
      setWorkspace(
        initialWorkspace
      );
    },
    [
      initialWorkspace
    ]
  );

  async function submitPayment(
    event:
      FormEvent<
        HTMLFormElement
      >,
    bill:
      PersonalFinanceReconciliationBill
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const data =
      new FormData(
        form
      );

    setBusyBillKey(
      bill.budgetItemKey
    );
    setError(
      null
    );
    setNotice(
      null
    );

    try {
      const response =
        await fetch(
          "/api/personal/reconciliation",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                action:
                  "record-bill-payment",

                periodKey:
                  workspace.periodKey,

                budgetItemKey:
                  bill.budgetItemKey,

                amount:
                  String(
                    data.get(
                      "amount"
                    ) ?? ""
                  ),

                paidOn:
                  String(
                    data.get(
                      "paidOn"
                    ) ?? ""
                  ),

                note:
                  String(
                    data.get(
                      "note"
                    ) ?? ""
                  )
              })
          }
        );

      const body =
        await response.json() as
          ReconciliationResponse;

      if (
        !response.ok ||
        !body.workspace
      ) {
        throw new Error(
          body.error ??
            "The bill payment could not be recorded."
        );
      }

      setWorkspace(
        body.workspace
      );

      form.reset();

      setNotice(
        `Payment recorded for ${bill.name}.`
      );

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );

      router.refresh();
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "The bill payment could not be recorded."
      );
    } finally {
      setBusyBillKey(
        null
      );
    }
  }

  return (
    <section
      className={
        styles.workspace
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span>
            Monthly payment ledger
          </span>

          <h2>
            Record ordinary bill
            payments
          </h2>

          <p>
            Record what was paid
            during{" "}
            {
              workspace.periodLabel
            } and keep a
            month-specific payment
            history.
          </p>
        </div>

        <strong>
          {
            workspace.bills.length
          }
        </strong>
      </header>

      <div
        className={
          styles.summary
        }
      >
        <article>
          <span>
            Planned
          </span>

          <strong>
            {money(
              workspace.totals
                .plannedBills
            )}
          </strong>
        </article>

        <article>
          <span>
            Paid
          </span>

          <strong
            className={
              styles.positive
            }
          >
            {money(
              workspace.totals
                .paidBills
            )}
          </strong>
        </article>

        <article>
          <span>
            Remaining
          </span>

          <strong>
            {money(
              workspace.totals
                .remainingBills
            )}
          </strong>
        </article>

        <article>
          <span>
            Ledger entries
          </span>

          <strong>
            {money(
              workspace.totals
                .recordedPayments
            )}
          </strong>
        </article>
      </div>

      <aside
        className={
          styles.debtNotice
        }
      >
        <strong>
          Debt payments have a
          separate workflow.
        </strong>

        <span>
          For mortgage, vehicle,
          or loan payments where
          principal and interest
          must update the linked
          liability and net worth,
          use the Record debt
          payments ledger below.
          Do not record the same
          payment in both ledgers.
        </span>
      </aside>

      {error ? (
        <div
          className={
            styles.error
          }
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          className={
            styles.success
          }
          role="status"
        >
          {notice}
        </div>
      ) : null}

      {workspace.bills.length >
      0 ? (
        <div
          className={
            styles.billList
          }
        >
          {workspace.bills.map(
            (bill) => (
              <article
                className={
                  styles.billCard
                }
                key={
                  bill.budgetItemKey
                }
              >
                <header
                  className={
                    styles.billHeader
                  }
                >
                  <div>
                    <span>
                      {bill.dueDate
                        ? `Due ${displayDate(
                            bill.dueDate
                          )}`
                        : bill.dueLabel}
                    </span>

                    <h3>
                      {bill.name}
                    </h3>

                    <p>
                      {
                        bill.paymentMethod
                      }
                    </p>
                  </div>

                  <span
                    className={
                      bill.remaining <=
                      0
                        ? styles.paidBadge
                        : bill.paid > 0
                          ? styles.partialBadge
                          : styles.unpaidBadge
                    }
                  >
                    {statusLabel(
                      bill
                    )}
                  </span>
                </header>

                <div
                  className={
                    styles.amountGrid
                  }
                >
                  <span>
                    <small>
                      Planned
                    </small>

                    <strong>
                      {money(
                        bill.planned
                      )}
                    </strong>
                  </span>

                  <span>
                    <small>
                      Paid
                    </small>

                    <strong
                      className={
                        styles.positive
                      }
                    >
                      {money(
                        bill.paid
                      )}
                    </strong>
                  </span>

                  <span>
                    <small>
                      Remaining
                    </small>

                    <strong>
                      {money(
                        bill.remaining
                      )}
                    </strong>
                  </span>
                </div>

                <form
                  className={
                    styles.paymentForm
                  }
                  onSubmit={(
                    event
                  ) =>
                    void submitPayment(
                      event,
                      bill
                    )
                  }
                >
                  <label>
                    <span>
                      Payment amount
                    </span>

                    <input
                      min="0.01"
                      name="amount"
                      placeholder={
                        bill.remaining >
                        0
                          ? `Remaining ${money(
                              bill.remaining
                            )}`
                          : "Enter payment"
                      }
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>

                  <label>
                    <span>
                      Paid date
                    </span>

                    <input
                      defaultValue={
                        defaultPaymentDate(
                          workspace.periodKey
                        )
                      }
                      name="paidOn"
                      required
                      type="date"
                    />
                  </label>

                  <label
                    className={
                      styles.noteField
                    }
                  >
                    <span>
                      Note
                    </span>

                    <input
                      name="note"
                      placeholder="Optional"
                    />
                  </label>

                  <button
                    disabled={
                      busyBillKey ===
                      bill.budgetItemKey
                    }
                    type="submit"
                  >
                    {busyBillKey ===
                    bill.budgetItemKey
                      ? "Recording..."
                      : "Record payment"}
                  </button>
                </form>

                <details
                  className={
                    styles.history
                  }
                >
                  <summary>
                    Payment history (
                    {
                      bill.payments
                        .length
                    }
                    )
                  </summary>

                  {bill.payments
                    .length > 0 ? (
                    <div
                      className={
                        styles.historyList
                      }
                    >
                      {bill.payments.map(
                        (
                          payment
                        ) => (
                          <div
                            className={
                              styles.historyRow
                            }
                            key={
                              payment.id
                            }
                          >
                            <span>
                              {displayDate(
                                payment.paidOn
                              )}
                            </span>

                            <strong>
                              {money(
                                payment.amount
                              )}
                            </strong>

                            <small>
                              {payment.note ??
                                "No note"}
                            </small>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p>
                      No ordinary
                      payment entries
                      have been
                      recorded for
                      this bill in{" "}
                      {
                        workspace.periodLabel
                      }.
                    </p>
                  )}
                </details>
              </article>
            )
          )}
        </div>
      ) : (
        <div
          className={
            styles.empty
          }
        >
          No monthly bills are
          recorded for this
          period.
        </div>
      )}
    </section>
  );
}
