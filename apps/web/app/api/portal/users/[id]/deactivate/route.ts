import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { getPortalUserDeactivationBlocker } from "../../../../../../lib/portal-users";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("employee-portal:assignments:update");
    const { id } = await params;

    const portalUser = await prisma.user.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId
      },
      include: {
        role: true
      }
    });

    if (!portalUser) {
      return NextResponse.json({ error: "Portal user not found." }, { status: 404 });
    }

    const blocker = getPortalUserDeactivationBlocker({
      actorUserId: actor.id,
      targetUserId: portalUser.id,
      status: portalUser.status,
      portalAccessStatus: portalUser.portalAccessStatus
    });

    if (blocker === "You cannot deactivate your own portal access.") {
      return NextResponse.json({ error: blocker }, { status: 400 });
    }

    if (blocker) {
      return NextResponse.json({ user: portalUser, message: blocker });
    }

    const deactivatedUser = await prisma.user.update({
      where: { id: portalUser.id },
      data: {
        status: "inactive",
        portalAccessStatus: "deactivated",
        deactivatedAt: new Date()
      },
      include: {
        role: true
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.user.deactivated",
        subjectType: "User",
        subjectId: portalUser.id,
        summary: `Portal user deactivated: ${portalUser.email}`,
        metadata: {
          roleName: portalUser.role?.name,
          previousStatus: portalUser.status,
          previousPortalAccessStatus: portalUser.portalAccessStatus
        }
      }
    });

    return NextResponse.json({ user: deactivatedUser });
  } catch (error) {
    return handleDeactivateError(error);
  }
}

function handleDeactivateError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Portal user storage is temporarily unavailable." }, { status: 503 });
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
