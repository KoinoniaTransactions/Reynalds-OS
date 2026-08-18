import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";

const koinoniaWorkspaceId = "wks_koinonia";
const ownerEmail = "jeremiah@koinoniaadmin.com";

type Attribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  fbclid: string;
  ttclid: string;
  referrer: string;
};

type RelationshipData = {
  contact?: Record<string, unknown>;
  acquisition?: Record<string, unknown>;
  problem?: Record<string, unknown>;
  diagnosis?: Record<string, unknown>;
  consultationRequest?: Record<string, unknown>;
  growth?: Record<string, unknown>;
  [key: string]: unknown;
};

function record(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};
}

function text(input: unknown) {
  return typeof input === "string" ? input : "";
}

function toPrismaJson(input: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(input)) as Prisma.InputJsonValue;
}

function normalizePhone(input: string) {
  return input.replace(/\D/g, "");
}

function mapIntent(consultationType: string) {
  const normalized = consultationType.toLowerCase();

  if (normalized.includes("transaction")) {
    return { pressure: "Transaction/File Capacity", service: "Transaction Support / Contract-to-Close Coordination", path: "Keep Client" };
  }
  if (normalized.includes("contract") || normalized.includes("document")) {
    return { pressure: "Contract/Document Workload", service: "Contract & Document Support", path: "Keep Client" };
  }
  if (normalized.includes("showing")) {
    return { pressure: "Showing/Schedule Conflict", service: "Licensed Showing Coverage", path: "Keep Client" };
  }
  if (normalized.includes("open house")) {
    return { pressure: "Open House/Listing Capacity", service: "Professional Open House Coverage", path: "Keep Client" };
  }
  if (normalized.includes("monthly") || normalized.includes("operations")) {
    return { pressure: "CRM/Follow-Up/Business Organization", service: "Monthly Operations Partnership", path: "Keep Client" };
  }
  if (normalized.includes("referral")) {
    return { pressure: "Referral/No-Capacity Client Opportunity", service: "40% Referral Partner Option", path: "Refer Client" };
  }
  return { pressure: "Unclear/Other", service: consultationType || "Not Sure Yet", path: "Undetermined" };
}

function lifecycleRank(status: string) {
  const stages = [
    "Awareness", "Interest", "Lead", "Qualified Lead", "Consultation", "Proposal",
    "Client", "Active Engagement", "Successful Delivery", "Advocate", "Referral"
  ];
  const exact = stages.indexOf(status);
  if (exact !== -1) return exact;
  const legacy: Record<string, number> = { Open: 2, Active: 6, "Active Client": 6, Complete: 8, Closed: 8 };
  return legacy[status] ?? -1;
}

function preserveLifecycle(currentStatus: string, proposedStatus: string) {
  const current = lifecycleRank(currentStatus);
  const proposed = lifecycleRank(proposedStatus);
  if (current === -1) return proposedStatus;
  if (proposed === -1) return currentStatus;
  return current >= proposed ? currentStatus : proposedStatus;
}

function deriveAcquisition(attribution: Attribution) {
  const sourceName = attribution.utmSource.toLowerCase();
  const medium = attribution.utmMedium.toLowerCase();
  const isInstagram = sourceName.includes("instagram");
  const isFacebook = sourceName.includes("facebook") || sourceName.includes("meta");
  const isTikTok = sourceName.includes("tiktok") || Boolean(attribution.ttclid);
  const isEmail = sourceName.includes("email") || medium.includes("email");
  const isPaid = medium.includes("paid") || medium.includes("cpc") || Boolean(attribution.fbclid) || Boolean(attribution.ttclid);

  let source = "Website";
  let firstTouchChannel = "Website";
  let sourceDetail = "Public consultation scheduler";

  if (isInstagram || isFacebook || isTikTok) {
    source = "Social Media";
    firstTouchChannel = isInstagram ? "Instagram" : isTikTok ? "TikTok" : "Facebook";
    sourceDetail = `${firstTouchChannel}${isPaid ? " paid" : " organic"}`;
  } else if (isEmail) {
    source = "Email";
    firstTouchChannel = "Email";
    sourceDetail = attribution.utmSource || "Email campaign";
  } else if (attribution.utmSource) {
    sourceDetail = attribution.utmSource;
  } else if (attribution.referrer) {
    sourceDetail = `Referral from ${attribution.referrer}`;
  }

  const parts = [
    sourceDetail,
    attribution.utmMedium ? `medium=${attribution.utmMedium}` : "",
    attribution.utmContent ? `content=${attribution.utmContent}` : ""
  ].filter(Boolean);

  return {
    source,
    sourceDetail: parts.join(" · "),
    firstTouchChannel,
    campaign: attribution.utmCampaign,
    referrer: attribution.referrer
  };
}

