import { NextResponse } from "next/server";
import { isAuthError } from "./auth";

type AuthErrorResponseOptions = {
  includeUser?: boolean;
};

export function getAuthErrorResponse(
  error: unknown,
  options: AuthErrorResponseOptions = {}
): NextResponse | null {
  if (!isAuthError(error)) {
    return null;
  }

  const payload = options.includeUser
    ? { user: null, error: error.message }
    : { error: error.message };

  return NextResponse.json(payload, { status: error.status });
}
