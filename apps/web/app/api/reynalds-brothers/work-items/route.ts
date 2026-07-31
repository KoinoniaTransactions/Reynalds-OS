import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  getWorkItemMetrics,
  normalizeWorkItemStatus,
  reynaldsBrothersFallbackWorkItems,
  validateWorkItemCreate,
  type ReynaldsBrothersWorkItem,
  type ReynaldsBrothersWorkItemData
} from "../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

function getPermissionErrorResponse(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Permission denied:")) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return null;
}

function toWorkItemData(data: Prisma.JsonValue | null): ReynaldsBrothersWorkItemData | null {
  if (!data || Array.isArray(data) || typeof data !== "object") return null;
  return data as ReynaldsBrothersWorkItemData;
}

export async function POST(request: Request) {
  try {
    const user = await assertPermission("objects:create");
    const input = validateWorkItemCreate(await request.json());
    const normalizedInput = normalizeWorkItemStatus({
      id: "pending",
      objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
      name: input.name,
      status: input.status,
      health: input.health,
      nextAction: input.nextAction,
      data: input.data
    });

    const object = await prisma.rosObject.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
        name: normalizedInput.name,
        status: normalizedInput.status,
        health: normalizedInput.health,
        nextAction: normalizedInput.nextAction,
        ownerId: user.id,
        data: normalizedInput.data as Prisma.InputJsonValue
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectId: object.id,
        actorId: user.id,
        eventType: "rb.work_item.created",
        summary: `Reynalds Brothers Work Item created: ${object.name}`,
        newValue: object
      }
    });

    return NextResponse.json({
      workItem: {
        id: object.id,
        objectType: object.objectType,
        name: object.name,
        status: object.status,
        health: object.health,
        nextAction: object.nextAction,
        data: toWorkItemData(object.data)
      }
    }, { status: 201 });
  } catch (error) {
    const permissionErrorResponse = getPermissionErrorResponse(error);
    if (permissionErrorResponse) return permissionErrorResponse;

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Work Item could not be created."
    }, { status: 400 });
  }
}

export async function GET() {
  try {
    await assertPermission("objects:view");

    const objects = await prisma.rosObject.findMany({
      where: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
    });

    const databaseWorkItems: ReynaldsBrothersWorkItem[] = objects.map((object) => normalizeWorkItemStatus({
      id: object.id,
      objectType: object.objectType,
      name: object.name,
      status: object.status,
      health: object.health,
      nextAction: object.nextAction,
      data: toWorkItemData(object.data)
    }));
    const fallbackWorkItems = reynaldsBrothersFallbackWorkItems.map(normalizeWorkItemStatus);
    const workItems = databaseWorkItems.length > 0 ? databaseWorkItems : fallbackWorkItems;

    return NextResponse.json({
      source: databaseWorkItems.length > 0 ? "database" : "fallback",
      metrics: getWorkItemMetrics(workItems),
      workItems
    });
  } catch (error) {
    const permissionErrorResponse = getPermissionErrorResponse(error);
    if (permissionErrorResponse) return permissionErrorResponse;

    return NextResponse.json({
      source: "fallback",
      warning: error instanceof Error ? error.message : "Database unavailable.",
      metrics: getWorkItemMetrics(reynaldsBrothersFallbackWorkItems.map(normalizeWorkItemStatus)),
      workItems: reynaldsBrothersFallbackWorkItems.map(normalizeWorkItemStatus)
    });
  }
}
