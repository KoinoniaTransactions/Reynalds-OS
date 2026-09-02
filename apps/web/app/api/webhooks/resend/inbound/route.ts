import { NextResponse } from "next/server";
import {
  isResendInboundConfigured,
  parseResendEmailReceivedEvent,
  verifyAndParseResendWebhook
} from "../../../../../lib/resend-inbound-email";
import { ingestTransactionInboundEmail } from "../../../../../lib/transaction-inbound-email-ingestion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isResendInboundConfigured()) {
    return NextResponse.json(
      { error: "Inbound transaction email is not configured." },
      { status: 503 }
    );
  }

  const payload = await request.text();

  try {
    const parsed = verifyAndParseResendWebhook({
      payload,
      svixId: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature")
    });
    const event = parseResendEmailReceivedEvent(parsed);

    if (!event) {
      return NextResponse.json({ accepted: true, ignored: true });
    }

    const result = await ingestTransactionInboundEmail(event);
    return NextResponse.json({ accepted: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inbound email processing failed.";
    const signatureFailure =
      message.includes("signature") ||
      message.includes("timestamp") ||
      message.includes("webhook verification");

    if (signatureFailure) {
      return NextResponse.json({ error: "Invalid webhook request." }, { status: 401 });
    }

    console.error("Resend inbound email processing failed", error);
    return NextResponse.json(
      { error: "Inbound email processing failed." },
      { status: 500 }
    );
  }
}
