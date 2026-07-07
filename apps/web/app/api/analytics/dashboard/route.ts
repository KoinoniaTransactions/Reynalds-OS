import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export async function GET() {
  const user = assertPermission("objects:view");

  const [
    totalObjects,
    criticalObjects,
    activeTransactions,
    openTasks,
    timelineEvents,
    invoices
  ] = await Promise.all([
    prisma.rosObject.count({
      where: { workspaceId: user.workspaceId, archivedAt: null }
    }),
    prisma.rosObject.count({
      where: { workspaceId: user.workspaceId, archivedAt: null, health: "Critical" }
    }),
    prisma.rosObject.count({
      where: { workspaceId: user.workspaceId, archivedAt: null, objectType: "Transaction" }
    }),
    prisma.task.count({
      where: { workspaceId: user.workspaceId, status: { not: "Complete" } }
    }),
    prisma.timelineEvent.count({
      where: { workspaceId: user.workspaceId }
    }),
    prisma.invoice.findMany({
      where: { workspaceId: user.workspaceId }
    })
  ]);

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + decimalToNumber(invoice.amount), 0);

  const pendingRevenue = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + decimalToNumber(invoice.amount), 0);

  return NextResponse.json({
    metrics: [
      { label: "Objects", value: String(totalObjects), note: "active shared records" },
      { label: "Critical", value: String(criticalObjects), note: "objects need attention" },
      { label: "Transactions", value: String(activeTransactions), note: "active transaction records" },
      { label: "Open Tasks", value: String(openTasks), note: "not complete" },
      { label: "Paid Revenue", value: `$${paidRevenue.toFixed(0)}`, note: "paid invoices" },
      { label: "Pending", value: `$${pendingRevenue.toFixed(0)}`, note: "pending invoices" },
      { label: "Timeline", value: String(timelineEvents), note: "audit events" },
      { label: "Version", value: "9.2", note: "database dashboard" }
    ]
  });
}
