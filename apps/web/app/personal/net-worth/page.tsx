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
  PersonalFinanceNetWorthWorkspace
} from "../../../components/personal-finance-net-worth-workspace";

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
    "Net Worth",
  description:
    "Private household assets, liabilities, and equity workspace.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function NetWorthPage() {
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

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Personal balance sheet"
      monthLabel={
        budget?.month ??
        "Personal Finance"
      }
      sourceFile={
        budget?.sourceFile ??
        "Secure local database"
      }
      subtitle="Record what you own, what you owe, and the equity attached to financed property while keeping sensitive account identifiers encrypted."
      title="Assets − Liabilities = Net Worth"
    >
      <PersonalFinanceNetWorthWorkspace />
    </PersonalFinanceRouteFrame>
  );
}
