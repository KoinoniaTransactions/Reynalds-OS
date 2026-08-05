import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PersonalFinanceMvp } from "../../components/personal-finance-mvp";
import { loadLocalPersonalFinance } from "../../lib/personal-finance-local";
import {
  loadPersonalFinanceTransactionInbox
} from "../../lib/personal-finance-transaction-inbox-local";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Personal Finance",
  description: "Local-only household budget workspace.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PersonalPage() {
  const requestHeaders = await headers();

  const requestHost = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    ""
  )
    .split(",")[0]
    ?.trim();

  if (!isLocalHost(requestHost)) {
    notFound();
  }

  const [budgetResult, inboxResult] = await Promise.all([
    loadLocalPersonalFinance(),
    loadPersonalFinanceTransactionInbox()
  ]);

  return (
    <PersonalFinanceMvp
      budget={budgetResult.budget}
      unavailableReason={budgetResult.reason}
      transactions={inboxResult.transactions}
      transactionTotal={inboxResult.totalMatching}
      transactionAccountCount={inboxResult.summary.accounts}
      unclassifiedTransactionCount={
        inboxResult.summary.unclassifiedTransactions
      }
      reviewedTransactionCount={
        inboxResult.summary.reviewedTransactions
      }
      notReviewedTransactionCount={
        inboxResult.summary.notReviewedTransactions
      }
      transactionReason={inboxResult.reason}
    />
  );
}

function isLocalHost(host: string | undefined): boolean {
  const normalized = host?.trim().toLowerCase() ?? "";

  return (
    normalized === "localhost" ||
    normalized.startsWith("localhost:") ||
    normalized === "127.0.0.1" ||
    normalized.startsWith("127.0.0.1:") ||
    normalized === "[::1]" ||
    normalized.startsWith("[::1]:")
  );
}
