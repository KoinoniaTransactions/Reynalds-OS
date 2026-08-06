"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";

import styles from "./personal-finance-net-worth-workspace.module.css";

type AssetType =
  | "cash"
  | "checking"
  | "savings"
  | "investment"
  | "real_estate"
  | "vehicle"
  | "business"
  | "personal_property"
  | "other";

type LiabilityType =
  | "mortgage"
  | "home_equity"
  | "auto_loan"
  | "credit_card"
  | "personal_loan"
  | "student_loan"
  | "tax_debt"
  | "medical_debt"
  | "other";

type AssetRecord = {
  id: string;
  name: string;
  assetType: AssetType;
  institution: string | null;
  description: string | null;
  value: number;
  valuedOn: string;
  valuationSource: string | null;
};

type LiabilityRecord = {
  id: string;
  obligationId: string | null;
  linkedAssetId: string | null;
  name: string;
  liabilityType: LiabilityType;
  institution: string | null;
  originalBalance: number | null;
  currentBalance: number;
  balanceAsOf: string | null;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  creditLimit: number | null;
  maturityDate: string | null;
  maskedAccountNumber: string | null;
};

type AssetEquity = {
  assetId: string;
  assetName: string;
  assetValueCents: number;
  linkedLiabilityCents: number;
  equityCents: number;
};

type NetWorthCatalog = {
  assets: AssetRecord[];
  liabilities: LiabilityRecord[];
  summary: {
    totalAssetsCents: number;
    totalLiabilitiesCents: number;
    netWorthCents: number;
    assetEquity: AssetEquity[];
    unlinkedLiabilityCents: number;
  };
};

type AssetFormState = {
  name: string;
  assetType: AssetType;
  institution: string;
  description: string;
  value: string;
  valuedOn: string;
  valuationSource: string;
  accountNumber: string;
};

type LiabilityFormState = {
  name: string;
  liabilityType: LiabilityType;
  linkedAssetId: string;
  institution: string;
  originalBalance: string;
  currentBalance: string;
  balanceAsOf: string;
  interestRate: string;
  minimumPayment: string;
  escrowPayment: string;
  creditLimit: string;
  maturityDate: string;
  accountNumber: string;
};

const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY_ASSET: AssetFormState = {
  name: "",
  assetType: "real_estate",
  institution: "",
  description: "",
  value: "",
  valuedOn: TODAY,
  valuationSource: "",
  accountNumber: ""
};

const EMPTY_LIABILITY: LiabilityFormState = {
  name: "",
  liabilityType: "mortgage",
  linkedAssetId: "",
  institution: "",
  originalBalance: "",
  currentBalance: "",
  balanceAsOf: TODAY,
  interestRate: "",
  minimumPayment: "",
  escrowPayment: "",
  creditLimit: "",
  maturityDate: "",
  accountNumber: ""
};

const ASSET_LABELS: Record<AssetType, string> = {
  cash: "Cash",
  checking: "Checking account",
  savings: "Savings account",
  investment: "Investment",
  real_estate: "Real estate",
  vehicle: "Vehicle",
  business: "Business interest",
  personal_property: "Personal property",
  other: "Other asset"
};

const LIABILITY_LABELS: Record<LiabilityType, string> = {
  mortgage: "Mortgage",
  home_equity: "Home-equity loan",
  auto_loan: "Auto loan",
  credit_card: "Credit card",
  personal_loan: "Personal loan",
  student_loan: "Student loan",
  tax_debt: "Tax debt",
  medical_debt: "Medical debt",
  other: "Other liability"
};

function moneyFromCents(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value / 100);
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

function optionalValue(value: string): string | null {
  const trimmed = value.trim();

  return trimmed || null;
}

function inputPayloadValue(value: string): string | null {
  return value.trim() ? value : null;
}

