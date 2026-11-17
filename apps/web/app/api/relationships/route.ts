import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { getAuthErrorResponse } from "../../../lib/api-auth";

export async function POST(request: Request) {
  try {
    const actor = await assertPermission("objects:update");
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid relationship" }, { status: 400 });
    const input = body as Record<string, unknown>;
    const { sourceObjectId, targetObjectId, relationshipType } = input;
    if (typeof sourceObjectId !== "string" || !sourceObjectId || sourceObjectId.length > 100 || typeof targetObjectId !== "string" || !targetObjectId || targetObjectId.length > 100 || sourceObjectId === targetObjectId || typeof relationshipType !== "string" || !relationshipType.trim() || relationshipType.length > 80) return NextResponse.json({ error: "Two distinct object IDs and a relationship type are required" }, { status: 400 });
    const relationship = await prisma.$transaction(async tx => {
      const found = await tx.rosObject.count({ where: { id: { in: [sourceObjectId, targetObjectId] }, workspaceId: actor.workspaceId, archivedAt: null } });
      if (found !== 2) return null;
      const created = await tx.objectRelationship.create({ data: { sourceObjectId, targetObjectId, relationshipType: relationshipType.trim() } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "relationship.linked", subjectType: "ObjectRelationship", subjectId: created.id, summary: "Workspace objects linked", metadata: { sourceObjectId, targetObjectId, relationshipType } } });
      await tx.timelineEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, objectId: sourceObjectId, eventType: "relationship.linked", summary: "Related object linked", newValue: { targetObjectId, relationshipType } } });
      return created;
    });
    if (!relationship) return NextResponse.json({ error: "Objects not found in this workspace" }, { status: 404 });
    return NextResponse.json({ relationship }, { status: 201 });
  } catch (error) { return getAuthErrorResponse(error) ?? NextResponse.json({ error: "Unable to link objects" }, { status: 503 }); }
}
