import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const user = assertPermission("finance:update");
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.invoice.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      paidAt: body.status === "Paid" ? new Date() : existing.paidAt,
      dueAt: body.dueAt ? new Date(body.dueAt) : existing.dueAt
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: invoice.relatedObjectId ?? invoice.clientObjectId,
      actorId: user.id,
      eventType: body.status === "Paid" ? "invoice.paid" : "invoice.updated",
      summary: body.status === "Paid" ? `Invoice paid: $${invoice.amount.toString()}` : `Invoice updated: ${invoice.status}`,
      previousValue: existing,
      newValue: invoice
    }
  });

  return NextResponse.json({
    invoice: { ...invoice, amount: invoice.amount.toString() }
  });
}
