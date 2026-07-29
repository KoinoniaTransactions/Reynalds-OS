import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const user = await assertPermission("objects:update");
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.notification.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      level: body.level ?? existing.level,
      title: body.title ?? existing.title,
      message: body.message ?? existing.message,
      dueAt: body.dueAt ? new Date(body.dueAt) : existing.dueAt
    }
  });

  if (notification.relatedObjectId) {
    await prisma.timelineEvent.create({
      data: {
        workspaceId: user.workspaceId,
        objectId: notification.relatedObjectId,
        actorId: user.id,
        eventType: notification.status === "Resolved" ? "notification.resolved" : "notification.updated",
        summary: notification.status === "Resolved" ? `Notification resolved: ${notification.title}` : `Notification updated: ${notification.title}`,
        previousValue: existing,
        newValue: notification
      }
    });
  }

  return NextResponse.json({ notification });
}
