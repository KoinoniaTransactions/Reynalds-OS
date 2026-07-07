import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { validateObjectUpdate } from "../../../../lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const user = assertPermission("objects:view");
  const { id } = await params;

  const object = await prisma.rosObject.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId,
      archivedAt: null
    },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
      sourceLinks: {
        include: { targetObject: true }
      },
      targetLinks: {
        include: { sourceObject: true }
      }
    }
  });

  if (!object) {
    return NextResponse.json({ error: "Object not found." }, { status: 404 });
  }

  return NextResponse.json({ object });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = assertPermission("objects:update");
  const { id } = await params;
  const input = validateObjectUpdate(await request.json());

  const existing = await prisma.rosObject.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId,
      archivedAt: null
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Object not found." }, { status: 404 });
  }

  const object = await prisma.rosObject.update({
    where: { id },
    data: input
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: object.id,
      actorId: user.id,
      eventType: "object.updated",
      summary: `${object.objectType} updated: ${object.name}`,
      previousValue: existing,
      newValue: object
    }
  });

  return NextResponse.json({ object });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = assertPermission("objects:archive");
  const { id } = await params;

  const existing = await prisma.rosObject.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId,
      archivedAt: null
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Object not found." }, { status: 404 });
  }

  const object = await prisma.rosObject.update({
    where: { id },
    data: { archivedAt: new Date(), status: "Archived" }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: object.id,
      actorId: user.id,
      eventType: "object.archived",
      summary: `${object.objectType} archived: ${object.name}`,
      previousValue: existing,
      newValue: object
    }
  });

  return NextResponse.json({ object });
}
