import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  databaseCommunicationToEntry,
  mergeCommunicationHistory
} from "../../../../lib/reynalds-brothers-communications";
import {
  REYNALDS_BROTHERS_COMMUNICATION_TYPE,
  REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
  classifyEmailForWorkItem,
  getDefaultWorkItemDataForClassification,
  validateEmailIntake
} from "../../../../lib/reynalds-brothers-email-intake";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  addCommunicationToWorkItemData,
  reynaldsBrothersFallbackWorkItems,
  type ReynaldsBrothersWorkItem,
  type ReynaldsBrothersWorkItemData
} from "../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

function getPermissionErrorResponse(error: unknown): NextResponse | null {
  if (
    error instanceof Error
    && error.message.startsWith("Permission denied:")
  ) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  return null;
}

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
    include: {
      communications: {
        include: {
          attachments: true
        },
        orderBy: [
          { sentAt: "desc" },
          { createdAt: "desc" }
        ]
      }
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });

  return objects.map((object) => {
    const workItem = toWorkItem(object);
    return {
      ...workItem,
      data: mergeCommunicationHistory(
        workItem.data ?? {},
        object.communications.map(databaseCommunicationToEntry)
      )
    };
  });
}

export async function GET() {
  try {
    await assertPermission("objects:view");
    await getDatabaseWorkItems();

    return NextResponse.json({
      source: "database",
      liveSync: false,
      candidates: [],
      note: "Live Gmail synchronization is not enabled yet. Use manual email analysis until the Gmail integration phase."
    });
  } catch (error) {
    const authErrorResponse = getPermissionErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      source: "fallback",
      liveSync: false,
      warning: error instanceof Error ? error.message : "Database unavailable.",
      candidates: []
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
    let workItemData: ReynaldsBrothersWorkItemData = {};

    if (action === "create_work_item") {
      const defaultWorkItemData: ReynaldsBrothersWorkItemData = {
        ...getDefaultWorkItemDataForClassification(classification),
        sourceReferenceId: email.providerMessageId,
        intakeReasons: classification.reasons
      };
      const workItem = await prisma.rosObject.create({
        data: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
          name: classification.suggestedWorkItemName ?? email.subject,
          status: "Needs Approval",
          health: classification.multiStoreFlag ? "Attention" : "Watch",
          nextAction: classification.suggestedNextAction,
          ownerId: user.id,
          data: defaultWorkItemData as Prisma.InputJsonValue
        }
      });

      workItemId = workItem.id;
      workItemName = workItem.name;
      workItemData = defaultWorkItemData;
    }

    if (!workItemId) {
      return NextResponse.json({
        error: "A Work Item must be selected before this email can be filed."
      }, { status: 400 });
    }

    if (action !== "create_work_item") {
      const existingWorkItem = await prisma.rosObject.findUnique({
        where: { id: workItemId }
      });

      workItemName = existingWorkItem?.name ?? workItemName;
      workItemData = toWorkItemData(existingWorkItem?.data ?? null) ?? {};
    }

    const now = new Date().toISOString();
    const sourceLabel = email.sourceLabel ?? REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL;
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
          sourceLabel,
          attachments: email.attachments ?? [],
          humanResponseStatus: "Needs Response",
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

    const communicationEntry = {
      id: communication.id,
      channel: "email",
      direction: "inbound",
      sourceLabel,
      subject: email.subject,
      from: email.from,
      to: email.to,
      occurredAt: email.receivedAt ?? now,
      snippet: email.snippet,
      body: email.body,
      providerMessageId: email.providerMessageId,
      communicationObjectId: communication.id,
      attachments: email.attachments ?? [],
      classificationConfidence: classification.confidence,
      matchedBy: classification.reasons,
      humanResponseStatus: "Needs Response",
      filedBy: user.name,
      filedAt: now
    };
    const nextWorkItemData = addCommunicationToWorkItemData(workItemData, communicationEntry);

    await prisma.rosObject.update({
      where: { id: workItemId },
      data: {
        data: nextWorkItemData as Prisma.InputJsonValue
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
          sourceLabel,
          communicationEntry,
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
    const authErrorResponse = getPermissionErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Email could not be filed."
    }, { status: 400 });
  }
}
