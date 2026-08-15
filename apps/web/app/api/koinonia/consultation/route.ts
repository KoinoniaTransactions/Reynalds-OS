import { NextResponse } from "next/server";
import type { Prisma } from "@reynalds-os/database";
import { prisma } from "../../../../lib/db";
import {
  mapConsultationTypeToRelationshipIntent,
  mergeKoinoniaRelationshipData,
  normalizeKoinoniaRelationshipData,
  preserveAdvancedLifecycle
} from "../../../../lib/koinonia-relationship";

export const runtime = "nodejs";

const koinoniaWorkspaceId = "wks_koinonia";
const ownerEmail = "jeremiah@koinoniaadmin.com";

type ConsultationPayload = {
  consultationType?: unknown;
  consultationSubject?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  preferredDate?: unknown;
  preferredTime?: unknown;
  notes?: unknown;
  website?: unknown;
};

const recipientEmail =
  process.env.CONTACT_INTAKE_TO_EMAIL || ownerEmail;

const senderEmail =
  process.env.CONTACT_INTAKE_FROM_EMAIL ||
  "Koinonia <noreply@koinoniatransactions.com>";

const allowedTimeWindows = new Set([
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM"
]);

function value(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function normalizePhone(input: string) {
  return input.replace(/\D/g, "");
}

function isValidEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function isWeekendDate(input: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;

  const date = new Date(`${input}T12:00:00`);
  const day = date.getDay();

  return day === 0 || day === 6;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildTextEmail({
  consultationType,
  name,
  email,
  phone,
  preferredDate,
  preferredTime,
  notes
}: {
  consultationType: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}) {
  return [
    "New Koinonia Consultation Request",
    "",
    `Consultation Type: ${consultationType}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Requested Date: ${preferredDate}`,
    `Requested Time: ${preferredTime}`,
    "",
    "Notes:",
    notes
  ].join("\n");
}

function buildHtmlEmail({
  consultationType,
  name,
  email,
  phone,
  preferredDate,
  preferredTime,
  notes
}: {
  consultationType: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}) {
  const rows = [
    ["Consultation Type", consultationType],
    ["Name", name],
    ["Email", email],
    ["Phone", phone],
    ["Requested Date", preferredDate],
    ["Requested Time", preferredTime]
  ];

  return `
    <div style="font-family: Arial, sans-serif; color: #181818; line-height: 1.55;">
      <h1 style="margin: 0 0 18px;">New Koinonia Consultation Request</h1>
      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 680px;">
        ${rows
          .map(
            ([label, rowValue]) => `
              <tr>
                <td style="border: 1px solid #e8dfcf; padding: 10px 12px; font-weight: 700; width: 180px;">
                  ${escapeHtml(label)}
                </td>
                <td style="border: 1px solid #e8dfcf; padding: 10px 12px;">
                  ${escapeHtml(rowValue)}
                </td>
              </tr>
            `
          )
          .join("")}
      </table>

      <h2 style="margin: 22px 0 8px;">Notes</h2>
      <div style="white-space: pre-wrap; border: 1px solid #e8dfcf; padding: 14px 16px; max-width: 680px; background: #fbf8f2;">
        ${escapeHtml(notes)}
      </div>
    </div>
  `;
}

async function persistConsultationRelationship({
  consultationType,
  name,
  email,
  phone,
  preferredDate,
  preferredTime,
  notes
}: {
  consultationType: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}) {
  const intent = mapConsultationTypeToRelationshipIntent(consultationType);
  const relationships = await prisma.rosObject.findMany({
    where: {
      workspaceId: koinoniaWorkspaceId,
      objectType: "Relationship",
      archivedAt: null
    },
    orderBy: { updatedAt: "desc" }
  });

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  const existing = relationships.find((relationship) => {
    const profile = normalizeKoinoniaRelationshipData(relationship.data);
    const relationshipEmail = normalizeEmail(profile.contact?.email ?? "");
    const relationshipPhone = normalizePhone(profile.contact?.phone ?? "");

    return (
      (normalizedEmail && relationshipEmail === normalizedEmail) ||
      (normalizedPhone && relationshipPhone === normalizedPhone)
    );
  });

  const existingProfile = normalizeKoinoniaRelationshipData(existing?.data);
  const submittedAt = new Date().toISOString();
  const profile = mergeKoinoniaRelationshipData(existing?.data, {
    relationshipProfileVersion: 1,
    contact: {
      email,
      phone
    },
    acquisition: {
      source: existingProfile.acquisition?.source || "Website",
      sourceDetail:
        existingProfile.acquisition?.sourceDetail || "Public consultation scheduler",
      firstTouchChannel:
        existingProfile.acquisition?.firstTouchChannel || "Website",
      material: existingProfile.acquisition?.material || "Website",
      firstTouchDate:
        existingProfile.acquisition?.firstTouchDate || submittedAt.slice(0, 10)
    },
    problem: {
      primaryPressure:
        existingProfile.problem?.primaryPressure || intent.pressure,
      exactLanguage: notes
    },
    diagnosis: {
      path: existingProfile.diagnosis?.path || "Undetermined",
      requestedService: intent.service
    },
    consultationRequest: {
      type: consultationType,
      preferredDate,
      preferredTime,
      notes,
      submittedAt
    },
    growth: {
      lastMeaningfulInteraction: submittedAt
    }
  });

  const nextAction = `Review consultation request for ${preferredDate} · ${preferredTime}`;
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  return prisma.$transaction(async (tx) => {
    const relationship = existing
      ? await tx.rosObject.update({
          where: { id: existing.id },
          data: {
            name,
            status: preserveAdvancedLifecycle(existing.status, "Consultation"),
            health: existing.health || "Healthy",
            nextAction,
            data: profile as Prisma.InputJsonValue
          }
        })
      : await tx.rosObject.create({
          data: {
            workspaceId: koinoniaWorkspaceId,
            objectType: "Relationship",
            name,
            status: "Consultation",
            health: "Healthy",
            nextAction,
            data: profile as Prisma.InputJsonValue
          }
        });

    await tx.timelineEvent.create({
      data: {
        workspaceId: koinoniaWorkspaceId,
        objectId: relationship.id,
        eventType: "consultation.requested",
        summary: `Website consultation requested: ${consultationType} · ${preferredDate} · ${preferredTime}`,
        newValue: {
          consultationType,
          preferredDate,
          preferredTime,
          notes
        }
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
      const task = await tx.task.create({
        data: {
          workspaceId: koinoniaWorkspaceId,
          relatedObjectId: relationship.id,
          ownerId: owner?.workspaceId === koinoniaWorkspaceId ? owner.id : undefined,
          title: nextAction,
          status: "Open",
          priority: "Normal"
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: koinoniaWorkspaceId,
          objectId: relationship.id,
          actorId: owner?.workspaceId === koinoniaWorkspaceId ? owner.id : undefined,
          eventType: "task.created",
          summary: `Task created: ${task.title}`,
          newValue: task
        }
      });
    }

    return relationship;
  });
}

export async function POST(request: Request) {
  let payload: ConsultationPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }

  if (value(payload.website)) {
    return NextResponse.json({
      ok: true,
      message:
        "Your consultation request has been received. Koinonia will follow up with next steps."
    });
  }

  const consultationType = value(payload.consultationType);
  const consultationSubject = value(payload.consultationSubject);
  const name = value(payload.name);
  const email = value(payload.email);
  const phone = value(payload.phone);
  const preferredDate = value(payload.preferredDate);
  const preferredTime = value(payload.preferredTime);
  const notes = value(payload.notes);

  if (
    !consultationType ||
    !name ||
    !email ||
    !phone ||
    !preferredDate ||
    !preferredTime ||
    !notes
  ) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (isWeekendDate(preferredDate)) {
    return NextResponse.json(
      { error: "Please choose a Monday–Friday consultation date." },
      { status: 400 }
    );
  }

  if (!allowedTimeWindows.has(preferredTime)) {
    return NextResponse.json(
      { error: "Please choose a valid consultation time window." },
      { status: 400 }
    );
  }

  try {
    await persistConsultationRelationship({
      consultationType,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes
    });
  } catch (error) {
    console.error("Koinonia consultation CRM write failed:", error);
    return NextResponse.json(
      {
        error:
          "The consultation request could not be saved. Please try again or contact Koinonia directly."
      },
      { status: 500 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      "Koinonia consultation saved to CRM, but RESEND_API_KEY is not configured."
    );
    return NextResponse.json({
      ok: true,
      message:
        "Your consultation request has been received. Koinonia will follow up with next steps."
    });
  }

  const subject =
    consultationSubject || `Koinonia Consultation Request — ${consultationType}`;

  const emailPayload = {
    from: senderEmail,
    to: [recipientEmail],
    subject,
    html: buildHtmlEmail({
      consultationType,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes
    }),
    text: buildTextEmail({
      consultationType,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes
    })
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      "Koinonia consultation saved to CRM, but notification email failed:",
      errorBody
    );

    return NextResponse.json({
      ok: true,
      message:
        "Your consultation request has been received. Koinonia will follow up with next steps."
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "Your consultation request has been sent. Koinonia will follow up with next steps."
  });
}
