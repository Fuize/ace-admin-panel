import { cookies } from "next/headers";
import { getActiveSessionAdmin, getSupabaseServerConfig, SUPABASE_ACCESS_COOKIE, type SessionAdmin } from "@/lib/supabase/session";

export async function getAccessTokenFromCookies() {
  return (await cookies()).get(SUPABASE_ACCESS_COOKIE)?.value || null;
}

export async function requireSessionAdmin(): Promise<{ accessToken: string; admin: SessionAdmin } | null> {
  const accessToken = await getAccessTokenFromCookies();
  const admin = accessToken ? await getActiveSessionAdmin(accessToken).catch(() => null) : null;
  return accessToken && admin ? { accessToken, admin } : null;
}

export async function supabaseRestFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const { url, anonKey } = getSupabaseServerConfig();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function supabaseRestInsert<T>(table: string, accessToken: string, body: unknown): Promise<T | null> {
  const { url, anonKey } = getSupabaseServerConfig();
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<T>;
}
