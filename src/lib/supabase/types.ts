export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AdminRole = {
  id: string;
  name: string;
  label: string;
  rank_level: number;
  color: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminPermission = {
  id: string;
  key: AdminPermissionKey;
  label: string;
  description: string | null;
  category: string;
  is_dangerous: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminProfile = {
  id: string;
  auth_user_id: string | null;
  username: string;
  staff_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  display_lastname: string;
  role_id: string | null;
  rank_color: string | null;
  is_active: boolean;
  is_online: boolean;
  last_seen: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminPermissionKey =
  | "dashboard.view"
  | "players.view"
  | "vehicles.view"
  | "businesses.view"
  | "factions.view"
  | "logs.view"
  | "staff_chat.view"
  | "staff_chat.send"
  | "admins.view"
  | "admins.manage"
  | "roles.view"
  | "roles.manage"
  | "audit_logs.view"
  | "future.kick"
  | "future.ban"
  | "future.warn"
  | "future.ragemp.actions";

export type AdminProfileWithRole = AdminProfile & {
  role: AdminRole | null;
};

export type AdminApprovalStatus =
  | { approved: true; reason: null; profile: AdminProfileWithRole }
  | { approved: false; reason: "missing_user" | "missing_profile" | "inactive_admin"; profile: AdminProfileWithRole | null };

export type StaffChatMessage = {
  id: string;
  sender_admin_id: string | null;
  body: string;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLogAction =
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "admin.created"
  | "admin.updated"
  | "admin.disabled"
  | "admin.enabled"
  | "role.created"
  | "role.updated"
  | "role.permission_added"
  | "role.permission_removed"
  | "staff_chat.message_sent"
  | "staff_chat.message_deleted"
  | "future.punishment.kick"
  | "future.punishment.ban"
  | "future.punishment.warn"
  | "future.ragemp.action";

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
