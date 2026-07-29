import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../lib/api-auth";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ user: await getCurrentUser() });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error, { includeUser: true });

    if (authResponse) {
      return authResponse;
    }

    throw error;
  }
}
