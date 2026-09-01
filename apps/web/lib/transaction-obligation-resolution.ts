import type { Prisma } from "@reynalds-os/database";
import { getTransactionObligationEvidenceRules } from "./transaction-obligation-evidence";
import {
  obligationHealthFromState,
  obligationStatusFromState,
  readTransactionObligationData,
  transactionObligationRelationshipType,
  type TransactionObligationData
} from "./transaction-obligations";

export async function satisfyTransactionObligationsFromDocument(input: {
  tx: Prisma.TransactionClient;
  workspaceId: string;
  transactionId: string;
  actorId: string;
  documentId: string;
  documentType: string;
  occurredAt: string;
}): Promise<{ satisfied: number; obligationIds: string[] }> {
  const rules = getTransactionObligationEvidenceRules(input.documentType);
  if (!rules.length) return { satisfied: 0, obligationIds: [] };

  const links = await input.tx.objectRelationship.findMany({
    where: {
      sourceObjectId: input.transactionId,
      relationshipType: transactionObligationRelationshipType
    },
    include: { targetObject: true }
  });

  const matchingKeys = new Map<string, string>();
  for (const rule of rules) {
    for (const key of rule.obligationKeys) matchingKeys.set(key, rule.reason);
  }

  const satisfiedIds: string[] = [];

  for (const link of links) {
    const obligation = link.targetObject;
    const data = readTransactionObligationData(obligation.data);
    if (!data || !matchingKeys.has(data.obligationKey)) continue;
    if (["superseded", "not_applicable", "satisfied"].includes(data.state)) continue;

    const reason = matchingKeys.get(data.obligationKey)!;
    const evidenceDocumentIds = [...new Set([...(data.evidenceDocumentIds ?? []), input.documentId])];
    const nextData: TransactionObligationData = {
      ...data,
      state: "satisfied",
      evidenceDocumentIds,
      satisfiedAt: input.occurredAt,
      satisfiedReason: reason
    };

    await input.tx.rosObject.update({
      where: { id: obligation.id },
      data: {
        status: obligationStatusFromState("satisfied"),
        health: obligationHealthFromState("satisfied"),
        nextAction: "Satisfied by transaction evidence.",
        data: nextData as unknown as Prisma.InputJsonObject
      }
    });

    await input.tx.timelineEvent.create({
      data: {
        workspaceId: input.workspaceId,
        objectId: input.transactionId,
        actorId: input.actorId,
        eventType: "transaction.obligation.satisfied_by_evidence",
        summary: `${data.label} satisfied by ${input.documentType}`,
        previousValue: {
          obligationId: obligation.id,
          state: data.state,
          dueDate: data.dueDate ?? null
        },
        newValue: {
          obligationId: obligation.id,
          state: "satisfied",
          evidenceDocumentId: input.documentId,
          documentType: input.documentType,
          reason
        }
      }
    });

    satisfiedIds.push(obligation.id);
  }

  return { satisfied: satisfiedIds.length, obligationIds: satisfiedIds };
}

export async function resolveTransactionObligationByStaff(input: {
  tx: Prisma.TransactionClient;
  workspaceId: string;
  transactionId: string;
  obligationId: string;
  actorId: string;
  resolution: "satisfied" | "not_applicable";
  reason: string;
  occurredAt: string;
}): Promise<TransactionObligationData> {
  const link = await input.tx.objectRelationship.findFirst({
    where: {
      sourceObjectId: input.transactionId,
      targetObjectId: input.obligationId,
      relationshipType: transactionObligationRelationshipType
    },
    include: { targetObject: true }
  });

  if (!link) throw new Error("Transaction obligation was not found.");
  const data = readTransactionObligationData(link.targetObject.data);
  if (!data) throw new Error("Transaction obligation data is invalid.");
  if (data.state === "superseded") throw new Error("A superseded obligation cannot be resolved.");

  const nextData: TransactionObligationData = {
    ...data,
    state: input.resolution,
    ...(input.resolution === "satisfied"
      ? { satisfiedAt: input.occurredAt, satisfiedReason: input.reason }
      : { satisfiedReason: input.reason })
  };

  await input.tx.rosObject.update({
    where: { id: input.obligationId },
    data: {
      status: obligationStatusFromState(input.resolution),
      health: obligationHealthFromState(input.resolution),
      nextAction:
        input.resolution === "satisfied"
          ? "Resolved by Koinonia staff."
          : "Marked not applicable by Koinonia staff.",
      data: nextData as unknown as Prisma.InputJsonObject
    }
  });

  await input.tx.timelineEvent.create({
    data: {
      workspaceId: input.workspaceId,
      objectId: input.transactionId,
      actorId: input.actorId,
      eventType: "transaction.obligation.staff_resolved",
      summary: `${data.label} marked ${input.resolution === "satisfied" ? "satisfied" : "not applicable"}`,
      previousValue: {
        obligationId: input.obligationId,
        state: data.state
      },
      newValue: {
        obligationId: input.obligationId,
        state: input.resolution,
        reason: input.reason
      }
    }
  });

  return nextData;
}
