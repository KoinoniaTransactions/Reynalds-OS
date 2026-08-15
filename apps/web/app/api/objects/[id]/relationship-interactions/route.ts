import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";

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

function toPrismaJson(input: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(input)) as Prisma.InputJsonValue;
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
  const createFollowUpTask = body.createFollowUpTask === true && Boolean(confirmed.nextAction);

  if (!note) {
    return NextResponse.json({ error: "Interaction note is required." }, { status: 400 });
  }

  if (createFollowUpTask) {
    await assertPermission("tasks:update");
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

  const result = await prisma.$transaction(async (tx) => {
    const object = await tx.rosObject.update({
      where: { id },
      data: {
        status: nextStatus,
        nextAction: confirmed.nextAction || existing.nextAction,
        data: toPrismaJson(profile)
      }
    });

    await tx.timelineEvent.create({
      data: {
        workspaceId: user.workspaceId,
        objectId: object.id,
        actorId: user.id,
        eventType: "relationship.interaction.captured",
        summary: `Relationship interaction captured: ${object.name}`,
        newValue: toPrismaJson({
          capturedAt,
          note,
          confirmed
        })
      }
    });

    let task = null;
    let taskAlreadyOpen = false;

    if (createFollowUpTask && confirmed.nextAction) {
      const existingTask = await tx.task.findFirst({
        where: {
          workspaceId: user.workspaceId,
          relatedObjectId: object.id,
          status: "Open",
          title: confirmed.nextAction
        }
      });

      if (existingTask) {
        task = existingTask;
        taskAlreadyOpen = true;
      } else {
        task = await tx.task.create({
          data: {
            workspaceId: user.workspaceId,
            relatedObjectId: object.id,
            ownerId: user.id,
            title: confirmed.nextAction,
            status: "Open",
            priority: "Normal"
          }
        });

        await tx.timelineEvent.create({
          data: {
            workspaceId: user.workspaceId,
            objectId: object.id,
            actorId: user.id,
            eventType: "task.created",
            summary: `Task created: ${task.title}`,
            newValue: toPrismaJson(task)
          }
        });
      }
    }

    return { object, task, taskAlreadyOpen };
  });

  return NextResponse.json(
    {
      object: result.object,
      interaction: { capturedAt, note, confirmed },
      followUpTask: result.task,
      followUpTaskAlreadyOpen: result.taskAlreadyOpen
    },
    { status: 201 }
  );
}
