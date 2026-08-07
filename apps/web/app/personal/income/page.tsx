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
  PersonalFinanceIncomeWorkspace
} from "../../../components/personal-finance-income-workspace";

import {
  PersonalFinanceRouteFrame
} from "../../../components/personal-finance-route-frame";

import {
  isAllowedPersonalFinanceHost
} from "../../../lib/personal-finance-access-local";

import {
  readPersonalFinanceIncomeWorkspace
} from "../../../lib/personal-finance-income-local";

import {
  loadLocalPersonalFinance
} from "../../../lib/personal-finance-local";

import {
  preparePersonalFinancePeriodWorkspace
} from "../../../lib/personal-finance-period-local";

import {
  normalizePersonalFinancePeriodKey
} from "../../../lib/personal-finance-period-types";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title:
      "Income",

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

export default async function IncomePage({
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

  if (
    !periodWorkspace.periodKey ||
    !periodWorkspace.budget
  ) {
    return (
      <PersonalFinanceRouteFrame
        eyebrow="Household income"
        monthLabel="Personal Finance"
        sourceFile="No budget period loaded"
        subtitle="Create or import a budget month before income can be planned."
        title="Income"
      >
        <p>
          {periodWorkspace.reason ??
            budgetResult.reason}
        </p>
      </PersonalFinanceRouteFrame>
    );
  }

  const incomeWorkspace =
    readPersonalFinanceIncomeWorkspace(
      periodWorkspace.periodKey
    );

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Household income"
      monthLabel={
        incomeWorkspace
          .periodLabel
      }
      sourceFile={
        periodWorkspace
          .budget
          .sourceFile
      }
      subtitle="Define each income source, assign who earns it, track actual deposits, and add clearly labeled miscellaneous income."
      title="Income"
    >
      <PersonalFinanceIncomeWorkspace
        initialWorkspace={
          incomeWorkspace
        }
      />
    </PersonalFinanceRouteFrame>
  );
}
