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
  | "copilot:ask"
  | "client-portal:view"
  | "client-portal:work:view"
  | "client-portal:documents:view"
  | "client-portal:documents:upload"
  | "client-portal:access:view"
  | "client-portal:access:update"
  | "employee-portal:view"
  | "employee-portal:clients:view"
  | "employee-portal:work:view"
  | "employee-portal:assigned-work:view"
  | "employee-portal:assigned-work:update"
  | "employee-portal:assignments:update"
  | "employee-portal:staff:view"
  | "employee-portal:capacity:view";

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
    "copilot:ask",
    "client-portal:view",
    "client-portal:work:view",
    "client-portal:documents:view",
    "client-portal:documents:upload",
    "client-portal:access:view",
    "client-portal:access:update",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update",
    "employee-portal:assignments:update",
    "employee-portal:staff:view",
    "employee-portal:capacity:view"
  ],
  Operations: [
    "objects:view",
    "objects:create",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "copilot:ask",
    "client-portal:view",
    "client-portal:work:view",
    "client-portal:documents:view",
    "client-portal:access:view",
    "client-portal:access:update",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update",
    "employee-portal:assignments:update",
    "employee-portal:staff:view",
    "employee-portal:capacity:view"
  ],
  "Transaction Coordinator": [
    "objects:view",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "client-portal:work:view",
    "client-portal:documents:view",
    "client-portal:access:view",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update"
  ],
  "Contract Support": [
    "objects:view",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "client-portal:work:view",
    "client-portal:documents:view",
    "client-portal:access:view",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update"
  ],
  "Showing Provider": [
    "objects:view",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "employee-portal:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update"
  ],
  "Customer Success": [
    "objects:view",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "client-portal:work:view",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update"
  ],
  Finance: [
    "objects:view",
    "timeline:view",
    "finance:view",
    "finance:update",
    "employee-portal:view",
    "employee-portal:clients:view"
  ],
  Viewer: ["objects:view", "timeline:view"],
  Client: [
    "client-portal:view",
    "client-portal:work:view",
    "client-portal:documents:view",
    "client-portal:documents:upload",
    "client-portal:access:view"
  ]
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

export function getMockClientUser(): AuthUser {
  return {
    id: "usr_client_preview",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Realtor Client Preview",
    email: "client@example.com",
    role: "Client",
    permissions: rolePermissions.Client
  };
}

export function getMockEmployeeUser(): AuthUser {
  return {
    id: "usr_employee_preview",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Koinonia Employee Preview",
    email: "employee@example.com",
    role: "Operations",
    permissions: rolePermissions.Operations
  };
}
