import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getActiveSessionAdmin, setSupabaseSessionCookies } from "@/lib/supabase/session";

type LoginBody = {
  username?: unknown;
  password?: unknown;
};

function cleanUsername(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPassword(value: unknown) {
  return typeof value === "string" ? value : "";
}

function cleanError(status = 401) {
  return NextResponse.json({ error: "Wrong username or password" }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;
  const username = cleanUsername(body?.username);
  const password = cleanPassword(body?.password);

  if (!username || !password) {
    return cleanError();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Login is not available right now." }, { status: 500 });
  }

  const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authEmail, error: lookupError } = await supabase.rpc("lookup_admin_auth_email", { p_username: username });

  if (lookupError || typeof authEmail !== "string" || !authEmail) {
    return cleanError();
  }

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  const accessToken = authData.session?.access_token;
  const refreshToken = authData.session?.refresh_token;
  const user = authData.user;

  if (signInError || !accessToken || !user) {
    return cleanError();
  }

  const admin = await getActiveSessionAdmin(accessToken).catch(() => null);

  if (!admin) {
    await supabase.auth.signOut().catch(() => undefined);
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  setSupabaseSessionCookies(res, accessToken, refreshToken);
  return res;
}
