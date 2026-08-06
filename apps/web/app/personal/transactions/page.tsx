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
  loadPersonalFinanceTransactionInbox
} from "../../../lib/personal-finance-transaction-inbox-local";

export const dynamic =
  "force-dynamic";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title:
    "Transactions | Personal Finance",
  robots: {
    index: false,
    follow: false
  }
};

export default async function TransactionsPage() {
  const requestHeaders =
    await headers();

  const requestHost = (
    requestHeaders.get(
      "x-forwarded-host"
    ) ??
    requestHeaders.get("host") ??
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

  const [
    budgetResult,
    inboxResult
  ] = await Promise.all([
    loadLocalPersonalFinance(),
    loadPersonalFinanceTransactionInbox({
      reviewStatus: "all"
    })
  ]);

  const budget =
    budgetResult.budget;

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Transaction workspace"
      monthLabel={
        budget?.month ??
        "Personal Finance"
      }
      sourceFile={
        budget?.sourceFile ??
        "No local file loaded"
      }
      subtitle="Classify, review, reconcile, and resolve imported activity from one focused screen."
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
          inboxResult.summary
            .reviewedTransactions
        }
        notReviewedTransactionCount={
          inboxResult.summary
            .notReviewedTransactions
        }
        transactionReason={
          inboxResult.reason
        }
      />
    </PersonalFinanceRouteFrame>
  );
}
