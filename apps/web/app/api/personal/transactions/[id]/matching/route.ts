import { NextResponse } from "next/server";

import {
  readPersonalFinanceTransactionMatching,
  updatePersonalFinanceTransferLink
} from "../../../../../../lib/personal-finance-transaction-matching-local";

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
    const matching =
      await readPersonalFinanceTransactionMatching({
        transactionId: id
      });

    return NextResponse.json({ matching });
  } catch (error) {
    return handleMatchingError(error);
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

  const value =
    body &&
    typeof body === "object"
      ? body as {
          counterpartTransactionId?: unknown;
          status?: unknown;
        }
      : {};

  if (
    typeof value.counterpartTransactionId !==
      "string" ||
    !value.counterpartTransactionId.trim()
  ) {
    return NextResponse.json(
      {
        error:
          "A counterpart transaction ID is required."
      },
      { status: 400 }
    );
  }

  if (
    value.status !== "confirmed" &&
    value.status !== "rejected"
  ) {
    return NextResponse.json(
      {
        error:
          "Status must be confirmed or rejected."
      },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    const matching =
      await updatePersonalFinanceTransferLink({
        transactionId: id,
        counterpartTransactionId:
          value.counterpartTransactionId,
        status: value.status
      });

    return NextResponse.json({ matching });
  } catch (error) {
    return handleMatchingError(error);
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
    return isLocalHost(
      new URL(origin).host
    );
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

function handleMatchingError(
  error: unknown
) {
  if (
    error instanceof Error &&
    error.message.includes(
      "already has a confirmed transfer pair"
    )
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 409 }
    );
  }

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
      error.message.includes("Only") ||
      error.message.includes("different") ||
      error.message.includes("opposite") ||
      error.message.includes("within")
    )
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  throw error;
}
