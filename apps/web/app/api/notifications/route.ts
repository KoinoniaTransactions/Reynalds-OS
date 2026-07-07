import { NextResponse } from "next/server";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function GET(request: Request) {
  const user = assertPermission("objects:view");
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const level = url.searchParams.get("level");

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId: user.workspaceId,
      ...(status ? { status } : {}),
      ...(level ? { level } : {})
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 100
  });

  const relatedObjectIds = [...new Set(notifications.map((item) => item.relatedObjectId).filter(Boolean))] as string[];

  const relatedObjects = await prisma.rosObject.findMany({
    where: {
      workspaceId: user.workspaceId,
      id: { in: relatedObjectIds }
    }
  });

  return NextResponse.json({ notifications, relatedObjects });
}

export async function POST(request: Request) {
  const user = assertPermission("objects:update");
  const body = await request.json();

  if (!body.title || !body.message || !body.level) {
    return NextResponse.json({ error: "title, message, and level are required." }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      workspaceId: user.workspaceId,
      userId: body.userId ?? user.id,
      relatedObjectId: body.relatedObjectId,
      level: body.level,
      title: body.title,
      message: body.message,
      status: body.status ?? "Unread",
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined
    }
  });

  if (notification.relatedObjectId) {
    await prisma.timelineEvent.create({
      data: {
        workspaceId: user.workspaceId,
        objectId: notification.relatedObjectId,
        actorId: user.id,
        eventType: "notification.created",
        summary: `Notification created: ${notification.title}`,
        newValue: notification
      }
    });
  }

  return NextResponse.json({ notification }, { status: 201 });
}
