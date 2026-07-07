import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const user = assertPermission("tasks:update");
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.task.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      status: body.status ?? existing.status,
      priority: body.priority ?? existing.priority,
      ownerId: body.ownerId ?? existing.ownerId,
      dueAt: body.dueAt ? new Date(body.dueAt) : existing.dueAt,
      completedAt: body.status === "Complete" ? new Date() : existing.completedAt
    }
  });

  if (task.relatedObjectId) {
    await prisma.timelineEvent.create({
      data: {
        workspaceId: user.workspaceId,
        objectId: task.relatedObjectId,
        actorId: user.id,
        eventType: body.status === "Complete" ? "task.completed" : "task.updated",
        summary: body.status === "Complete" ? `Task completed: ${task.title}` : `Task updated: ${task.title}`,
        previousValue: existing,
        newValue: task
      }
    });
  }

  return NextResponse.json({ task });
}
