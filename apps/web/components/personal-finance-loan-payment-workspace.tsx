"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";

import styles from "./personal-finance-loan-payment-workspace.module.css";

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
  lastAccrualDate: string | null;
  hasConfiguredTerms: boolean;
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

            {!record.hasConfiguredTerms ? (
              <p
                className={styles.warning}
              >
                Configure loan terms before
                recording a payment.
              </p>
            ) : null}

            <button
              disabled={
                !record.hasConfiguredTerms
              }
              onClick={() => {
                setSelected(record);
                setPreview(null);
                setError(null);
                setNotice(null);
              }}
              type="button"
            >
              Record payment
            </button>
          </article>
        ))}
      </div>

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
