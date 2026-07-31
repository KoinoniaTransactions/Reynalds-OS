import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/db";

const RB_WORKSPACE_ID = "wks_reynalds_brothers";

const snapshotStatus = {
  source: "Gmail",
  label: "WalMart Tanks",
  mailboxPath: "wmtanks@reynaldsbrothers.com",
  indexedMessageCount: 1600,
  hasMoreIndexedMessages: true,
  filedCommunications: 83,
  reviewQueueItems: 16,
  workItemCount: 66,
  storeCount: 63,
  liveStatus: "partial-live-snapshot",
  nextStep: "Finish Gmail pagination and background import before trial launch.",
  hostingStatus: "Sites private trial deployed at https://reynalds-brothers-os-trial.koinoniaadmi-1192.chatgpt.site"
};

export async function GET() {
  try {
    const workItems = await prisma.rosObject.findMany({
      where: {
        workspaceId: RB_WORKSPACE_ID,
        objectType: "rb.work_item",
        archivedAt: null
      },
      select: {
        id: true,
        data: true
      }
    });

    let filedCommunications = 0;
    let reviewQueueItems = 0;
    const storeNumbers = new Set<string>();

    for (const item of workItems) {
      const data = item.data as Record<string, unknown> | null;
      const communications = Array.isArray(data?.communications) ? data.communications : [];
      const reviewQueue = Array.isArray(data?.reviewQueue) ? data.reviewQueue : [];

      filedCommunications += communications.length;
      reviewQueueItems += reviewQueue.length;

      if (typeof data?.storeNumber === "string" && data.storeNumber.trim()) {
        storeNumbers.add(data.storeNumber);
      }
    }

    return NextResponse.json({
      ...snapshotStatus,
      filedCommunications,
      reviewQueueItems,
      workItemCount: workItems.length,
      storeCount: storeNumbers.size,
      dataMode: "database"
    });
  } catch {
    return NextResponse.json({
      ...snapshotStatus,
      dataMode: "snapshot-fallback"
    });
  }
}
