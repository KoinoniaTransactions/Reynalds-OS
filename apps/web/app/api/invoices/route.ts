import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

function toMoneyString(value: unknown) {
  return typeof value === "object" && value && "toString" in value ? value.toString() : String(value ?? "0");
}

export async function GET() {
  const user = await assertPermission("finance:view");

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: user.workspaceId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    invoices: invoices.map((invoice: { amount: unknown }) => ({
      ...invoice,
      amount: toMoneyString(invoice.amount)
    }))
  });
}

export async function POST(request: Request) {
  const user = await assertPermission("finance:update");
  const body = await request.json();

  if (!body.clientObjectId || !body.amount) {
    return NextResponse.json({ error: "clientObjectId and amount are required." }, { status: 400 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: user.workspaceId,
      clientObjectId: body.clientObjectId,
      relatedObjectId: body.relatedObjectId,
      packageObjectId: body.packageObjectId,
      amount: body.amount,
      status: body.status ?? "Pending",
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: body.relatedObjectId ?? body.clientObjectId,
      actorId: user.id,
      eventType: "invoice.created",
      summary: `Invoice created for $${invoice.amount.toString()}`,
      newValue: invoice
    }
  });

  return NextResponse.json({
    invoice: { ...invoice, amount: invoice.amount.toString() }
  }, { status: 201 });
}
