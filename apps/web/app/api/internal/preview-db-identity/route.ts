import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary read-only verification endpoint. Remove immediately after branch proof.
export async function GET() {
  if (process.env.VERCEL !== "1" || process.env.VERCEL_ENV !== "preview") {
    return new Response(null, { status: 404 });
  }

  await assertPermission("objects:view");

  const rows = await prisma.$queryRaw<
    Array<{ branch_id: string | null; branch_name: string | null }>
  >`SELECT current_setting('neon.branch_id', true) AS branch_id,
            current_setting('neon.branch_name', true) AS branch_name`;

  return NextResponse.json(
    {
      preview: true,
      branchId: rows[0]?.branch_id || null,
      branchName: rows[0]?.branch_name || null,
      identityAvailable: Boolean(rows[0]?.branch_id || rows[0]?.branch_name)
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
