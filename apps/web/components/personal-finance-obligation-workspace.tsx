"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";

import type {
  BudgetBill
} from "../lib/personal-finance-local";

import styles from "./personal-finance-obligation-workspace.module.css";

type ObligationHomeKind =
  | "home"
  | "vehicle"
  | "household"
  | "debt"
  | "other";

type ObligationType =
  | "mortgage"
  | "rent"
  | "auto"
  | "utility"
  | "insurance"
  | "credit_card"
  | "loan"
  | "subscription"
  | "tax"
  | "membership"
  | "other";

type ObligationFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "variable";

type ObligationPaymentMethod =
  | "autopay"
  | "bank_bill_pay"
  | "provider_website"
  | "phone"
  | "check"
  | "manual"
  | "other";

type ObligationHome = {
  id: string;
  name: string;
  kind: ObligationHomeKind;
  description: string | null;
};

type ObligationAccount = {
  id: string;
  institution: string;
  name: string;
  lastFour: string | null;
};

type Obligation = {
  id: string;
  homeId: string | null;
  budgetItemKey: string | null;
  name: string;
  obligationType: ObligationType;
  provider: string | null;
  accountLastFour: string | null;
  expectedAmount: number | null;
  dueDay: number | null;
  frequency: ObligationFrequency;
  paymentMethod: ObligationPaymentMethod;
  fundingAccountId: string | null;
  fundingAccountLabel: string | null;
  paymentUrl: string | null;
  isAutopay: boolean;
  notes: string | null;
  isActive: boolean;
};

type ObligationCatalog = {
  homes: ObligationHome[];
  accounts: ObligationAccount[];
  obligations: Obligation[];
};

type Props = {
  bills: BudgetBill[];
  totals: {
    planned: number;
    paid: number;
    remaining: number;
  };
};

const EMPTY_CATALOG: ObligationCatalog = {
  homes: [],
  accounts: [],
  obligations: []
};

const HOME_KIND_LABELS: Record<
  ObligationHomeKind,
  string
> = {
  home: "Home",
  vehicle: "Vehicle",
  household: "Household",
  debt: "Debt",
  other: "Other"
};

const TYPE_LABELS: Record<
  ObligationType,
  string
> = {
  mortgage: "Mortgage",
  rent: "Rent",
  auto: "Auto payment",
  utility: "Utility",
  insurance: "Insurance",
  credit_card: "Credit card",
  loan: "Loan",
  subscription: "Subscription",
  tax: "Tax",
  membership: "Membership",
  other: "Other"
};

const PAYMENT_LABELS: Record<
  ObligationPaymentMethod,
  string
> = {
  autopay: "Autopay",
  bank_bill_pay: "Bank bill pay",
  provider_website: "Provider website",
  phone: "Phone",
  check: "Check",
  manual: "Manual",
  other: "Other"
};

const FREQUENCY_LABELS: Record<
  ObligationFrequency,
  string
> = {
  weekly: "Weekly",
  biweekly: "Every two weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannual: "Twice yearly",
  annual: "Annual",
  variable: "Variable"
};

