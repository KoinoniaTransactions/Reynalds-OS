"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";

import styles from "./personal-finance-loan-payment-workspace.module.css";

type PaymentHistoryRecord = {
  paymentId: string;
  paidOn: string;
  totalPayment: number;
  interest: number;
  principal: number;
  escrow: number;
  fees: number;
  extraPrincipal: number;
  openingBalance: number;
  closingBalance: number;
};

type LoanRecord = {
  liabilityId: string;
  obligationId: string;
  billName: string;
  liabilityName: string;
  liabilityType: string;
  institution: string | null;
  currentBalance: number;
  balanceAsOf: string | null;
  expectedPayment: number | null;
  annualInterestRate: number | null;
  calculationMethod: string | null;
  paymentFrequency: string | null;
  scheduledEscrow: number;
  scheduledPayment: number | null;
  originalTermMonths: number | null;
  remainingTermMonths: number | null;
  loanStartDate: string | null;
  firstPaymentDate: string | null;
  rateType: string | null;
  lastAccrualDate: string | null;
  hasConfiguredTerms: boolean;
  projectedPayoffDate:
    string | null;
  projectedRemainingPayments:
    number | null;
  estimatedRemainingInterest:
    number | null;
  principalAndInterestPayment:
    number | null;
  statementBalance:
    number | null;
  statementAsOf:
    string | null;
  balanceDifference:
    number | null;
  needsReconciliation:
    boolean;
  recentPayments:
    PaymentHistoryRecord[];
};

type AmortizationEntry = {
  paymentNumber: number;
  paymentDate: string;
  payment: number;
  interest: number;
  principal: number;
  extraPrincipal: number;
  closingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
};

type LoanScenario = {
  liabilityId: string;
  openingBalance: number;
  scheduledPrincipalAndInterest: number;
  modeledPrincipalAndInterest: number;
  oneTimeExtraPayment: number;
  recurringExtraPayment: number;
  baselinePayoffDate: string | null;
  modeledPayoffDate: string | null;
  baselinePaymentCount: number | null;
  modeledPaymentCount: number | null;
  paymentsSaved: number | null;
  baselineRemainingInterest: number | null;
  modeledRemainingInterest: number | null;
  interestSaved: number | null;
  amortization: AmortizationEntry[];
};

type PaymentPreview = {
  liabilityId: string;
  obligationId: string | null;
  openingBalance: number;
  totalPayment: number;
  interest: number;
  principal: number;
  extraPrincipal: number;
  escrow: number;
  fees: number;
  projectedBalance: number;
  calculationMethod: string;
  paidOn: string;
};

const TODAY =
  new Date()
    .toISOString()
    .slice(0, 10);

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
  ).format(value);
}

