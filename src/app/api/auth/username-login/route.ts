import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getActiveSessionAdmin, setSupabaseSessionCookies } from "@/lib/supabase/session";
import { supabaseRestInsert } from "@/lib/supabase/server-api";

type LoginBody = {
  username?: unknown;
  password?: unknown;
};

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function cleanUsername(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPassword(value: unknown) {
  return typeof value === "string" ? value : "";
}

function cleanError(status = 401) {
  return NextResponse.json({ error: "Wrong username or password" }, { status });
}

function attemptKey(req: Request, username: string) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${forwarded || "local"}:${username.toLowerCase()}`;
}

function isRateLimited(req: Request, username: string) {
  const key = attemptKey(req, username);
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

function clearAttempts(req: Request, username: string) {
  attempts.delete(attemptKey(req, username));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;
  const username = cleanUsername(body?.username);
  const password = cleanPassword(body?.password);

  if (!username || !password) {
    return cleanError();
  }

  if (isRateLimited(req, username)) {
    return NextResponse.json({ error: "Too many login attempts. Try again soon." }, { status: 429 });
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

  clearAttempts(req, username);
  await supabaseRestInsert("audit_logs", accessToken, {
    actor_admin_id: admin.id,
    actor_auth_user_id: user.id,
    action: "auth.login",
    severity: "info",
    metadata: { username },
  }).catch(() => null);

  const res = NextResponse.json({ ok: true });
  setSupabaseSessionCookies(res, accessToken, refreshToken);
  return res;
}
