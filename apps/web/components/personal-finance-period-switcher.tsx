"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  usePathname
} from "next/navigation";

import {
  personalFinanceNextPeriodKey,
  personalFinancePeriodLabel
} from "../lib/personal-finance-income-schedule";

import type {
  PersonalFinancePeriodSummary
} from "../lib/personal-finance-period-types";

import styles from "./personal-finance-period-switcher.module.css";

const PERIOD_AWARE_PATHS =
  new Set([
    "/personal",
    "/personal/bills",
    "/personal/income",
    "/personal/transactions",
    "/personal/accounts"
  ]);

type PeriodResponse = {
  periods?:
    PersonalFinancePeriodSummary[];

  selectedPeriodKey?:
    string | null;

  period?:
    PersonalFinancePeriodSummary;

  created?: boolean;

  error?: string;
};

export function PersonalFinancePeriodSwitcher() {
  const pathname =
    usePathname();

  const supported =
    pathname !== null &&
    PERIOD_AWARE_PATHS.has(
      pathname
    );

  const [
    periods,
    setPeriods
  ] =
    useState<
      PersonalFinancePeriodSummary[]
    >([]);

  const [
    selectedPeriodKey,
    setSelectedPeriodKey
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    busy,
    setBusy
  ] =
    useState(false);

  const [
    builderOpen,
    setBuilderOpen
  ] =
    useState(false);

  const [
    carryBills,
    setCarryBills
  ] =
    useState(true);

  const [
    carryAccounts,
    setCarryAccounts
  ] =
    useState(true);

  const [
    carryGoal,
    setCarryGoal
  ] =
    useState(true);

  const [
    error,
    setError
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (!supported) {
      return;
    }

    let cancelled =
      false;

    async function loadPeriods() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/personal/periods",
            {
              cache:
                "no-store"
            }
          );

        const body =
          await response.json() as
            PeriodResponse;

        if (!response.ok) {
          throw new Error(
            body.error ??
              "Budget months could not be loaded."
          );
        }

        if (cancelled) {
          return;
        }

        const loadedPeriods =
          body.periods ?? [];

        setPeriods(
          loadedPeriods
        );

        const url =
          new URL(
            window.location.href
          );

        const queryPeriod =
          url.searchParams.get(
            "period"
          );

        const queryIsValid =
          queryPeriod !== null &&
          loadedPeriods.some(
            (period) =>
              period.periodKey ===
              queryPeriod
          );

        const selected =
          queryIsValid
            ? queryPeriod
            : body
                .selectedPeriodKey ??
              loadedPeriods.at(-1)
                ?.periodKey ??
              null;

        setSelectedPeriodKey(
          selected
        );

        if (
          selected &&
          queryPeriod !==
            selected
        ) {
          url.searchParams.set(
            "period",
            selected
          );

          window.history
            .replaceState(
              {},
              "",
              `${url.pathname}${url.search}${url.hash}`
            );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Budget months could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPeriods();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    supported
  ]);

  const selectedIndex =
    useMemo(
      () =>
        periods.findIndex(
          (period) =>
            period.periodKey ===
            selectedPeriodKey
        ),
      [
        periods,
        selectedPeriodKey
      ]
    );

  const selectedPeriod =
    selectedIndex >= 0
      ? periods[
          selectedIndex
        ] ??
        null
      : null;

  const previousPeriod =
    selectedIndex > 0
      ? periods[
          selectedIndex - 1
        ] ??
        null
      : null;

  const nextExistingPeriod =
    selectedIndex >= 0 &&
    selectedIndex <
      periods.length - 1
      ? periods[
          selectedIndex + 1
        ] ??
        null
      : null;

  const nextPeriodKey =
    selectedPeriodKey
      ? personalFinanceNextPeriodKey(
          selectedPeriodKey
        )
      : null;

  const nextPeriodLabel =
    nextPeriodKey
      ? personalFinancePeriodLabel(
          nextPeriodKey
        )
      : null;

  if (
    !supported ||
    loading ||
    !selectedPeriodKey ||
    periods.length === 0
  ) {
    return null;
  }

  async function choosePeriod(
    periodKey: string
  ) {
    if (
      busy ||
      periodKey ===
        selectedPeriodKey
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/personal/periods",
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
                  "select-period",
                periodKey
              })
          }
        );

      const body =
        await response.json() as
          PeriodResponse;

      if (!response.ok) {
        throw new Error(
          body.error ??
            "Budget month could not be selected."
        );
      }

      const url =
        new URL(
          window.location.href
        );

      url.searchParams.set(
        "period",
        periodKey
      );

      window.location.assign(
        `${url.pathname}${url.search}${url.hash}`
      );
    } catch (chooseError) {
      setBusy(false);

      setError(
        chooseError instanceof
          Error
          ? chooseError.message
          : "Budget month could not be selected."
      );
    }
  }

  async function buildNextMonth() {
    if (
      !selectedPeriodKey ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/personal/periods",
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
                  "create-next",

                periodKey:
                  selectedPeriodKey,

                options: {
                  carryBills,
                  carryAccounts,
                  carryGoal
                }
              })
          }
        );

      const body =
        await response.json() as
          PeriodResponse;

      if (
        !response.ok ||
        !body.period
      ) {
        throw new Error(
          body.error ??
            "The next budget month could not be created."
        );
      }

      const url =
        new URL(
          window.location.href
        );

      url.searchParams.set(
        "period",
        body.period.periodKey
      );

      window.location.assign(
        `${url.pathname}${url.search}${url.hash}`
      );
    } catch (buildError) {
      setBusy(false);

      setError(
        buildError instanceof
          Error
          ? buildError.message
          : "The next budget month could not be created."
      );
    }
  }

  return (
    <>
      <section
        aria-label="Budget month"
        className={
          styles.switcher
        }
      >
        <div
          className={
            styles.identity
          }
        >
          <span>
            Budget month
          </span>

          <strong>
            {selectedPeriod
              ?.periodLabel ??
              personalFinancePeriodLabel(
                selectedPeriodKey
              )}
          </strong>
        </div>

        <div
          className={
            styles.controls
          }
        >
          <button
            aria-label="Previous budget month"
            className={
              styles.iconButton
            }
            disabled={
              busy ||
              !previousPeriod
            }
            onClick={() => {
              if (
                previousPeriod
              ) {
                void choosePeriod(
                  previousPeriod
                    .periodKey
                );
              }
            }}
            type="button"
          >
            ‹
          </button>

          <label
            className={
              styles.monthPicker
            }
          >
            <span>
              Select month
            </span>

            <select
              disabled={busy}
              onChange={(
                event
              ) =>
                void choosePeriod(
                  event.target
                    .value
                )
              }
              value={
                selectedPeriodKey
              }
            >
              {periods.map(
                (period) => (
                  <option
                    key={
                      period.periodKey
                    }
                    value={
                      period.periodKey
                    }
                  >
                    {
                      period.periodLabel
                    }
                  </option>
                )
              )}
            </select>
          </label>

          {nextExistingPeriod ? (
            <button
              aria-label="Next budget month"
              className={
                styles.iconButton
              }
              disabled={busy}
              onClick={() =>
                void choosePeriod(
                  nextExistingPeriod
                    .periodKey
                )
              }
              type="button"
            >
              ›
            </button>
          ) : (
            <button
              className={
                styles.buildButton
              }
              disabled={busy}
              onClick={() =>
                setBuilderOpen(
                  true
                )
              }
              type="button"
            >
              Build next month
            </button>
          )}
        </div>

        <div
          className={
            styles.context
          }
        >
          <span>
            {selectedPeriod
              ?.sourceKind ===
            "imported"
              ? "Imported starting month"
              : selectedPeriod
                    ?.status ===
                  "draft"
                ? "Draft month"
                : "Budget period"}
          </span>

          <span
            aria-hidden="true"
          >
            ·
          </span>

          <span>
            Household plan for
            this selected month
          </span>
        </div>

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
      </section>

      {builderOpen &&
      nextPeriodKey &&
      nextPeriodLabel ? (
        <div
          className={
            styles.overlay
          }
          role="presentation"
        >
          <section
            aria-labelledby="build-next-month-title"
            aria-modal="true"
            className={
              styles.builder
            }
            role="dialog"
          >
            <header>
              <div>
                <span>
                  Month builder
                </span>

                <h2
                  id="build-next-month-title"
                >
                  Build{" "}
                  {
                    nextPeriodLabel
                  }
                </h2>
              </div>

              <button
                aria-label="Close month builder"
                className={
                  styles.closeButton
                }
                disabled={busy}
                onClick={() =>
                  setBuilderOpen(
                    false
                  )
                }
                type="button"
              >
                ×
              </button>
            </header>

            <p
              className={
                styles.builderIntro
              }
            >
              Start the next month
              from the current
              household plan.
              Actual bill payments
              reset while recurring
              income is generated
              from your active
              income schedules.
            </p>

            <div
              className={
                styles.optionList
              }
            >
              <label>
                <input
                  checked={
                    carryBills
                  }
                  onChange={(
                    event
                  ) =>
                    setCarryBills(
                      event.target
                        .checked
                    )
                  }
                  type="checkbox"
                />

                <span>
                  <strong>
                    Carry recurring
                    bills
                  </strong>

                  <small>
                    Planned amounts
                    and due days
                    continue.
                    Payments restart
                    at zero.
                  </small>
                </span>
              </label>

              <label>
                <input
                  checked={
                    carryAccounts
                  }
                  onChange={(
                    event
                  ) =>
                    setCarryAccounts(
                      event.target
                        .checked
                    )
                  }
                  type="checkbox"
                />

                <span>
                  <strong>
                    Carry account
                    balances
                  </strong>

                  <small>
                    Current cash and
                    credit balances
                    become the new
                    month's opening
                    snapshot.
                  </small>
                </span>
              </label>

              <label>
                <input
                  checked={
                    carryGoal
                  }
                  onChange={(
                    event
                  ) =>
                    setCarryGoal(
                      event.target
                        .checked
                    )
                  }
                  type="checkbox"
                />

                <span>
                  <strong>
                    Carry month-end
                    target
                  </strong>

                  <small>
                    Keep the current
                    household ending
                    cash target.
                  </small>
                </span>
              </label>
            </div>

            <aside
              className={
                styles.incomeNote
              }
            >
              <strong>
                Recurring income is
                generated
                automatically.
              </strong>

              <span>
                Active weekly,
                biweekly,
                twice-monthly, and
                monthly sources
                generate expected
                deposits for{" "}
                {nextPeriodLabel}.
                One-time
                miscellaneous
                income stays in its
                original month.
              </span>
            </aside>

            <footer>
              <button
                className={
                  styles.cancelButton
                }
                disabled={busy}
                onClick={() =>
                  setBuilderOpen(
                    false
                  )
                }
                type="button"
              >
                Cancel
              </button>

              <button
                className={
                  styles.confirmButton
                }
                disabled={busy}
                onClick={() =>
                  void buildNextMonth()
                }
                type="button"
              >
                {busy
                  ? "Building..."
                  : `Build ${nextPeriodLabel}`}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
