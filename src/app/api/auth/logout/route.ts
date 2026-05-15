import { NextResponse } from "next/server";
import { clearSupabaseSessionCookies } from "@/lib/supabase/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSupabaseSessionCookies(res);
  return res;
}
