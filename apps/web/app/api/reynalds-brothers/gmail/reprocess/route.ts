import { NextResponse } from "next/server";
import { assertPermission } from "../../../../../lib/auth";
import { reprocessWalMartTanksReviewQueue } from "../../../../../lib/reynalds-brothers-gmail";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await assertPermission("objects:update");

    let limit = 100;
    try {
      const payload = await request.json() as { limit?: number };
      if (typeof payload.limit === "number" && Number.isFinite(payload.limit)) {
        limit = Math.max(1, Math.min(250, Math.trunc(payload.limit)));
      }
    } catch {
      // Empty body is valid; keep the default.
    }

    const result = await reprocessWalMartTanksReviewQueue(user.id, user.name, limit);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Gmail review reprocessing failed."
    }, { status: 400 });
  }
}
