import type { User } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  getPortalWorkStatusBucket,
  isClientPortalWorkObjectType,
  PortalWorkAssignmentValidationError,
  validatePortalWorkAssignmentInput
} from "../../../../../../lib/portal-work-items";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

type AssignableStaffUser = Pick<User, "id" | "name" | "email"> & {
  role: {
    name: string;
  } | null;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("employee-portal:assignments:update");
    const { id } = await params;
    const input = validatePortalWorkAssignmentInput(await request.json());

    const workItem = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null
      }
    });

    if (!workItem || !isClientPortalWorkObjectType(workItem.objectType)) {
      return NextResponse.json({ error: "Portal work item not found." }, { status: 404 });
    }

    if (getPortalWorkStatusBucket(workItem.status) === "completed") {
      return NextResponse.json(
        { error: "Completed work cannot be reassigned from the portal dashboard." },
        { status: 400 }
      );
    }

    const staffById = await getAssignableStaffById(
      actor.workspaceId,
      [input.assignedStaffUserId, input.backupStaffUserId].filter(isStaffUserId)
    );
    const assignedStaff = getRequestedStaffUser(
      staffById,
      input.assignedStaffUserId,
      "assignedStaffUserId"
    );
    const backupStaff = getRequestedStaffUser(
      staffById,
      input.backupStaffUserId,
      "backupStaffUserId"
    );

    const updatedWorkItem = await prisma.rosObject.update({
      where: { id: workItem.id },
      data: {
        assignedStaffUserId: assignedStaff?.id ?? null,
        backupStaffUserId: backupStaff?.id ?? null
      }
    });

    const previousAssignment = {
      assignedStaffUserId: workItem.assignedStaffUserId,
      backupStaffUserId: workItem.backupStaffUserId
    };
    const newAssignment = {
      assignedStaffName: assignedStaff?.name ?? null,
      assignedStaffUserId: assignedStaff?.id ?? null,
      assignmentNote: input.assignmentNote ?? null,
      backupStaffName: backupStaff?.name ?? null,
      backupStaffUserId: backupStaff?.id ?? null
    };

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: workItem.id,
        actorId: actor.id,
        eventType: "portal_work.assignment.updated",
        summary: `Assignment updated for ${workItem.name}`,
        previousValue: previousAssignment,
        newValue: newAssignment
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.work.assignment.updated",
        subjectType: "RosObject",
        subjectId: workItem.id,
        summary: `Assignment updated for ${workItem.name}`,
        metadata: {
          assignedStaffUserId: assignedStaff?.id ?? null,
          backupStaffUserId: backupStaff?.id ?? null,
          hasAssignmentNote: Boolean(input.assignmentNote),
          objectType: workItem.objectType,
          previousAssignedStaffUserId: workItem.assignedStaffUserId ?? null,
          previousBackupStaffUserId: workItem.backupStaffUserId ?? null
        }
      }
    });

    return NextResponse.json({
      assignment: newAssignment,
      workItem: updatedWorkItem
    });
  } catch (error) {
    return handleWorkAssignmentError(error);
  }
}

async function getAssignableStaffById(
  workspaceId: string,
  staffUserIds: string[]
): Promise<Map<string, AssignableStaffUser>> {
  if (staffUserIds.length === 0) {
    return new Map();
  }

  const staffUsers = await prisma.user.findMany({
    where: {
      id: {
        in: staffUserIds
      },
      portalAccessStatus: "active",
      status: "active",
      workspaceId
    },
    include: {
      role: true
    }
  });

  return staffUsers.filter(isAssignableStaffUser).reduce((staffById, staffUser) => {
    staffById.set(staffUser.id, staffUser);
    return staffById;
  }, new Map<string, AssignableStaffUser>());
}

function getRequestedStaffUser(
  staffById: Map<string, AssignableStaffUser>,
  staffUserId: string | null,
  fieldName: "assignedStaffUserId" | "backupStaffUserId"
): AssignableStaffUser | null {
  if (!staffUserId) {
    return null;
  }

  const staffUser = staffById.get(staffUserId);

  if (!staffUser) {
    throw new PortalWorkAssignmentValidationError(
      `${fieldName} must match an active staff user in this workspace.`
    );
  }

  return staffUser;
}

function isAssignableStaffUser(staffUser: AssignableStaffUser): boolean {
  return Boolean(
    staffUser.role?.name &&
      staffUser.role.name !== "Client" &&
      staffUser.role.name !== "Viewer"
  );
}

function isStaffUserId(value: string | null): value is string {
  return Boolean(value);
}

function handleWorkAssignmentError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalWorkAssignmentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Portal work assignment storage is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
