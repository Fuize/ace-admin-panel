import { NextResponse } from "next/server";
import { requireSessionAdmin, supabaseRestFetch } from "@/lib/supabase/server-api";

export async function GET(req: Request) {
  const session = await requireSessionAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
  const action = url.searchParams.get("action");
  const severity = url.searchParams.get("severity");

  const select = [
    "id",
    "action",
    "target_type",
    "target_id",
    "severity",
    "metadata",
    "created_at",
    "actor:admins!audit_logs_actor_admin_id_fkey(display_name,display_lastname,username,role:admin_roles!admins_role_id_fkey(label,color))",
  ].join(",");

  const params = new URLSearchParams({
    select,
    order: "created_at.desc",
    limit: String(limit),
  });

  if (action) params.set("action", `eq.${action}`);
  if (severity) params.set("severity", `eq.${severity}`);

  const rows = await supabaseRestFetch<any[]>(`/rest/v1/audit_logs?${params.toString()}`, session.accessToken).catch(() => null);
  if (!rows) return NextResponse.json({ error: "Unable to load audit logs" }, { status: 500 });

  return NextResponse.json(rows);
}
