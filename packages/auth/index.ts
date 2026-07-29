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
  | "client-portal:showings:view"
  | "client-portal:showings:create"
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
  | "employee-portal:capacity:view"
  | "document-workspace:view"
  | "document-workspace:checklists:update"
  | "document-workspace:drafts:create"
  | "document-workspace:drafts:update"
  | "document-workspace:versions:view"
  | "document-workspace:approval:request"
  | "document-workspace:approval:record"
  | "document-workspace:send"
  | "document-workspace:templates:view"
  | "document-workspace:templates:update"
  | "document-workspace:audit:view"
  | "client-portal:documents:approve"
  | "client-portal:billing:view"
  | "client-portal:billing:setup"
  | "billing-workspace:view"
  | "billing-workspace:profiles:update"
  | "billing-workspace:payment-methods:request"
  | "billing-workspace:invoices:create"
  | "billing-workspace:payments:process"
  | "billing-workspace:pay-at-close:update"
  | "billing-workspace:audit:view";

export type AuthUser = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
};

export const rolePermissions = {
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
    "client-portal:showings:view",
    "client-portal:showings:create",
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
    "employee-portal:capacity:view",
    "document-workspace:view",
    "document-workspace:checklists:update",
    "document-workspace:drafts:create",
    "document-workspace:drafts:update",
    "document-workspace:versions:view",
    "document-workspace:approval:request",
    "document-workspace:approval:record",
    "document-workspace:send",
    "document-workspace:templates:view",
    "document-workspace:templates:update",
    "document-workspace:audit:view",
    "client-portal:documents:approve",
    "client-portal:billing:view",
    "client-portal:billing:setup",
    "billing-workspace:view",
    "billing-workspace:profiles:update",
    "billing-workspace:payment-methods:request",
    "billing-workspace:invoices:create",
    "billing-workspace:payments:process",
    "billing-workspace:pay-at-close:update",
    "billing-workspace:audit:view"
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
    "client-portal:showings:view",
    "client-portal:showings:create",
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
    "employee-portal:capacity:view",
    "document-workspace:view",
    "document-workspace:checklists:update",
    "document-workspace:drafts:create",
    "document-workspace:drafts:update",
    "document-workspace:versions:view",
    "document-workspace:approval:request",
    "document-workspace:approval:record",
    "document-workspace:send",
    "document-workspace:templates:view",
    "document-workspace:audit:view",
    "client-portal:billing:view",
    "billing-workspace:view",
    "billing-workspace:payment-methods:request",
    "billing-workspace:pay-at-close:update",
    "billing-workspace:audit:view"
  ],
  "Transaction Coordinator": [
    "objects:view",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "client-portal:work:view",
    "client-portal:showings:view",
    "client-portal:documents:view",
    "client-portal:access:view",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update",
    "document-workspace:view",
    "document-workspace:checklists:update",
    "document-workspace:versions:view",
    "document-workspace:approval:request",
    "document-workspace:send",
    "document-workspace:templates:view",
    "document-workspace:audit:view",
    "billing-workspace:view"
  ],
  "Contract Support": [
    "objects:view",
    "objects:update",
    "timeline:view",
    "timeline:create",
    "tasks:view",
    "tasks:update",
    "client-portal:work:view",
    "client-portal:showings:view",
    "client-portal:documents:view",
    "client-portal:access:view",
    "employee-portal:view",
    "employee-portal:clients:view",
    "employee-portal:work:view",
    "employee-portal:assigned-work:view",
    "employee-portal:assigned-work:update",
    "document-workspace:view",
    "document-workspace:checklists:update",
    "document-workspace:drafts:create",
    "document-workspace:drafts:update",
    "document-workspace:versions:view",
    "document-workspace:approval:request",
    "document-workspace:send",
    "document-workspace:templates:view",
    "document-workspace:audit:view"
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
    "client-portal:showings:view",
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
    "employee-portal:clients:view",
    "client-portal:billing:view",
    "billing-workspace:view",
    "billing-workspace:profiles:update",
    "billing-workspace:payment-methods:request",
    "billing-workspace:invoices:create",
    "billing-workspace:payments:process",
    "billing-workspace:pay-at-close:update",
    "billing-workspace:audit:view"
  ],
  Viewer: ["objects:view", "timeline:view"],
  Client: [
    "client-portal:view",
    "client-portal:work:view",
    "client-portal:showings:view",
    "client-portal:showings:create",
    "client-portal:documents:view",
    "client-portal:documents:upload",
    "client-portal:documents:approve",
    "client-portal:access:view",
    "client-portal:billing:view",
    "client-portal:billing:setup"
  ]
} satisfies Record<string, Permission[]>;

export type RoleName = keyof typeof rolePermissions;

export const defaultRoleName: RoleName = "Viewer";

export function isKnownRoleName(role: string | null | undefined): role is RoleName {
  return typeof role === "string" && Object.prototype.hasOwnProperty.call(rolePermissions, role);
}

export function normalizeRoleName(
  role: string | null | undefined,
  fallback: RoleName = defaultRoleName
): RoleName {
  return isKnownRoleName(role) ? role : fallback;
}

export function getPermissionsForRole(role: string | null | undefined): Permission[] {
  return rolePermissions[normalizeRoleName(role)];
}

export type AuthUserInput = Omit<AuthUser, "permissions" | "role"> & {
  role?: string | null;
  permissions?: Permission[];
};

export function createAuthUser(input: AuthUserInput): AuthUser {
  const role = normalizeRoleName(input.role);

  return {
    ...input,
    role,
    permissions: input.permissions ?? getPermissionsForRole(role)
  };
}

export function can(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export class PermissionDeniedError extends Error {
  permission: Permission;

  constructor(permission: Permission) {
    super(`Permission denied: ${permission}`);
    this.name = "PermissionDeniedError";
    this.permission = permission;
  }
}

export function requirePermission(user: AuthUser, permission: Permission): void {
  if (!can(user, permission)) {
    throw new PermissionDeniedError(permission);
  }
}

export function getMockUser(): AuthUser {
  return createAuthUser({
    id: "usr_owner",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Jeremiah Reynalds",
    email: "owner@example.com",
    role: "Owner"
  });
}

export function getMockClientUser(): AuthUser {
  return createAuthUser({
    id: "usr_client_preview",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Realtor Client Preview",
    email: "client@example.com",
    role: "Client"
  });
}

export function getMockEmployeeUser(): AuthUser {
  return createAuthUser({
    id: "usr_employee_preview",
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: "Koinonia Employee Preview",
    email: "employee@example.com",
    role: "Operations"
  });
}
