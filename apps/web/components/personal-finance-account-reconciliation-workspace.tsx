"use client";

import {
  useEffect,
  useState,
  type FormEvent
} from "react";

import type {
  PersonalFinanceReconciliationAccount,
  PersonalFinanceReconciliationWorkspace
} from "../lib/personal-finance-reconciliation-types";

import styles from "./personal-finance-account-reconciliation-workspace.module.css";

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

function reconciledLabel(
  value: string | null
): string {
  if (!value) {
    return "Not reconciled yet";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Reconciled";
  }

  return `Updated ${date.toLocaleString(
    "en-US",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short"
    }
  )}`;
}

export function PersonalFinanceAccountReconciliationWorkspace({
  initialWorkspace
}: Props) {
  const [
    workspace,
    setWorkspace
  ] =
    useState(
      initialWorkspace
    );

  const [
    busyKey,
    setBusyKey
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

  const cashAccounts =
    workspace.accounts.filter(
      (account) =>
        account.kind ===
        "cash"
    );

  const creditAccounts =
    workspace.accounts.filter(
      (account) =>
        account.kind ===
        "credit"
    );

  async function postAction(
    action: string,
    payload:
      Record<
        string,
        unknown
      >
  ) {
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
              action,
              periodKey:
                workspace.periodKey,
              ...payload
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
          "The account could not be reconciled."
      );
    }

    return body.workspace;
  }

  async function submitBalance(
    event:
      FormEvent<
        HTMLFormElement
      >,
    account:
      PersonalFinanceReconciliationAccount,
    mode:
      "current" |
      "closing"
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const data =
      new FormData(
        form
      );

    const balance =
      String(
        data.get(
          "balance"
        ) ?? ""
      );

    const busy =
      `${account.accountKey}:${mode}`;

    setBusyKey(
      busy
    );
    setError(
      null
    );
    setNotice(
      null
    );

    try {
      const updated =
        await postAction(
          mode ===
          "closing"
            ? "close-account"
            : "update-account-current",
          {
            accountKey:
              account.accountKey,

            balance
          }
        );

      setWorkspace(
        updated
      );

      setNotice(
        mode ===
        "closing"
          ? `${account.name} month-end balance was recorded.`
          : `${account.name} current balance was updated.`
      );

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "The account balance could not be updated."
      );
    } finally {
      setBusyKey(
        null
      );
    }
  }

  function renderAccount(
    account:
      PersonalFinanceReconciliationAccount
  ) {
    const currentBusy =
      busyKey ===
      `${account.accountKey}:current`;

    const closingBusy =
      busyKey ===
      `${account.accountKey}:closing`;

    return (
      <article
        className={
          styles.accountCard
        }
        key={
          account.accountKey
        }
      >
        <header
          className={
            styles.accountHeader
          }
        >
          <div
            className={
              styles.accountIdentity
            }
          >
            <span
              aria-hidden="true"
              className={
                styles.accountAvatar
              }
            >
              {account.name
                .trim()
                .charAt(0)
                .toUpperCase() ||
                "A"}
            </span>

            <div>
              <span
                className={
                  styles.accountType
                }
              >
                {account.kind ===
                "cash"
                  ? "Cash account"
                  : "Credit account"}
              </span>

              <h3>
                {account.name}
              </h3>
            </div>
          </div>

          <span
            className={
              account.closingBalance ===
              null
                ? styles.openBadge
                : styles.closedBadge
            }
          >
            {account.closingBalance ===
            null
              ? "Month open"
              : "Closing balance set"}
          </span>
        </header>

        <div
          className={
            styles.balanceGrid
          }
        >
          <div>
            <span>
              Opening
            </span>

            <strong>
              {money(
                account.openingBalance
              )}
            </strong>

            <small>
              Starting snapshot
            </small>
          </div>

          <div>
            <span>
              Current
            </span>

            <strong
              className={
                styles.currentValue
              }
            >
              {money(
                account.currentBalance
              )}
            </strong>

            <small>
              Latest recorded balance
            </small>
          </div>

          <div>
            <span>
              Closing
            </span>

            <strong>
              {account.closingBalance ===
              null
                ? "—"
                : money(
                    account.closingBalance
                  )}
            </strong>

            <small>
              Used for next month
            </small>
          </div>
        </div>

        {account.kind ===
        "credit" ? (
          <div
            className={
              styles.creditFacts
            }
          >
            <span>
              <small>
                Credit limit
              </small>

              <strong>
                {account.creditLimit ===
                null
                  ? "Not entered"
                  : money(
                      account.creditLimit
                    )}
              </strong>
            </span>

            <span>
              <small>
                Minimum payment
              </small>

              <strong>
                {account.minimumPayment ===
                null
                  ? "Not entered"
                  : money(
                      account.minimumPayment
                    )}
              </strong>
            </span>
          </div>
        ) : null}

        <div
          className={
            styles.forms
          }
        >
          <form
            className={
              styles.balanceForm
            }
            onSubmit={(
              event
            ) =>
              void submitBalance(
                event,
                account,
                "current"
              )
            }
          >
            <label>
              <span>
                Current balance
              </span>

              <input
                key={`current-${account.accountKey}-${account.currentBalance}`}
                defaultValue={
                  account.currentBalance
                }
                name="balance"
                required
                step="0.01"
                type="number"
              />
            </label>

            <button
              disabled={
                currentBusy ||
                closingBusy
              }
              type="submit"
            >
              {currentBusy
                ? "Updating..."
                : "Update current"}
            </button>
          </form>

          <form
            className={
              styles.balanceForm
            }
            onSubmit={(
              event
            ) =>
              void submitBalance(
                event,
                account,
                "closing"
              )
            }
          >
            <label>
              <span>
                Month-end balance
              </span>

              <input
                key={`closing-${account.accountKey}-${account.closingBalance ?? account.currentBalance}`}
                defaultValue={
                  account.closingBalance ??
                  account.currentBalance
                }
                name="balance"
                required
                step="0.01"
                type="number"
              />
            </label>

            <button
              className={
                styles.closeButton
              }
              disabled={
                currentBusy ||
                closingBusy
              }
              type="submit"
            >
              {closingBusy
                ? "Saving..."
                : account.closingBalance ===
                    null
                  ? "Set month-end"
                  : "Update month-end"}
            </button>
          </form>
        </div>

        <footer
          className={
            styles.accountFooter
          }
        >
          {reconciledLabel(
            account.reconciledAt
          )}
        </footer>
      </article>
    );
  }

  return (
    <div
      className={
        styles.workspace
      }
    >
      <section
        className={
          styles.summary
        }
      >
        <article>
          <span>
            Opening cash
          </span>

          <strong>
            {money(
              workspace.totals
                .openingCash
            )}
          </strong>

          <small>
            Start of{" "}
            {
              workspace.periodLabel
            }
          </small>
        </article>

        <article>
          <span>
            Current cash
          </span>

          <strong
            className={
              styles.currentValue
            }
          >
            {money(
              workspace.totals
                .currentCash
            )}
          </strong>

          <small>
            Latest reconciled cash
          </small>
        </article>

        <article>
          <span>
            Closing cash
          </span>

          <strong>
            {workspace.totals
              .closedCash ===
            null
              ? "Not closed"
              : money(
                  workspace.totals
                    .closedCash
                )}
          </strong>

          <small>
            Available once every
            cash account has a
            month-end balance
          </small>
        </article>
      </section>

      <aside
        className={
          styles.explanation
        }
      >
        <strong>
          Reconcile from the bank,
          not from estimated
          spending.
        </strong>

        <span>
          Update Current during
          the month. Set
          Month-end when the
          statement or bank
          balance is final.
          Month-end is what the
          next budget month will
          inherit.
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

      <section
        className={
          styles.accountSection
        }
      >
        <header
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span>
              Cash accounts
            </span>

            <h2>
              Bank balances
            </h2>

            <p>
              Keep the month's
              opening position,
              current bank
              balance, and final
              closing balance
              separate.
            </p>
          </div>

          <strong>
            {
              cashAccounts.length
            }
          </strong>
        </header>

        {cashAccounts.length >
        0 ? (
          <div
            className={
              styles.accountList
            }
          >
            {cashAccounts.map(
              renderAccount
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            No cash accounts are
            recorded for this
            month.
          </div>
        )}
      </section>

      <section
        className={
          styles.accountSection
        }
      >
        <header
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span>
              Revolving accounts
            </span>

            <h2>
              Credit balances
            </h2>

            <p>
              Reconcile credit
              balances the same
              way so the next
              month starts from
              the correct
              liability
              snapshot.
            </p>
          </div>

          <strong>
            {
              creditAccounts.length
            }
          </strong>
        </header>

        {creditAccounts.length >
        0 ? (
          <div
            className={
              styles.accountList
            }
          >
            {creditAccounts.map(
              renderAccount
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            No revolving accounts
            are recorded for this
            month.
          </div>
        )}
      </section>
    </div>
  );
}
