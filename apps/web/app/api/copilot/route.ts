import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function POST(request: Request) {
  const user = await assertPermission("copilot:ask");
  const body = await request.json();
  const question = String(body.question ?? "").toLowerCase();

  const [criticalObjects, openTasks, pendingInvoices, recentEvents, knowledgeItems] = await Promise.all([
    prisma.rosObject.findMany({
      where: {
        workspaceId: user.workspaceId,
        archivedAt: null,
        health: "Critical"
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.task.findMany({
      where: {
        workspaceId: user.workspaceId,
        status: { not: "Complete" }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 8
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId: user.workspaceId,
        status: { not: "Paid" }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.timelineEvent.findMany({
      where: { workspaceId: user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.rosObject.findMany({
      where: {
        workspaceId: user.workspaceId,
        archivedAt: null,
        objectType: { in: ["Service", "Workflow", "Template", "Decision Playbook", "SOP"] }
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    })
  ]);

  let answer = "Review critical objects and open tasks first. This read-only Copilot does not change data.";
  let recommendedAction = "Open Operations Queue";

  if (question.includes("blocking") || question.includes("critical")) {
    answer = criticalObjects.length
      ? `There are ${criticalObjects.length} critical objects. Start with ${criticalObjects[0].name}: ${criticalObjects[0].nextAction ?? "review next action"}.`
      : "No critical objects are currently flagged.";
    recommendedAction = "Open Object Explorer or Operations Queue";
  }

  if (question.includes("work") || question.includes("next") || question.includes("priority")) {
    answer = openTasks.length
      ? `There are ${openTasks.length} open tasks in the current sample. Start with: ${openTasks[0].title}.`
      : "No open tasks are currently available.";
    recommendedAction = "Open Operations Queue";
  }

  if (question.includes("invoice") || question.includes("finance") || question.includes("revenue")) {
    answer = pendingInvoices.length
      ? `There are ${pendingInvoices.length} pending invoices. Review the oldest/highest priority invoice first.`
      : "No pending invoices are currently available.";
    recommendedAction = "Open Finance";
  }

  if (question.includes("knowledge") || question.includes("sop") || question.includes("service")) {
    answer = knowledgeItems.length
      ? `There are ${knowledgeItems.length} knowledge objects available. Most recent: ${knowledgeItems[0].name}.`
      : "No knowledge objects are currently loaded. Seed or create Service, Workflow, Template, Decision Playbook, or SOP objects.";
    recommendedAction = "Open Knowledge";
  }

  return NextResponse.json({
    answer,
    recommendedAction,
    requiresHumanReview: true,
    mode: "read_only",
    supportingReferences: {
      criticalObjectIds: criticalObjects.map((item: { id: string }) => item.id),
      openTaskIds: openTasks.map((item: { id: string }) => item.id),
      pendingInvoiceIds: pendingInvoices.map((item: { id: string }) => item.id),
      recentTimelineEventIds: recentEvents.map((item: { id: string }) => item.id),
      knowledgeObjectIds: knowledgeItems.map((item: { id: string }) => item.id)
    }
  });
}
