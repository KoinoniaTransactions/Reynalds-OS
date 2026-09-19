import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/db";

const RB_WORKSPACE_ID = "wks_reynalds_brothers";
const HISTORICAL_INDEXED_MESSAGE_COUNT = 1600;

function jsonArrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export async function GET() {
  try {
    const [workItems, firstClassCommunicationCount, openReviewCount, checkpoint] = await Promise.all([
      prisma.rosObject.findMany({
        where: {
          workspaceId: RB_WORKSPACE_ID,
          objectType: "rb.work_item",
          archivedAt: null
        },
        select: {
          id: true,
          data: true
        }
      }),
      prisma.communication.count({
        where: { workspaceId: RB_WORKSPACE_ID }
      }),
      prisma.communicationReviewItem.count({
        where: {
          workspaceId: RB_WORKSPACE_ID,
          status: "open"
        }
      }),
      prisma.importCheckpoint.findFirst({
        where: {
          workspaceId: RB_WORKSPACE_ID,
          source: "gmail"
        },
        orderBy: { updatedAt: "desc" }
      })
    ]);

    let legacyFiledCommunications = 0;
    let legacyReviewQueueItems = 0;
    const storeNumbers = new Set<string>();

    for (const item of workItems) {
      const data = item.data as Record<string, unknown> | null;
      legacyFiledCommunications += Math.max(
        jsonArrayLength(data?.communicationLog),
        jsonArrayLength(data?.communications)
      );
      legacyReviewQueueItems += jsonArrayLength(data?.reviewQueue);

      if (typeof data?.storeNumber === "string" && data.storeNumber.trim()) {
        storeNumbers.add(data.storeNumber);
      }
    }

    return NextResponse.json({
      dataMode: "database",
      protectedHosting: "vercel-authentication",
      workItemCount: workItems.length,
      storeCount: storeNumbers.size,
      communicationStorage: {
        legacyWorkItemJson: legacyFiledCommunications,
        firstClassRows: firstClassCommunicationCount
      },
      reviewQueue: {
        legacyWorkItemJson: legacyReviewQueueItems,
        firstClassOpenRows: openReviewCount
      },
      gmail: {
        liveSync: false,
        mailbox: "wmtanks@reynaldsbrothers.com",
        label: "WalMart Tanks",
        historicalIndexedMessageCount: HISTORICAL_INDEXED_MESSAGE_COUNT,
        checkpoint: checkpoint
          ? {
              status: checkpoint.status,
              cursorPresent: Boolean(checkpoint.cursor),
              lastSyncedAt: checkpoint.lastSyncedAt
            }
          : null,
        note: "Historical Gmail evidence is present, but live Gmail synchronization is not implemented in Phase 1."
      }
    });
  } catch (error) {
    return NextResponse.json({
      dataMode: "snapshot-fallback",
      protectedHosting: "vercel-authentication",
      warning: error instanceof Error ? error.message : "Database unavailable.",
      gmail: {
        liveSync: false,
        mailbox: "wmtanks@reynaldsbrothers.com",
        label: "WalMart Tanks",
        historicalIndexedMessageCount: HISTORICAL_INDEXED_MESSAGE_COUNT,
        note: "Historical snapshot only; no live Gmail synchronization."
      }
    });
  }
}
