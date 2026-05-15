import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getActiveSessionAdmin, SUPABASE_ACCESS_COOKIE } from "@/lib/supabase/session";

export async function GET() {
  const accessToken = (await cookies()).get(SUPABASE_ACCESS_COOKIE)?.value;
  const admin = accessToken ? await getActiveSessionAdmin(accessToken).catch(() => null) : null;

  if (!accessToken || !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ accessToken });
}