export async function persistConsultationRelationship(input: {
  consultationType: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  attribution: Attribution;
}) {
  const intent = mapIntent(input.consultationType);
  const acquisition = deriveAcquisition(input.attribution);
  const relationships = await prisma.rosObject.findMany({
    where: { workspaceId: koinoniaWorkspaceId, objectType: "Relationship", archivedAt: null },
    orderBy: { updatedAt: "desc" }
  });

  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(input.phone);
  const existing = relationships.find((relationship) => {
    const data = record(relationship.data);
    const contact = record(data.contact);
    const relationshipEmail = text(contact.email).trim().toLowerCase();
    const relationshipPhone = normalizePhone(text(contact.phone));
    return (normalizedEmail && relationshipEmail === normalizedEmail) ||
      (normalizedPhone && relationshipPhone === normalizedPhone);
  });

  const current: RelationshipData = record(existing?.data) as RelationshipData;
  const currentContact = record(current.contact);
  const currentAcquisition = record(current.acquisition);
  const currentProblem = record(current.problem);
  const currentDiagnosis = record(current.diagnosis);
  const currentGrowth = record(current.growth);
  const submittedAt = new Date().toISOString();

  const data: RelationshipData = {
    ...current,
    relationshipProfileVersion: 1,
    contact: { ...currentContact, email: input.email, phone: input.phone },
    acquisition: {
      ...currentAcquisition,
      source: text(currentAcquisition.source) || acquisition.source,
      sourceDetail: text(currentAcquisition.sourceDetail) || acquisition.sourceDetail,
      firstTouchChannel: text(currentAcquisition.firstTouchChannel) || acquisition.firstTouchChannel,
      campaign: text(currentAcquisition.campaign) || acquisition.campaign,
      material: text(currentAcquisition.material) || "Website",
      firstTouchDate: text(currentAcquisition.firstTouchDate) || submittedAt.slice(0, 10),
      referrer: text(currentAcquisition.referrer) || acquisition.referrer
    },
    problem: {
      ...currentProblem,
      primaryPressure: text(currentProblem.primaryPressure) || intent.pressure,
      exactLanguage: text(currentProblem.exactLanguage) || input.notes
    },
    diagnosis: {
      ...currentDiagnosis,
      path: text(currentDiagnosis.path) && text(currentDiagnosis.path) !== "Undetermined" ? text(currentDiagnosis.path) : intent.path,
      requestedService: intent.service
    },
    consultationRequest: {
      type: input.consultationType,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      notes: input.notes,
      submittedAt
    },
    growth: { ...currentGrowth, lastMeaningfulInteraction: submittedAt }
  };

  const nextAction = `Review consultation request for ${input.preferredDate} · ${input.preferredTime}`;
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  return prisma.$transaction(async (tx) => {
    const relationship = existing
      ? await tx.rosObject.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            status: preserveLifecycle(existing.status, "Consultation"),
            health: existing.health || "Healthy",
            nextAction,
            data: toPrismaJson(data)
          }
        })
      : await tx.rosObject.create({
          data: {
            workspaceId: koinoniaWorkspaceId,
            objectType: "Relationship",
            name: input.name,
            status: "Consultation",
            health: "Healthy",
            nextAction,
            data: toPrismaJson(data)
          }
        });

    await tx.timelineEvent.create({
      data: {
        workspaceId: koinoniaWorkspaceId,
        objectId: relationship.id,
        eventType: "consultation.requested",
        summary: `Website consultation requested: ${input.consultationType} · ${input.preferredDate} · ${input.preferredTime}`,
        newValue: toPrismaJson({
          consultationType: input.consultationType,
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime,
          notes: input.notes,
          acquisition
        })
      }
    });

    const existingTask = await tx.task.findFirst({
      where: {
        workspaceId: koinoniaWorkspaceId,
        relatedObjectId: relationship.id,
        status: "Open",
        title: nextAction
      }
    });

    if (!existingTask) {
      await tx.task.create({
        data: {
          workspaceId: koinoniaWorkspaceId,
          relatedObjectId: relationship.id,
          ownerId: owner?.workspaceId === koinoniaWorkspaceId ? owner.id : undefined,
          title: nextAction,
          status: "Open",
          priority: "Normal"
        }
      });
    }

    return relationship;
  });
}
