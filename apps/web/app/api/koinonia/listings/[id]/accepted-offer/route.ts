import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";

import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  LISTING_ENGAGEMENT_OBJECT_TYPE,
  LISTING_TO_TRANSACTION_RELATIONSHIP,
  TRANSACTION_OBJECT_TYPE,
  asRecord,
  buildTransactionDataFromListing,
  validateAcceptedOffer
} from "../../../../../../lib/koinonia-listings";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const user = await assertPermission("objects:update");
  await assertPermission("objects:create");
  const { id } = await params;

  try {
    const offer = validateAcceptedOffer(await request.json());

    const listing = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
        objectType: LISTING_ENGAGEMENT_OBJECT_TYPE,
        archivedAt: null
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing engagement not found." }, { status: 404 });
    }

    const existingHandoff = await prisma.objectRelationship.findFirst({
      where: {
        sourceObjectId: listing.id,
        relationshipType: LISTING_TO_TRANSACTION_RELATIONSHIP,
        targetObject: {
          workspaceId: user.workspaceId,
          objectType: TRANSACTION_OBJECT_TYPE,
          archivedAt: null
        }
      },
      include: { targetObject: true }
    });

    if (existingHandoff) {
      return NextResponse.json({
        transaction: existingHandoff.targetObject,
        listing,
        existing: true
      });
    }

    const listingData = asRecord(listing.data);
    const propertyAddress =
      typeof listingData.propertyAddress === "string" && listingData.propertyAddress.trim()
        ? listingData.propertyAddress.trim()
        : listing.name;
    const sellerNames =
      typeof listingData.sellerNames === "string" && listingData.sellerNames.trim()
        ? listingData.sellerNames.trim()
        : "Seller";

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transaction = await tx.rosObject.create({
        data: {
          workspaceId: user.workspaceId,
          objectType: TRANSACTION_OBJECT_TYPE,
          name: `${propertyAddress} — ${sellerNames}`,
          status: "Under Contract",
          health: "Healthy",
          ownerId: listing.ownerId ?? user.id,
          nextAction: "Validate executed contract and build the deadline timeline",
          data: buildTransactionDataFromListing(
            listing.id,
            listingData,
            offer
          ) as Prisma.InputJsonValue
        }
      });

      await tx.objectRelationship.create({
        data: {
          sourceObjectId: listing.id,
          targetObjectId: transaction.id,
          relationshipType: LISTING_TO_TRANSACTION_RELATIONSHIP
        }
      });

      const updatedListingData = {
        ...listingData,
        phase: "under_contract",
        transactionId: transaction.id,
        acceptedOffer: {
          buyerNames: offer.buyerNames ?? null,
          buyerAgent: offer.buyerAgent ?? null,
          closingDate: offer.closingDate ?? null,
          closingCompany: offer.closingCompany ?? null,
          contractNotes: offer.contractNotes ?? null
        }
      } as Prisma.InputJsonValue;

      const updatedListing = await tx.rosObject.update({
        where: { id: listing.id },
        data: {
          status: "Under Contract",
          nextAction: "Transaction opened; continue contract-to-close management",
          data: updatedListingData
        }
      });

      await tx.task.createMany({
        data: [
          {
            workspaceId: user.workspaceId,
            relatedObjectId: transaction.id,
            ownerId: listing.ownerId ?? user.id,
            title: "Validate executed contract and extract critical dates",
            status: "Open",
            priority: "High"
          },
          {
            workspaceId: user.workspaceId,
            relatedObjectId: transaction.id,
            ownerId: listing.ownerId ?? user.id,
            title: "Confirm title, closing, lender, and participant information",
            status: "Open",
            priority: "Normal"
          },
          {
            workspaceId: user.workspaceId,
            relatedObjectId: transaction.id,
            ownerId: listing.ownerId ?? user.id,
            title: "Build contract-to-close communication and QA schedule",
            status: "Open",
            priority: "Normal"
          }
        ]
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: user.workspaceId,
          objectId: listing.id,
          actorId: user.id,
          eventType: "listing.accepted_offer_handoff",
          summary: `Accepted offer handed off to Transaction ${transaction.id}.`,
          previousValue: listing,
          newValue: updatedListing
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: user.workspaceId,
          objectId: transaction.id,
          actorId: user.id,
          eventType: "transaction.created_from_listing",
          summary: `Transaction created from Listing Engagement ${listing.id}.`,
          newValue: transaction
        }
      });

      return { transaction, listing: updatedListing };
    });

    return NextResponse.json({ ...result, existing: false }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to hand off accepted offer." },
      { status: 400 }
    );
  }
}
