import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  PersonalFinanceMvp
} from "../../../components/personal-finance-mvp";

import {
  isAllowedPersonalFinanceHost
} from "../../../lib/personal-finance-access-local";

import {
  loadLocalPersonalFinance
} from "../../../lib/personal-finance-local";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Rules",
  robots: {
    index: false,
    follow: false
  }
};

export default async function RulesPage() {
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

  const budgetResult =
    await loadLocalPersonalFinance();

  return (
    <PersonalFinanceMvp
      budget={budgetResult.budget}
      dataMode={budgetResult.dataMode}
      unavailableReason={budgetResult.reason}
      view="rules"
    />
  );
}
