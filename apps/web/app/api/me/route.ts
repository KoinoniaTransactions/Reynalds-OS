import { getCurrentUser, isAuthError } from "../../../lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ user: await getCurrentUser() });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ user: null, error: error.message }, { status: error.status });
    }

    throw error;
  }
}
