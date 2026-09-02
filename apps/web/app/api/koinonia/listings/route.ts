import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";

import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  LISTING_ENGAGEMENT_OBJECT_TYPE,
  buildInitialListingTasks,
  buildListingData,
  buildListingName,
  validateListingIntake
} from "../../../../lib/koinonia-listings";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = assertPermission("objects:view");

  const listings = await prisma.rosObject.findMany({
    where: {
      workspaceId: user.workspaceId,
      objectType: LISTING_ENGAGEMENT_OBJECT_TYPE,
      archivedAt: null
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const user = assertPermission("objects:create");

  try {
    const input = validateListingIntake(await request.json());
    const listingName = buildListingName(input);
    const listingData = buildListingData(input) as Prisma.InputJsonValue;
    const initialTasks = buildInitialListingTasks(input);

    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.rosObject.create({
        data: {
          workspaceId: user.workspaceId,
          objectType: LISTING_ENGAGEMENT_OBJECT_TYPE,
          name: listingName,
          status: "Intake",
          health: "Healthy",
          ownerId: user.id,
          nextAction: "Validate listing authority, documents, and launch requirements",
          data: listingData
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: user.workspaceId,
          objectId: created.id,
          actorId: user.id,
          eventType: "listing.intake_received",
          summary: `New listing received: ${input.propertyAddress}`,
          newValue: created
        }
      });

      await tx.task.createMany({
        data: initialTasks.map((title) => ({
          workspaceId: user.workspaceId,
          relatedObjectId: created.id,
          ownerId: user.id,
          title,
          status: "Open",
          priority: "Normal"
        }))
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: user.workspaceId,
          objectId: created.id,
          actorId: user.id,
          eventType: "listing.launch_checklist_created",
          summary: `${initialTasks.length} listing launch tasks created.`,
          newValue: { tasks: initialTasks }
        }
      });

      return created;
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create listing engagement." },
      { status: 400 }
    );
  }
}