export function PersonalFinanceNetWorthWorkspace() {
  const [catalog, setCatalog] =
    useState<NetWorthCatalog | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [formMode, setFormMode] =
    useState<"asset" | "liability">("asset");

  const [assetForm, setAssetForm] =
    useState<AssetFormState>(EMPTY_ASSET);

  const [liabilityForm, setLiabilityForm] =
    useState<LiabilityFormState>(
      EMPTY_LIABILITY
    );

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/personal/net-worth",
        {
          cache: "no-store"
        }
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ??
            "Net-worth information could not be loaded."
        );
      }

      setCatalog(body.catalog);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Net-worth information could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const linkedAssetOptions = useMemo(
    () =>
      catalog?.assets.filter((asset) => {
        if (
          liabilityForm.liabilityType ===
            "mortgage" ||
          liabilityForm.liabilityType ===
            "home_equity"
        ) {
          return asset.assetType === "real_estate";
        }

        if (
          liabilityForm.liabilityType ===
          "auto_loan"
        ) {
          return asset.assetType === "vehicle";
        }

        return true;
      }) ?? [],
    [
      catalog?.assets,
      liabilityForm.liabilityType
    ]
  );

  const isPropertyDebt =
    liabilityForm.liabilityType === "mortgage" ||
    liabilityForm.liabilityType === "home_equity";

  const isAutoDebt =
    liabilityForm.liabilityType === "auto_loan";

  const isCreditCard =
    liabilityForm.liabilityType === "credit_card";

  async function saveRecord(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setNotice(null);

    const payload =
      formMode === "asset"
        ? {
            recordType: "asset",
            name: assetForm.name,
            assetType: assetForm.assetType,
            institution: optionalValue(
              assetForm.institution
            ),
            description: optionalValue(
              assetForm.description
            ),
            value: assetForm.value,
            valuedOn: assetForm.valuedOn,
            valuationSource: optionalValue(
              assetForm.valuationSource
            ),
            accountNumber: optionalValue(
              assetForm.accountNumber
            )
          }
        : {
            recordType: "liability",
            name: liabilityForm.name,
            liabilityType:
              liabilityForm.liabilityType,
            linkedAssetId: optionalValue(
              liabilityForm.linkedAssetId
            ),
            institution: optionalValue(
              liabilityForm.institution
            ),
            originalBalance:
              inputPayloadValue(
                liabilityForm.originalBalance
              ),
            currentBalance:
              liabilityForm.currentBalance,
            balanceAsOf: optionalValue(
              liabilityForm.balanceAsOf
            ),
            interestRate:
              inputPayloadValue(
                liabilityForm.interestRate
              ),
            minimumPayment:
              inputPayloadValue(
                liabilityForm.minimumPayment
              ),
            escrowPayment:
              inputPayloadValue(
                liabilityForm.escrowPayment
              ),
            creditLimit:
              inputPayloadValue(
                liabilityForm.creditLimit
              ),
            maturityDate: optionalValue(
              liabilityForm.maturityDate
            ),
            accountNumber: optionalValue(
              liabilityForm.accountNumber
            )
          };

    try {
      const response = await fetch(
        "/api/personal/net-worth",
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ??
            "The record could not be saved."
        );
      }

      setCatalog(body.catalog);

      if (formMode === "asset") {
        setAssetForm({
          ...EMPTY_ASSET,
          valuedOn: TODAY
        });

        setNotice("Asset added securely.");
      } else {
        setLiabilityForm({
          ...EMPTY_LIABILITY,
          balanceAsOf: TODAY
        });

        setNotice("Liability added securely.");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The record could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.workspace}>
      {loading ? (
        <section className={styles.stateCard}>
          Loading net-worth records…
        </section>
      ) : null}

      {error ? (
        <section
          className={`${styles.stateCard} ${styles.errorCard}`}
          role="alert"
        >
          <strong>Action needed</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {notice ? (
        <section
          className={`${styles.stateCard} ${styles.successCard}`}
          role="status"
        >
          {notice}
        </section>
      ) : null}

      {catalog ? (
        <>
          <section
            aria-label="Net worth equation"
            className={styles.equation}
          >
            <article className={styles.equationCard}>
              <span>Total assets</span>
              <strong>
                {moneyFromCents(
                  catalog.summary.totalAssetsCents
                )}
              </strong>
              <small>
                {catalog.assets.length} recorded{" "}
                {catalog.assets.length === 1
                  ? "asset"
                  : "assets"}
              </small>
            </article>

            <span
              aria-hidden="true"
              className={styles.operator}
            >
              −
            </span>

            <article className={styles.equationCard}>
              <span>Total liabilities</span>
              <strong>
                {moneyFromCents(
                  catalog.summary
                    .totalLiabilitiesCents
                )}
              </strong>
              <small>
                {catalog.liabilities.length} recorded{" "}
                {catalog.liabilities.length === 1
                  ? "liability"
                  : "liabilities"}
              </small>
            </article>

            <span
              aria-hidden="true"
              className={styles.operator}
            >
              =
            </span>

            <article
              className={`${styles.equationCard} ${styles.netWorthCard}`}
            >
              <span>Net worth</span>
              <strong>
                {moneyFromCents(
                  catalog.summary.netWorthCents
                )}
              </strong>
              <small>
                Assets minus liabilities
              </small>
            </article>
          </section>

          <section className={styles.contentGrid}>
            <form
              className={styles.formCard}
              onSubmit={saveRecord}
            >
              <header className={styles.formHeader}>
                <div>
                  <span className={styles.kicker}>
                    Secure record entry
                  </span>

                  <h2>
                    {formMode === "asset"
                      ? "Add an asset"
                      : "Add a liability"}
                  </h2>
                </div>

                <div
                  aria-label="Record type"
                  className={styles.modeSwitch}
                >
                  <button
                    aria-pressed={
                      formMode === "asset"
                    }
                    onClick={() =>
                      setFormMode("asset")
                    }
                    type="button"
                  >
                    Asset
                  </button>

                  <button
                    aria-pressed={
                      formMode === "liability"
                    }
                    onClick={() =>
                      setFormMode("liability")
                    }
                    type="button"
                  >
                    Liability
                  </button>
                </div>
              </header>

              {formMode === "asset" ? (
                <div className={styles.formGrid}>
                  <label>
                    <span>Asset name</span>
                    <input
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          name: event.target.value
                        }))
                      }
                      placeholder="Primary home"
                      required
                      value={assetForm.name}
                    />
                  </label>

                  <label>
                    <span>Asset type</span>
                    <select
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          assetType:
                            event.target
                              .value as AssetType
                        }))
                      }
                      value={assetForm.assetType}
                    >
                      {Object.entries(
                        ASSET_LABELS
                      ).map(([value, label]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Current value</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          value: event.target.value
                        }))
                      }
                      placeholder="350000"
                      required
                      step="0.01"
                      type="number"
                      value={assetForm.value}
                    />
                  </label>

                  <label>
                    <span>Valuation date</span>
                    <input
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          valuedOn:
                            event.target.value
                        }))
                      }
                      required
                      type="date"
                      value={assetForm.valuedOn}
                    />
                  </label>

                  <label>
                    <span>
                      Institution or holder
                    </span>
                    <input
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          institution:
                            event.target.value
                        }))
                      }
                      placeholder="Bank or ownership source"
                      value={assetForm.institution}
                    />
                  </label>

                  <label>
                    <span>Valuation source</span>
                    <input
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          valuationSource:
                            event.target.value
                        }))
                      }
                      placeholder="Appraisal, statement, estimate"
                      value={
                        assetForm.valuationSource
                      }
                    />
                  </label>

                  <label className={styles.fullWidth}>
                    <span>
                      Full account number
                      <small>
                        Encrypted before storage
                      </small>
                    </span>
                    <input
                      autoComplete="off"
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          accountNumber:
                            event.target.value
                        }))
                      }
                      placeholder="Optional"
                      type="password"
                      value={assetForm.accountNumber}
                    />
                  </label>

                  <label className={styles.fullWidth}>
                    <span>Description</span>
                    <textarea
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          description:
                            event.target.value
                        }))
                      }
                      placeholder="Address, vehicle details, ownership notes, or other context"
                      rows={3}
                      value={assetForm.description}
                    />
                  </label>
                </div>
              ) : (
                <div className={styles.formGrid}>
                  <label>
                    <span>Liability name</span>
                    <input
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            name: event.target.value
                          })
                        )
                      }
                      placeholder="Primary mortgage"
                      required
                      value={liabilityForm.name}
                    />
                  </label>

                  <label>
                    <span>Liability type</span>
                    <select
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            liabilityType:
                              event.target
                                .value as LiabilityType,
                            linkedAssetId: ""
                          })
                        )
                      }
                      value={
                        liabilityForm.liabilityType
                      }
                    >
                      {Object.entries(
                        LIABILITY_LABELS
                      ).map(([value, label]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {(isPropertyDebt ||
                    isAutoDebt) ? (
                    <label>
                      <span>
                        Linked{" "}
                        {isAutoDebt
                          ? "vehicle"
                          : "property"}
                      </span>
                      <select
                        onChange={(event) =>
                          setLiabilityForm(
                            (current) => ({
                              ...current,
                              linkedAssetId:
                                event.target.value
                            })
                          )
                        }
                        value={
                          liabilityForm.linkedAssetId
                        }
                      >
                        <option value="">
                          Select an asset
                        </option>

                        {linkedAssetOptions.map(
                          (asset) => (
                            <option
                              key={asset.id}
                              value={asset.id}
                            >
                              {asset.name} —{" "}
                              {money(asset.value)}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  ) : null}

                  <label>
                    <span>Current balance</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            currentBalance:
                              event.target.value
                          })
                        )
                      }
                      placeholder="240000"
                      required
                      step="0.01"
                      type="number"
                      value={
                        liabilityForm.currentBalance
                      }
                    />
                  </label>

                  <label>
                    <span>Balance date</span>
                    <input
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            balanceAsOf:
                              event.target.value
                          })
                        )
                      }
                      type="date"
                      value={
                        liabilityForm.balanceAsOf
                      }
                    />
                  </label>

                  <label>
                    <span>Original balance</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            originalBalance:
                              event.target.value
                          })
                        )
                      }
                      placeholder="275000"
                      step="0.01"
                      type="number"
                      value={
                        liabilityForm.originalBalance
                      }
                    />
                  </label>

                  <label>
                    <span>Interest rate</span>
                    <input
                      inputMode="decimal"
                      max="100"
                      min="0"
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            interestRate:
                              event.target.value
                          })
                        )
                      }
                      placeholder="6.25"
                      step="0.01"
                      type="number"
                      value={
                        liabilityForm.interestRate
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {isCreditCard
                        ? "Minimum payment"
                        : "Regular payment"}
                    </span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            minimumPayment:
                              event.target.value
                          })
                        )
                      }
                      placeholder="1850"
                      step="0.01"
                      type="number"
                      value={
                        liabilityForm.minimumPayment
                      }
                    />
                  </label>

                  {isPropertyDebt ? (
                    <label>
                      <span>Escrow amount</span>
                      <input
                        inputMode="decimal"
                        min="0"
                        onChange={(event) =>
                          setLiabilityForm(
                            (current) => ({
                              ...current,
                              escrowPayment:
                                event.target.value
                            })
                          )
                        }
                        placeholder="550"
                        step="0.01"
                        type="number"
                        value={
                          liabilityForm.escrowPayment
                        }
                      />
                    </label>
                  ) : null}

                  {isCreditCard ? (
                    <label>
                      <span>Credit limit</span>
                      <input
                        inputMode="decimal"
                        min="0"
                        onChange={(event) =>
                          setLiabilityForm(
                            (current) => ({
                              ...current,
                              creditLimit:
                                event.target.value
                            })
                          )
                        }
                        placeholder="15000"
                        step="0.01"
                        type="number"
                        value={
                          liabilityForm.creditLimit
                        }
                      />
                    </label>
                  ) : null}

                  {!isCreditCard ? (
                    <label>
                      <span>Maturity date</span>
                      <input
                        onChange={(event) =>
                          setLiabilityForm(
                            (current) => ({
                              ...current,
                              maturityDate:
                                event.target.value
                            })
                          )
                        }
                        type="date"
                        value={
                          liabilityForm.maturityDate
                        }
                      />
                    </label>
                  ) : null}

                  <label>
                    <span>Lender or institution</span>
                    <input
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            institution:
                              event.target.value
                          })
                        )
                      }
                      placeholder="Mortgage company or lender"
                      value={
                        liabilityForm.institution
                      }
                    />
                  </label>

                  <label className={styles.fullWidth}>
                    <span>
                      Full account number
                      <small>
                        Encrypted before storage
                      </small>
                    </span>
                    <input
                      autoComplete="off"
                      onChange={(event) =>
                        setLiabilityForm(
                          (current) => ({
                            ...current,
                            accountNumber:
                              event.target.value
                          })
                        )
                      }
                      placeholder="Optional"
                      type="password"
                      value={
                        liabilityForm.accountNumber
                      }
                    />
                  </label>
                </div>
              )}

              <footer className={styles.formFooter}>
                <span>
                  Full identifiers are never returned by
                  the normal catalog API.
                </span>

                <button
                  disabled={saving}
                  type="submit"
                >
                  {saving
                    ? "Saving…"
                    : formMode === "asset"
                      ? "Add asset"
                      : "Add liability"}
                </button>
              </footer>
            </form>

            <div className={styles.recordColumn}>
              <section className={styles.listCard}>
                <header className={styles.listHeader}>
                  <div>
                    <span className={styles.kicker}>
                      What you own
                    </span>
                    <h2>Assets</h2>
                  </div>

                  <strong>
                    {catalog.assets.length}
                  </strong>
                </header>

                {catalog.assets.length ? (
                  <div className={styles.recordList}>
                    {catalog.assets.map((asset) => {
                      const equity =
                        catalog.summary.assetEquity.find(
                          (item) =>
                            item.assetId === asset.id
                        );

                      return (
                        <article
                          className={styles.record}
                          key={asset.id}
                        >
                          <div>
                            <span
                              className={
                                styles.recordType
                              }
                            >
                              {
                                ASSET_LABELS[
                                  asset.assetType
                                ]
                              }
                            </span>

                            <strong>
                              {asset.name}
                            </strong>

                            <small>
                              Value as of{" "}
                              {asset.valuedOn}
                            </small>
                          </div>

                          <div
                            className={
                              styles.recordValues
                            }
                          >
                            <strong>
                              {money(asset.value)}
                            </strong>

                            {equity &&
                            equity.linkedLiabilityCents >
                              0 ? (
                              <small>
                                Equity{" "}
                                {moneyFromCents(
                                  equity.equityCents
                                )}
                              </small>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    Add cash, property, vehicles, or other
                    owned assets to begin the equation.
                  </div>
                )}
              </section>

              <section className={styles.listCard}>
                <header className={styles.listHeader}>
                  <div>
                    <span className={styles.kicker}>
                      What you owe
                    </span>
                    <h2>Liabilities</h2>
                  </div>

                  <strong>
                    {catalog.liabilities.length}
                  </strong>
                </header>

                {catalog.liabilities.length ? (
                  <div className={styles.recordList}>
                    {catalog.liabilities.map(
                      (liability) => (
                        <article
                          className={styles.record}
                          key={liability.id}
                        >
                          <div>
                            <span
                              className={
                                styles.recordType
                              }
                            >
                              {
                                LIABILITY_LABELS[
                                  liability
                                    .liabilityType
                                ]
                              }
                            </span>

                            <strong>
                              {liability.name}
                            </strong>

                            <small>
                              {liability
                                .maskedAccountNumber ??
                                "No account number stored"}
                            </small>
                          </div>

                          <div
                            className={
                              styles.recordValues
                            }
                          >
                            <strong>
                              {money(
                                liability.currentBalance
                              )}
                            </strong>

                            {liability.interestRate !==
                            null ? (
                              <small>
                                {
                                  liability.interestRate
                                }
                                % interest
                              </small>
                            ) : null}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    Add mortgages, vehicle loans, cards, or
                    other outstanding debt.
                  </div>
                )}
              </section>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
