import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function GET(request: Request) {
  const user = await assertPermission("tasks:view");
  const url = new URL(request.url);
  const relatedObjectId = url.searchParams.get("relatedObjectId");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId: user.workspaceId,
      ...(relatedObjectId ? { relatedObjectId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {})
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }]
  });

  const relatedObjectIds = [...new Set(tasks.map((task: { relatedObjectId: string | null }) => task.relatedObjectId).filter(Boolean))] as string[];
  const relatedObjects = await prisma.rosObject.findMany({
    where: {
      workspaceId: user.workspaceId,
      id: { in: relatedObjectIds }
    }
  });

  return NextResponse.json({ tasks, relatedObjects });
}

export async function POST(request: Request) {
  const user = await assertPermission("tasks:update");
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      workspaceId: user.workspaceId,
      relatedObjectId: body.relatedObjectId,
      ownerId: body.ownerId ?? user.id,
      title: body.title,
      status: body.status ?? "Open",
      priority: body.priority ?? "Normal",
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined
    }
  });

  if (body.relatedObjectId) {
    await prisma.timelineEvent.create({
      data: {
        workspaceId: user.workspaceId,
        objectId: body.relatedObjectId,
        actorId: user.id,
        eventType: "task.created",
        summary: `Task created: ${task.title}`,
        newValue: task
      }
    });
  }

  return NextResponse.json({ task }, { status: 201 });
}
