import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import type { Prisma } from "@reynalds-os/database";
import { validateObjectCreate } from "../../../lib/validation";

export async function GET(request: Request) {
  const user = assertPermission("objects:view");
  const url = new URL(request.url);
  const objectType = url.searchParams.get("objectType");
  const health = url.searchParams.get("health");
  const status = url.searchParams.get("status");
  const objects = await prisma.rosObject.findMany({
    where: {
      workspaceId: user.workspaceId,
      archivedAt: null,
      ...(objectType ? { objectType } : {}),
      ...(health ? { health } : {}),
      ...(status ? { status } : {})
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ objects });
}

export async function POST(request: Request) {
  const user = assertPermission("objects:create");
  const input = validateObjectCreate(await request.json());

  const object = await prisma.rosObject.create({
    data: {
      workspaceId: user.workspaceId,
      objectType: input.objectType,
      name: input.name,
      status: input.status ?? "Open",
      health: input.health ?? "Healthy",
      ownerId: input.ownerId,
      nextAction: input.nextAction,
      data: input.data as Prisma.InputJsonValue | undefined
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: object.id,
      actorId: user.id,
      eventType: "object.created",
      summary: `${object.objectType} created: ${object.name}`,
      newValue: object
    }
  });

  return NextResponse.json({ object }, { status: 201 });
}
