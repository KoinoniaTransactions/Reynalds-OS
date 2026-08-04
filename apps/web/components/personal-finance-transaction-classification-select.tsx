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

  useEffect(() => {
    setValue(classification);
  }, [classification]);

  async function updateClassification(
    nextClassification: Classification
  ) {
    if (
      isSaving ||
      nextClassification === value
    ) {
      return;
    }

    const previousClassification = value;

    setValue(nextClassification);
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
            classification:
              nextClassification
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
      setValue(previousClassification);

      setError(
        updateError instanceof Error
          ? updateError.message
          : "The classification could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={
        styles.classificationControl
      }
    >
      <select
        aria-label="Transaction classification"
        className={
          styles.classificationSelect
        }
        disabled={isSaving}
        value={value}
        onChange={(event) => {
          void updateClassification(
            event.target
              .value as Classification
          );
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
