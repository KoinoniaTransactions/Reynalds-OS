import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "reynalds-os-web",
    version: "8.5.0"
  });
}
