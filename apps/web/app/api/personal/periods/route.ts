import {
  NextResponse
} from "next/server";

import {
  isAllowedPersonalFinanceHost
} from "../../../../lib/personal-finance-access-local";

import {
  createNextPersonalFinancePeriod,
  preparePersonalFinancePeriodWorkspace,
  readPersonalFinancePeriodSummaries,
  selectPersonalFinancePeriod
} from "../../../../lib/personal-finance-period-local";

import {
  normalizePersonalFinancePeriodKey
} from "../../../../lib/personal-finance-period-types";

import {
  loadLocalPersonalFinance
} from "../../../../lib/personal-finance-local";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function GET(
  request: Request
) {
  if (!isAllowedRequest(request)) {
    return NextResponse.json(
      {
        error:
          "Not found."
      },
      {
        status: 404
      }
    );
  }

  try {
    const legacy =
      await loadLocalPersonalFinance();

    const workspace =
      preparePersonalFinancePeriodWorkspace({
        legacyBudget:
          legacy.budget,
        requestedPeriodKey:
          null
      });

    return NextResponse.json({
      periods:
        workspace.periods,
      selectedPeriodKey:
        workspace.periodKey
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: Request
) {
  if (!isAllowedRequest(request)) {
    return NextResponse.json(
      {
        error:
          "Not found."
      },
      {
        status: 404
      }
    );
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "A valid JSON body is required."
      },
      {
        status: 400
      }
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Budget month details are required."
      },
      {
        status: 400
      }
    );
  }

  const record =
    body as Record<
      string,
      unknown
    >;

  const action =
    typeof record.action ===
      "string"
      ? record.action
      : "";

  try {
    const legacy =
      await loadLocalPersonalFinance();

    preparePersonalFinancePeriodWorkspace({
      legacyBudget:
        legacy.budget,
      requestedPeriodKey:
        null
    });

    if (
      action ===
      "select-period"
    ) {
      const periodKey =
        normalizePersonalFinancePeriodKey(
          record.periodKey
        );

      if (!periodKey) {
        throw new Error(
          "Choose a valid budget month."
        );
      }

      selectPersonalFinancePeriod(
        periodKey
      );

      return NextResponse.json({
        selectedPeriodKey:
          periodKey,
        periods:
          readPersonalFinancePeriodSummaries()
      });
    }

    if (
      action ===
      "create-next"
    ) {
      const periodKey =
        normalizePersonalFinancePeriodKey(
          record.periodKey
        );

      if (!periodKey) {
        throw new Error(
          "Choose a valid source budget month."
        );
      }

      const options =
        record.options &&
        typeof record.options ===
          "object"
          ? record.options as
              Record<
                string,
                unknown
              >
          : {};

      const result =
        createNextPersonalFinancePeriod(
          periodKey,
          {
            carryBills:
              typeof options
                .carryBills ===
                "boolean"
                ? options
                    .carryBills
                : undefined,

            carryAccounts:
              typeof options
                .carryAccounts ===
                "boolean"
                ? options
                    .carryAccounts
                : undefined,

            carryGoal:
              typeof options
                .carryGoal ===
                "boolean"
                ? options
                    .carryGoal
                : undefined
          }
        );

      return NextResponse.json(
        {
          created:
            result.created,

          period:
            result.period,

          selectedPeriodKey:
            result
              .period
              .periodKey,

          periods:
            readPersonalFinancePeriodSummaries()
        },
        {
          status:
            result.created
              ? 201
              : 200
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Budget month action is not valid."
      },
      {
        status: 400
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

function isAllowedRequest(
  request: Request
): boolean {
  const requestUrl =
    new URL(request.url);

  const requestHost = (
    request.headers.get(
      "x-forwarded-host"
    ) ??
    request.headers.get(
      "host"
    ) ??
    requestUrl.host
  )
    .split(",")[0]
    ?.trim();

  if (
    !isAllowedPersonalFinanceHost(
      requestHost
    )
  ) {
    return false;
  }

  const origin =
    request.headers.get(
      "origin"
    );

  if (!origin) {
    return true;
  }

  try {
    return isAllowedPersonalFinanceHost(
      new URL(origin).host
    );
  } catch {
    return false;
  }
}

function handleError(
  error: unknown
) {
  if (
    error instanceof Error &&
    error.message.includes(
      "disabled"
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Not found."
      },
      {
        status: 404
      }
    );
  }

  if (
    error instanceof Error
  ) {
    return NextResponse.json(
      {
        error:
          error.message
      },
      {
        status: 400
      }
    );
  }

  throw error;
}
