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
  PersonalFinanceMvp
} from "../../../components/personal-finance-mvp";

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

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata = {
    title:
      "Accounts | Personal Finance",

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

  return (
    <PersonalFinanceMvp
      budget={
        periodWorkspace.budget
      }
      unavailableReason={
        periodWorkspace.reason ??
        budgetResult.reason
      }
      view="accounts"
    />
  );
}
