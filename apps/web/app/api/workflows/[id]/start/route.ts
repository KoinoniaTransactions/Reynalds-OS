import { NextResponse } from "next/server";
import { assertPermission } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const user = assertPermission("objects:update");
  const { id } = await params;
  const body = await request.json();

  const workflow = await prisma.workflow.findFirst({
    where: {
      id,
      workspaceId: user.workspaceId
    }
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  if (!body.objectId) {
    return NextResponse.json({ error: "objectId is required to start a workflow." }, { status: 400 });
  }

  const workflowRun = await prisma.workflowRun.create({
    data: {
      workflowId: workflow.id,
      objectId: body.objectId,
      status: "Running",
      currentStage: "Start"
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: user.workspaceId,
      objectId: body.objectId,
      actorId: user.id,
      eventType: "workflow.started",
      summary: `Workflow started: ${workflow.name}`,
      newValue: workflowRun
    }
  });

  return NextResponse.json({ workflowRun }, { status: 201 });
}
