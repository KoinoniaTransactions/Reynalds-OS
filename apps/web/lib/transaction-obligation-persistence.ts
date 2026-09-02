import type { Prisma } from "@reynalds-os/database";
import {
  deriveConfirmedExtractionObligations,
  obligationHealthFromState,
  obligationStatusFromState,
  readTransactionObligationData,
  transactionObligationObjectType,
  transactionObligationRelationshipType,
  type TransactionObligationData,
  type TransactionObligationSeed,
  type TransactionObligationState
} from "./transaction-obligations";
import { satisfyTransactionObligationsFromDocument } from "./transaction-obligation-resolution";
import type { TransactionExtractionProposal } from "./transaction-extraction";
import type { TransactionSide, TransactionStage } from "./transaction-intake";

export async function reconcileConfirmedTransactionObligations(input: {
  tx: Prisma.TransactionClient;
  workspaceId: string;
  transactionId: string;
  ownerId?: string | null;
  clientUserId?: string | null;
  actorId: string;
  side: TransactionSide;
  stage: TransactionStage;
  proposal: TransactionExtractionProposal;
  confirmedDocumentType: string;
  confirmedAt: string;
}): Promise<{ created: number; superseded: number; unchanged: number; evidenceSatisfied: number }> {
  const seeds = deriveConfirmedExtractionObligations({
    side: input.side,
    stage: input.stage,
    proposal: input.proposal,
    confirmedDocumentType: input.confirmedDocumentType,
    confirmedAt: input.confirmedAt
  });

  const links = await input.tx.objectRelationship.findMany({
    where: {
      sourceObjectId: input.transactionId,
      relationshipType: transactionObligationRelationshipType
    },
    include: { targetObject: true }
  });

  const obligations = links.map((link) => link.targetObject);
  let created = 0;
  let superseded = 0;
  let unchanged = 0;

  for (const seed of seeds) {
    const current = obligations
      .filter((item) => {
        const data = readTransactionObligationData(item.data);
        return data?.obligationKey === seed.obligationKey && data.state !== "superseded";
      })
      .sort((a, b) => {
        const aData = readTransactionObligationData(a.data);
        const bData = readTransactionObligationData(b.data);
        return (bData?.sequence ?? 0) - (aData?.sequence ?? 0);
      })[0];

    const currentData = current ? readTransactionObligationData(current.data) : null;

    if (current && currentData && currentData.dueDate === seed.dueDate) {
      await appendSourceDocument(input.tx, current.id, currentData, seed.sourceDocumentId);
      unchanged += 1;
      continue;
    }

    if (current && currentData && !seed.isScheduleRevision) {
      // A non-revision document is additional evidence/context, not authority to silently
      // replace an already-established contractual schedule.
      await appendSourceDocument(input.tx, current.id, currentData, seed.sourceDocumentId);
      unchanged += 1;
      continue;
    }

    if (current && currentData && seed.isScheduleRevision) {
      await input.tx.rosObject.update({
        where: { id: current.id },
        data: {
          status: "Superseded",
          health: "Healthy",
          nextAction: `Superseded by ${seed.sourceDocumentType}.`,
          data: {
            ...currentData,
            state: "superseded",
            supersededAt: input.confirmedAt,
            supersededBySourceDocumentId: seed.sourceDocumentId
          } as Prisma.InputJsonObject
        }
      });
      superseded += 1;
    }

    const sequence = (currentData?.sequence ?? 0) + 1;
    const state = initialState(seed);
    const obligationData: TransactionObligationData = {
      obligationKey: seed.obligationKey,
      label: seed.label,
      kind: seed.kind,
      category: seed.category,
      dueDate: seed.dueDate,
      activatedAt: seed.activatedAt,
      monitorAfter: seed.monitorAfter,
      state,
      sequence,
      sourceDocumentId: seed.sourceDocumentId,
      sourceDocumentType: seed.sourceDocumentType,
      sourceDocumentIds: [seed.sourceDocumentId],
      evidenceDocumentIds: [],
      ...(current ? { supersedesObligationId: current.id } : {})
    };

    const obligation = await input.tx.rosObject.create({
      data: {
        workspaceId: input.workspaceId,
        objectType: transactionObligationObjectType,
        name: `${seed.label} — ${seed.dueDate ?? "Transaction obligation"}`,
        status: obligationStatusFromState(state),
        health: obligationHealthFromState(state),
        ownerId: input.ownerId ?? undefined,
        clientUserId: input.clientUserId ?? undefined,
        nextAction:
          state === "baseline"
            ? "Historical baseline captured from the confirmed transaction package."
            : `Track ${seed.label} through completion, revision, or other resolution.`,
        data: obligationData as unknown as Prisma.InputJsonObject
      }
    });

    await input.tx.objectRelationship.create({
      data: {
        sourceObjectId: input.transactionId,
        targetObjectId: obligation.id,
        relationshipType: transactionObligationRelationshipType
      }
    });

    await input.tx.timelineEvent.create({
      data: {
        workspaceId: input.workspaceId,
        objectId: input.transactionId,
        actorId: input.actorId,
        eventType: current ? "transaction.obligation.superseded" : "transaction.obligation.created",
        summary: current
          ? `${seed.label} changed to ${seed.dueDate}`
          : `${seed.label} obligation established for ${seed.dueDate}`,
        previousValue: currentData
          ? {
              obligationId: current?.id,
              dueDate: currentData.dueDate ?? null,
              sequence: currentData.sequence
            }
          : undefined,
        newValue: {
          obligationId: obligation.id,
          obligationKey: seed.obligationKey,
          dueDate: seed.dueDate ?? null,
          sequence,
          sourceDocumentId: seed.sourceDocumentId,
          sourceDocumentType: seed.sourceDocumentType,
          state
        }
      }
    });

    obligations.push(obligation);
    created += 1;
  }

  const evidence = await satisfyTransactionObligationsFromDocument({
    tx: input.tx,
    workspaceId: input.workspaceId,
    transactionId: input.transactionId,
    actorId: input.actorId,
    documentId: input.proposal.sourceDocumentId,
    documentType: input.confirmedDocumentType,
    occurredAt: input.confirmedAt
  });

  return {
    created,
    superseded,
    unchanged,
    evidenceSatisfied: evidence.satisfied
  };
}

async function appendSourceDocument(
  tx: Prisma.TransactionClient,
  obligationId: string,
  data: TransactionObligationData,
  sourceDocumentId: string
) {
  const sourceDocumentIds = [...new Set([...(data.sourceDocumentIds ?? []), sourceDocumentId])];
  if (sourceDocumentIds.length === (data.sourceDocumentIds ?? []).length) return;

  await tx.rosObject.update({
    where: { id: obligationId },
    data: {
      data: {
        ...data,
        sourceDocumentIds
      } as unknown as Prisma.InputJsonObject
    }
  });
}

function initialState(seed: TransactionObligationSeed): TransactionObligationState {
  if (!seed.dueDate || !seed.monitorAfter) return "scheduled";
  const due = day(seed.dueDate);
  const monitor = day(seed.monitorAfter);
  if (due !== null && monitor !== null && due < monitor) return "baseline";
  return "scheduled";
}

function day(value: string): number | null {
  const timestamp = Date.parse(`${value.slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(timestamp) ? null : timestamp;
}
