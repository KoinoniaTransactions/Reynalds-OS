import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

function parseDueAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return undefined;
    }
    return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await assertPermission("tasks:update");
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

  const parsedDueAt = parseDueAt(body.dueAt);
  if (body.dueAt !== undefined && parsedDueAt === undefined) {
    return NextResponse.json(
      { error: "dueAt must be a valid date, YYYY-MM-DD, null, or an empty string." },
      { status: 400 }
    );
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      status: body.status ?? existing.status,
      priority: body.priority ?? existing.priority,
      ownerId: body.ownerId ?? existing.ownerId,
      dueAt: parsedDueAt === undefined ? existing.dueAt : parsedDueAt,
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
