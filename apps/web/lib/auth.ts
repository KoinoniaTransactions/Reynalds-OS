import { getMockUser, requirePermission, type Permission } from "@reynalds-os/auth";

export function getCurrentUser() {
  // MVP scaffold: replace with managed auth provider session lookup.
  return getMockUser();
}

export function assertPermission(permission: Permission) {
  const user = getCurrentUser();
  requirePermission(user, permission);
  return user;
}
