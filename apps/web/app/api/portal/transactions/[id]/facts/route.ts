import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/db";
import type {
  TransactionFactKey,
  TransactionFacts
} from "../../../../../../../lib/transaction-document-requirements";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const booleanFactKeys = new Set<TransactionFactKey>([
  "inHoa",
  "squareFootageAdvertised",
  "sellerDisclosureExempt",
  "waterDisclosureSatisfied",
  "shortSale",
  "foreclosure",
  "manufacturedHome",
  "hasCounterproposal",
  "contractAmended",
  "inspectionObjectionUsed",
  "titleObjectionUsed",
  "appraisalObjectionUsed",
  "contractTerminated",
  "contractRevived",
  "powerOfAttorneyUsed",
  "personalPropertyAgreementUsed",
  "postClosingOccupancy",
  "preClosingOccupancy",
  "affiliatedBusinessReferral",
  "referralFee"
]);

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A transaction fact is required." }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const factKey = typeof record.factKey === "string" ? record.factKey as TransactionFactKey : null;
    if (!factKey || !isAllowedFactKey(factKey)) {
      return NextResponse.json({ error: "Unknown transaction fact." }, { status: 400 });
    }

    const parsedValue = parseFactValue(factKey, record.value);
    if (parsedValue === INVALID) {
      return NextResponse.json({ error: "Invalid transaction fact value." }, { status: 400 });
    }

    const transaction = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null,
        OR: [{ clientUserId: actor.id }, { ownerId: actor.id }]
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    }

    const data = asRecord(transaction.data) ?? {};
    const previousFacts = asRecord(data.requirementFacts) ?? {};
    const previousValue = previousFacts[factKey];
    const nextFacts = {
      ...previousFacts,
      [factKey]: parsedValue
    } as Prisma.InputJsonObject;

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.rosObject.update({
        where: { id: transaction.id },
        data: {
          data: {
            ...data,
            requirementFacts: nextFacts
          } as Prisma.InputJsonObject
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: transaction.id,
          actorId: actor.id,
          eventType: "transaction.requirement_fact.updated",
          summary: `Transaction checklist information updated: ${factKey}`,
          previousValue: { value: previousValue ?? null },
          newValue: { value: parsedValue }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.transaction.requirement_fact.updated",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary: `Updated transaction checklist fact ${factKey}`,
          metadata: {
            factKey,
            previousValue: previousValue ?? null,
            value: parsedValue
          }
        }
      });

      return next;
    });

    return NextResponse.json({ transaction: updated, factKey, value: parsedValue });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server"))
    ) {
      return NextResponse.json({ error: "Transaction storage is temporarily unavailable." }, { status: 503 });
    }

    throw error;
  }
}

const INVALID = Symbol("invalid");

function parseFactValue(factKey: TransactionFactKey, value: unknown): string | number | boolean | typeof INVALID {
  if (booleanFactKeys.has(factKey)) {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return INVALID;
  }

  if (factKey === "yearBuilt") {
    const numeric = typeof value === "number" ? value : Number(value);
    const currentYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(numeric) || numeric < 1600 || numeric > currentYear) return INVALID;
    return numeric;
  }

  if (factKey === "propertyUse") {
    return value === "residential" || value === "income_residential" || value === "land" || value === "commercial"
      ? value
      : INVALID;
  }

  if (factKey === "financingType") {
    return value === "cash" || value === "loan" || value === "owner_carry"
      ? value
      : INVALID;
  }

  return INVALID;
}

function isAllowedFactKey(value: string): value is TransactionFactKey {
  return [
    "propertyUse",
    "yearBuilt",
    "inHoa",
    "squareFootageAdvertised",
    "sellerDisclosureExempt",
    "waterDisclosureSatisfied",
    "financingType",
    "shortSale",
    "foreclosure",
    "manufacturedHome",
    "hasCounterproposal",
    "contractAmended",
    "inspectionObjectionUsed",
    "titleObjectionUsed",
    "appraisalObjectionUsed",
    "contractTerminated",
    "contractRevived",
    "powerOfAttorneyUsed",
    "personalPropertyAgreementUsed",
    "postClosingOccupancy",
    "preClosingOccupancy",
    "affiliatedBusinessReferral",
    "referralFee"
  ].includes(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
