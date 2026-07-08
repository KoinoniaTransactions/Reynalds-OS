import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

async function createNotificationIfMissing(input: {
  workspaceId: string;
  userId: string;
  relatedObjectId?: string;
  level: string;
  title: string;
  message: string;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      workspaceId: input.workspaceId,
      relatedObjectId: input.relatedObjectId,
      title: input.title,
      status: { not: "Resolved" }
    }
  });

  if (existing) return null;

  return prisma.notification.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      relatedObjectId: input.relatedObjectId,
      level: input.level,
      title: input.title,
      message: input.message,
      status: "Unread"
    }
  });
}

export async function POST() {
  const user = assertPermission("objects:update");

  const [criticalObjects, highPriorityTasks, pendingInvoices] = await Promise.all([
    prisma.rosObject.findMany({
      where: {
        workspaceId: user.workspaceId,
        archivedAt: null,
        health: "Critical"
      },
      take: 10,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.task.findMany({
      where: {
        workspaceId: user.workspaceId,
        status: { not: "Complete" },
        priority: { in: ["High", "Critical"] }
      },
      take: 10,
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }]
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId: user.workspaceId,
        status: { not: "Paid" }
      },
      take: 10,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const created = [];

  for (const object of criticalObjects) {
    const notification = await createNotificationIfMissing({
      workspaceId: user.workspaceId,
      userId: user.id,
      relatedObjectId: object.id,
      level: "Critical",
      title: `Critical object: ${object.name}`,
      message: object.nextAction ?? "Review this critical object."
    });
    if (notification) created.push(notification);
  }

  for (const task of highPriorityTasks) {
    const notification = await createNotificationIfMissing({
      workspaceId: user.workspaceId,
      userId: user.id,
      relatedObjectId: task.relatedObjectId ?? undefined,
      level: task.priority === "Critical" ? "Critical" : "Important",
      title: `Priority task: ${task.title}`,
      message: `Task status: ${task.status}. Priority: ${task.priority}.`
    });
    if (notification) created.push(notification);
  }

  for (const invoice of pendingInvoices) {
    const notification = await createNotificationIfMissing({
      workspaceId: user.workspaceId,
      userId: user.id,
      relatedObjectId: invoice.relatedObjectId ?? invoice.clientObjectId,
      level: "Important",
      title: `Pending invoice: $${invoice.amount.toString()}`,
      message: `Invoice ${invoice.id} is ${invoice.status}.`
    });
    if (notification) created.push(notification);
  }

  for (const notification of created) {
    if (notification.relatedObjectId) {
      await prisma.timelineEvent.create({
        data: {
          workspaceId: user.workspaceId,
          objectId: notification.relatedObjectId,
          actorId: user.id,
          eventType: "notification.auto_generated",
          summary: `Auto-generated notification: ${notification.title}`,
          newValue: notification
        }
      });
    }
  }

  return NextResponse.json({
    createdCount: created.length,
    notifications: created
  });
}
