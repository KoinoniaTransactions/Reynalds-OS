import { getCurrentUser } from "../../../lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ user: getCurrentUser() });
}
