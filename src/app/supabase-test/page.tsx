"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import webBg from "../../../assets/webbg.png";
import webIcon from "../../../assets/ACEtransparent.png";
import { createBrowserSupabaseClient, getSupabaseConfig } from "@/lib/supabase/client";
import { getAdminPermissions, getAdminProfile, getCurrentUser, isApprovedActiveAdmin, signIn, signOut } from "@/lib/supabase/auth";
import type { AdminPermissionKey, AdminProfileWithRole } from "@/lib/supabase/types";

type TestState = {
  loading: boolean;
  error: string | null;
  user: { id: string; email?: string } | null;
  profile: AdminProfileWithRole | null;
  permissions: AdminPermissionKey[];
  approval: string;
};

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (typeof error === "string" && error.trim()) return error;

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}" ? serialized : "Unknown Supabase error";
  } catch {
    return "Unknown Supabase error";
  }
}

export default function SupabaseTestPage() {
  const config = getSupabaseConfig();
  const supabase = useMemo(() => (config.configured ? createBrowserSupabaseClient() : null), [config.configured]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<TestState>({
    loading: Boolean(config.configured),
    error: null,
    user: null,
    profile: null,
    permissions: [],
    approval: config.configured ? "Checking session..." : "Supabase env is not configured.",
  });

  async function refresh() {
    if (!supabase) return;
    setState((current) => ({ ...current, loading: true, error: null }));

    let user: TestState["user"] = null;
    let profile: AdminProfileWithRole | null = null;
    let permissions: AdminPermissionKey[] = [];

    try {
      const authUser = await getCurrentUser(supabase);
      user = authUser ? { id: authUser.id, email: authUser.email || undefined } : null;

      if (!authUser) {
        setState({
          loading: false,
          error: null,
          user: null,
          profile: null,
          permissions: [],
          approval: "No Supabase Auth session.",
        });
        return;
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: errorMessage(error),
        approval: "Supabase Auth check failed.",
      }));
      return;
    }

    try {
      profile = user ? await getAdminProfile(supabase, user.id) : null;
    } catch (error) {
      setState({
        loading: false,
        error: errorMessage(error),
        user,
        profile: null,
        permissions: [],
        approval: "Auth session exists, but public.admins read failed. RLS grants or policies are blocking the profile query.",
      });
      return;
    }

    try {
      permissions = profile?.role_id ? await getAdminPermissions(supabase, profile.role_id) : [];
    } catch (error) {
      setState({
        loading: false,
        error: errorMessage(error),
        user,
        profile,
        permissions: [],
        approval: "Auth and profile read succeeded, but role/permission reads failed. Check RLS grants on admin_roles, admin_permissions, and role_permissions.",
      });
      return;
    }

    try {
      const approval = await isApprovedActiveAdmin(supabase, user?.id);

      setState({
        loading: false,
        error: null,
        user,
        profile,
        permissions,
        approval: approval.approved ? "Approved active admin" : `Not approved: ${approval.reason}`,
      });
    } catch (error) {
      setState({
        loading: false,
        user,
        profile,
        permissions,
        error: errorMessage(error),
        approval: "Auth succeeded, but final approval check failed.",
      });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      await signIn(email, password, supabase);
      await refresh();
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: errorMessage(error), approval: "Sign in failed." }));
    }
  }

  async function onSignOut() {
    if (!supabase) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      await signOut(supabase);
      await refresh();
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: errorMessage(error) }));
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Image src={webBg} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.28),transparent_32%),linear-gradient(90deg,rgba(9,9,11,.92),rgba(9,9,11,.72),rgba(9,9,11,.88))]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <section className="relative grid min-h-screen place-items-center px-4 py-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70 shadow-[0_24px_90px_rgba(0,0,0,.55)] backdrop-blur-xl lg:grid lg:grid-cols-[1fr_1.2fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <Image src={webIcon} alt="ACE" width={64} height={64} className="h-16 w-16 object-contain" />
            <h1 className="mt-6 text-2xl font-semibold text-white">Supabase Auth Test</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Safe side-by-side test page for Supabase Auth, admin profiles, roles, and permissions. This does not replace the current login.
            </p>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm">
              <div className="font-medium text-zinc-100">Connection</div>
              <div className={config.configured ? "mt-2 text-emerald-300" : "mt-2 text-amber-300"}>
                {config.configured ? "Supabase public env is configured." : "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."}
              </div>
              <div className="mt-2 break-all text-xs text-zinc-400">{config.url || "No project URL loaded"}</div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label htmlFor="supabase-email" className="text-sm font-medium text-zinc-200">Email</label>
                <input
                  id="supabase-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-indigo-300"
                  placeholder="owner@example.com"
                  disabled={!config.configured || state.loading}
                />
              </div>
              <div>
                <label htmlFor="supabase-password" className="text-sm font-medium text-zinc-200">Password</label>
                <input
                  id="supabase-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-indigo-300"
                  placeholder="Supabase Auth password"
                  disabled={!config.configured || state.loading}
                />
              </div>
              <button
                type="submit"
                disabled={!config.configured || state.loading}
                className="self-end rounded-lg border border-indigo-400/25 bg-indigo-500/20 px-4 py-2.5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Sign in
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={!config.configured || state.loading}
                className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Refresh status
              </button>
              <button
                type="button"
                onClick={() => void onSignOut()}
                disabled={!config.configured || state.loading}
                className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Sign out
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <StatusRow label="Status" value={state.loading ? "Loading..." : state.approval} />
              <StatusRow label="Auth user" value={state.user ? `${state.user.email || "No email"} (${state.user.id})` : "Not signed in"} />
              <StatusRow label="Admin profile" value={state.profile ? `${state.profile.display_name} / ${state.profile.username}` : "No matching public.admins profile"} />
              <StatusRow label="Role" value={state.profile?.role ? `${state.profile.role.label} (${state.profile.role.name})` : "No role loaded"} />
              <StatusRow label="Permissions" value={state.permissions.length ? state.permissions.join(", ") : "No permissions loaded"} />
              {state.error ? <StatusRow label="Error" value={state.error} danger /> : null}
            </div>

            <p className="mt-6 text-xs leading-5 text-zinc-400">
              If table reads fail after sign in, RLS is likely blocking access. Add reviewed approved-admin policies before using Supabase from the static frontend.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={danger ? "mt-1 break-words text-sm text-red-300" : "mt-1 break-words text-sm text-zinc-100"}>{value}</div>
    </div>
  );
}
