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
  PersonalFinanceObligationWorkspace
} from "../../../components/personal-finance-obligation-workspace";

import {
  PersonalFinanceRouteFrame
} from "../../../components/personal-finance-route-frame";

import {
  isAllowedPersonalFinanceHost
} from "../../../lib/personal-finance-access-local";

import {
  loadLocalPersonalFinance
} from "../../../lib/personal-finance-local";

export const dynamic =
  "force-dynamic";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title:
    "Bills | Personal Finance",
  robots: {
    index: false,
    follow: false
  }
};

export default async function BillsPage() {
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

  const budgetResult =
    await loadLocalPersonalFinance();

  const budget =
    budgetResult.budget;

  if (!budget) {
    return (
      <PersonalFinanceRouteFrame
        eyebrow="Household obligations"
        monthLabel="Personal Finance"
        sourceFile="No local file loaded"
        subtitle="The private local budget file must be available before bills can be displayed."
        title="Bills"
      >
        <p>
          {budgetResult.reason}
        </p>
      </PersonalFinanceRouteFrame>
    );
  }

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Household obligations"
      monthLabel={budget.month}
      sourceFile={budget.sourceFile}
      subtitle="Organize each recurring payment around the home, vehicle, account, or service it supports."
      title="Bills and financial homes"
    >
      <PersonalFinanceObligationWorkspace
        bills={budget.bills}
        totals={{
          planned:
            budget.totals
              .expensesBudgeted,
          paid:
            budget.totals
              .expensesPaid,
          remaining:
            budget.totals
              .billsRemaining
        }}
      />
    </PersonalFinanceRouteFrame>
  );
}
