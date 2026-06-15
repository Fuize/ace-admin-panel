import { NextResponse } from "next/server";
import { requireSessionAdmin, supabaseRestFetch } from "@/lib/supabase/server-api";

export async function GET() {
  const session = await requireSessionAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await supabaseRestFetch<any[]>(
    "/rest/v1/admin_roles?select=id,name,label,rank_level,color,is_system,is_active,permissions:role_permissions(permission:admin_permissions(key,label,category,is_dangerous,is_active))&order=rank_level.desc",
    session.accessToken
  ).catch(() => null);

  if (!roles) return NextResponse.json({ error: "Unable to load roles" }, { status: 500 });
  return NextResponse.json(roles);
}
