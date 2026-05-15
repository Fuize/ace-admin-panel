import type { AdminPermissionKey } from "./types";

export type PermissionSet = Set<AdminPermissionKey>;

export function hasPermission(permissions: PermissionSet, permission: AdminPermissionKey) {
  return permissions.has(permission);
}

export function hasEveryPermission(permissions: PermissionSet, required: AdminPermissionKey[]) {
  return required.every((permission) => permissions.has(permission));
}

export function hasAnyPermission(permissions: PermissionSet, required: AdminPermissionKey[]) {
  return required.some((permission) => permissions.has(permission));
}

export function createPermissionSet(permissions: AdminPermissionKey[]) {
  return new Set(permissions);
}
