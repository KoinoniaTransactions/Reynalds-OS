import { NextResponse } from "next/server";

import {
  readPersonalFinanceTransactionReconciliation,
  updatePersonalFinanceTransactionReconciliation
} from "../../../../../../lib/personal-finance-transaction-reconciliation-local";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  if (!isLocalRequest(request)) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404 }
    );
  }

  const { id } = await params;

  try {
    const reconciliation =
      await readPersonalFinanceTransactionReconciliation({
        transactionId: id
      });

    return NextResponse.json({ reconciliation });
  } catch (error) {
    return handleReconciliationError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  if (!isLocalRequest(request)) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON body is required." },
      { status: 400 }
    );
  }

  const reconciled =
    body &&
    typeof body === "object" &&
    "reconciled" in body
      ? (body as { reconciled?: unknown })
          .reconciled
      : undefined;

  const allocations =
    body &&
    typeof body === "object" &&
    "allocations" in body
      ? (body as { allocations?: unknown })
          .allocations
      : undefined;

  if (typeof reconciled !== "boolean") {
    return NextResponse.json(
      {
        error:
          "A Personal Finance reconciliation state is required."
      },
      { status: 400 }
    );
  }

  if (
    allocations !== undefined &&
    !Array.isArray(allocations)
  ) {
    return NextResponse.json(
      { error: "Allocations must be an array." },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    const reconciliation =
      await updatePersonalFinanceTransactionReconciliation({
        transactionId: id,
        reconciled,
        allocations: Array.isArray(allocations)
          ? allocations.map((allocation) => {
              if (
                !allocation ||
                typeof allocation !== "object"
              ) {
                throw new Error(
                  "Every allocation must be an object."
                );
              }

              const value = allocation as {
                targetKey?: unknown;
                amountCents?: unknown;
                note?: unknown;
              };

              return {
                targetKey:
                  typeof value.targetKey === "string"
                    ? value.targetKey
                    : "",
                amountCents:
                  typeof value.amountCents === "number"
                    ? value.amountCents
                    : Number.NaN,
                note:
                  typeof value.note === "string"
                    ? value.note
                    : null
              };
            })
          : []
      });

    return NextResponse.json({ reconciliation });
  } catch (error) {
    return handleReconciliationError(error);
  }
}

function isLocalRequest(request: Request): boolean {
  const requestUrl = new URL(request.url);

  const requestHost = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    requestUrl.host
  )
    .split(",")[0]
    ?.trim();

  if (!isLocalHost(requestHost)) {
    return false;
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

function isLocalHost(
  host: string | undefined
): boolean {
  const normalized =
    host?.trim().toLowerCase() ?? "";

  return (
    normalized === "localhost" ||
    normalized.startsWith("localhost:") ||
    normalized === "127.0.0.1" ||
    normalized.startsWith("127.0.0.1:") ||
    normalized === "[::1]" ||
    normalized.startsWith("[::1]:")
  );
}

function handleReconciliationError(
  error: unknown
) {
  if (
    error instanceof Error &&
    error.message.includes(
      "transaction was not found"
    )
  ) {
    return NextResponse.json(
      { error: "Transaction not found." },
      { status: 404 }
    );
  }

  if (
    error instanceof Error &&
    (
      error.message.includes(
        "Local personal finance is disabled"
      ) ||
      error.message.includes(
        "database was not found"
      )
    )
  ) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404 }
    );
  }

  if (
    error instanceof Error &&
    (
      error.message.includes("required") ||
      error.message.includes("must") ||
      error.message.includes("cannot") ||
      error.message.includes("unavailable") ||
      error.message.includes("valid") ||
      error.message.includes("Classify") ||
      error.message.includes("equal") ||
      error.message.includes("between") ||
      error.message.includes("non-zero") ||
      error.message.includes("directions")
    )
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  throw error;
}
