import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function GET(request: Request) {
  assertPermission("objects:view");
  const url = new URL(request.url);
  const objectId = url.searchParams.get("objectId");

  const runs = await prisma.workflowRun.findMany({
    where: {
      ...(objectId ? { objectId } : {})
    },
    orderBy: { startedAt: "desc" },
    take: 100
  });

  return NextResponse.json({ runs });
}
