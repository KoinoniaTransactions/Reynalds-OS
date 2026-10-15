import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../../lib/db";
import { normalizeKoinoniaRelationshipData } from "../../../../../lib/koinonia-relationship";
import { applyGlobalMarketingUnsubscribe, selectLinkedMarketingRelationship } from "../../../../../lib/resend-contact-matching";
import { parseResendGlobalUnsubscribe, verifyResendContactWebhook } from "../../../../../lib/resend-contact-unsubscribe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Inactive unless explicitly enabled and bound to one Koinonia workspace.
 * Never accepts subscribe events, and never calls a sending API.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_CONTACT_WEBHOOK_SECRET;
  const workspaceId = process.env.KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID?.trim();
  if (process.env.KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED !== "true" || !secret || !workspaceId) {
    return NextResponse.json({ error: "Contact webhook disabled." }, { status: 503 });
  }

  const svixId = request.headers.get("svix-id");
  let incoming: ReturnType<typeof parseResendGlobalUnsubscribe>;
  try {
    const payload = await request.text();
    incoming = parseResendGlobalUnsubscribe(verifyResendContactWebhook({
      payload,
      svixId,
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
      secret
    }));
  } catch {
    return NextResponse.json({ error: "Invalid webhook request." }, { status: 401 });
  }
  if (!incoming) return NextResponse.json({ accepted: true, ignored: true });
  if (!svixId) return NextResponse.json({ error: "Missing event ID." }, { status: 401 });

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      // Unique svixId and the CRM update commit atomically. Duplicate requests
      // are handled after the unique constraint rejects them.
      await tx.resendContactWebhookEvent.create({
        data: {
          svixId,
          workspaceId,
          eventType: incoming.type,
          resendContactId: incoming.contactId,
          email: incoming.email,
          eventOccurredAt: new Date(incoming.createdAt),
          outcome: "unmatched"
        }
      });

      const candidates = await tx.rosObject.findMany({
        where: {
          workspaceId,
          archivedAt: null,
          data: {
            path: ["emailMarketing", "resendContactId"],
            equals: incoming.contactId
          }
        }
      });
      const matched = selectLinkedMarketingRelationship(candidates, incoming.contactId, incoming.email);
      if (!matched) return "unmatched";

      // Only update if the current record is still the one read above.
      // A do-not-contact restriction remains stricter than a global unsubscribe.
      const updatedProfile = applyGlobalMarketingUnsubscribe(
        normalizeKoinoniaRelationshipData(matched.profile), incoming.createdAt
      );
      await tx.rosObject.update({
        where: { id: matched.id, workspaceId },
        data: { data: updatedProfile as Prisma.InputJsonValue }
      });
      await tx.resendContactWebhookEvent.update({
        where: { svixId },
        data: { relationshipId: matched.id, outcome: "unsubscribed" }
      });
      await tx.timelineEvent.create({
        data: {
          workspaceId,
          objectId: matched.id,
          eventType: "marketing.unsubscribed",
          summary: "Marketing email opt-out received from Resend",
          newValue: { contactId: incoming.contactId, source: "resend", occurredAt: incoming.createdAt }
        }
      });
      return "unsubscribed";
    });

    return NextResponse.json({ accepted: true, outcome });
  } catch (error) {
    // The event ledger's unique index is an atomic duplicate guard.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ accepted: true, duplicate: true });
    }
    console.error("Resend contact webhook processing failed", error);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
