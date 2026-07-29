import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { assertPermission } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

const defaultDefinition = {
  version: 1,
  stages: ["Start", "Review", "Execute", "Complete"],
  steps: [
    {
      id: "step_start",
      type: "manual",
      label: "Start workflow",
      action: "create_timeline_event"
    }
  ],
  variables: {},
  conditions: []
};

export async function GET() {
  const user = await assertPermission("objects:view");

  const workflows = await prisma.workflow.findMany({
    where: { workspaceId: user.workspaceId },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ workflows });
}

export async function POST(request: Request) {
  const user = await assertPermission("objects:update");
  const body = await request.json();

  if (!body.name || !body.triggerEvent) {
    return NextResponse.json({ error: "name and triggerEvent are required." }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      workspaceId: user.workspaceId,
      name: body.name,
      status: body.status ?? "Draft",
      triggerEvent: body.triggerEvent,
      definition: body.definition ?? defaultDefinition
    }
  });

  return NextResponse.json({ workflow }, { status: 201 });
}
