import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runSocialPublishingWorker } from "../../../../../lib/social-publishing-worker";
import { liveSocialPublishingEnabled } from "../../../../../lib/social-queue-policy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  const expected = "Bearer " + (secret ?? "");
  if (!secret || secret.length < 32 || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!liveSocialPublishingEnabled()) return NextResponse.json({ disabled: true, processed: 0 });
  try { return NextResponse.json(await runSocialPublishingWorker({ mode: "live" }), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Dispatch unavailable" }, { status: 503 }); }
}
