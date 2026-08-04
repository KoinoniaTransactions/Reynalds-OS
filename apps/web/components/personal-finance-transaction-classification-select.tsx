"use client";

import {
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";

import styles from "./personal-finance-mvp.module.css";

const CLASSIFICATION_OPTIONS = [
  ["unknown", "Unknown"],
  ["expense", "Expense"],
  ["income", "Income"],
  ["refund", "Refund"],
  ["transfer", "Transfer"],
  ["duplicate", "Duplicate"],
  ["ignored", "Ignored"]
] as const;

type Classification =
  (typeof CLASSIFICATION_OPTIONS)[number][0];

type Props = {
  transactionId: string;
  classification: Classification;
};

export function PersonalFinanceTransactionClassificationSelect({
  transactionId,
  classification
}: Props) {
  const router = useRouter();

  const [value, setValue] =
    useState<Classification>(
      classification
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const hasPendingChange =
    value !== classification;

  useEffect(() => {
    setValue(classification);
    setError(null);
  }, [classification]);

  async function saveClassification() {
    if (
      isSaving ||
      !hasPendingChange
    ) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal/transactions/${encodeURIComponent(
          transactionId
        )}/classification`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            classification: value
          })
        }
      );

      const result = (await response
        .json()
        .catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "The classification could not be saved."
        );
      }

      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "The classification could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function cancelClassificationChange() {
    if (isSaving) {
      return;
    }

    setValue(classification);
    setError(null);
  }

  return (
    <div
      className={
        styles.classificationControl
      }
    >
      <select
        aria-label="Choose transaction classification; use Save to apply"
        className={`${styles.classificationSelect} ${
          hasPendingChange
            ? styles.classificationSelectPending
            : ""
        }`}
        title="Choose a classification, then click Save"
        disabled={isSaving}
        value={value}
        onChange={(event) => {
          setValue(
            event.target
              .value as Classification
          );

          setError(null);
        }}
      >
        {CLASSIFICATION_OPTIONS.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          )
        )}
      </select>

      {hasPendingChange ? (
        <div
          className={
            styles.classificationPending
          }
        >
          <span
            className={
              styles.classificationPendingLabel
            }
          >
            Unsaved change
          </span>

          <div
            className={
              styles.classificationActions
            }
          >
            <button
              aria-label="Save transaction classification change"
              className={
                styles.classificationSaveButton
              }
              disabled={isSaving}
              type="button"
              onClick={() => {
                void saveClassification();
              }}
            >
              {isSaving
                ? "Saving..."
                : "Save"}
            </button>

            <button
              aria-label="Cancel transaction classification change"
              className={
                styles.classificationCancelButton
              }
              disabled={isSaving}
              type="button"
              onClick={
                cancelClassificationChange
              }
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <span
          className={
            styles.classificationError
          }
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
