import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
  process.env.CONTACT_INTAKE_TO_EMAIL || "jeremiah@koinoniaadmin.com";

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

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured yet. Add RESEND_API_KEY before using the live consultation form."
      },
      { status: 503 }
    );
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

    console.error("Koinonia consultation email failed:", errorBody);

    return NextResponse.json(
      {
        error:
          "The consultation request could not be sent. Please try again or contact Koinonia directly."
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      "Your consultation request has been sent. Koinonia will follow up with next steps."
  });
}
