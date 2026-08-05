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

type TargetSuggestion = {
  targetKey: string;
  targetLabel: string;
  targetType: "bill" | "income" | "category";
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  recommendedAmountCents: number;
  reasons: string[];
};

type TransferCandidate = {
  transactionId: string;
  accountName: string;
  postedDate: string;
  displayDescription: string;
  amountCents: number;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  reasons: string[];
  status: "suggested" | "confirmed" | "rejected";
};

type MatchingResponse = {
  matching?: {
    suggestions: TargetSuggestion[];
    transferCandidates: TransferCandidate[];
    confirmedTransfer:
      | TransferCandidate
      | null;
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

function parseAmountToCents(
  value: string
): number | null {
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

function confidencePercent(
  value: number
): string {
  return `${Math.round(value * 100)}%`;
}

async function readJson<ResponseBody>(
  response: Response
): Promise<ResponseBody> {
  return await response.json() as ResponseBody;
}

export function PersonalFinanceTransactionReconciliationControl({
  transactionId,
  classification,
  reviewStatus,
  amountCents
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isPairSaving, setIsPairSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [matchingWarning, setMatchingWarning] =
    useState<string | null>(null);

  const [budgetMonth, setBudgetMonth] =
    useState<string | null>(null);

  const [targets, setTargets] =
    useState<Target[]>([]);

  const [allocations, setAllocations] =
    useState<AllocationDraft[]>([]);

  const [suggestions, setSuggestions] =
    useState<TargetSuggestion[]>([]);

  const [
    transferCandidates,
    setTransferCandidates
  ] = useState<TransferCandidate[]>([]);

  const [
    confirmedTransfer,
    setConfirmedTransfer
  ] = useState<TransferCandidate | null>(
    null
  );

  const needsAllocations =
    classificationNeedsAllocations(classification);

  const enteredTotalCents = allocations.reduce(
    (total, allocation) =>
      total +
      (parseAmountToCents(
        allocation.amount
      ) ?? 0),
    0
  );

  const expectedTotalCents =
    Math.abs(amountCents);

  const totalMatches =
    enteredTotalCents ===
    expectedTotalCents;

  async function fetchMatching(): Promise<
    NonNullable<MatchingResponse["matching"]>
  > {
    const response = await fetch(
      `/api/personal/transactions/${encodeURIComponent(
        transactionId
      )}/matching`,
      {
        method: "GET",
        headers: {
          accept: "application/json"
        }
      }
    );

    const result =
      await readJson<MatchingResponse>(
        response
      );

    if (!response.ok || !result.matching) {
      throw new Error(
        result.error ??
          "Matching suggestions could not be loaded."
      );
    }

    return result.matching;
  }

  function applyMatchingState(
    matching: NonNullable<
      MatchingResponse["matching"]
    >
  ) {
    setSuggestions(matching.suggestions);

    setTransferCandidates(
      matching.transferCandidates
    );

    setConfirmedTransfer(
      matching.confirmedTransfer
    );
  }

  async function loadAllocationEditor() {
    setIsLoading(true);
    setError(null);
    setMatchingWarning(null);

    try {
      const reconciliationResponse =
        await fetch(
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

      const reconciliationResult =
        await readJson<ReconciliationResponse>(
          reconciliationResponse
        );

      if (
        !reconciliationResponse.ok ||
        !reconciliationResult.reconciliation
      ) {
        throw new Error(
          reconciliationResult.error ??
            "The reconciliation details could not be loaded."
        );
      }

      const reconciliation =
        reconciliationResult.reconciliation;

      setBudgetMonth(
        reconciliation.budgetMonth
      );

      setTargets(reconciliation.targets);

      let matching:
        | NonNullable<
            MatchingResponse["matching"]
          >
        | null = null;

      try {
        matching = await fetchMatching();
        applyMatchingState(matching);
      } catch (matchingError) {
        setMatchingWarning(
          matchingError instanceof Error
            ? matchingError.message
            : "Matching suggestions could not be loaded."
        );
      }

      const existing =
        reconciliation.allocations;

      if (existing.length > 0) {
        setAllocations(
          existing.map((allocation) => ({
            targetKey: allocation.targetKey,
            amount: (
              Math.abs(
                allocation.amountCents
              ) / 100
            ).toFixed(2),
            note: allocation.note ?? ""
          }))
        );
      } else {
        const recommended =
          matching?.suggestions.find(
            (suggestion) =>
              suggestion.confidence >= 0.5
          );

        setAllocations([
          {
            targetKey:
              recommended?.targetKey ?? "",
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

  async function loadTransferEditor() {
    setIsLoading(true);
    setError(null);
    setMatchingWarning(null);

    try {
      const matching =
        await fetchMatching();

      applyMatchingState(matching);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Transfer candidates could not be loaded."
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
      const sign =
        amountCents < 0 ? -1 : 1;

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
                targetKey:
                  allocation.targetKey,
                amountCents:
                  sign * absoluteCents,
                note:
                  allocation.note.trim() ||
                  null
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
            "content-type":
              "application/json"
          },
          body: JSON.stringify({
            reconciled,
            allocations:
              payloadAllocations
          })
        }
      );

      const result =
        await readJson<ReconciliationResponse>(
          response
        );

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

  async function saveTransferLink({
    candidate,
    status
  }: {
    candidate: TransferCandidate;
    status: "confirmed" | "rejected";
  }) {
    if (isPairSaving) {
      return;
    }

    setIsPairSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal/transactions/${encodeURIComponent(
          transactionId
        )}/matching`,
        {
          method: "PATCH",
          headers: {
            "content-type":
              "application/json"
          },
          body: JSON.stringify({
            counterpartTransactionId:
              candidate.transactionId,
            status
          })
        }
      );

      const result =
        await readJson<MatchingResponse>(
          response
        );

      if (!response.ok || !result.matching) {
        throw new Error(
          result.error ??
            "The transfer pair could not be saved."
        );
      }

      applyMatchingState(result.matching);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The transfer pair could not be saved."
      );
    } finally {
      setIsPairSaving(false);
    }
  }

  function toggleEditor() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!nextOpen) {
      return;
    }

    if (classification === "transfer") {
      void loadTransferEditor();
    } else {
      void loadAllocationEditor();
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

  if (classification === "transfer") {
    return (
      <div className={styles.reconciliationControl}>
        <span className={`${styles.status} ${styles.statusPartial}`}>
          Unreconciled
        </span>

        <div className={styles.reconciliationButtonRow}>
          <button
            className={styles.reconciliationSecondaryButton}
            disabled={isLoading || isPairSaving}
            type="button"
            onClick={toggleEditor}
          >
            {isOpen ? "Close pairs" : "Find pair"}
          </button>

          <button
            className={styles.reconciliationPrimaryButton}
            disabled={isSaving}
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reconcile this transfer without a budget allocation?"
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
        </div>

        {isOpen ? (
          <div className={styles.reconciliationEditor}>
            <div className={styles.reconciliationEditorHeader}>
              <strong>
                Transfer pairing
              </strong>

              <span>
                Pairing does not reconcile or reclassify.
              </span>
            </div>

            {isLoading ? (
              <div className={styles.matchingEmpty}>
                Looking for opposite transactions across other accounts...
              </div>
            ) : confirmedTransfer ? (
              <div className={styles.transferCandidateCard}>
                <div>
                  <span className={styles.matchingConfidence}>
                    Confirmed pair
                  </span>

                  <strong>
                    {confirmedTransfer.displayDescription}
                  </strong>

                  <small>
                    {confirmedTransfer.accountName}
                    {" · "}
                    {confirmedTransfer.postedDate}
                    {" · "}
                    {moneyFromCents(
                      Math.abs(
                        confirmedTransfer.amountCents
                      )
                    )}
                  </small>
                </div>

                <button
                  className={styles.reconciliationRemoveButton}
                  disabled={isPairSaving}
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this confirmed transfer pair?"
                      )
                    ) {
                      void saveTransferLink({
                        candidate:
                          confirmedTransfer,
                        status: "rejected"
                      });
                    }
                  }}
                >
                  Remove pair
                </button>
              </div>
            ) : transferCandidates.length > 0 ? (
              <div className={styles.transferCandidateList}>
                {transferCandidates.map(
                  (candidate) => (
                    <div
                      className={styles.transferCandidateCard}
                      key={candidate.transactionId}
                    >
                      <div>
                        <span className={styles.matchingConfidence}>
                          {candidate.confidenceLabel}
                          {" · "}
                          {confidencePercent(
                            candidate.confidence
                          )}
                        </span>

                        <strong>
                          {candidate.displayDescription}
                        </strong>

                        <small>
                          {candidate.accountName}
                          {" · "}
                          {candidate.postedDate}
                          {" · "}
                          {moneyFromCents(
                            Math.abs(
                              candidate.amountCents
                            )
                          )}
                        </small>

                        <span className={styles.matchingReasons}>
                          {candidate.reasons.join(" ")}
                        </span>
                      </div>

                      <div className={styles.transferCandidateActions}>
                        <button
                          className={styles.reconciliationPrimaryButton}
                          disabled={isPairSaving}
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Confirm these two transactions as the two sides of one transfer?"
                              )
                            ) {
                              void saveTransferLink({
                                candidate,
                                status:
                                  "confirmed"
                              });
                            }
                          }}
                        >
                          Confirm pair
                        </button>

                        <button
                          className={styles.reconciliationRemoveButton}
                          disabled={
                            isPairSaving ||
                            candidate.status ===
                              "rejected"
                          }
                          type="button"
                          onClick={() => {
                            void saveTransferLink({
                              candidate,
                              status:
                                "rejected"
                            });
                          }}
                        >
                          {candidate.status ===
                          "rejected"
                            ? "Rejected"
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className={styles.matchingEmpty}>
                No opposite transaction was found in another account within 7 days.
              </div>
            )}
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
        onClick={toggleEditor}
      >
        {isOpen ? "Close" : "Allocate"}
      </button>

      {isOpen ? (
        <div className={styles.reconciliationEditor}>
          <div className={styles.reconciliationEditorHeader}>
            <strong>
              Match, split, and reconcile
            </strong>

            <span>
              {budgetMonth ??
                (
                  isLoading
                    ? "Loading budget..."
                    : "Budget unavailable"
                )}
            </span>
          </div>

          {suggestions.length > 0 ? (
            <div className={styles.matchingSuggestionList}>
              <span className={styles.reconciliationDetailsTitle}>
                Suggested targets
              </span>

              {suggestions.slice(0, 3).map(
                (suggestion) => (
                  <button
                    className={styles.matchingSuggestionCard}
                    disabled={isSaving}
                    key={suggestion.targetKey}
                    type="button"
                    onClick={() => {
                      setAllocations([
                        {
                          targetKey:
                            suggestion.targetKey,
                          amount: (
                            Math.abs(
                              suggestion.recommendedAmountCents
                            ) / 100
                          ).toFixed(2),
                          note: ""
                        }
                      ]);
                    }}
                  >
                    <span>
                      <strong>
                        {suggestion.targetLabel}
                      </strong>

                      <small>
                        {suggestion.targetType}
                        {" · "}
                        {suggestion.confidenceLabel}
                        {" · "}
                        {confidencePercent(
                          suggestion.confidence
                        )}
                      </small>

                      <span className={styles.matchingReasons}>
                        {suggestion.reasons.join(" ")}
                      </span>
                    </span>

                    <span className={styles.matchingSuggestionUse}>
                      Use
                    </span>
                  </button>
                )
              )}
            </div>
          ) : !isLoading ? (
            <div className={styles.matchingEmpty}>
              No strong target suggestion was found. Choose a target manually.
            </div>
          ) : null}

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
                      targetKey:
                        event.target.value
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
                      amount:
                        event.target.value
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
                      note:
                        event.target.value
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
                          (
                            _,
                            allocationIndex
                          ) =>
                            allocationIndex !==
                            index
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
              Entered: {moneyFromCents(
                enteredTotalCents
              )}
            </span>

            <span>
              Required: {moneyFromCents(
                expectedTotalCents
              )}
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

          {matchingWarning ? (
            <span className={styles.reconciliationWarning}>
              {matchingWarning}
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
