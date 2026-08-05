"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type {
  PersonalFinanceInboxTransaction
} from "../lib/personal-finance-transaction-inbox-local";

import styles from "./personal-finance-mvp.module.css";

type Target = {
  key: string;
  label: string;
  type: "bill" | "income" | "category";
};

type AllocationDraft = {
  targetKey: string;
  amount: string;
  note: string;
};

type ReconciliationResponse = {
  reconciliation?: {
    reviewStatus: "unreviewed" | "reconciled";
    budgetMonth: string | null;
    targets: Target[];
    allocations: Array<{
      id: string;
      targetKey: string;
      targetLabel: string;
      amountCents: number;
      note: string | null;
    }>;
  };
  error?: string;
};

type Props = {
  transactionId: string;
  classification:
    PersonalFinanceInboxTransaction["classification"];
  reviewStatus:
    PersonalFinanceInboxTransaction["reviewStatus"];
  amountCents: number;
};

function moneyFromCents(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value / 100);
}

function parseAmountToCents(value: string): number | null {
  const normalized = value
    .trim()
    .replace(/[$,\s]/g, "");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function classificationNeedsAllocations(
  classification:
    PersonalFinanceInboxTransaction["classification"]
): boolean {
  return (
    classification === "expense" ||
    classification === "income" ||
    classification === "refund"
  );
}

export function PersonalFinanceTransactionReconciliationControl({
  transactionId,
  classification,
  reviewStatus,
  amountCents
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const [isSaving, setIsSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [budgetMonth, setBudgetMonth] =
    useState<string | null>(null);
  const [targets, setTargets] =
    useState<Target[]>([]);
  const [allocations, setAllocations] =
    useState<AllocationDraft[]>([]);

  const needsAllocations =
    classificationNeedsAllocations(classification);

  const enteredTotalCents = allocations.reduce(
    (total, allocation) =>
      total +
      (parseAmountToCents(allocation.amount) ?? 0),
    0
  );

  const expectedTotalCents = Math.abs(amountCents);
  const totalMatches =
    enteredTotalCents === expectedTotalCents;

  async function readReconciliation() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal/transactions/${encodeURIComponent(
          transactionId
        )}/reconciliation`,
        {
          method: "GET",
          headers: {
            accept: "application/json"
          }
        }
      );

      const result =
        (await response.json()) as ReconciliationResponse;

      if (!response.ok || !result.reconciliation) {
        throw new Error(
          result.error ??
            "The reconciliation details could not be loaded."
        );
      }

      setBudgetMonth(
        result.reconciliation.budgetMonth
      );
      setTargets(result.reconciliation.targets);

      const existing =
        result.reconciliation.allocations;

      if (existing.length > 0) {
        setAllocations(
          existing.map((allocation) => ({
            targetKey: allocation.targetKey,
            amount: (
              Math.abs(allocation.amountCents) / 100
            ).toFixed(2),
            note: allocation.note ?? ""
          }))
        );
      } else {
        setAllocations([
          {
            targetKey:
              result.reconciliation.targets[0]?.key ??
              "",
            amount: (
              Math.abs(amountCents) / 100
            ).toFixed(2),
            note: ""
          }
        ]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The reconciliation details could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveReconciliation({
    reconciled
  }: {
    reconciled: boolean;
  }) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const sign = amountCents < 0 ? -1 : 1;

      const payloadAllocations =
        reconciled && needsAllocations
          ? allocations.map((allocation) => {
              const absoluteCents =
                parseAmountToCents(
                  allocation.amount
                );

              if (
                !allocation.targetKey ||
                absoluteCents === null
              ) {
                throw new Error(
                  "Every split requires a target and a valid positive amount."
                );
              }

              return {
                targetKey: allocation.targetKey,
                amountCents:
                  sign * absoluteCents,
                note: allocation.note.trim() || null
              };
            })
          : [];

      const response = await fetch(
        `/api/personal/transactions/${encodeURIComponent(
          transactionId
        )}/reconciliation`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            reconciled,
            allocations: payloadAllocations
          })
        }
      );

      const result =
        (await response.json()) as ReconciliationResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The reconciliation could not be saved."
        );
      }

      setIsOpen(false);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The reconciliation could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (reviewStatus === "reconciled") {
    return (
      <div className={styles.reconciliationControl}>
        <span className={`${styles.status} ${styles.statusPaid}`}>
          Reconciled
        </span>

        <button
          className={styles.reconciliationSecondaryButton}
          disabled={isSaving}
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Undo this reconciliation and remove its budget allocations?"
              )
            ) {
              void saveReconciliation({
                reconciled: false
              });
            }
          }}
        >
          {isSaving ? "Undoing..." : "Undo"}
        </button>

        {error ? (
          <span
            className={styles.reconciliationError}
            role="alert"
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  if (classification === "unknown") {
    return (
      <div className={styles.reconciliationControl}>
        <span className={`${styles.status} ${styles.statusPartial}`}>
          Unreconciled
        </span>

        <button
          className={styles.reconciliationSecondaryButton}
          disabled
          title="Classify this transaction before reconciling it."
          type="button"
        >
          Classify first
        </button>
      </div>
    );
  }

  if (!needsAllocations) {
    return (
      <div className={styles.reconciliationControl}>
        <span className={`${styles.status} ${styles.statusPartial}`}>
          Unreconciled
        </span>

        <button
          className={styles.reconciliationPrimaryButton}
          disabled={isSaving}
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Reconcile this ${classification} transaction without a budget allocation?`
              )
            ) {
              void saveReconciliation({
                reconciled: true
              });
            }
          }}
        >
          {isSaving ? "Saving..." : "Reconcile"}
        </button>

        {error ? (
          <span
            className={styles.reconciliationError}
            role="alert"
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.reconciliationControl}>
      <span className={`${styles.status} ${styles.statusPartial}`}>
        Unreconciled
      </span>

      <button
        className={styles.reconciliationPrimaryButton}
        disabled={isLoading || isSaving}
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen && targets.length === 0) {
            void readReconciliation();
          }
        }}
      >
        {isOpen ? "Close" : "Allocate"}
      </button>

      {isOpen ? (
        <div className={styles.reconciliationEditor}>
          <div className={styles.reconciliationEditorHeader}>
            <strong>
              Split and reconcile
            </strong>

            <span>
              {budgetMonth ??
                (isLoading
                  ? "Loading budget..."
                  : "Budget unavailable")}
            </span>
          </div>

          {allocations.map(
            (allocation, index) => (
              <div
                className={styles.reconciliationAllocationRow}
                key={`allocation-${index}`}
              >
                <select
                  aria-label={`Allocation ${index + 1} target`}
                  className={styles.reconciliationSelect}
                  disabled={isLoading || isSaving}
                  value={allocation.targetKey}
                  onChange={(event) => {
                    const next = [...allocations];
                    next[index] = {
                      ...allocation,
                      targetKey: event.target.value
                    };
                    setAllocations(next);
                  }}
                >
                  <option value="">
                    Select target
                  </option>

                  {targets.map((target) => (
                    <option
                      key={target.key}
                      value={target.key}
                    >
                      {target.label}
                    </option>
                  ))}
                </select>

                <input
                  aria-label={`Allocation ${index + 1} amount`}
                  className={styles.reconciliationAmountInput}
                  disabled={isLoading || isSaving}
                  inputMode="decimal"
                  value={allocation.amount}
                  onChange={(event) => {
                    const next = [...allocations];
                    next[index] = {
                      ...allocation,
                      amount: event.target.value
                    };
                    setAllocations(next);
                  }}
                />

                <input
                  aria-label={`Allocation ${index + 1} note`}
                  className={styles.reconciliationNoteInput}
                  disabled={isLoading || isSaving}
                  placeholder="Optional note"
                  value={allocation.note}
                  onChange={(event) => {
                    const next = [...allocations];
                    next[index] = {
                      ...allocation,
                      note: event.target.value
                    };
                    setAllocations(next);
                  }}
                />

                {allocations.length > 1 ? (
                  <button
                    className={styles.reconciliationRemoveButton}
                    disabled={isSaving}
                    type="button"
                    onClick={() => {
                      setAllocations(
                        allocations.filter(
                          (_, allocationIndex) =>
                            allocationIndex !== index
                        )
                      );
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            )
          )}

          <div className={styles.reconciliationTotals}>
            <span>
              Entered: {moneyFromCents(enteredTotalCents)}
            </span>

            <span>
              Required: {moneyFromCents(expectedTotalCents)}
            </span>
          </div>

          <div className={styles.reconciliationEditorActions}>
            <button
              className={styles.reconciliationSecondaryButton}
              disabled={
                isLoading ||
                isSaving ||
                allocations.length >= 12
              }
              type="button"
              onClick={() => {
                setAllocations([
                  ...allocations,
                  {
                    targetKey: "",
                    amount: "0.00",
                    note: ""
                  }
                ]);
              }}
            >
              Add split
            </button>

            <button
              className={styles.reconciliationPrimaryButton}
              disabled={
                isLoading ||
                isSaving ||
                targets.length === 0 ||
                !totalMatches
              }
              type="button"
              onClick={() => {
                void saveReconciliation({
                  reconciled: true
                });
              }}
            >
              {isSaving
                ? "Saving..."
                : "Save reconciliation"}
            </button>
          </div>

          {!totalMatches ? (
            <span className={styles.reconciliationWarning}>
              Split amounts must equal the full transaction amount.
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <span
          className={styles.reconciliationError}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
