import { NextResponse } from "next/server";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function GET(request: Request) {
  const user = assertPermission("timeline:view");
  const url = new URL(request.url);
  const objectId = url.searchParams.get("objectId");

  const events = await prisma.timelineEvent.findMany({
    where: {
      workspaceId: user.workspaceId,
      ...(objectId ? { objectId } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const user = assertPermission("timeline:create");
  const body = await request.json();

  if (!body.objectId || !body.eventType || !body.summary) {
    return NextResponse.json({ error: "objectId, eventType, and summary are required." }, { status: 400 });
  }

  const event = await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: body.objectId,
      actorId: user.id,
      eventType: body.eventType,
      summary: body.summary,
      previousValue: body.previousValue,
      newValue: body.newValue
    }
  });

  return NextResponse.json({ event }, { status: 201 });
}
