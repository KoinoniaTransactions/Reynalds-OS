import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { assertPermission } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  validateWorkItemUpdate,
  type ReynaldsBrothersWorkItemData
} from "../../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

function toWorkItemData(data: Prisma.JsonValue | null): ReynaldsBrothersWorkItemData | null {
  if (!data || Array.isArray(data) || typeof data !== "object") return null;
  return data as ReynaldsBrothersWorkItemData;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await assertPermission("objects:update");
    const { id } = await params;
    const input = validateWorkItemUpdate(await request.json());

    const existing = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
        archivedAt: null
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Reynalds Brothers Work Item not found." }, { status: 404 });
    }

    const existingData = toWorkItemData(existing.data) ?? {};
    const nextData = input.data ? { ...existingData, ...input.data } : existingData;

    const object = await prisma.rosObject.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.health ? { health: input.health } : {}),
        ...(input.nextAction !== undefined ? { nextAction: input.nextAction } : {}),
        data: nextData as Prisma.InputJsonValue
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        objectId: object.id,
        actorId: user.id,
        eventType: "rb.work_item.updated",
        summary: `Reynalds Brothers Work Item updated: ${object.name}`,
        previousValue: existing,
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
    });
  } catch (error) {
    const authErrorResponse = getAuthErrorResponse(error);
    if (authErrorResponse) return authErrorResponse;

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Work Item could not be updated."
    }, { status: 400 });
  }
}
