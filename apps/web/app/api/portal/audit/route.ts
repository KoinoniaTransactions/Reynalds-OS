import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { normalizeAuditLimit, portalAuditActionPrefix } from "../../../../lib/portal-audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await assertPermission("employee-portal:assignments:update");
    const url = new URL(request.url);
    const limit = normalizeAuditLimit(url.searchParams.get("limit"));

    const events = await prisma.auditEvent.findMany({
      where: {
        workspaceId: actor.workspaceId,
        action: {
          startsWith: portalAuditActionPrefix
        }
      },
      select: {
        id: true,
        action: true,
        actorEmail: true,
        createdAt: true,
        subjectId: true,
        subjectType: true,
        summary: true
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ events });
  } catch (error) {
    return handlePortalAuditError(error);
  }
}

function handlePortalAuditError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Portal audit history is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
