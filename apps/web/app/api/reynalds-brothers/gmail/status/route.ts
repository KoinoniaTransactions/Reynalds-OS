import { NextResponse } from "next/server";
import { assertPermission } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import {
  RB_GMAIL_EXPECTED_ACCOUNT
} from "../../../../../lib/reynalds-brothers-gmail";
import {
  REYNALDS_BROTHERS_GMAIL_LABEL_NAME
} from "../../../../../lib/reynalds-brothers-email-intake";
import { REYNALDS_BROTHERS_WORKSPACE_ID } from "../../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertPermission("objects:view");

    const [connection, checkpoint] = await Promise.all([
      prisma.gmailConnection.findFirst({
        where: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          status: "active"
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.importCheckpoint.findUnique({
        where: {
          workspaceId_source_mailbox_label: {
            workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
            source: "gmail",
            mailbox: RB_GMAIL_EXPECTED_ACCOUNT,
            label: REYNALDS_BROTHERS_GMAIL_LABEL_NAME
          }
        }
      })
    ]);

    return NextResponse.json({
      connected: Boolean(connection),
      accountEmail: connection?.accountEmail ?? RB_GMAIL_EXPECTED_ACCOUNT,
      label: REYNALDS_BROTHERS_GMAIL_LABEL_NAME,
      lastConnectedAt: connection?.lastConnectedAt ?? null,
      lastSyncedAt: checkpoint?.lastSyncedAt ?? null,
      syncStatus: checkpoint?.status ?? "not_started",
      syncMetadata: checkpoint?.metadata ?? null,
      requiredEnvironment: {
        googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        googleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        encryptionSecret: Boolean(process.env.RB_GMAIL_ENCRYPTION_SECRET)
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Gmail status could not be loaded."
    }, { status: 400 });
  }
}
