"use client";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Activity, ChevronDown, Clock3, Command, LogOut, Menu, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { useUX } from "@/components/UXProvider";
import { getSupabaseConfig } from "@/lib/supabase/client";
import { isRecentlyActive } from "@/lib/supabase/presence";

export function Topbar() {
  const { admin, loading, permissions } = useAuth();
  const { openCommand, setMobileNavOpen } = useUX();
  const [time, setTime] = useState("");
  const [onlineAdmins, setOnlineAdmins] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    function tick() {
      setTime(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadOnlineCount() {
      try {
        const tokenResponse = await fetch("/api/auth/session-token");
        const tokenData = tokenResponse.ok ? await tokenResponse.json() : null;
        if (!tokenData?.accessToken) {
          if (alive) setOnlineAdmins(null);
          return;
        }

        const config = getSupabaseConfig();
        const client = createClient(config.url, config.anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${tokenData.accessToken}` } },
        });

        const { data, error } = await client
          .from("admin_presence")
          .select("admin_id,status,last_heartbeat")
          .eq("status", "online");

        if (error) throw error;
        const uniqueOnline = new Set((data || []).filter((row: any) => isRecentlyActive(row.last_heartbeat)).map((row: any) => row.admin_id));
        if (alive) setOnlineAdmins(uniqueOnline.size);
      } catch {
        if (alive) setOnlineAdmins(null);
      }
    }

    void loadOnlineCount();
    const interval = window.setInterval(() => void loadOnlineCount(), 20_000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  }

  const fullName = admin ? [admin.displayName, admin.displayLastname].filter(Boolean).join(" ") : "";

  return (
    <header className="glass-panel mx-3 mt-3 flex min-h-16 flex-wrap items-center gap-3 overflow-visible rounded-2xl px-4 py-3 sm:px-5">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-zinc-100 transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <div className="text-sm font-semibold tracking-wide text-zinc-50">Admin Workspace</div>
        <div className="text-xs text-zinc-300/85">Read-only server data overview</div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={openCommand}
          className="glass-soft hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-sky-200/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:inline-flex"
          aria-label="Open command palette"
        >
          <Command className="h-4 w-4 text-sky-200" />
          <span className="hidden xl:inline">Command</span>
          <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-400">Ctrl K</kbd>
        </button>
        <div className="hidden items-center gap-2 lg:flex">
          <StatusPill icon={<Activity className="h-3.5 w-3.5 text-emerald-200" />} label="Server" value="Online" glow="rgba(110,231,183,.28)" />
          <StatusPill icon={<Users className="h-3.5 w-3.5 text-sky-200" />} label="Staff" value={onlineAdmins === null ? "-" : String(onlineAdmins)} glow="rgba(125,211,252,.24)" />
          <StatusPill icon={<Clock3 className="h-3.5 w-3.5 text-indigo-200" />} label="Local" value={time || "--:--"} glow="rgba(165,180,252,.24)" />
        </div>
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
          className="glass-soft flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-right transition-colors duration-150 hover:border-sky-200/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="Open admin profile"
            aria-expanded={profileOpen}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-xs font-bold text-zinc-50">
              {fullName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A"}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-100">{loading ? "Loading admin..." : fullName || "Admin"}</span>
              {admin ? (
                <span className="block truncate text-xs font-semibold" style={{ color: admin.roleColor }}>
                  {admin.roleLabel}
                </span>
              ) : (
                <span className="block text-xs text-zinc-400">Authenticated session</span>
              )}
            </span>
            <ChevronDown className={clsx("h-4 w-4 text-zinc-400 transition-transform duration-200", profileOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="glass-panel-strong absolute right-0 top-[calc(100%+.6rem)] z-50 w-72 rounded-2xl p-3 text-left"
              >
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-50">{fullName || "Admin"}</div>
                    <div className="truncate text-xs" style={admin?.roleColor ? { color: admin.roleColor } : undefined}>{admin?.roleLabel || "Authenticated"}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-zinc-400">Permissions</div>
                    <div className="mt-1 text-lg font-semibold text-zinc-50">{permissions.length}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-zinc-400">Status</div>
                    <div className="mt-1 text-sm font-semibold text-emerald-200">Online</div>
                  </div>
                </div>
                <Link href="/panel/settings" onClick={() => setProfileOpen(false)} className="mt-3 block rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 transition-colors duration-150 hover:bg-white/[0.075]">
                  Profile settings
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors duration-150 hover:border-sky-200/20 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <LogOut className="h-4 w-4 text-zinc-300" />
          Logout
        </button>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; glow: string }) {
  return (
    <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
      {icon}
      <div className="leading-none">
        <div className="text-[10px] font-medium tracking-[0.04em] text-zinc-400">{label}</div>
        <div className="mt-0.5 text-xs font-semibold text-zinc-100">{value}</div>
      </div>
    </div>
  );
}
