import { NextResponse } from "next/server";

import { assertPermission } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import {
  mergeKoinoniaRelationshipData,
  normalizeKoinoniaRelationshipData,
  preserveAdvancedLifecycle,
  type RelationshipQuickCaptureSuggestion
} from "../../../../../lib/koinonia-relationship";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function confirmedSuggestion(value: unknown): RelationshipQuickCaptureSuggestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;

  return {
    brokerage: text(source.brokerage),
    lifecycle: text(source.lifecycle),
    source: text(source.source),
    material: text(source.material),
    primaryPressure: text(source.primaryPressure),
    path: text(source.path),
    requestedService: text(source.requestedService),
    recommendedService: text(source.recommendedService),
    nextAction: text(source.nextAction)
  };
}

export async function POST(request: Request, { params }: Params) {
  const user = await assertPermission("objects:update");
  const { id } = await params;
  const body = await request.json();
  const note = text(body.note);
  const confirmed = confirmedSuggestion(body.confirmed);

  if (!note) {
    return NextResponse.json({ error: "Interaction note is required." }, { status: 400 });
  }

  const existing = await prisma.rosObject.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId,
      objectType: "Relationship",
      archivedAt: null
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Relationship not found." }, { status: 404 });
  }

  const current = normalizeKoinoniaRelationshipData(existing.data);
  const capturedAt = new Date().toISOString();
  const interactions = [
    ...(current.learning?.interactions ?? []),
    {
      capturedAt,
      note,
      confirmed
    }
  ].slice(-50);

  const profile = mergeKoinoniaRelationshipData(existing.data, {
    relationshipProfileVersion: 1,
    contact: confirmed.brokerage ? { brokerage: confirmed.brokerage } : undefined,
    acquisition: {
      ...(confirmed.source ? { source: confirmed.source } : {}),
      ...(confirmed.material ? { material: confirmed.material } : {})
    },
    problem: confirmed.primaryPressure
      ? { primaryPressure: confirmed.primaryPressure }
      : undefined,
    diagnosis: {
      ...(confirmed.path ? { path: confirmed.path } : {}),
      ...(confirmed.requestedService ? { requestedService: confirmed.requestedService } : {}),
      ...(confirmed.recommendedService ? { recommendedService: confirmed.recommendedService } : {})
    },
    growth: {
      lastMeaningfulInteraction: capturedAt
    },
    learning: {
      interactions
    }
  });

  const nextStatus = confirmed.lifecycle
    ? preserveAdvancedLifecycle(existing.status, confirmed.lifecycle)
    : existing.status;

  const object = await prisma.rosObject.update({
    where: { id },
    data: {
      status: nextStatus,
      nextAction: confirmed.nextAction || existing.nextAction,
      data: profile
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: object.id,
      actorId: user.id,
      eventType: "relationship.interaction.captured",
      summary: `Relationship interaction captured: ${object.name}`,
      newValue: {
        capturedAt,
        note,
        confirmed
      }
    }
  });

  return NextResponse.json({ object, interaction: { capturedAt, note, confirmed } }, { status: 201 });
}
