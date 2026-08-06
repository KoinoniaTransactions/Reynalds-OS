"use client";

import {
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";

import styles from "./personal-finance-mvp.module.css";

type Props = {
  transactionId: string;
  reviewedAt: string | null;
};

type ReviewedApiResponse = {
  transaction?: {
    reviewedAt?: string | null;
  };
  error?: string;
};

export function PersonalFinanceTransactionReviewedControl({
  transactionId,
  reviewedAt
}: Props) {
  const router = useRouter();

  const [
    savedReviewedAt,
    setSavedReviewedAt
  ] = useState<string | null>(
    reviewedAt
  );

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setSavedReviewedAt(reviewedAt);
    setError(null);
  }, [reviewedAt]);

  const isReviewed =
    savedReviewedAt !== null;

  async function saveReviewedState() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal/transactions/${encodeURIComponent(
          transactionId
        )}/reviewed`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            reviewed: !isReviewed
          })
        }
      );

      const result = (await response
        .json()
        .catch(() => null)) as
        | ReviewedApiResponse
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "The reviewed state could not be saved."
        );
      }

      const nextReviewedAt =
        result?.transaction?.reviewedAt;

      if (
        nextReviewedAt !== null &&
        typeof nextReviewedAt !== "string"
      ) {
        throw new Error(
          "The reviewed state response was invalid."
        );
      }

      setSavedReviewedAt(nextReviewedAt);
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "The reviewed state could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.reviewedControl}>
      <button
        aria-label={
          isReviewed
            ? "Mark transaction as not reviewed"
            : "Mark transaction as reviewed"
        }
        aria-pressed={isReviewed}
        className={`${styles.reviewedToggle} ${
          isReviewed
            ? styles.reviewedToggleActive
            : ""
        }`}
        disabled={isSaving}
        type="button"
        onClick={() => {
          void saveReviewedState();
        }}
      >
        <span
          aria-hidden="true"
          className={styles.reviewedToggleIndicator}
        >
          {isReviewed ? "✓" : ""}
        </span>

        <span className={styles.reviewedToggleCopy}>
          {isSaving
            ? "Saving..."
            : isReviewed
              ? "Reviewed"
              : "Mark reviewed"}
        </span>
      </button>

      {error ? (
        <span
          className={styles.reviewedError}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
