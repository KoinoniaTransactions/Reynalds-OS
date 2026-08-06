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

  if (!isAllowedPersonalFinanceHost(requestHost)) {
    notFound();
  }

  const [budgetResult, inboxResult] = await Promise.all([
    loadLocalPersonalFinance(),
    loadPersonalFinanceTransactionInbox({
      reviewStatus: "all"
    })
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

function isAllowedPersonalFinanceHost(
  host: string | undefined
): boolean {
  const normalized = host?.trim().toLowerCase() ?? "";
  const hostname = normalizedHostName(normalized);

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return isPrivateIpv4Address(hostname);
}

function normalizedHostName(host: string): string {
  if (host.startsWith("[")) {
    const closingBracket = host.indexOf("]");

    if (closingBracket !== -1) {
      return host.slice(1, closingBracket);
    }
  }

  return host.split(":")[0] ?? "";
}

function isPrivateIpv4Address(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);

  if (
    octets.length !== 4 ||
    octets.some(
      (octet) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255
    )
  ) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    (first === 172 &&
      second !== undefined &&
      second >= 16 &&
      second <= 31) ||
    (first === 192 && second === 168)
  );
}
