import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  assertPayAtCloseTriggerEligibility,
  buildPayAtCloseTriggerData,
  payAtCloseTriggerObjectType,
  PayAtCloseTriggerValidationError,
  validatePayAtCloseConfirmationInput
} from "../../../../../../lib/portal-pay-at-close";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission(
      "billing-workspace:pay-at-close:update"
    );
    const { id } = await params;
    const input = validatePayAtCloseConfirmationInput(
      await request.json()
    );

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    if (!invoice.relatedObjectId) {
      throw new PayAtCloseTriggerValidationError(
        "The invoice is not linked to a ServiceActivation."
      );
    }

    const serviceActivation = await prisma.rosObject.findFirst({
      where: {
        id: invoice.relatedObjectId,
        workspaceId: actor.workspaceId,
        archivedAt: null
      }
    });

    if (!serviceActivation) {
      throw new PayAtCloseTriggerValidationError(
        "The linked ServiceActivation was not found."
      );
    }

    const { relatedWorkObjectId } =
      assertPayAtCloseTriggerEligibility({
        invoice,
        serviceActivation
      });

    const workObject = await prisma.rosObject.findFirst({
      where: {
        id: relatedWorkObjectId,
        workspaceId: actor.workspaceId,
        archivedAt: null
      }
    });

    if (!workObject) {
      throw new PayAtCloseTriggerValidationError(
        "The transaction or work object for this closing was not found."
      );
    }

    const existingTriggers = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: payAtCloseTriggerObjectType,
        archivedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 200
    });

    const existingTrigger = existingTriggers.find(
      (trigger) =>
        getDataString(trigger.data, "invoiceId") === invoice.id
    );

    if (existingTrigger) {
      return NextResponse.json(
        {
          error:
            "A successful closing trigger has already been recorded for this invoice."
        },
        { status: 409 }
      );
    }

    const confirmedAt = new Date();
    const triggerData = buildPayAtCloseTriggerData({
      actorId: actor.id,
      confirmedAt,
      input,
      invoiceId: invoice.id,
      relatedWorkObjectId: workObject.id,
      serviceActivationId: serviceActivation.id
    });

    const result = await prisma.$transaction(async (tx) => {
      const trigger = await tx.rosObject.create({
        data: {
          workspaceId: actor.workspaceId,
          objectType: payAtCloseTriggerObjectType,
          name: `Successful Close - ${workObject.name}`,
          status: "Confirmed",
          health: "Healthy",
          ownerId: serviceActivation.ownerId,
          clientUserId: serviceActivation.clientUserId,
          clientObjectId: invoice.clientObjectId,
          assignedStaffUserId: actor.id,
          nextAction:
            "Invoice released to Ready to Process after confirmed successful closing.",
          data: triggerData as Prisma.InputJsonObject
        }
      });

      const updatedInvoice = await tx.invoice.update({
        where: {
          id: invoice.id
        },
        data: {
          dueAt: input.closingDate,
          status: "Ready to Process"
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: workObject.id,
          actorId: actor.id,
          eventType: "invoice.pay_at_close.ready",
          summary:
            "Successful closing confirmed. Pay-at-close invoice is Ready to Process.",
          previousValue: {
            invoiceId: invoice.id,
            status: invoice.status
          },
          newValue: {
            closingDate:
              input.closingDate.toISOString().slice(0, 10),
            confirmationSource: input.confirmationSource,
            invoiceId: updatedInvoice.id,
            payAtCloseTriggerId: trigger.id,
            status: updatedInvoice.status
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.invoice.pay_at_close.confirmed",
          subjectType: "Invoice",
          subjectId: invoice.id,
          summary:
            "Successful closing confirmed for pay-at-close invoice.",
          metadata: {
            closingDate:
              input.closingDate.toISOString().slice(0, 10),
            confirmationSource: input.confirmationSource,
            hasNote: Boolean(input.note),
            payAtCloseTriggerId: trigger.id,
            previousStatus: invoice.status,
            relatedWorkObjectId: workObject.id,
            serviceActivationId: serviceActivation.id,
            status: updatedInvoice.status
          }
        }
      });

      return {
        trigger,
        invoice: updatedInvoice
      };
    });

    return NextResponse.json({
      invoice: {
        id: result.invoice.id,
        amount: result.invoice.amount.toString(),
        dueAt: result.invoice.dueAt?.toISOString() ?? null,
        paidAt: result.invoice.paidAt?.toISOString() ?? null,
        status: result.invoice.status
      },
      trigger: {
        id: result.trigger.id,
        closingDate:
          input.closingDate.toISOString().slice(0, 10),
        outcome: input.outcome,
        status: result.trigger.status
      }
    });
  } catch (error) {
    return handlePayAtCloseTriggerError(error);
  }
}

function handlePayAtCloseTriggerError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PayAtCloseTriggerValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      {
        error:
          "Pay-at-close storage is temporarily unavailable."
      },
      { status: 503 }
    );
  }

  throw error;
}

function getDataString(
  data: unknown,
  key: string
): string | null {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return null;
  }

  const value = (data as Record<string, unknown>)[key];

  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
