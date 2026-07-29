import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  REYNALDS_BROTHERS_COMMUNICATION_TYPE,
  buildEmailCandidates,
  classifyEmailForWorkItem,
  reynaldsBrothersFallbackEmails,
  validateEmailIntake
} from "../../../../lib/reynalds-brothers-email-intake";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  reynaldsBrothersFallbackWorkItems,
  type ReynaldsBrothersWorkItem,
  type ReynaldsBrothersWorkItemData
} from "../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

type EmailIntakeAction = "analyze_only" | "file_to_existing" | "create_work_item";

type EmailIntakeRequest = {
  action?: EmailIntakeAction;
  email?: unknown;
  workItemId?: string;
};

function toWorkItemData(data: Prisma.JsonValue | null): ReynaldsBrothersWorkItemData | null {
  if (!data || Array.isArray(data) || typeof data !== "object") return null;
  return data as ReynaldsBrothersWorkItemData;
}

function toWorkItem(object: {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction: string | null;
  data: Prisma.JsonValue | null;
}): ReynaldsBrothersWorkItem {
  return {
    id: object.id,
    objectType: object.objectType,
    name: object.name,
    status: object.status,
    health: object.health,
    nextAction: object.nextAction,
    data: toWorkItemData(object.data)
  };
}

async function getDatabaseWorkItems() {
  const objects = await prisma.rosObject.findMany({
    where: {
      workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
      objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
      archivedAt: null
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });

  return objects.map(toWorkItem);
}

export async function GET() {
  try {
    await assertPermission("objects:view");
    const databaseWorkItems = await getDatabaseWorkItems();
    const workItems = databaseWorkItems.length > 0 ? databaseWorkItems : reynaldsBrothersFallbackWorkItems;

    return NextResponse.json({
      source: databaseWorkItems.length > 0 ? "database" : "fallback",
      candidates: buildEmailCandidates(reynaldsBrothersFallbackEmails, workItems)
    });
  } catch (error) {
    const authErrorResponse = getAuthErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      source: "fallback",
      warning: error instanceof Error ? error.message : "Database unavailable.",
      candidates: buildEmailCandidates(reynaldsBrothersFallbackEmails, reynaldsBrothersFallbackWorkItems)
    });
  }
}

export async function POST(request: Request) {
  try {
    const user = await assertPermission("objects:create");
    const payload = (await request.json()) as EmailIntakeRequest;
    const action = payload.action ?? "analyze_only";
    const email = validateEmailIntake(payload.email);
    const databaseWorkItems = await getDatabaseWorkItems();
    const workItems = databaseWorkItems.length > 0 ? databaseWorkItems : reynaldsBrothersFallbackWorkItems;
    const classification = classifyEmailForWorkItem(email, workItems);

    if (action === "analyze_only") {
      return NextResponse.json({ classification });
    }

    const targetWorkItemId = payload.workItemId ?? classification.matchedWorkItemId;
    let workItemId = targetWorkItemId;
    let workItemName = classification.matchedWorkItemName;

    if (action === "create_work_item") {
      const workItem = await prisma.rosObject.create({
        data: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
          name: classification.suggestedWorkItemName ?? email.subject,
          status: "Intake",
          health: "Healthy",
          nextAction: classification.suggestedNextAction,
          ownerId: user.id,
          data: {
            sourceSystem: "email",
            sourceReferenceId: email.providerMessageId,
            serviceLine: classification.suggestedServiceLine,
            customer: classification.suggestedCustomer,
            siteName: classification.suggestedLocation,
            phase: "Intake",
            invoiceStatus: "Not Ready",
            mediaStatus: "No media yet",
            customerUpdateStatus: "Email received; scope needs review."
          } as Prisma.InputJsonValue
        }
      });

      workItemId = workItem.id;
      workItemName = workItem.name;
    }

    if (!workItemId) {
      return NextResponse.json({
        error: "A Work Item must be selected before this email can be filed."
      }, { status: 400 });
    }

    const communication = await prisma.rosObject.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectType: REYNALDS_BROTHERS_COMMUNICATION_TYPE,
        name: email.subject,
        status: "Filed",
        health: "Healthy",
        ownerId: user.id,
        nextAction: classification.suggestedNextAction,
        data: {
          channel: "email",
          providerMessageId: email.providerMessageId,
          from: email.from,
          to: email.to,
          receivedAt: email.receivedAt,
          snippet: email.snippet,
          body: email.body,
          classification
        } as Prisma.InputJsonValue
      }
    });

    await prisma.objectRelationship.create({
      data: {
        sourceObjectId: communication.id,
        targetObjectId: workItemId,
        relationshipType: "filed_under"
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectId: workItemId,
        actorId: user.id,
        eventType: "rb.email.filed",
        summary: `Email filed under ${workItemName ?? "Reynalds Brothers Work Item"}: ${email.subject}`,
        newValue: {
          communicationId: communication.id,
          providerMessageId: email.providerMessageId,
          classification
        }
      }
    });

    return NextResponse.json({
      communicationId: communication.id,
      workItemId,
      classification
    }, { status: action === "create_work_item" ? 201 : 200 });
  } catch (error) {
    const authErrorResponse = getAuthErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Email could not be filed."
    }, { status: 400 });
  }
}
