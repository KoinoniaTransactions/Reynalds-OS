import { NextResponse } from "next/server";

import {
  createPersonalFinanceObligation,
  readPersonalFinanceObligationCatalog,
  type CreatePersonalFinanceObligationInput
} from "../../../../lib/personal-finance-obligations-local";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request
) {
  if (!isAllowedRequest(request)) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404 }
    );
  }

  try {
    return NextResponse.json({
      catalog:
        readPersonalFinanceObligationCatalog()
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
      { error: "Not found." },
      { status: 404 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "A valid JSON body is required."
      },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return NextResponse.json(
      {
        error:
          "Bill details are required."
      },
      { status: 400 }
    );
  }

  try {
    const obligation =
      createPersonalFinanceObligation(
        body as
          CreatePersonalFinanceObligationInput
      );

    return NextResponse.json(
      { obligation },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

function isAllowedRequest(
  request: Request
): boolean {
  const requestUrl = new URL(request.url);

  const requestHost = (
    request.headers.get(
      "x-forwarded-host"
    ) ??
    request.headers.get("host") ??
    requestUrl.host
  )
    .split(",")[0]
    ?.trim();

  if (!isAllowedHost(requestHost)) {
    return false;
  }

  const origin =
    request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return isAllowedHost(
      new URL(origin).host
    );
  } catch {
    return false;
  }
}

function isAllowedHost(
  host: string | undefined
): boolean {
  const normalized =
    host?.trim().toLowerCase() ?? "";

  const hostname =
    normalizedHostName(normalized);

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }

  return (
    process.env.NODE_ENV !==
      "production" &&
    isPrivateIpv4Address(hostname)
  );
}

function normalizedHostName(
  host: string
): string {
  if (host.startsWith("[")) {
    const closingBracket =
      host.indexOf("]");

    if (closingBracket !== -1) {
      return host.slice(
        1,
        closingBracket
      );
    }
  }

  return host.split(":")[0] ?? "";
}

function isPrivateIpv4Address(
  hostname: string
): boolean {
  const octets =
    hostname.split(".").map(Number);

  if (
    octets.length !== 4 ||
    octets.some(
      (octet) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255
    )
  ) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    (
      first === 172 &&
      second !== undefined &&
      second >= 16 &&
      second <= 31
    ) ||
    (
      first === 192 &&
      second === 168
    )
  );
}

function handleError(
  error: unknown
) {
  if (
    error instanceof Error &&
    error.message.includes("disabled")
  ) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404 }
    );
  }

  if (
    error instanceof Error &&
    (
      error.message.includes(
        "required"
      ) ||
      error.message.includes(
        "must"
      ) ||
      error.message.includes(
        "not found"
      ) ||
      error.message.includes(
        "not valid"
      )
    )
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  throw error;
}
