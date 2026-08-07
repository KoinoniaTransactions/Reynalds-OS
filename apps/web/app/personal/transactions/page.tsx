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
  PersonalFinanceRouteFrame
} from "../../../components/personal-finance-route-frame";

import {
  PersonalFinanceTransactionInbox
} from "../../../components/personal-finance-transaction-inbox";

import {
  isAllowedPersonalFinanceHost
} from "../../../lib/personal-finance-access-local";

import {
  loadLocalPersonalFinance
} from "../../../lib/personal-finance-local";

import {
  preparePersonalFinancePeriodWorkspace
} from "../../../lib/personal-finance-period-local";

import {
  normalizePersonalFinancePeriodKey
} from "../../../lib/personal-finance-period-types";

import {
  loadPersonalFinanceTransactionInbox
} from "../../../lib/personal-finance-transaction-inbox-local";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title:
      "Transactions | Personal Finance",

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

export default async function TransactionsPage({
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

  const reviewedCount =
    inboxResult.transactions
      .filter(
        (transaction) =>
          transaction.reviewedAt !==
          null
      )
      .length;

  const notReviewedCount =
    inboxResult.transactions
      .filter(
        (transaction) =>
          transaction.reviewedAt ===
          null
      )
      .length;

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Transaction workspace"
      monthLabel={
        periodWorkspace
          .budget
          ?.month ??
        "Personal Finance"
      }
      sourceFile={
        periodWorkspace
          .budget
          ?.sourceFile ??
        "personal-finance.sqlite3"
      }
      subtitle="Classify, review, reconcile, and resolve imported activity for the selected budget month."
      title="Transactions"
    >
      <PersonalFinanceTransactionInbox
        transactions={
          inboxResult.transactions
        }
        transactionTotal={
          inboxResult.totalMatching
        }
        reviewedTransactionCount={
          reviewedCount
        }
        notReviewedTransactionCount={
          notReviewedCount
        }
        transactionReason={
          inboxResult.reason
        }
      />
    </PersonalFinanceRouteFrame>
  );
}
