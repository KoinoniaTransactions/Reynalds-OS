export type ObjectCreateInput = {
  assignedStaffUserId?: string;
  backupStaffUserId?: string;
  clientObjectId?: string;
  clientUserId?: string;
  objectType: string;
  name: string;
  status?: string;
  health?: string;
  ownerId?: string;
  nextAction?: string;
  data?: Record<string, unknown>;
};

export function validateObjectCreate(input: unknown): ObjectCreateInput {
  if (!input || typeof input !== "object") {
    throw new Error("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;

  if (typeof value.objectType !== "string" || value.objectType.trim().length === 0) {
    throw new Error("objectType is required.");
  }

  if (typeof value.name !== "string" || value.name.trim().length === 0) {
    throw new Error("name is required.");
  }

  return {
    objectType: value.objectType.trim(),
    name: value.name.trim(),
    status: typeof value.status === "string" ? value.status : "Open",
    health: typeof value.health === "string" ? value.health : "Healthy",
    ownerId: typeof value.ownerId === "string" ? value.ownerId : undefined,
    clientUserId: typeof value.clientUserId === "string" ? value.clientUserId : undefined,
    clientObjectId: typeof value.clientObjectId === "string" ? value.clientObjectId : undefined,
    assignedStaffUserId:
      typeof value.assignedStaffUserId === "string" ? value.assignedStaffUserId : undefined,
    backupStaffUserId:
      typeof value.backupStaffUserId === "string" ? value.backupStaffUserId : undefined,
    nextAction: typeof value.nextAction === "string" ? value.nextAction : undefined,
    data: typeof value.data === "object" && value.data !== null ? (value.data as Record<string, unknown>) : undefined
  };
}

export function validateObjectUpdate(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new Error("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};

  for (const key of [
    "objectType",
    "name",
    "status",
    "health",
    "ownerId",
    "clientUserId",
    "clientObjectId",
    "assignedStaffUserId",
    "backupStaffUserId",
    "nextAction",
    "data"
  ]) {
    if (value[key] !== undefined) allowed[key] = value[key];
  }

  if (Object.keys(allowed).length === 0) {
    throw new Error("At least one updatable field is required.");
  }

  return allowed;
}
