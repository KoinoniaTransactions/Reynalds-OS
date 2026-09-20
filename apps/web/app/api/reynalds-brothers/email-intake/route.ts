import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  databaseCommunicationToEntry,
  mergeCommunicationHistory
} from "../../../../lib/reynalds-brothers-communications";
import {
  REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
  classifyEmailForWorkItem,
  getDefaultWorkItemDataForClassification,
  validateEmailIntake
} from "../../../../lib/reynalds-brothers-email-intake";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
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

type EmailIntakeAction = "analyze_only" | "file_to_existing" | "create_work_item" | "queue_for_review";

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

    const reviewItems = await prisma.communicationReviewItem.findMany({
      where: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        status: "open"
      },
      include: {
        communication: {
          include: {
            attachments: true
          }
        },
        suggestedWorkItem: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

    const candidates = reviewItems.map((item) => {
      const evidence = item.evidence && !Array.isArray(item.evidence) && typeof item.evidence === "object"
        ? item.evidence as Record<string, unknown>
        : {};
      const storedClassification = evidence.classification
        && !Array.isArray(evidence.classification)
        && typeof evidence.classification === "object"
        ? evidence.classification as Record<string, unknown>
        : {};
      const communication = item.communication;

      return {
        id: communication.externalMessageId,
        providerMessageId: communication.externalMessageId,
        providerThreadId: communication.externalThreadId ?? undefined,
        sourceUrl: communication.sourceUrl ?? undefined,
        from: communication.sender,
        to: Array.isArray(communication.recipients)
          ? communication.recipients.filter((value): value is string => typeof value === "string").join(", ")
          : undefined,
        subject: communication.subject,
        receivedAt: communication.sentAt?.toISOString(),
        snippet: communication.snippet ?? undefined,
        body: communication.bodyText ?? undefined,
        sourceLabel: "wmtanks",
        attachments: communication.attachments.map((attachment) => attachment.fileName),
        classification: {
          action: "needs_review",
          confidence: storedClassification.confidence === "high" || storedClassification.confidence === "medium"
            ? storedClassification.confidence
            : "low",
          matchedWorkItemId: item.suggestedWorkItem?.id,
          matchedWorkItemName: item.suggestedWorkItem?.name,
          suggestedWorkItemName: typeof storedClassification.suggestedWorkItemName === "string"
            ? storedClassification.suggestedWorkItemName
            : undefined,
          suggestedServiceLine: typeof storedClassification.suggestedServiceLine === "string"
            ? storedClassification.suggestedServiceLine
            : undefined,
          suggestedCustomer: typeof storedClassification.suggestedCustomer === "string"
            ? storedClassification.suggestedCustomer
            : undefined,
          suggestedLocation: typeof storedClassification.suggestedLocation === "string"
            ? storedClassification.suggestedLocation
            : undefined,
          suggestedCity: typeof storedClassification.suggestedCity === "string"
            ? storedClassification.suggestedCity
            : undefined,
          suggestedState: typeof storedClassification.suggestedState === "string"
            ? storedClassification.suggestedState
            : undefined,
          suggestedStoreNumber: typeof storedClassification.suggestedStoreNumber === "string"
            ? storedClassification.suggestedStoreNumber
            : undefined,
          suggestedNextAction: typeof storedClassification.suggestedNextAction === "string"
            ? storedClassification.suggestedNextAction
            : "Review this email and choose the correct Reynalds Brothers Work Item.",
          requiresApproval: true,
          multiStoreFlag: item.category === "multi_store",
          extractedStoreNumbers: Array.isArray(storedClassification.extractedStoreNumbers)
            ? storedClassification.extractedStoreNumbers.filter((value): value is string => typeof value === "string")
            : [],
          reasons: typeof item.reason === "string" && item.reason
            ? [item.reason]
            : ["Email requires human review before filing."]
        }
      };
    });

    return NextResponse.json({
      source: "database",
      liveSync: true,
      candidates,
      reviewCount: candidates.length,
      note: "Review queue is live. Connected Gmail messages can be synchronized and safely reprocessed after classifier updates."
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
    const classification = classifyEmailForWorkItem(email, databaseWorkItems);

    if (action === "analyze_only") {
      return NextResponse.json({ classification });
    }

    const externalMessageId = email.providerMessageId ?? `manual:${crypto.randomUUID()}`;
    const sourceLabel = email.sourceLabel ?? REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL;
    const confidenceScore = classification.confidence === "high" ? 100 : classification.confidence === "medium" ? 70 : 30;
    const sentAt = email.receivedAt ? new Date(email.receivedAt) : null;

    const existingCommunication = await prisma.communication.findUnique({
      where: {
        workspaceId_source_externalMessageId: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          source: "gmail",
          externalMessageId
        }
      },
      include: {
        attachments: true,
        reviewItem: true
      }
    });

    if (existingCommunication && action !== "queue_for_review") {
      return NextResponse.json({
        communicationId: existingCommunication.id,
        workItemId: existingCommunication.workItemId,
        classification,
        duplicate: true
      });
    }

    const targetWorkItemId = payload.workItemId ?? classification.matchedWorkItemId;
    let workItemId = targetWorkItemId;
    let workItemName = classification.matchedWorkItemName;

    if (action === "create_work_item") {
      const defaultWorkItemData: ReynaldsBrothersWorkItemData = {
        ...getDefaultWorkItemDataForClassification(classification),
        sourceReferenceId: externalMessageId,
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
    }

    if (action === "file_to_existing" && !workItemId) {
      return NextResponse.json({
        error: "A Work Item must be selected before this email can be filed."
      }, { status: 400 });
    }

    const shouldQueueForReview = action === "queue_for_review"
      || (!workItemId && classification.action === "needs_review");

    const communication = existingCommunication ?? await prisma.communication.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        source: "gmail",
        externalMessageId,
        externalThreadId: email.providerThreadId,
        workItemId: shouldQueueForReview ? null : workItemId,
        subject: email.subject,
        sender: email.from,
        recipients: email.to ? [email.to] : [],
        sentAt: sentAt && !Number.isNaN(sentAt.getTime()) ? sentAt : null,
        snippet: email.snippet,
        bodyText: email.body,
        sourceUrl: email.sourceUrl,
        status: shouldQueueForReview ? "review" : "filed",
        matchConfidence: confidenceScore,
        matchEvidence: {
          confidence: classification.confidence,
          action: classification.action,
          reasons: classification.reasons
        },
        identifiers: {
          storeNumbers: classification.extractedStoreNumbers ?? [],
          suggestedStoreNumber: classification.suggestedStoreNumber ?? null
        },
        location: classification.suggestedLocation
          ? {
              display: classification.suggestedLocation,
              city: classification.suggestedCity ?? null,
              state: classification.suggestedState ?? null
            }
          : undefined,
        rawMetadata: {
          channel: "email",
          direction: "inbound",
          sourceLabel,
          humanResponseStatus: shouldQueueForReview ? "Needs Review" : "Needs Response",
          filedBy: user.name
        }
      }
    });

    if (!existingCommunication && (email.attachments ?? []).length > 0) {
      await prisma.communicationAttachment.createMany({
        data: (email.attachments ?? []).map((fileName, index) => ({
          communicationId: communication.id,
          externalAttachmentId: `${externalMessageId}:${index + 1}`,
          fileName
        })),
        skipDuplicates: true
      });
    }

    if (shouldQueueForReview) {
      const reviewItem = await prisma.communicationReviewItem.upsert({
        where: {
          communicationId: communication.id
        },
        update: {
          category: classification.multiStoreFlag ? "multi_store" : "unmatched",
          reason: classification.reasons.join(" "),
          status: "open",
          confidence: confidenceScore,
          evidence: {
            classification,
            sourceLabel
          }
        },
        create: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          communicationId: communication.id,
          suggestedWorkItemId: classification.matchedWorkItemId,
          category: classification.multiStoreFlag ? "multi_store" : "unmatched",
          reason: classification.reasons.join(" "),
          status: "open",
          confidence: confidenceScore,
          evidence: {
            classification,
            sourceLabel
          }
        }
      });

      return NextResponse.json({
        communicationId: communication.id,
        reviewItemId: reviewItem.id,
        classification,
        queuedForReview: true
      }, { status: existingCommunication ? 200 : 201 });
    }

    if (!workItemId) {
      return NextResponse.json({
        error: "A Work Item must be selected before this email can be filed."
      }, { status: 400 });
    }

    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        workItemId,
        status: "filed",
        rawMetadata: {
          channel: "email",
          direction: "inbound",
          sourceLabel,
          humanResponseStatus: "Needs Response",
          filedBy: user.name
        }
      }
    });

    const existingReview = await prisma.communicationReviewItem.findUnique({
      where: { communicationId: communication.id }
    });

    if (existingReview && existingReview.status === "open") {
      await prisma.communicationReviewItem.update({
        where: { id: existingReview.id },
        data: {
          suggestedWorkItemId: workItemId,
          status: "resolved",
          resolvedById: user.id,
          resolvedAt: new Date()
        }
      });
    }

    const timelineEvent = await prisma.timelineEvent.findFirst({
      where: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectId: workItemId,
        eventType: "rb.email.filed",
        newValue: {
          path: ["communicationId"],
          equals: communication.id
        }
      }
    });

    if (!timelineEvent) {
      await prisma.timelineEvent.create({
        data: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          objectId: workItemId,
          actorId: user.id,
          eventType: "rb.email.filed",
          summary: `Email filed under ${workItemName ?? "Reynalds Brothers Work Item"}: ${email.subject}`,
          newValue: {
            communicationId: communication.id,
            providerMessageId: externalMessageId,
            sourceLabel,
            classification
          }
        }
      });
    }

    return NextResponse.json({
      communicationId: communication.id,
      workItemId,
      classification,
      duplicate: Boolean(existingCommunication)
    }, { status: action === "create_work_item" ? 201 : 200 });
  } catch (error) {
    const authErrorResponse = getPermissionErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Email could not be filed."
    }, { status: 400 });
  }
}
