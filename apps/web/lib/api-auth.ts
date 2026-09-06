import { NextResponse } from "next/server";
import { PermissionDeniedError } from "@reynalds-os/auth";
import { isAuthError } from "./auth";

type AuthErrorResponseOptions = { includeUser?: boolean };

export function getAuthErrorResponse(error: unknown, options: AuthErrorResponseOptions = {}): NextResponse | null {
  if (error instanceof PermissionDeniedError) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }
  if (!isAuthError(error)) return null;
  const payload = options.includeUser ? { user: null, error: error.message } : { error: error.message };
  return NextResponse.json(payload, { status: error.status });
}
