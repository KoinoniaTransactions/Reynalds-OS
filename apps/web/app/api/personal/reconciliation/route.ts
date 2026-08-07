import {
  NextResponse
} from "next/server";

import {
  isAllowedPersonalFinanceHost
} from "../../../../lib/personal-finance-access-local";

import {
  closePersonalFinanceAccountBalance,
  deletePersonalFinanceBillPayment,
  readPersonalFinanceReconciliationWorkspace,
  recordPersonalFinanceBillPayment,
  updatePersonalFinanceAccountCurrentBalance,
  updatePersonalFinanceBillPayment
} from "../../../../lib/personal-finance-reconciliation-local";

import type {
  DeletePersonalFinanceBillPaymentInput,
  RecordPersonalFinanceBillPaymentInput,
  UpdatePersonalFinanceAccountBalanceInput,
  UpdatePersonalFinanceBillPaymentInput
} from "../../../../lib/personal-finance-reconciliation-types";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function GET(
  request: Request
) {
  if (
    !isAllowedRequest(
      request
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

  const requestUrl =
    new URL(
      request.url
    );

  const periodKey =
    requestUrl
      .searchParams
      .get(
        "period"
      ) ??
    "";

  try {
    return NextResponse.json({
      workspace:
        readPersonalFinanceReconciliationWorkspace(
          periodKey
        )
    });
  } catch (error) {
    return handleError(
      error
    );
  }
}

export async function POST(
  request: Request
) {
  if (
    !isAllowedRequest(
      request
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
    typeof body !==
      "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Reconciliation details are required."
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

  const periodKey =
    typeof record.periodKey ===
      "string"
      ? record.periodKey
      : "";

  try {
    if (
      action ===
      "update-account-current"
    ) {
      return NextResponse.json({
        workspace:
          updatePersonalFinanceAccountCurrentBalance(
            periodKey,
            record as
              unknown as
              UpdatePersonalFinanceAccountBalanceInput
          )
      });
    }

    if (
      action ===
      "close-account"
    ) {
      return NextResponse.json({
        workspace:
          closePersonalFinanceAccountBalance(
            periodKey,
            record as
              unknown as
              UpdatePersonalFinanceAccountBalanceInput
          )
      });
    }

    if (
      action ===
      "record-bill-payment"
    ) {
      return NextResponse.json({
        workspace:
          recordPersonalFinanceBillPayment(
            periodKey,
            record as
              unknown as
              RecordPersonalFinanceBillPaymentInput
          )
      });
    }

    if (
      action ===
      "update-bill-payment"
    ) {
      return NextResponse.json({
        workspace:
          updatePersonalFinanceBillPayment(
            periodKey,
            record as
              unknown as
              UpdatePersonalFinanceBillPaymentInput
          )
      });
    }

    if (
      action ===
      "delete-bill-payment"
    ) {
      return NextResponse.json({
        workspace:
          deletePersonalFinanceBillPayment(
            periodKey,
            record as
              unknown as
              DeletePersonalFinanceBillPaymentInput
          )
      });
    }

    return NextResponse.json(
      {
        error:
          "Reconciliation action is not valid."
      },
      {
        status: 400
      }
    );
  } catch (error) {
    return handleError(
      error
    );
  }
}

function isAllowedRequest(
  request: Request
): boolean {
  const requestUrl =
    new URL(
      request.url
    );

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
      new URL(
        origin
      ).host
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