function money(
  value: number | null
): string {
  if (value === null) {
    return "Amount not set";
  }

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

function dueLabel(
  dueDay: number | null
): string {
  if (dueDay === null) {
    return "Due date not set";
  }

  return `Due on the ${ordinal(dueDay)}`;
}

function ordinal(
  value: number
): string {
  const remainder100 = value % 100;

  if (
    remainder100 >= 11 &&
    remainder100 <= 13
  ) {
    return `${value}th`;
  }

  if (value % 10 === 1) {
    return `${value}st`;
  }

  if (value % 10 === 2) {
    return `${value}nd`;
  }

  if (value % 10 === 3) {
    return `${value}rd`;
  }

  return `${value}th`;
}

function obligationMatchesBill(
  obligation: Obligation,
  bill: BudgetBill
): boolean {
  if (
    obligation.budgetItemKey &&
    obligation.budgetItemKey === bill.id
  ) {
    return true;
  }

  return (
    obligation.name
      .trim()
      .toLowerCase() ===
    bill.name
      .trim()
      .toLowerCase()
  );
}

export function PersonalFinanceObligationWorkspace({
  bills,
  totals
}: Props) {
  const [
    catalog,
    setCatalog
  ] = useState<ObligationCatalog>(
    EMPTY_CATALOG
  );

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    isFormOpen,
    setIsFormOpen
  ] = useState(false);

  const [
    isSaving,
    setIsSaving
  ] = useState(false);

  const [
    selectedObligationType,
    setSelectedObligationType
  ] = useState<ObligationType>(
    "mortgage"
  );

  const [
    statusMessage,
    setStatusMessage
  ] = useState<string | null>(
    null
  );

  const [
    errorMessage,
    setErrorMessage
  ] = useState<string | null>(
    null
  );

  const loadCatalog = useCallback(
    async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          "/api/personal/obligations",
          {
            cache: "no-store"
          }
        );

        const payload = await response.json() as {
          catalog?: ObligationCatalog;
          error?: string;
        };

        if (
          !response.ok ||
          !payload.catalog
        ) {
          throw new Error(
            payload.error ??
              "Bills could not be loaded."
          );
        }

        setCatalog(payload.catalog);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Bills could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const homeNameById = useMemo(
    () =>
      new Map(
        catalog.homes.map(
          (home) => [
            home.id,
            home.name
          ]
        )
      ),
    [catalog.homes]
  );

  const accountNameById = useMemo(
    () =>
      new Map(
        catalog.accounts.map(
          (account) => [
            account.id,
            [
              account.institution,
              account.name,
              account.lastFour
                ? `•••• ${account.lastFour}`
                : null
            ]
              .filter(Boolean)
              .join(" · ")
          ]
        )
      ),
    [catalog.accounts]
  );

  const groupedHomes = useMemo(
    () => {
      const groups = new Map<
        string,
        {
          id: string;
          name: string;
          kind: ObligationHomeKind;
          obligations: Obligation[];
        }
      >();

      for (
        const home of catalog.homes
      ) {
        groups.set(home.id, {
          id: home.id,
          name: home.name,
          kind: home.kind,
          obligations: []
        });
      }

      for (
        const obligation of
          catalog.obligations
      ) {
        const groupId =
          obligation.homeId ??
          "unassigned";

        const existing =
          groups.get(groupId);

        if (existing) {
          existing.obligations.push(
            obligation
          );
          continue;
        }

        groups.set(groupId, {
          id: groupId,
          name: "Unassigned bills",
          kind: "other",
          obligations: [
            obligation
          ]
        });
      }

      return Array.from(
        groups.values()
      ).filter(
        (group) =>
          group.obligations.length > 0
      );
    },
    [
      catalog.homes,
      catalog.obligations
    ]
  );

  const unconfiguredBills =
    useMemo(
      () =>
        bills.filter(
          (bill) =>
            !catalog.obligations.some(
              (obligation) =>
                obligationMatchesBill(
                  obligation,
                  bill
                )
            )
        ),
      [
        bills,
        catalog.obligations
      ]
    );

  async function submitBill(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const isAutopay =
      formData.get("isAutopay") ===
      "on";

    const payload = {
      name:
        String(
          formData.get("name") ?? ""
        ),
      obligationType:
        String(
          formData.get(
            "obligationType"
          ) ?? "other"
        ),
      homeName:
        String(
          formData.get("homeName") ??
            ""
        ),
      homeKind:
        String(
          formData.get("homeKind") ??
            "other"
        ),
      budgetItemKey:
        String(
          formData.get(
            "budgetItemKey"
          ) ?? ""
        ),
      provider:
        String(
          formData.get("provider") ??
            ""
        ),
      accountLastFour:
        String(
          formData.get(
            "accountLastFour"
          ) ?? ""
        ),
      expectedAmount:
        String(
          formData.get(
            "expectedAmount"
          ) ?? ""
        ),
      dueDay:
        String(
          formData.get("dueDay") ??
            ""
        ),
      frequency:
        String(
          formData.get("frequency") ??
            "monthly"
        ),
      paymentMethod:
        String(
          formData.get(
            "paymentMethod"
          ) ??
            (
              isAutopay
                ? "autopay"
                : "manual"
            )
        ),
      fundingAccountId:
        String(
          formData.get(
            "fundingAccountId"
          ) ?? ""
        ),
      fundingAccountLabel:
        String(
          formData.get(
            "fundingAccountLabel"
          ) ?? ""
        ),
      paymentUrl:
        String(
          formData.get(
            "paymentUrl"
          ) ?? ""
        ),
      isAutopay,
      notes:
        String(
          formData.get("notes") ??
            ""
        ),
      assetName:
        String(
          formData.get("assetName") ??
            ""
        ),
      assetValue:
        String(
          formData.get("assetValue") ??
            ""
        ),
      assetValuedOn:
        String(
          formData.get(
            "assetValuedOn"
          ) ?? ""
        ),
      currentBalance:
        String(
          formData.get(
            "currentBalance"
          ) ?? ""
        ),
      originalBalance:
        String(
          formData.get(
            "originalBalance"
          ) ?? ""
        ),
      interestRate:
        String(
          formData.get(
            "interestRate"
          ) ?? ""
        ),
      minimumPayment:
        String(
          formData.get(
            "minimumPayment"
          ) ?? ""
        ),
      escrowPayment:
        String(
          formData.get(
            "escrowPayment"
          ) ?? ""
        ),
      maturityDate:
        String(
          formData.get(
            "maturityDate"
          ) ?? ""
        ),
      fullAccountNumber:
        String(
          formData.get(
            "fullAccountNumber"
          ) ?? ""
        )
    };

    try {
      const response = await fetch(
        "/api/personal/obligations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            payload
          )
        }
      );

      const result =
        await response.json() as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The bill could not be saved."
        );
      }

      form.reset();
      setSelectedObligationType(
        "mortgage"
      );

      setStatusMessage(
        "Bill saved successfully."
      );

      setIsFormOpen(false);

      await loadCatalog();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The bill could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className={styles.workspace}
      id="bills"
    >
      <header
        className={styles.header}
      >
        <div>
          <span
            className={styles.kicker}
          >
            Household obligations
          </span>

          <h2>
            Bills and financial homes
          </h2>

          <p>
            Organize each payment around
            the home, vehicle, account, or
            service it supports.
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() =>
            setIsFormOpen(
              (current) => !current
            )
          }
          type="button"
        >
          {isFormOpen
            ? "Close"
            : "Add bill"}
        </button>
      </header>

      <div
        className={styles.summary}
      >
        <article>
          <span>Planned</span>
          <strong>
            {money(totals.planned)}
          </strong>
        </article>

        <article>
          <span>Paid</span>
          <strong>
            {money(totals.paid)}
          </strong>
        </article>

        <article>
          <span>Remaining</span>
          <strong
            className={
              totals.remaining > 0
                ? styles.negative
                : styles.positive
            }
          >
            {money(
              totals.remaining
            )}
          </strong>
        </article>

        <article>
          <span>Configured</span>
          <strong>
            {
              catalog.obligations
                .length
            }
          </strong>
        </article>
      </div>

      {isFormOpen ? (
        <form
          className={styles.form}
          onSubmit={submitBill}
        >
          <div
            className={
              styles.formHeading
            }
          >
            <div>
              <span>
                Guided bill setup
              </span>

              <h3>
                Add a financial
                obligation
              </h3>
            </div>

            <p>
              Store provider and
              payment instructions,
              but never passwords,
              PINs, or security codes.
            </p>
          </div>

          <div
            className={styles.formGrid}
          >
            <label>
              <span>Bill name</span>
              <input
                name="name"
                placeholder="Mortgage"
                required
              />
            </label>

            <label>
              <span>Bill type</span>
              <select
                name="obligationType"
                onChange={(event) =>
                  setSelectedObligationType(
                    event.target
                      .value as ObligationType
                  )
                }
                value={
                  selectedObligationType
                }
              >
                {Object.entries(
                  TYPE_LABELS
                ).map(
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

            <label>
              <span>
                What does it belong to?
              </span>
              <input
                name="homeName"
                placeholder="Primary residence"
              />
            </label>

            <label>
              <span>
                Financial home type
              </span>
              <select
                defaultValue="home"
                name="homeKind"
              >
                {Object.entries(
                  HOME_KIND_LABELS
                ).map(
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

            <label>
              <span>
                Link to current plan
              </span>
              <select
                defaultValue=""
                name="budgetItemKey"
              >
                <option value="">
                  Not linked
                </option>

                {bills.map(
                  (bill) => (
                    <option
                      key={bill.id}
                      value={bill.id}
                    >
                      {bill.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>Provider</span>
              <input
                name="provider"
                placeholder="Chase Home Lending"
              />
            </label>

            {selectedObligationType ===
              "mortgage" ||
            selectedObligationType ===
              "auto" ? (
              <>
                <label>
                  <span>
                    {selectedObligationType ===
                    "mortgage"
                      ? "Property name"
                      : "Vehicle name"}
                  </span>
                  <input
                    name="assetName"
                    placeholder={
                      selectedObligationType ===
                      "mortgage"
                        ? "Primary residence"
                        : "2024 Chevrolet Tahoe"
                    }
                  />
                </label>

                <label>
                  <span>
                    Current asset value
                  </span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="assetValue"
                    placeholder="350000.00"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>Valuation date</span>
                  <input
                    defaultValue={
                      new Date()
                        .toISOString()
                        .slice(0, 10)
                    }
                    name="assetValuedOn"
                    type="date"
                  />
                </label>

                <label>
                  <span>
                    Current loan balance
                  </span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="currentBalance"
                    placeholder="240000.00"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Original loan amount
                  </span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="originalBalance"
                    placeholder="275000.00"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>Interest rate</span>
                  <input
                    inputMode="decimal"
                    max="100"
                    min="0"
                    name="interestRate"
                    placeholder="6.25"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  <span>
                    Regular payment
                  </span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="minimumPayment"
                    placeholder="2150.00"
                    step="0.01"
                    type="number"
                  />
                </label>

                {selectedObligationType ===
                "mortgage" ? (
                  <label>
                    <span>
                      Escrow amount
                    </span>
                    <input
                      inputMode="decimal"
                      min="0"
                      name="escrowPayment"
                      placeholder="550.00"
                      step="0.01"
                      type="number"
                    />
                  </label>
                ) : null}

                <label>
                  <span>Maturity date</span>
                  <input
                    name="maturityDate"
                    type="date"
                  />
                </label>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>
                    Full loan account number
                  </span>
                  <input
                    autoComplete="off"
                    name="fullAccountNumber"
                    placeholder="Encrypted before storage"
                    type="password"
                  />
                </label>
              </>
            ) : null}

            <label>
              <span>
                Account last four
              </span>
              <input
                inputMode="numeric"
                maxLength={4}
                name="accountLastFour"
                placeholder="7788"
              />
            </label>

            <label>
              <span>
                Expected amount
              </span>
              <input
                inputMode="decimal"
                min="0"
                name="expectedAmount"
                placeholder="2150.00"
                step="0.01"
                type="number"
              />
            </label>

            <label>
              <span>
                Due day of month
              </span>
              <input
                inputMode="numeric"
                max="31"
                min="1"
                name="dueDay"
                placeholder="2"
                type="number"
              />
            </label>

            <label>
              <span>Frequency</span>
              <select
                defaultValue="monthly"
                name="frequency"
              >
                {Object.entries(
                  FREQUENCY_LABELS
                ).map(
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

            <label>
              <span>How is it paid?</span>
              <select
                defaultValue="manual"
                name="paymentMethod"
              >
                {Object.entries(
                  PAYMENT_LABELS
                ).map(
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

            <label>
              <span>Funding account</span>
              <select
                defaultValue=""
                name="fundingAccountId"
              >
                <option value="">
                  Not linked
                </option>

                {catalog.accounts.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.institution}
                      {" · "}
                      {account.name}
                      {account.lastFour
                        ? ` · •••• ${account.lastFour}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>
                Funding account label
              </span>
              <input
                name="fundingAccountLabel"
                placeholder="Chase checking"
              />
            </label>

            <label>
              <span>
                Payment website
              </span>
              <input
                name="paymentUrl"
                placeholder="https://provider.com/pay"
                type="url"
              />
            </label>

            <label
              className={
                styles.fullWidth
              }
            >
              <span>Notes</span>
              <textarea
                name="notes"
                placeholder="Autopay runs on the 2nd of each month."
                rows={3}
              />
            </label>
          </div>

          <div
            className={
              styles.formActions
            }
          >
            <label
              className={
                styles.checkbox
              }
            >
              <input
                name="isAutopay"
                type="checkbox"
              />

              <span>
                This bill is on
                autopay
              </span>
            </label>

            <button
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Saving..."
                : "Save bill"}
            </button>
          </div>
        </form>
      ) : null}

      {errorMessage ? (
        <div
          className={styles.error}
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div
          className={styles.success}
          role="status"
        >
          {statusMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div
          className={styles.loading}
        >
          Loading financial homes...
        </div>
      ) : null}

      {!isLoading &&
      groupedHomes.length > 0 ? (
        <div
          className={styles.homeGrid}
        >
          {groupedHomes.map(
            (group) => (
              <section
                className={
                  styles.homeCard
                }
                key={group.id}
              >
                <header>
                  <div
                    className={
                      styles.homeIcon
                    }
                    aria-hidden="true"
                  >
                    {HOME_KIND_LABELS[
                      group.kind
                    ].slice(0, 1)}
                  </div>

                  <div>
                    <span>
                      {
                        HOME_KIND_LABELS[
                          group.kind
                        ]
                      }
                    </span>

                    <h3>
                      {group.name}
                    </h3>
                  </div>

                  <strong>
                    {
                      group.obligations
                        .length
                    }
                  </strong>
                </header>

                <div
                  className={
                    styles.obligationList
                  }
                >
                  {group.obligations.map(
                    (obligation) => {
                      const accountLabel =
                        obligation
                          .fundingAccountId
                          ? accountNameById.get(
                              obligation
                                .fundingAccountId
                            )
                          : obligation
                              .fundingAccountLabel;

                      return (
                        <article
                          className={
                            styles.obligation
                          }
                          key={
                            obligation.id
                          }
                        >
                          <div
                            className={
                              styles.obligationTop
                            }
                          >
                            <div>
                              <span
                                className={
                                  styles.type
                                }
                              >
                                {
                                  TYPE_LABELS[
                                    obligation
                                      .obligationType
                                  ]
                                }
                              </span>

                              <h4>
                                {
                                  obligation.name
                                }
                              </h4>

                              <p>
                                {obligation.provider ??
                                  "Provider not set"}
                              </p>
                            </div>

                            <strong>
                              {money(
                                obligation
                                  .expectedAmount
                              )}
                            </strong>
                          </div>

                          <div
                            className={
                              styles.meta
                            }
                          >
                            <span>
                              {dueLabel(
                                obligation
                                  .dueDay
                              )}
                            </span>

                            <span>
                              {
                                FREQUENCY_LABELS[
                                  obligation
                                    .frequency
                                ]
                              }
                            </span>

                            <span>
                              {obligation.isAutopay
                                ? "Autopay"
                                : PAYMENT_LABELS[
                                    obligation
                                      .paymentMethod
                                  ]}
                            </span>
                          </div>

                          <div
                            className={
                              styles.paymentLine
                            }
                          >
                            <div>
                              <span>
                                Paid from
                              </span>

                              <strong>
                                {accountLabel ??
                                  "Funding account not set"}
                              </strong>
                            </div>

                            {obligation.paymentUrl ? (
                              <a
                                href={
                                  obligation.paymentUrl
                                }
                                rel="noreferrer"
                                target="_blank"
                              >
                                Pay bill
                              </a>
                            ) : null}
                          </div>

                          {obligation.accountLastFour ? (
                            <p
                              className={
                                styles.accountNumber
                              }
                            >
                              Provider account
                              {" · "}
                              ••••{" "}
                              {
                                obligation.accountLastFour
                              }
                            </p>
                          ) : null}

                          {obligation.notes ? (
                            <p
                              className={
                                styles.notes
                              }
                            >
                              {
                                obligation.notes
                              }
                            </p>
                          ) : null}
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )
          )}
        </div>
      ) : null}

      {!isLoading &&
      catalog.obligations.length === 0 ? (
        <div
          className={styles.emptyState}
        >
          <span>
            Your financial homes are
            ready.
          </span>

          <h3>
            Add the first detailed
            bill
          </h3>

          <p>
            Start with a mortgage,
            vehicle payment, utility,
            insurance policy, debt, or
            subscription.
          </p>

          <button
            onClick={() =>
              setIsFormOpen(true)
            }
            type="button"
          >
            Add first bill
          </button>
        </div>
      ) : null}

      {unconfiguredBills.length > 0 ? (
        <section
          className={
            styles.unconfigured
          }
        >
          <header>
            <div>
              <span>
                Current monthly plan
              </span>

              <h3>
                Bills needing details
              </h3>

              <p>
                These CSV bill rows
                still participate in
                monthly totals but have
                not been connected to a
                financial home.
              </p>
            </div>

            <strong>
              {
                unconfiguredBills
                  .length
              }
            </strong>
          </header>

          <div
            className={
              styles.unconfiguredList
            }
          >
            {unconfiguredBills.map(
              (bill) => (
                <article
                  key={bill.id}
                >
                  <div>
                    <h4>
                      {bill.name}
                    </h4>

                    <p>
                      {bill.paymentMethod}
                      {" · "}
                      {bill.due
                        .toLowerCase() ===
                      "not entered"
                        ? "Due date not set"
                        : `Due ${bill.due}`}
                    </p>
                  </div>

                  <div
                    className={
                      styles.unconfiguredAmounts
                    }
                  >
                    <span>
                      <small>
                        Planned
                      </small>

                      <strong>
                        {money(
                          bill.budgeted
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
                </article>
              )
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
