export type Permission =
  | "objects:view"
  | "objects:create"
  | "objects:update"
  | "objects:archive"
  | "timeline:view"
  | "timeline:create"
  | "tasks:view"
  | "tasks:update"
  | "finance:view"
  | "finance:update"
  | "admin:view"
  | "admin:update"
  | "copilot:ask";

export type AuthUser = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
};

export const rolePermissions: Record<string, Permission[]> = {
  Owner: [
    "objects:view",
    "objects:create",
    "objects:update",
    "objects:archive",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "finance:view",
    "finance:update",
    "admin:view",
    "admin:update",
    "copilot:ask"
  ],
  Operations: [
    "objects:view",
    "objects:create",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "copilot:ask"
  ],
  Finance: ["objects:view", "timeline:view", "finance:view", "finance:update"],
  Viewer: ["objects:view", "timeline:view"]
};

export function can(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export function requirePermission(user: AuthUser, permission: Permission): void {
  if (!can(user, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function getMockUser(): AuthUser {
  return {
    id: "usr_owner",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Jeremiah Reynalds",
    email: "owner@example.com",
    role: "Owner",
    permissions: rolePermissions.Owner
  };
}
