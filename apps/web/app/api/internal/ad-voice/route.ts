import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = "kads-260902-7c4a9f";

const VOICES: Record<string, { url: string; filename: string }> = {
  ig: {
    url: "https://resource2.heygen.ai/text_to_speech/fe6821dcc4f044298ffc81b5a25fbda5/03dca9ebfca441dba55fb14afa0791b7/id=012944d9-4298-4232-82a8-39f7a0b4a34e.wav",
    filename: "koinonia-instagram-voice.wav"
  },
  tt: {
    url: "https://resource2.heygen.ai/text_to_speech/fe6821dcc4f044298ffc81b5a25fbda5/03dca9ebfca441dba55fb14afa0791b7/id=85f42f0b-4f6e-4d44-808b-5917ff4d07e5.wav",
    filename: "koinonia-tiktok-voice.wav"
  },
  fb: {
    url: "https://resource2.heygen.ai/text_to_speech/fe6821dcc4f044298ffc81b5a25fbda5/03dca9ebfca441dba55fb14afa0791b7/id=fd97ba46-7322-425c-807d-37896137e15e.wav",
    filename: "koinonia-facebook-voice.wav"
  },
  li: {
    url: "https://resource2.heygen.ai/text_to_speech/fe6821dcc4f044298ffc81b5a25fbda5/330290724a1b470fb63153f34d4c0183/id=1cca8fce-7fc5-4b1d-bf53-d7c9625a499e.wav",
    filename: "koinonia-linkedin-voice.wav"
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const key = searchParams.get("key") || "";

  if (token !== TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const source = VOICES[key];
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstream = await fetch(source.url, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Upstream media unavailable", status: upstream.status },
      { status: 502 }
    );
  }

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "audio/wav",
      "Content-Disposition": `inline; filename="${source.filename}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}
