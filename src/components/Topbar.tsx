"use client";
import { Activity, Clock3, LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export function Topbar() {
  const { admin, loading } = useAuth();
  const [time, setTime] = useState("");
  const [onlineAdmins, setOnlineAdmins] = useState<number | null>(null);

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
    fetch("/api/admin-users")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!alive || !Array.isArray(data)) return;
        setOnlineAdmins(data.filter((adminUser) => adminUser?.is_active).length);
      })
      .catch(() => {
        if (alive) setOnlineAdmins(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  }

  const fullName = admin ? [admin.displayName, admin.displayLastname].filter(Boolean).join(" ") : "";

  return (
    <header className="glass-panel mx-3 mt-3 flex min-h-16 flex-wrap items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <div className="text-sm font-semibold tracking-wide text-zinc-50">Admin Workspace</div>
        <div className="text-xs text-zinc-300/85">Read-only server data overview</div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 lg:flex">
          <StatusPill icon={<Activity className="h-3.5 w-3.5 text-emerald-200" />} label="Server" value="Online" glow="rgba(110,231,183,.28)" />
          <StatusPill icon={<Users className="h-3.5 w-3.5 text-sky-200" />} label="Staff" value={onlineAdmins === null ? "-" : String(onlineAdmins)} glow="rgba(125,211,252,.24)" />
          <StatusPill icon={<Clock3 className="h-3.5 w-3.5 text-indigo-200" />} label="Local" value={time || "--:--"} glow="rgba(165,180,252,.24)" />
        </div>
        <div className="glass-soft hidden min-w-0 rounded-xl px-3 py-2 text-right sm:block">
          <div className="truncate text-sm font-medium text-zinc-100">{loading ? "Loading admin..." : fullName || "Admin"}</div>
          {admin ? (
            <div className="truncate text-xs font-semibold" style={{ color: admin.roleColor, textShadow: `0 0 14px ${admin.roleColor}80` }}>
              {admin.roleLabel}
            </div>
          ) : (
            <div className="text-xs text-zinc-400">Authenticated session</div>
          )}
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors duration-200 hover:border-sky-200/20 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <LogOut className="h-4 w-4 text-indigo-200" />
          Logout
        </button>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, value, glow }: { icon: React.ReactNode; label: string; value: string; glow: string }) {
  return (
    <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2" style={{ boxShadow: `0 12px 28px rgba(0,0,0,.14), 0 0 16px ${glow}, inset 0 1px 0 rgba(255,255,255,.08)` }}>
      {icon}
      <div className="leading-none">
        <div className="text-[10px] uppercase tracking-wide text-zinc-300/60">{label}</div>
        <div className="mt-1 text-xs font-semibold text-zinc-100">{value}</div>
      </div>
    </div>
  );
}
