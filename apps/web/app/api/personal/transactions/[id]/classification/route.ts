import { NextResponse } from "next/server";

import {
  isPersonalFinanceClassification,
  updatePersonalFinanceTransactionClassification
} from "../../../../../../lib/personal-finance-transaction-classification-local";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

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

  const classification =
    body &&
    typeof body === "object" &&
    "classification" in body
      ? (body as { classification?: unknown })
          .classification
      : undefined;

  if (
    !isPersonalFinanceClassification(
      classification
    )
  ) {
    return NextResponse.json(
      {
        error:
          "A supported transaction classification is required."
      },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    const transaction =
      updatePersonalFinanceTransactionClassification({
        transactionId: id,
        classification
      });

    return NextResponse.json({ transaction });
  } catch (error) {
    return handleClassificationError(error);
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

function handleClassificationError(
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
    error.message.includes(
      "Unsupported Personal Finance classification"
    )
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  throw error;
}
