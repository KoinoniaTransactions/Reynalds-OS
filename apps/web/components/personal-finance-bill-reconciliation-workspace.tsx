"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";

import {
  useRouter
} from "next/navigation";

import type {
  PersonalFinanceBillPayment,
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

type ObligationOption = {
  id: string;
  name: string;

  obligationType:
    string;

  budgetItemKey:
    string | null;

  isActive:
    boolean;
};

type ObligationCatalogResponse = {
  catalog?: {
    obligations:
      ObligationOption[];
  };

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

function paymentMethodLabel(
  value: string
): string {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "not entered"
  ) {
    return "Payment method not set";
  }

  return value;
}

function debtTypeLabel(
  value:
    string | null
): string {
  if (!value) {
    return "linked debt";
  }

  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function obligationTypeLabel(
  value:
    string | null
): string {
  if (!value) {
    return "Financial obligation";
  }

  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function dueDayFromDate(
  value:
    string | null
): number | null {
  if (!value) {
    return null;
  }

  const match =
    value.match(
      /^\d{4}-\d{2}-(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const day =
    Number(
      match[1]
    );

  return (
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 31
  )
    ? day
    : null;
}

function formAmount(
  value:
    FormDataEntryValue |
    null
): number {
  const parsed =
    Number(
      String(
        value ?? ""
      )
        .replace(
          /[$,\s]/g,
          ""
        )
    );

  return parsed;
}

function confirmOverpayment({
  bill,
  amount,
  replacedAmount = 0
}: {
  bill:
    PersonalFinanceReconciliationBill;

  amount:
    number;

  replacedAmount?:
    number;
}): boolean {
  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return true;
  }

  const projectedPaid =
    bill.paid -
    replacedAmount +
    amount;

  if (
    projectedPaid <=
    bill.planned + 0.005
  ) {
    return true;
  }

  const overBy =
    projectedPaid -
    bill.planned;

  return window.confirm(
    `${bill.name} will be ${money(
      overBy
    )} over its planned amount after this payment.\n\nRecord it anyway?`
  );
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
    busyPaymentId,
    setBusyPaymentId
  ] =
    useState<
      string | null
    >(null);

  const [
    editingPaymentId,
    setEditingPaymentId
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


  const [
    obligations,
    setObligations
  ] =
    useState<
      ObligationOption[]
    >([]);

  const [
    linkEditorBillKey,
    setLinkEditorBillKey
  ] =
    useState<
      string | null
    >(null);

  const [
    linkBusyBillKey,
    setLinkBusyBillKey
  ] =
    useState<
      string | null
    >(null);

  const loadObligations =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/personal/obligations",
              {
                cache:
                  "no-store"
              }
            );

          const body =
            await response.json() as
              ObligationCatalogResponse;

          if (
            !response.ok ||
            !body.catalog
          ) {
            return;
          }

          setObligations(
            body.catalog
              .obligations
              .filter(
                (obligation) =>
                  obligation.isActive
              )
          );
        } catch {
          // The monthly ledger remains usable
          // if the optional setup catalog
          // cannot be loaded.
        }
      },
      []
    );

  const refreshWorkspace =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `/api/personal/reconciliation?period=${encodeURIComponent(
                initialWorkspace.periodKey
              )}`,
              {
                cache:
                  "no-store"
              }
            );

          const body =
            await response.json() as
              ReconciliationResponse;

          if (
            response.ok &&
            body.workspace
          ) {
            setWorkspace(
              body.workspace
            );
          }
        } catch {
          // Server refresh remains the
          // fallback if the local refresh
          // request is unavailable.
        }
      },
      [
        initialWorkspace
          .periodKey
      ]
    );

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

  useEffect(
    () => {
      void loadObligations();
    },
    [
      loadObligations
    ]
  );

  useEffect(
    () => {
      function handleObligationUpdate() {
        void Promise.all([
          refreshWorkspace(),
          loadObligations()
        ]);
      }

      window.addEventListener(
        "personal-finance-obligation-updated",
        handleObligationUpdate
      );

      return () => {
        window.removeEventListener(
          "personal-finance-obligation-updated",
          handleObligationUpdate
        );
      };
    },
    [
      loadObligations,
      refreshWorkspace
    ]
  );

  async function postAction(
    action: string,
    payload:
      Record<
        string,
        unknown
      >
  ): Promise<
    PersonalFinanceReconciliationWorkspace
  > {
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
          "The payment change could not be saved."
      );
    }

    return body.workspace;
  }

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

    const amount =
      formAmount(
        data.get(
          "amount"
        )
      );

    if (
      !confirmOverpayment({
        bill,
        amount
      })
    ) {
      return;
    }

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
      const updated =
        await postAction(
          "record-bill-payment",
          {
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
          }
        );

      setWorkspace(
        updated
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

  async function submitPaymentEdit(
    event:
      FormEvent<
        HTMLFormElement
      >,
    bill:
      PersonalFinanceReconciliationBill,
    payment:
      PersonalFinanceBillPayment
  ) {
    event.preventDefault();

    const data =
      new FormData(
        event.currentTarget
      );

    const amount =
      formAmount(
        data.get(
          "amount"
        )
      );

    if (
      !confirmOverpayment({
        bill,
        amount,
        replacedAmount:
          payment.amount
      })
    ) {
      return;
    }

    setBusyPaymentId(
      payment.id
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
          "update-bill-payment",
          {
            paymentId:
              payment.id,

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
          }
        );

      setWorkspace(
        updated
      );

      setEditingPaymentId(
        null
      );

      setNotice(
        `Payment corrected for ${bill.name}.`
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
          : "The payment could not be updated."
      );
    } finally {
      setBusyPaymentId(
        null
      );
    }
  }

  async function deletePayment(
    bill:
      PersonalFinanceReconciliationBill,
    payment:
      PersonalFinanceBillPayment
  ) {
    const confirmed =
      window.confirm(
        `Delete the ${money(
          payment.amount
        )} payment recorded for ${bill.name} on ${displayDate(
          payment.paidOn
        )}?\n\nThe bill's Paid total will decrease by the same amount.`
      );

    if (!confirmed) {
      return;
    }

    setBusyPaymentId(
      payment.id
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
          "delete-bill-payment",
          {
            paymentId:
              payment.id
          }
        );

      setWorkspace(
        updated
      );

      setEditingPaymentId(
        null
      );

      setNotice(
        `Payment deleted from ${bill.name}.`
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
          : "The payment could not be deleted."
      );
    } finally {
      setBusyPaymentId(
        null
      );
    }
  }

  function linkedObligationForBill(
    bill:
      PersonalFinanceReconciliationBill
  ): ObligationOption | null {
    if (!bill.obligationId) {
      return null;
    }

    return (
      obligations.find(
        (obligation) =>
          obligation.id ===
          bill.obligationId
      ) ??
      null
    );
  }

  function openFinancialSetup(
    bill:
      PersonalFinanceReconciliationBill,
    mode:
      "create" |
      "complete"
  ) {
    if (
      mode ===
        "complete" &&
      !bill.obligationId
    ) {
      setError(
        "This monthly bill must be linked before debt setup can be completed."
      );

      return;
    }

    setError(
      null
    );

    setNotice(
      null
    );

    setLinkEditorBillKey(
      null
    );

    window.dispatchEvent(
      new CustomEvent(
        "personal-finance-open-obligation-setup",
        {
          detail: {
            mode,

            billKey:
              bill.budgetItemKey,

            billName:
              bill.name,

            plannedAmount:
              bill.planned,

            dueDay:
              dueDayFromDate(
                bill.dueDate
              ),

            obligationId:
              mode ===
              "complete"
                ? bill.obligationId
                : null,

            obligationType:
              mode ===
              "complete"
                ? bill.obligationType
                : null
          }
        }
      )
    );
  }

  async function saveExistingLink(
    event:
      FormEvent<
        HTMLFormElement
      >,
    bill:
      PersonalFinanceReconciliationBill
  ) {
    event.preventDefault();

    const data =
      new FormData(
        event.currentTarget
      );

    const obligationId =
      String(
        data.get(
          "obligationId"
        ) ?? ""
      ).trim();

    if (!obligationId) {
      setError(
        "Choose an existing financial obligation first."
      );

      return;
    }

    setLinkBusyBillKey(
      bill.budgetItemKey
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
          "link-bill-obligation",
          {
            budgetItemKey:
              bill.budgetItemKey,

            obligationId
          }
        );

      setWorkspace(
        updated
      );

      setLinkEditorBillKey(
        null
      );

      setNotice(
        `${bill.name} is now linked to its financial setup.`
      );

      await loadObligations();

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
          : "The financial link could not be saved."
      );
    } finally {
      setLinkBusyBillKey(
        null
      );
    }
  }

  async function unlinkObligation(
    bill:
      PersonalFinanceReconciliationBill
  ) {
    if (!bill.obligationId) {
      return;
    }

    const linked =
      linkedObligationForBill(
        bill
      );

    const confirmed =
      window.confirm(
        `Unlink ${bill.name} from ${
          linked?.name ??
          "its financial obligation"
        }?\n\nThis does not delete the obligation, asset, liability, or payment history. It only removes this month's explicit relationship.`
      );

    if (!confirmed) {
      return;
    }

    setLinkBusyBillKey(
      bill.budgetItemKey
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
          "unlink-bill-obligation",
          {
            budgetItemKey:
              bill.budgetItemKey
          }
        );

      setWorkspace(
        updated
      );

      setLinkEditorBillKey(
        null
      );

      setNotice(
        `${bill.name} was unlinked.`
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
          : "The financial link could not be removed."
      );
    } finally {
      setLinkBusyBillKey(
        null
      );
    }
  }

  function openDebtLedger(
    bill:
      PersonalFinanceReconciliationBill
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "personal-finance-open-debt-ledger",
        {
          detail: {
            billName:
              bill.name
          }
        }
      )
    );

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "loan-payment-ledger"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
      }
    );
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
          Linked debt bills are
          protected.
        </strong>

        <span>
          Use Financial setup to
          explicitly connect a
          monthly bill to the
          obligation it belongs to.
          Linked mortgage, vehicle,
          and loan payments are
          then kept out of the
          ordinary ledger.
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
                      {paymentMethodLabel(
                        bill.paymentMethod
                      )}
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

                <div
                  className={
                    styles.financialLink
                  }
                >
                  <div
                    className={
                      styles.linkSummary
                    }
                  >
                    <div
                      className={
                        styles.linkIdentity
                      }
                    >
                      <span
                        className={
                          bill.obligationId
                            ? styles.linkedBadge
                            : styles.unlinkedBadge
                        }
                      >
                        {bill.obligationId
                          ? "Linked"
                          : "Not linked"}
                      </span>

                      <div>
                        <strong>
                          {bill.obligationId
                            ? `${obligationTypeLabel(
                                bill.obligationType ??
                                linkedObligationForBill(
                                  bill
                                )?.obligationType ??
                                null
                              )} · ${
                                linkedObligationForBill(
                                  bill
                                )?.name ??
                                "Financial obligation"
                              }`
                            : "Financial setup"}
                        </strong>

                        <p>
                          {bill.obligationId
                            ? "This month carries an explicit obligation relationship."
                            : "Link ordinary bills for organization, or set up mortgage and auto debt before using their payment workflow."}
                        </p>
                      </div>
                    </div>

                    <div
                      className={
                        styles.linkActions
                      }
                    >
                      {bill.obligationId ? (
                        <>
                          <button
                            className={
                              styles.secondaryButton
                            }
                            disabled={
                              linkBusyBillKey ===
                              bill.budgetItemKey
                            }
                            onClick={() =>
                              setLinkEditorBillKey(
                                linkEditorBillKey ===
                                bill.budgetItemKey
                                  ? null
                                  : bill.budgetItemKey
                              )
                            }
                            type="button"
                          >
                            Change link
                          </button>

                          <button
                            className={
                              styles.unlinkButton
                            }
                            disabled={
                              linkBusyBillKey ===
                              bill.budgetItemKey
                            }
                            onClick={() =>
                              void unlinkObligation(
                                bill
                              )
                            }
                            type="button"
                          >
                            {linkBusyBillKey ===
                            bill.budgetItemKey
                              ? "Working..."
                              : "Unlink"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={
                              styles.setupButton
                            }
                            onClick={() =>
                              openFinancialSetup(
                                bill,
                                "create"
                              )
                            }
                            type="button"
                          >
                            Financial setup
                          </button>

                          <button
                            className={
                              styles.secondaryButton
                            }
                            onClick={() =>
                              setLinkEditorBillKey(
                                linkEditorBillKey ===
                                bill.budgetItemKey
                                  ? null
                                  : bill.budgetItemKey
                              )
                            }
                            type="button"
                          >
                            Link existing
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {linkEditorBillKey ===
                  bill.budgetItemKey ? (
                    <form
                      className={
                        styles.linkEditor
                      }
                      onSubmit={(
                        event
                      ) =>
                        void saveExistingLink(
                          event,
                          bill
                        )
                      }
                    >
                      <label>
                        <span>
                          Existing obligation
                        </span>

                        <select
                          defaultValue={
                            bill.obligationId ??
                            ""
                          }
                          name="obligationId"
                          required
                        >
                          <option
                            disabled
                            value=""
                          >
                            Choose an obligation
                          </option>

                          {obligations.map(
                            (
                              obligation
                            ) => (
                              <option
                                key={
                                  obligation.id
                                }
                                value={
                                  obligation.id
                                }
                              >
                                {obligationTypeLabel(
                                  obligation
                                    .obligationType
                                )}
                                {" · "}
                                {
                                  obligation.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <div
                        className={
                          styles.linkEditorActions
                        }
                      >
                        <button
                          className={
                            styles.setupButton
                          }
                          disabled={
                            obligations.length ===
                              0 ||
                            linkBusyBillKey ===
                              bill.budgetItemKey
                          }
                          type="submit"
                        >
                          {linkBusyBillKey ===
                          bill.budgetItemKey
                            ? "Saving..."
                            : "Save link"}
                        </button>

                        <button
                          className={
                            styles.secondaryButton
                          }
                          disabled={
                            linkBusyBillKey ===
                            bill.budgetItemKey
                          }
                          onClick={() =>
                            setLinkEditorBillKey(
                              null
                            )
                          }
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>

                      {obligations.length ===
                      0 ? (
                        <p
                          className={
                            styles.noObligations
                          }
                        >
                          No existing financial
                          obligations are
                          available. Use
                          Financial setup to
                          create one.
                        </p>
                      ) : null}
                    </form>
                  ) : null}
                </div>

                {bill.requiresDebtSetup ? (
                  <div
                    className={`${styles.debtAction} ${styles.debtSetupAction}`}
                  >
                    <div>
                      <span>
                        {debtTypeLabel(
                          bill.obligationType
                        )}
                      </span>

                      <strong>
                        Complete debt setup
                        before recording
                        payments
                      </strong>

                      <p>
                        This bill is already
                        protected as debt.
                        Add the real financial
                        details before any
                        payment can be posted.
                      </p>
                    </div>

                    {bill.obligationType ===
                    "loan" ? (
                      <span
                        className={
                          styles.debtSetupPending
                        }
                      >
                        Generic loan
                        liability setup is
                        not yet available
                        from this form.
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          openFinancialSetup(
                            bill,
                            "complete"
                          )
                        }
                        type="button"
                      >
                        Complete debt setup
                      </button>
                    )}
                  </div>
                ) : bill.requiresDebtLedger ? (
                  <div
                    className={
                      styles.debtAction
                    }
                  >
                    <div>
                      <span>
                        {
                          debtTypeLabel(
                            bill.debtLedgerLabel
                          )
                        }
                      </span>

                      <strong>
                        Record this payment
                        in the debt ledger
                      </strong>

                      <p>
                        Principal,
                        interest, the
                        linked liability,
                        net worth, and this
                        month's Paid total
                        will stay
                        synchronized.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        openDebtLedger(
                          bill
                        )
                      }
                      type="button"
                    >
                      Record in debt ledger
                    </button>
                  </div>
                ) : (
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
                )}

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
                        ) =>
                          editingPaymentId ===
                            payment.id &&
                          payment.sourceKind ===
                            "ordinary" ? (
                            <form
                              className={
                                styles.historyEditForm
                              }
                              key={
                                payment.id
                              }
                              onSubmit={(
                                event
                              ) =>
                                void submitPaymentEdit(
                                  event,
                                  bill,
                                  payment
                                )
                              }
                            >
                              <label>
                                <span>
                                  Amount
                                </span>

                                <input
                                  defaultValue={
                                    payment.amount
                                  }
                                  min="0.01"
                                  name="amount"
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
                                    payment.paidOn
                                  }
                                  name="paidOn"
                                  required
                                  type="date"
                                />
                              </label>

                              <label>
                                <span>
                                  Note
                                </span>

                                <input
                                  defaultValue={
                                    payment.note ??
                                    ""
                                  }
                                  name="note"
                                />
                              </label>

                              <div
                                className={
                                  styles.historyEditActions
                                }
                              >
                                <button
                                  className={
                                    styles.editButton
                                  }
                                  disabled={
                                    busyPaymentId ===
                                    payment.id
                                  }
                                  type="submit"
                                >
                                  {busyPaymentId ===
                                  payment.id
                                    ? "Saving..."
                                    : "Save"}
                                </button>

                                <button
                                  className={
                                    styles.cancelButton
                                  }
                                  disabled={
                                    busyPaymentId ===
                                    payment.id
                                  }
                                  onClick={() =>
                                    setEditingPaymentId(
                                      null
                                    )
                                  }
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
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

                              <div
                                className={
                                  styles.historyNote
                                }
                              >
                                <small>
                                  {payment.note ??
                                    "No note"}
                                </small>

                                {payment.sourceKind ===
                                "debt" ? (
                                  <span
                                    className={
                                      styles.debtSourceBadge
                                    }
                                  >
                                    Debt ledger
                                  </span>
                                ) : null}
                              </div>

                              {payment.sourceKind ===
                              "ordinary" ? (
                                <div
                                  className={
                                    styles.historyActions
                                  }
                                >
                                  <button
                                    className={
                                      styles.editButton
                                    }
                                    disabled={
                                      busyPaymentId ===
                                      payment.id
                                    }
                                    onClick={() =>
                                      setEditingPaymentId(
                                        payment.id
                                      )
                                    }
                                    type="button"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className={
                                      styles.dangerButton
                                    }
                                    disabled={
                                      busyPaymentId ===
                                      payment.id
                                    }
                                    onClick={() =>
                                      void deletePayment(
                                        bill,
                                        payment
                                      )
                                    }
                                    type="button"
                                  >
                                    {busyPaymentId ===
                                    payment.id
                                      ? "Working..."
                                      : "Delete"}
                                  </button>
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <p>
                      No payment ledger
                      entries have been
                      recorded for this
                      bill in{" "}
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
