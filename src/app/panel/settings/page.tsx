"use client";

import Link from "next/link";
import { Bell, MonitorCog, ShieldCheck, UserCog } from "lucide-react";
import { PageHeader, Surface } from "@/components/PanelPrimitives";
import { useAuth } from "@/components/AuthProvider";
import { useUX } from "@/components/UXProvider";

export default function SettingsPage() {
  const { admin, permissions } = useAuth();
  const { density, setDensity, glassMode, setGlassMode, reducedMotion, setReducedMotion } = useUX();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account, session, notification, and interface preferences for the admin workspace."
        stats={[{ label: "Permissions", value: permissions.length }, { label: "Rank", value: admin?.roleLabel || "-" }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="p-5">
          <div className="flex items-center gap-3">
            <UserCog className="h-5 w-5 text-sky-200" />
            <div>
              <div className="text-sm font-semibold text-zinc-50">Account</div>
              <div className="text-sm text-zinc-300/75">{admin ? `${admin.displayName} ${admin.displayLastname}` : "Loading admin..."}</div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-300">
            Passwords are managed in Supabase Auth. Display details are controlled from the admin profile system.
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
            <div>
              <div className="text-sm font-semibold text-zinc-50">Security</div>
              <div className="text-sm text-zinc-300/75">Review active sessions and account access.</div>
            </div>
          </div>
          <Link href="/panel/sessions" className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/[0.08]">
            View sessions
          </Link>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-indigo-200" />
            <div>
              <div className="text-sm font-semibold text-zinc-50">Notifications</div>
              <div className="text-sm text-zinc-300/75">Staff chat and audit notification preferences.</div>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {["Staff chat unread alerts", "Admin login alerts", "Future server sync errors"].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200">
                {item}
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-sky-300" />
              </label>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3">
            <MonitorCog className="h-5 w-5 text-fuchsia-200" />
            <div>
              <div className="text-sm font-semibold text-zinc-50">Interface</div>
              <div className="text-sm text-zinc-300/75">Adjust density, contrast, and motion.</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Table density</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["comfortable", "compact"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDensity(option)}
                    className={`rounded-xl border px-3 py-2 text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${density === option ? "border-sky-200/30 bg-sky-300/[0.10] text-sky-50" : "border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/[0.065]"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Panel contrast</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["clear", "balanced", "deep"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGlassMode(option)}
                    className={`rounded-xl border px-3 py-2 text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${glassMode === option ? "border-slate-400/45 bg-slate-700/55 text-zinc-50" : "border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/[0.065]"}`}
                  >
                    {option === "clear" ? "Light" : option === "deep" ? "Strong" : "Normal"}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200">
              Reduce motion
              <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} className="h-4 w-4 accent-sky-300" />
            </label>
          </div>
        </Surface>
      </div>
    </div>
  );
}
