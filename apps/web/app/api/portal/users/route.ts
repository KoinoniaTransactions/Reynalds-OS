import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await assertPermission("employee-portal:staff:view");
    const url = new URL(request.url);
    const portalAccessStatus = url.searchParams.get("portalAccessStatus");
    const status = url.searchParams.get("status");

    const users = await prisma.user.findMany({
      where: {
        workspaceId: actor.workspaceId,
        ...(portalAccessStatus ? { portalAccessStatus } : {}),
        ...(status ? { status } : {})
      },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        email: true,
        status: true,
        portalAccessStatus: true,
        mfaRequired: true,
        lastLoginAt: true,
        invitedAt: true,
        deactivatedAt: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 100
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handlePortalUsersError(error);
  }
}

function handlePortalUsersError(error: unknown) {
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
