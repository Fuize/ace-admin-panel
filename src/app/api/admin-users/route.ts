import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerConfig, SUPABASE_ACCESS_COOKIE } from "@/lib/supabase/session";

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

export async function GET() {
  const accessToken = (await cookies()).get(SUPABASE_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const select = [
    "id",
    "staff_id",
    "username",
    "display_name",
    "display_lastname",
    "is_online",
    "last_seen",
    "role:admin_roles!inner(label,rank_level,color,is_active)",
  ].join(",");
  const rows = await supabaseFetch<any[]>(
    `/rest/v1/admins?select=${encodeURIComponent(select)}&is_active=eq.true&order=created_at.asc`,
    accessToken
  ).catch(() => null);

  if (!rows) {
    return NextResponse.json({ error: "Unable to load admins" }, { status: 500 });
  }

  return NextResponse.json(rows.map((admin) => {
    const role = Array.isArray(admin.role) ? admin.role[0] : admin.role;
    return {
      id: admin.staff_id || admin.id,
      username: [admin.display_name, admin.display_lastname].filter(Boolean).join(" ") || admin.username,
      adminLevel: role?.rank_level || 0,
      role: role?.label || "Admin",
      tagColor: role?.color || "#ffffff",
      is_active: Boolean(admin.is_online),
      lastSeen: admin.last_seen || null,
    };
  }));
}

export async function POST() {
  return NextResponse.json({ error: "Admin management is not enabled yet" }, { status: 403 });
}
