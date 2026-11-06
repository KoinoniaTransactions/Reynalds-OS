import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const acceptedKinds = new Set(["owner", "rental", "buyer", "seller", "general"]);
const MAX_BODY_BYTES = 12_000;
const MAX_TEXT = 1600;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function failure(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(req: NextRequest) {
  const configured =
    process.env.PROPERTIES_INQUIRIES_ENABLED === "true" &&
    Boolean(process.env.PROPERTIES_RESEND_API_KEY) &&
    Boolean(process.env.PROPERTIES_INQUIRY_TO_EMAIL) &&
    Boolean(process.env.PROPERTIES_INQUIRY_FROM_EMAIL) &&
    Boolean(process.env.PROPERTIES_TURNSTILE_SECRET_KEY);
  if (!configured) {
    return failure("Online inquiries are not currently enabled. Please contact us by email or phone.", 503);
  }

  const expectedOrigin = process.env.PROPERTIES_INQUIRY_ALLOWED_ORIGIN;
  const origin = req.headers.get("origin");
  if (!expectedOrigin || !origin || origin !== expectedOrigin) {
    return failure("This request could not be verified.", 403);
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return failure("Please shorten your message.", 413);
  }
  let data: Record<string, unknown>;
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return failure("Invalid submission format.", 415);
    }
    const source = await req.text();
    if (source.length > MAX_BODY_BYTES) return failure("Please shorten your message.", 413);
    data = JSON.parse(source) as Record<string, unknown>;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return failure("Invalid submission.", 400);
    }
  } catch {
    return failure("Invalid submission.", 400);
  }

  // This field must stay hidden to legitimate users.
  if (clean(data.website, 150)) {
    return failure("This submission could not be processed.", 400);
  }
  const kind = clean(data.kind, 20);
  const name = clean(data.name, 110);
  const email = clean(data.email, 180);
  const phone = clean(data.phone, 40);
  const propertyAddress = clean(data.propertyAddress, 250);
  const message = clean(data.message, MAX_TEXT);
  const token = clean(data.turnstileToken, 2200);
  if (!acceptedKinds.has(kind) || name.length < 2 || !emailPattern.test(email) ||
      message.length < 12 || !token) {
    return failure("Please complete your name, email, message and verification.", 400);
  }

  try {
    const proof = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.PROPERTIES_TURNSTILE_SECRET_KEY!,
        response: token
      }),
      signal: AbortSignal.timeout(7000)
    });
    const verified = await proof.json() as { success?: boolean; hostname?: string };
    if (!proof.ok || !verified.success) {
      return failure("Verification was unsuccessful. Please retry.", 403);
    }
    const allowedHostname = new URL(expectedOrigin).hostname;
    if (verified.hostname !== allowedHostname) {
      return failure("Verification was unsuccessful.", 403);
    }
  } catch {
    return failure("Verification could not be completed. Please retry.", 503);
  }

  const safeSubject = "Koinonia Properties " + kind.toUpperCase() + " inquiry";
  const text = [
    "New Koinonia Properties public-site inquiry",
    "Type: " + kind,
    "Name: " + name,
    "Email: " + email,
    "Phone: " + (phone || "Not provided"),
    "Property: " + (propertyAddress || "Not provided"),
    "Message:\n" + message,
    "Submission origin: " + origin
  ].join("\n\n");

  try {
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.PROPERTIES_RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.PROPERTIES_INQUIRY_FROM_EMAIL,
        to: [process.env.PROPERTIES_INQUIRY_TO_EMAIL],
        subject: safeSubject,
        text,
        reply_to: email
      }),
      signal: AbortSignal.timeout(8500)
    });
    if (!delivery.ok) {
      console.error("Properties inquiry mail delivery rejected", delivery.status);
      return failure("We could not submit your inquiry. Please contact us directly.", 502);
    }
    return NextResponse.json({ ok: true, message: "Your inquiry was submitted. We will follow up using the contact information provided." }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return failure("We could not submit your inquiry. Please contact us directly.", 503);
  }
}
