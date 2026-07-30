import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  getPaymentRecordStatus,
  PortalInvoiceValidationError,
  validatePortalInvoiceStatusUpdateInput
} from "../../../../../../lib/portal-billing-invoices";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("billing-workspace:payments:process");
    const { id } = await params;
    const input = validatePortalInvoiceStatusUpdateInput(await request.json());
    const existing = await prisma.invoice.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const paymentRecordStatus = getPaymentRecordStatus(input.status);
    const paidAt =
      input.status === "Paid"
        ? input.paidAt ?? existing.paidAt ?? new Date()
        : input.status === "Payment Failed" || input.status === "Void"
          ? null
          : existing.paidAt;

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.update({
        where: { id: existing.id },
        data: {
          dueAt: input.dueAt ?? existing.dueAt,
          paidAt,
          status: input.status
        }
      });

      if (paymentRecordStatus) {
        await tx.payment.create({
          data: {
            workspaceId: actor.workspaceId,
            invoiceId: invoice.id,
            amount: invoice.amount,
            status: paymentRecordStatus,
            receivedAt: input.status === "Paid" ? invoice.paidAt : undefined
          }
        });
      }

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: invoice.relatedObjectId ?? invoice.clientObjectId,
          actorId: actor.id,
          eventType: input.status === "Paid" ? "invoice.paid" : "invoice.status.updated",
          summary: `Invoice status updated: ${formatInvoiceSummary(invoice.id)} is ${input.status}`,
          previousValue: {
            dueAt: existing.dueAt?.toISOString() ?? null,
            paidAt: existing.paidAt?.toISOString() ?? null,
            status: existing.status
          },
          newValue: {
            dueAt: invoice.dueAt?.toISOString() ?? null,
            hasNotes: Boolean(input.notes),
            paidAt: invoice.paidAt?.toISOString() ?? null,
            paymentMethodSummary: input.paymentMethodSummary ?? null,
            processorPaymentReference: input.processorPaymentReference ?? null,
            status: invoice.status
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.invoice.status.updated",
          subjectType: "Invoice",
          subjectId: invoice.id,
          summary: `Invoice status updated: ${formatInvoiceSummary(invoice.id)} is ${input.status}`,
          metadata: {
            hasNotes: Boolean(input.notes),
            hasPaymentMethodSummary: Boolean(input.paymentMethodSummary),
            hasProcessorPaymentReference: Boolean(input.processorPaymentReference),
            paymentRecordStatus,
            previousStatus: existing.status,
            status: invoice.status
          }
        }
      });

      return invoice;
    });

    return NextResponse.json({
      invoice: {
        ...updatedInvoice,
        amount: updatedInvoice.amount.toString()
      }
    });
  } catch (error) {
    return handlePortalInvoiceStatusError(error);
  }
}

function handlePortalInvoiceStatusError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalInvoiceValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Invoice storage is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}

function formatInvoiceSummary(id: string): string {
  return `invoice ${id.slice(-6).toUpperCase()}`;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
