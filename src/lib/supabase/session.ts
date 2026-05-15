import { NextResponse } from "next/server";

export const SUPABASE_ACCESS_COOKIE = "ace_sb_access_token";
export const SUPABASE_REFRESH_COOKIE = "ace_sb_refresh_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionAdmin = {
  id: string;
  username: string;
  staffId: string | null;
  displayName: string;
  displayLastname: string;
  roleId: string;
  roleName: string;
  roleLabel: string;
  roleColor: string;
  permissions: string[];
};

export function getSupabaseServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function setSupabaseSessionCookies(res: NextResponse, accessToken: string, refreshToken?: string | null) {
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set(SUPABASE_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  if (refreshToken) {
    res.cookies.set(SUPABASE_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
}

export function clearSupabaseSessionCookies(res: NextResponse) {
  res.cookies.set(SUPABASE_ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(SUPABASE_REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

async function supabaseFetch<T>(path: string, accessToken: string): Promise<T> {
  const { url, anonKey } = getSupabaseServerConfig();
  const response = await fetch(`${url}${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSupabaseUser(accessToken: string): Promise<{ id: string; email?: string }> {
  return supabaseFetch("/auth/v1/user", accessToken);
}

export async function getActiveSessionAdmin(accessToken: string): Promise<SessionAdmin | null> {
  const user = await getSupabaseUser(accessToken);
  if (!user?.id) return null;

  const select = [
    "id",
    "username",
    "staff_id",
    "display_name",
    "display_lastname",
    "role_id",
    "is_active",
    "role:admin_roles!inner(id,name,label,color,is_active)",
  ].join(",");
  const path = `/rest/v1/admins?auth_user_id=eq.${encodeURIComponent(user.id)}&is_active=eq.true&select=${encodeURIComponent(select)}&limit=1`;
  const rows = await supabaseFetch<any[]>(path, accessToken);
  const profile = rows[0];
  const role = Array.isArray(profile?.role) ? profile.role[0] : profile?.role;

  if (!profile || !role?.is_active || !profile.role_id) return null;

  const permissionsSelect = "permission:admin_permissions!inner(key,is_active)";
  const permissionsPath = `/rest/v1/role_permissions?role_id=eq.${encodeURIComponent(profile.role_id)}&select=${encodeURIComponent(permissionsSelect)}`;
  const permissionRows = await supabaseFetch<any[]>(permissionsPath, accessToken);
  const permissions = permissionRows
    .map((row) => row.permission)
    .flat()
    .filter((permission) => permission?.is_active && permission?.key)
    .map((permission) => String(permission.key));

  return {
    id: String(profile.id),
    username: String(profile.username),
    staffId: profile.staff_id ? String(profile.staff_id) : null,
    displayName: String(profile.display_name || profile.username),
    displayLastname: String(profile.display_lastname || ""),
    roleId: String(profile.role_id),
    roleName: String(role.name),
    roleLabel: String(role.label || role.name),
    roleColor: String(role.color || "#ffffff"),
    permissions,
  };
}
