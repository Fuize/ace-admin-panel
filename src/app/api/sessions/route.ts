import { NextResponse } from "next/server";
import { requireSessionAdmin, supabaseRestFetch } from "@/lib/supabase/server-api";

export async function GET() {
  const session = await requireSessionAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await supabaseRestFetch<any[]>(
    `/rest/v1/admin_sessions?select=id,admin_id,auth_user_id,user_agent,started_at,ended_at,last_seen,revoked_at,admin:admins!admin_sessions_admin_id_fkey(display_name,display_lastname,username,role:admin_roles!admins_role_id_fkey(label,color))&admin_id=eq.${encodeURIComponent(session.admin.id)}&order=last_seen.desc&limit=50`,
    session.accessToken
  ).catch(() => null);

  if (!rows) return NextResponse.json({ error: "Unable to load sessions" }, { status: 500 });
  return NextResponse.json(rows);
}
