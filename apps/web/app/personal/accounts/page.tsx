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
  PersonalFinanceAccountReconciliationWorkspace
} from "../../../components/personal-finance-account-reconciliation-workspace";

import {
  PersonalFinanceRouteFrame
} from "../../../components/personal-finance-route-frame";

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
  readPersonalFinanceReconciliationWorkspace
} from "../../../lib/personal-finance-reconciliation-local";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title:
      "Accounts",

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

export default async function AccountsPage({
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

  const budget =
    periodWorkspace.budget;

  const periodKey =
    periodWorkspace.periodKey;

  if (
    !budget ||
    !periodKey
  ) {
    return (
      <PersonalFinanceRouteFrame
        eyebrow="Household accounts"
        monthLabel="Personal Finance"
        sourceFile="No budget period loaded"
        subtitle="Create or import a budget month before account balances can be reconciled."
        title="Accounts"
      >
        <p>
          {periodWorkspace.reason ??
            budgetResult.reason}
        </p>
      </PersonalFinanceRouteFrame>
    );
  }

  const reconciliation =
    readPersonalFinanceReconciliationWorkspace(
      periodKey
    );

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Household accounts"
      monthLabel={
        budget.month
      }
      sourceFile={
        budget.sourceFile
      }
      subtitle="Reconcile opening, current, and month-end balances so each budget period starts from the correct financial position."
      title="Accounts and reconciliation"
    >
      <PersonalFinanceAccountReconciliationWorkspace
        initialWorkspace={
          reconciliation
        }
      />
    </PersonalFinanceRouteFrame>
  );
}
