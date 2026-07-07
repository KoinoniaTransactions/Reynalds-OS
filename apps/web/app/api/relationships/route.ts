import { NextResponse } from "next/server";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function POST(request: Request) {
  assertPermission("objects:update");
  const body = await request.json();

  if (!body.sourceObjectId || !body.targetObjectId || !body.relationshipType) {
    return NextResponse.json(
      { error: "sourceObjectId, targetObjectId, and relationshipType are required." },
      { status: 400 }
    );
  }

  const relationship = await prisma.objectRelationship.create({
    data: {
      sourceObjectId: body.sourceObjectId,
      targetObjectId: body.targetObjectId,
      relationshipType: body.relationshipType
    }
  });

  return NextResponse.json({ relationship }, { status: 201 });
}
