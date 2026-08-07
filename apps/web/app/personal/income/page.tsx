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
  readPersonalFinanceIncomeWorkspace,
  seedPersonalFinanceIncomeFromLegacy
} from "../../../lib/personal-finance-income-local";

import {
  personalFinancePeriodKeyFromMonthLabel
} from "../../../lib/personal-finance-income-schedule";

import {
  loadLocalPersonalFinance
} from "../../../lib/personal-finance-local";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title: "Income",
    robots: {
      index: false,
      follow: false
    }
  };

export default async function IncomePage() {
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

  const budgetResult =
    await loadLocalPersonalFinance();

  const currentDate =
    new Date();

  const fallbackPeriodKey =
    [
      currentDate
        .getFullYear(),
      String(
        currentDate
          .getMonth() + 1
      ).padStart(
        2,
        "0"
      )
    ].join("-");

  const periodKey =
    budgetResult.budget
      ? (
          personalFinancePeriodKeyFromMonthLabel(
            budgetResult
              .budget
              .month
          ) ??
          fallbackPeriodKey
        )
      : fallbackPeriodKey;

  if (
    budgetResult.budget
  ) {
    seedPersonalFinanceIncomeFromLegacy({
      periodKey,
      entries:
        budgetResult
          .budget
          .income
    });
  }

  const incomeWorkspace =
    readPersonalFinanceIncomeWorkspace(
      periodKey
    );

  return (
    <PersonalFinanceRouteFrame
      eyebrow="Household income"
      monthLabel={
        incomeWorkspace.periodLabel
      }
      sourceFile={
        budgetResult
          .budget
          ?.sourceFile ??
        "personal-finance.sqlite3"
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