export function PersonalFinanceLoanPaymentWorkspace() {
  const [
    records,
    setRecords
  ] = useState<LoanRecord[]>([]);

  const [
    selected,
    setSelected
  ] = useState<LoanRecord | null>(
    null
  );

  const [
    preview,
    setPreview
  ] = useState<PaymentPreview | null>(
    null
  );

  const [
    configuring,
    setConfiguring
  ] = useState<LoanRecord | null>(
    null
  );

  const [
    reconciling,
    setReconciling
  ] = useState<LoanRecord | null>(
    null
  );

  const [
    modeling,
    setModeling
  ] = useState<LoanRecord | null>(
    null
  );

  const [
    scenario,
    setScenario
  ] = useState<LoanScenario | null>(
    null
  );

  const [
    modeledPayment,
    setModeledPayment
  ] = useState<Record<string, number>>(
    {}
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    error,
    setError
  ] = useState<string | null>(
    null
  );

  const [
    notice,
    setNotice
  ] = useState<string | null>(
    null
  );

  const loadRecords =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/personal/loan-payments",
            {
              cache: "no-store"
            }
          );

        const body =
          await response.json() as {
            records?: LoanRecord[];
            error?: string;
          };

        if (
          !response.ok ||
          !body.records
        ) {
          throw new Error(
            body.error ??
              "Loan-payment information could not be loaded."
          );
        }

        setRecords(body.records);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Loan-payment information could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  async function modelExtraPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!modeling) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    setScenario(null);

    const data =
      new FormData(
        event.currentTarget
      );

    try {
      const response =
        await fetch(
          "/api/personal/loan-payments",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              action:
                "model-scenario",
              liabilityId:
                modeling.liabilityId,
              recurringExtraPayment:
                String(
                  data.get(
                    "recurringExtraPayment"
                  ) ?? ""
                ),
              oneTimeExtraPayment:
                String(
                  data.get(
                    "oneTimeExtraPayment"
                  ) ?? ""
                ),
              projectionStartDate:
                String(
                  data.get(
                    "projectionStartDate"
                  ) ?? ""
                )
            })
          }
        );

      const body =
        await response.json() as {
          scenario?: LoanScenario;
          error?: string;
        };

      if (
        !response.ok ||
        !body.scenario
      ) {
        throw new Error(
          body.error ??
            "Extra-payment scenario could not be calculated."
        );
      }

      setScenario(
        body.scenario
      );
    } catch (modelError) {
      setError(
        modelError instanceof Error
          ? modelError.message
          : "Extra-payment scenario could not be calculated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function reconcileStatement(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!reconciling) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data =
      new FormData(
        event.currentTarget
      );

    try {
      const response =
        await fetch(
          "/api/personal/loan-payments",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              action:
                "reconcile-statement",
              liabilityId:
                reconciling.liabilityId,
              statementBalance:
                String(
                  data.get(
                    "statementBalance"
                  ) ?? ""
                ),
              statementAsOf:
                String(
                  data.get(
                    "statementAsOf"
                  ) ?? ""
                ),
              note:
                String(
                  data.get("note") ??
                  ""
                )
            })
          }
        );

      const body =
        await response.json() as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          body.error ??
            "Statement balance could not be accepted."
        );
      }

      setNotice(
        `Statement balance accepted for ${reconciling.billName}.`
      );

      setReconciling(null);

      await loadRecords();

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Statement balance could not be accepted."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveLoanTerms(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!configuring) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data =
      new FormData(
        event.currentTarget
      );

    try {
      const response =
        await fetch(
          "/api/personal/loan-payments",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              action: "configure",
              liabilityId:
                configuring.liabilityId,
              calculationMethod:
                String(
                  data.get(
                    "calculationMethod"
                  ) ?? ""
                ),
              annualInterestRate:
                String(
                  data.get(
                    "annualInterestRate"
                  ) ?? ""
                ),
              originalTermMonths:
                String(
                  data.get(
                    "originalTermMonths"
                  ) ?? ""
                ),
              remainingTermMonths:
                String(
                  data.get(
                    "remainingTermMonths"
                  ) ?? ""
                ),
              loanStartDate:
                String(
                  data.get(
                    "loanStartDate"
                  ) ?? ""
                ),
              firstPaymentDate:
                String(
                  data.get(
                    "firstPaymentDate"
                  ) ?? ""
                ),
              paymentFrequency:
                String(
                  data.get(
                    "paymentFrequency"
                  ) ?? ""
                ),
              scheduledPayment:
                String(
                  data.get(
                    "scheduledPayment"
                  ) ?? ""
                ),
              scheduledEscrow:
                String(
                  data.get(
                    "scheduledEscrow"
                  ) ?? ""
                ),
              rateType:
                String(
                  data.get(
                    "rateType"
                  ) ?? ""
                ),
              lastAccrualDate:
                String(
                  data.get(
                    "lastAccrualDate"
                  ) ?? ""
                )
            })
          }
        );

      const body =
        await response.json() as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          body.error ??
            "Loan terms could not be saved."
        );
      }

      setNotice(
        `Loan terms saved for ${configuring.billName}.`
      );

      setConfiguring(null);

      await loadRecords();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Loan terms could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function previewPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    setPreview(null);

    const form =
      event.currentTarget;

    const data =
      new FormData(form);

    const payload = {
      action: "preview-payment",
      obligationId:
        selected.obligationId,
      sourceKey:
        String(
          data.get("sourceKey") ?? ""
        ),
      paidOn:
        String(
          data.get("paidOn") ?? ""
        ),
      totalPayment:
        String(
          data.get("totalPayment") ??
            ""
        ),
      escrow:
        String(
          data.get("escrow") ?? ""
        ),
      fees:
        String(
          data.get("fees") ?? ""
        ),
      extraPrincipal:
        String(
          data.get(
            "extraPrincipal"
          ) ?? ""
        ),
      interestOverride:
        String(
          data.get(
            "interestOverride"
          ) ?? ""
        ),
      note:
        String(
          data.get("note") ?? ""
        )
    };

    try {
      const response =
        await fetch(
          "/api/personal/loan-payments",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(payload)
          }
        );

      const body =
        await response.json() as {
          preview?: PaymentPreview;
          error?: string;
        };

      if (
        !response.ok ||
        !body.preview
      ) {
        throw new Error(
          body.error ??
            "Payment could not be previewed."
        );
      }

      setPreview(body.preview);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Payment could not be previewed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmPayment() {
    if (
      !selected ||
      !preview
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    const form =
      document.querySelector(
        "#loan-payment-form"
      ) as HTMLFormElement | null;

    if (!form) {
      setSaving(false);
      return;
    }

    const data =
      new FormData(form);

    try {
      const response =
        await fetch(
          "/api/personal/loan-payments",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              action:
                "apply-payment",
              obligationId:
                selected.obligationId,
              sourceKey:
                String(
                  data.get(
                    "sourceKey"
                  ) ?? ""
                ),
              paidOn:
                String(
                  data.get("paidOn") ??
                    ""
                ),
              totalPayment:
                String(
                  data.get(
                    "totalPayment"
                  ) ?? ""
                ),
              escrow:
                String(
                  data.get("escrow") ??
                    ""
                ),
              fees:
                String(
                  data.get("fees") ??
                    ""
                ),
              extraPrincipal:
                String(
                  data.get(
                    "extraPrincipal"
                  ) ?? ""
                ),
              interestOverride:
                String(
                  data.get(
                    "interestOverride"
                  ) ?? ""
                ),
              note:
                String(
                  data.get("note") ??
                    ""
                )
            })
          }
        );

      const body =
        await response.json() as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          body.error ??
            "Payment could not be applied."
        );
      }

      setNotice(
        `Payment applied. New principal balance: ${money(
          preview.projectedBalance
        )}.`
      );

      setPreview(null);
      setSelected(null);

      await loadRecords();

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Payment could not be applied."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={styles.workspace}
    >
      <header
        className={styles.header}
      >
        <div>
          <span>
            Loan payment ledger
          </span>

          <h2>
            Record debt payments
          </h2>

          <p>
            Review the payment allocation
            before principal and net worth
            are updated.
          </p>
        </div>
      </header>

      {error ? (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          className={styles.success}
          role="status"
        >
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.empty}>
          Loading linked loans...
        </div>
      ) : null}

      {!loading &&
      records.length === 0 ? (
        <div className={styles.empty}>
          No active bills are linked to a
          configured liability yet.
        </div>
      ) : null}

      <div
        className={styles.grid}
      >
        {records.map((record) => (
          <article
            className={styles.card}
            key={record.liabilityId}
          >
            <div>
              <span>
                {record.liabilityType
                  .replaceAll("_", " ")}
              </span>

              <h3>
                {record.billName}
              </h3>

              <p>
                {record.institution ??
                  record.liabilityName}
              </p>
            </div>

            <dl>
              <div>
                <dt>
                  Principal balance
                </dt>
                <dd>
                  {money(
                    record.currentBalance
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Scheduled payment
                </dt>
                <dd>
                  {record.expectedPayment ===
                  null
                    ? "Not set"
                    : money(
                        record.expectedPayment
                      )}
                </dd>
              </div>

              <div>
                <dt>
                  Interest rate
                </dt>
                <dd>
                  {record.annualInterestRate ===
                  null
                    ? "Not set"
                    : `${record.annualInterestRate.toFixed(
                        2
                      )}%`}
                </dd>
              </div>
            </dl>

            {record
              .projectedPayoffDate ? (
              <div
                className={
                  styles.projection
                }
              >
                <div>
                  <span>
                    Projected payoff
                  </span>
                  <strong>
                    {
                      record
                        .projectedPayoffDate
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Remaining payments
                  </span>
                  <strong>
                    {
                      record
                        .projectedRemainingPayments
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Remaining interest
                  </span>
                  <strong>
                    {money(
                      record
                        .estimatedRemainingInterest ??
                      0
                    )}
                  </strong>
                </div>
              </div>
            ) : null}

            {record.needsReconciliation ? (
              <p
                className={
                  styles.reconciliationWarning
                }
              >
                Statement balance differs
                from the calculated balance
                by{" "}
                {money(
                  Math.abs(
                    record.balanceDifference ??
                    0
                  )
                )}
                .
              </p>
            ) : null}

            {!record.hasConfiguredTerms ? (
              <p
                className={styles.warning}
              >
                Configure loan terms before
                recording a payment.
              </p>
            ) : null}

            <div
              className={
                styles.cardActions
              }
            >
              <button
                disabled={
                  !record.hasConfiguredTerms
                }
                onClick={() => {
                  setModeling(record);
                  setScenario(null);
                  setReconciling(null);
                  setConfiguring(null);
                  setSelected(null);
                  setPreview(null);
                  setError(null);
                  setNotice(null);
                }}
                type="button"
              >
                Model extra payment
              </button>

              <button
                onClick={() => {
                  setReconciling(record);
                  setModeling(null);
                  setScenario(null);
                  setConfiguring(null);
                  setSelected(null);
                  setPreview(null);
                  setError(null);
                  setNotice(null);
                }}
                type="button"
              >
                Reconcile balance
              </button>

              <button
                onClick={() => {
                  setConfiguring(record);
                  setModeling(null);
                  setScenario(null);
                  setReconciling(null);
                  setSelected(null);
                  setPreview(null);
                  setError(null);
                  setNotice(null);
                }}
                type="button"
              >
                {record.hasConfiguredTerms
                  ? "Edit loan terms"
                  : "Configure loan terms"}
              </button>

              <button
                disabled={
                  !record.hasConfiguredTerms
                }
                onClick={() => {
                  setSelected(record);
                  setModeling(null);
                  setScenario(null);
                  setConfiguring(null);
                  setPreview(null);
                  setError(null);
                  setNotice(null);
                }}
                type="button"
              >
                Record payment
              </button>
            </div>

            {record.recentPayments.length >
            0 ? (
              <section
                className={
                  styles.history
                }
              >
                <h4>
                  Recent payments
                </h4>

                {record.recentPayments.map(
                  (payment) => (
                    <article
                      key={
                        payment.paymentId
                      }
                    >
                      <div>
                        <strong>
                          {payment.paidOn}
                        </strong>

                        <span>
                          {money(
                            payment.totalPayment
                          )}
                        </span>
                      </div>

                      <dl>
                        <div>
                          <dt>Interest</dt>
                          <dd>
                            {money(
                              payment.interest
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>Principal</dt>
                          <dd>
                            {money(
                              payment.principal
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Closing balance
                          </dt>
                          <dd>
                            {money(
                              payment.closingBalance
                            )}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  )
                )}
              </section>
            ) : null}
          </article>
        ))}
      </div>

      {modeling ? (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <header>
              <div>
                <span>
                  Payoff modeling
                </span>

                <h3>
                  {modeling.billName}
                </h3>
              </div>

              <button
                aria-label="Close payoff modeling"
                onClick={() => {
                  setModeling(null);
                  setScenario(null);
                }}
                type="button"
              >
                ×
              </button>
            </header>

            <form
              onSubmit={
                modelExtraPayment
              }
            >
              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    One-time extra principal
                  </span>

                  <input
                    defaultValue="0"
                    min="0"
                    name="oneTimeExtraPayment"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Recurring extra payment
                  </span>

                  <input
                    defaultValue="0"
                    min="0"
                    name="recurringExtraPayment"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>
                    Projection start date
                  </span>

                  <input
                    defaultValue={TODAY}
                    name="projectionStartDate"
                    required
                    type="date"
                  />
                </label>
              </div>

              <button
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Calculating..."
                  : "Calculate scenario"}
              </button>
            </form>

            {scenario ? (
              <section
                className={
                  styles.scenario
                }
              >
                <h4>
                  Modeled result
                </h4>

                <div
                  className={
                    styles.scenarioSummary
                  }
                >
                  <div>
                    <span>
                      Current payoff
                    </span>
                    <strong>
                      {scenario
                        .baselinePayoffDate ??
                        "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Modeled payoff
                    </span>
                    <strong>
                      {scenario
                        .modeledPayoffDate ??
                        "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payments saved
                    </span>
                    <strong>
                      {scenario
                        .paymentsSaved ??
                        "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Interest saved
                    </span>
                    <strong>
                      {scenario
                        .interestSaved ===
                      null
                        ? "Unavailable"
                        : money(
                            scenario
                              .interestSaved
                          )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Modeled P&I payment
                    </span>
                    <strong>
                      {money(
                        scenario
                          .modeledPrincipalAndInterest
                      )}
                    </strong>
                  </div>
                </div>

                {scenario
                  .amortization.length >
                0 ? (
                  <div
                    className={
                      styles.amortization
                    }
                  >
                    <h4>
                      Next 12 payments
                    </h4>

                    <div
                      className={
                        styles.amortizationScroll
                      }
                    >
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>
                              Payment
                            </th>
                            <th>
                              Interest
                            </th>
                            <th>
                              Principal
                            </th>
                            <th>
                              Extra
                            </th>
                            <th>
                              Balance
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {scenario
                            .amortization
                            .map(
                              (entry) => (
                                <tr
                                  key={
                                    entry
                                      .paymentNumber
                                  }
                                >
                                  <td>
                                    {
                                      entry
                                        .paymentDate
                                    }
                                  </td>
                                  <td>
                                    {money(
                                      entry
                                        .payment
                                    )}
                                  </td>
                                  <td>
                                    {money(
                                      entry
                                        .interest
                                    )}
                                  </td>
                                  <td>
                                    {money(
                                      entry
                                        .principal
                                    )}
                                  </td>
                                  <td>
                                    {money(
                                      entry
                                        .extraPrincipal
                                    )}
                                  </td>
                                  <td>
                                    {money(
                                      entry
                                        .closingBalance
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={() => {
                    const totalPayment =
                      scenario
                        .modeledPrincipalAndInterest +
                      modeling
                        .scheduledEscrow;

                    setModeledPayment(
                      (current) => ({
                        ...current,
                        [modeling
                          .liabilityId]:
                          totalPayment
                      })
                    );

                    setSelected(
                      modeling
                    );

                    setModeling(null);
                    setScenario(null);
                    setPreview(null);
                  }}
                  type="button"
                >
                  Use modeled payment
                </button>
              </section>
            ) : null}
          </section>
        </div>
      ) : null}

      {reconciling ? (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <header>
              <div>
                <span>
                  Statement reconciliation
                </span>

                <h3>
                  {reconciling.billName}
                </h3>
              </div>

              <button
                aria-label="Close statement reconciliation"
                onClick={() =>
                  setReconciling(null)
                }
                type="button"
              >
                ×
              </button>
            </header>

            <div
              className={
                styles.reconciliationSummary
              }
            >
              <div>
                <span>
                  Calculated balance
                </span>
                <strong>
                  {money(
                    reconciling
                      .currentBalance
                  )}
                </strong>
              </div>

              {reconciling
                .statementBalance !==
              null ? (
                <div>
                  <span>
                    Previous statement
                  </span>
                  <strong>
                    {money(
                      reconciling
                        .statementBalance
                    )}
                  </strong>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={
                reconcileStatement
              }
            >
              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    Statement balance
                  </span>

                  <input
                    min="0"
                    name="statementBalance"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Statement date
                  </span>

                  <input
                    defaultValue={TODAY}
                    name="statementAsOf"
                    required
                    type="date"
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>Note</span>

                  <textarea
                    name="note"
                    placeholder="Statement source or reason for the adjustment"
                    rows={3}
                  />
                </label>
              </div>

              <button
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Accepting..."
                  : "Accept statement balance"}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {configuring ? (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <header>
              <div>
                <span>
                  Loan configuration
                </span>

                <h3>
                  {configuring.billName}
                </h3>
              </div>

              <button
                aria-label="Close loan terms"
                onClick={() =>
                  setConfiguring(null)
                }
                type="button"
              >
                ×
              </button>
            </header>

            <form
              onSubmit={saveLoanTerms}
            >
              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    Calculation method
                  </span>

                  <select
                    defaultValue={
                      configuring
                        .calculationMethod ??
                      (
                        configuring
                          .liabilityType ===
                        "auto_loan"
                          ? "daily_simple_interest"
                          : "monthly_amortization"
                      )
                    }
                    name="calculationMethod"
                  >
                    <option value="monthly_amortization">
                      Monthly amortization
                    </option>
                    <option value="daily_simple_interest">
                      Daily simple interest
                    </option>
                    <option value="interest_only">
                      Interest only
                    </option>
                    <option value="manual">
                      Manual allocation
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Interest rate
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .annualInterestRate ??
                      ""
                    }
                    max="100"
                    min="0"
                    name="annualInterestRate"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Original term, months
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .originalTermMonths ??
                      ""
                    }
                    min="1"
                    name="originalTermMonths"
                    step="1"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Remaining term, months
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .remainingTermMonths ??
                      ""
                    }
                    min="0"
                    name="remainingTermMonths"
                    step="1"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Loan start date
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .loanStartDate ??
                      ""
                    }
                    name="loanStartDate"
                    type="date"
                  />
                </label>

                <label>
                  <span>
                    First payment date
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .firstPaymentDate ??
                      ""
                    }
                    name="firstPaymentDate"
                    type="date"
                  />
                </label>

                <label>
                  <span>
                    Payment frequency
                  </span>

                  <select
                    defaultValue={
                      configuring
                        .paymentFrequency ??
                      "monthly"
                    }
                    name="paymentFrequency"
                  >
                    <option value="monthly">
                      Monthly
                    </option>
                    <option value="biweekly">
                      Every two weeks
                    </option>
                    <option value="weekly">
                      Weekly
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Rate type
                  </span>

                  <select
                    defaultValue={
                      configuring.rateType ??
                      "fixed"
                    }
                    name="rateType"
                  >
                    <option value="fixed">
                      Fixed
                    </option>
                    <option value="variable">
                      Variable
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Scheduled payment
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .scheduledPayment ??
                      configuring
                        .expectedPayment ??
                      ""
                    }
                    min="0"
                    name="scheduledPayment"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Scheduled escrow
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .scheduledEscrow
                    }
                    min="0"
                    name="scheduledEscrow"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>
                    Last confirmed balance
                    or accrual date
                  </span>

                  <input
                    defaultValue={
                      configuring
                        .lastAccrualDate ??
                      configuring
                        .balanceAsOf ??
                      TODAY
                    }
                    name="lastAccrualDate"
                    type="date"
                  />
                </label>
              </div>

              <button
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Saving..."
                  : "Save loan terms"}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {selected ? (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <header>
              <div>
                <span>
                  Payment review
                </span>

                <h3>
                  {selected.billName}
                </h3>
              </div>

              <button
                aria-label="Close payment form"
                onClick={() => {
                  setSelected(null);
                  setPreview(null);
                }}
                type="button"
              >
                ×
              </button>
            </header>

            <form
              id="loan-payment-form"
              onSubmit={previewPayment}
            >
              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    Payment date
                  </span>
                  <input
                    defaultValue={TODAY}
                    name="paidOn"
                    required
                    type="date"
                  />
                </label>

                <label>
                  <span>
                    Total payment
                  </span>
                  <input
                    defaultValue={
                      modeledPayment[
                        selected.liabilityId
                      ] ??
                      selected
                        .expectedPayment ??
                      ""
                    }
                    min="0.01"
                    name="totalPayment"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>Escrow</span>
                  <input
                    defaultValue={
                      selected
                        .scheduledEscrow
                    }
                    min="0"
                    name="escrow"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>Fees</span>
                  <input
                    defaultValue="0"
                    min="0"
                    name="fees"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Extra principal
                  </span>
                  <input
                    defaultValue="0"
                    min="0"
                    name="extraPrincipal"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Interest override
                  </span>
                  <input
                    min="0"
                    name="interestOverride"
                    placeholder="Leave blank to calculate"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>
                    Unique payment reference
                  </span>
                  <input
                    defaultValue={`${selected.obligationId}-${TODAY}`}
                    name="sourceKey"
                    required
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>Note</span>
                  <textarea
                    name="note"
                    rows={2}
                  />
                </label>
              </div>

              <button
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Calculating..."
                  : "Review allocation"}
              </button>
            </form>

            {preview ? (
              <section
                className={
                  styles.preview
                }
              >
                <h4>
                  Payment allocation
                </h4>

                <dl>
                  <div>
                    <dt>
                      Opening balance
                    </dt>
                    <dd>
                      {money(
                        preview
                          .openingBalance
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Interest</dt>
                    <dd>
                      {money(
                        preview.interest
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Escrow</dt>
                    <dd>
                      {money(
                        preview.escrow
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Fees</dt>
                    <dd>
                      {money(
                        preview.fees
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Principal reduction
                    </dt>
                    <dd>
                      {money(
                        preview.principal
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Projected balance
                    </dt>
                    <dd>
                      {money(
                        preview
                          .projectedBalance
                      )}
                    </dd>
                  </div>
                </dl>

                <div
                  className={
                    styles.confirmActions
                  }
                >
                  <button
                    disabled={saving}
                    onClick={() =>
                      setPreview(null)
                    }
                    type="button"
                  >
                    Edit payment
                  </button>

                  <button
                    disabled={saving}
                    onClick={
                      confirmPayment
                    }
                    type="button"
                  >
                    {saving
                      ? "Applying..."
                      : "Confirm and apply"}
                  </button>
                </div>
              </section>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}
