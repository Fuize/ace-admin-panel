import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "./client";
import type { AdminApprovalStatus, AdminPermissionKey, AdminProfileWithRole, Database } from "./types";

type AppSupabaseClient = SupabaseClient<any>;

function clientOrDefault(supabase?: SupabaseClient<Database>) {
  return (supabase || createBrowserSupabaseClient()) as AppSupabaseClient;
}

export async function getCurrentSession(supabase?: SupabaseClient<Database>) {
  const { data, error } = await clientOrDefault(supabase).auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(supabase?: SupabaseClient<Database>) {
  const { data, error } = await clientOrDefault(supabase).auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signIn(email: string, password: string, supabase?: SupabaseClient<Database>) {
  const { data, error } = await clientOrDefault(supabase).auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(supabase?: SupabaseClient<Database>) {
  const { error } = await clientOrDefault(supabase).auth.signOut();
  if (error) throw error;
}

export const signOutSupabase = signOut;

export async function getAdminProfile(supabase?: SupabaseClient<Database>, authUserId?: string): Promise<AdminProfileWithRole | null> {
  const client = clientOrDefault(supabase);
  const userId = authUserId || (await getCurrentUser(supabase))?.id;
  if (!userId) return null;

  const { data, error } = await client
    .from("admins")
    .select("id, auth_user_id, username, staff_id, first_name, last_name, display_name, display_lastname, role_id, rank_color, is_active, is_online, last_seen, created_by, updated_by, created_at, updated_at, role:admin_roles(*)")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as AdminProfileWithRole | null;
}

export async function getAdminPermissions(supabase?: SupabaseClient<Database>, roleId?: string | null): Promise<AdminPermissionKey[]> {
  if (!roleId) return [];

  const { data, error } = await clientOrDefault(supabase)
    .from("role_permissions")
    .select("permission:admin_permissions(key)")
    .eq("role_id", roleId);

  if (error) throw error;

  return (data || [])
    .map((row: any) => row.permission?.key)
    .filter(Boolean) as AdminPermissionKey[];
}

export async function isApprovedActiveAdmin(supabase?: SupabaseClient<Database>, authUserId?: string): Promise<AdminApprovalStatus> {
  const user = authUserId ? { id: authUserId } : await getCurrentUser(supabase);
  if (!user?.id) return { approved: false, reason: "missing_user", profile: null };

  const profile = await getAdminProfile(supabase, user.id);
  if (!profile) return { approved: false, reason: "missing_profile", profile: null };
  if (!profile.is_active) return { approved: false, reason: "inactive_admin", profile };

  return { approved: true, reason: null, profile };
}
