import type {
  Metadata
} from "next";

import {
  headers
} from "next/headers";

import {
  notFound
} from "next/navigation";

import {
  PersonalFinanceMvp
} from "../../components/personal-finance-mvp";

import {
  isAllowedPersonalFinanceHost
} from "../../lib/personal-finance-access-local";

import {
  loadLocalPersonalFinance
} from "../../lib/personal-finance-local";

import {
  preparePersonalFinancePeriodWorkspace
} from "../../lib/personal-finance-period-local";

import {
  normalizePersonalFinancePeriodKey
} from "../../lib/personal-finance-period-types";

import {
  loadPersonalFinanceTransactionInbox
} from "../../lib/personal-finance-transaction-inbox-local";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title: {
      absolute:
        "Overview | J&M Reynalds Finances"
    },

    description:
      "Local-only household budget workspace.",

    robots: {
      index: false,
      follow: false
    }
  };

type PageProps = {
  searchParams?:
    Promise<{
      period?:
        string | string[];
    }>;
};

export default async function PersonalPage({
  searchParams
}: PageProps) {
  const requestHeaders =
    await headers();

  const requestHost = (
    requestHeaders.get(
      "x-forwarded-host"
    ) ??
    requestHeaders.get(
      "host"
    ) ??
    ""
  )
    .split(",")[0]
    ?.trim();

  if (
    !isAllowedPersonalFinanceHost(
      requestHost
    )
  ) {
    notFound();
  }

  const params =
    searchParams
      ? await searchParams
      : {};

  const requestedPeriodKey =
    normalizePersonalFinancePeriodKey(
      params.period
    );

  const budgetResult =
    await loadLocalPersonalFinance();

  const periodWorkspace =
    preparePersonalFinancePeriodWorkspace({
      legacyBudget:
        budgetResult.budget,

      requestedPeriodKey
    });

  const inboxResult =
    await loadPersonalFinanceTransactionInbox({
      reviewStatus:
        "all",

      limit:
        500,

      periodKey:
        periodWorkspace
          .periodKey ??
        undefined
    });

  const transactions =
    inboxResult.transactions;

  const transactionAccountCount =
    new Set(
      transactions.map(
        (transaction) =>
          transaction.accountId
      )
    ).size;

  const unclassifiedTransactionCount =
    transactions.filter(
      (transaction) =>
        transaction.classification ===
        "unknown"
    ).length;

  const reviewedTransactionCount =
    transactions.filter(
      (transaction) =>
        transaction.reviewedAt !==
        null
    ).length;

  const notReviewedTransactionCount =
    transactions.filter(
      (transaction) =>
        transaction.reviewedAt ===
        null
    ).length;

  return (
    <PersonalFinanceMvp
      budget={
        periodWorkspace.budget
      }
      dataMode={
        budgetResult.dataMode
      }
      unavailableReason={
        periodWorkspace.reason ??
        budgetResult.reason
      }
      transactions={
        transactions
      }
      transactionTotal={
        inboxResult.totalMatching
      }
      transactionAccountCount={
        transactionAccountCount
      }
      unclassifiedTransactionCount={
        unclassifiedTransactionCount
      }
      reviewedTransactionCount={
        reviewedTransactionCount
      }
      notReviewedTransactionCount={
        notReviewedTransactionCount
      }
      transactionReason={
        inboxResult.reason
      }
    />
  );
}
