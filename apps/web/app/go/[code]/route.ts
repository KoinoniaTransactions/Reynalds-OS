import { NextRequest, NextResponse } from "next/server";
import { resolveKoinoniaSmsCampaignCode } from "../../../lib/koinonia-sms-links";

/**
 * Human-readable, branded links for Campaign 2.
 * No visitor or prospect PII is logged or persisted by this route.
 * Reuses the existing public marketing UTM attribution pipeline.
 */
export function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  return context.params.then(({ code }) => {
    const campaign = resolveKoinoniaSmsCampaignCode(code);
    if (!campaign) {
      return new NextResponse("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }
      });
    }
    const destination = new URL("/", request.nextUrl.origin);
    destination.search = campaign.toString();
    const response = NextResponse.redirect(destination, 307);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex");
    return response;
  });
}
