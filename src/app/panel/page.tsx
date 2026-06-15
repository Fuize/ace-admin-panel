"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, History, MessageSquare, Shield, Users } from "lucide-react";
import { EmptyState, PageHeader, Surface } from "@/components/PanelPrimitives";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";

type AdminRow = { id: string; username: string; role: string; tagColor: string; is_active: boolean; lastSeen?: string | null };
type AuditRow = { id: string; action: string; severity: string; created_at: string; actor?: { display_name?: string; display_lastname?: string; username?: string } | null };

function actorName(row: AuditRow) {
  return [row.actor?.display_name, row.actor?.display_lastname].filter(Boolean).join(" ") || row.actor?.username || "System";
}

export default function DashboardPage() {
  const { admin, permissions } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);

  useEffect(() => {
    fetch("/api/admin-users").then((response) => response.ok ? response.json() : []).then((data) => setAdmins(Array.isArray(data) ? data : [])).catch(() => setAdmins([]));
    fetch("/api/audit-logs?limit=5").then((response) => response.ok ? response.json() : []).then((data) => setAudit(Array.isArray(data) ? data : [])).catch(() => setAudit([]));
  }, []);

  const onlineAdmins = admins.filter((row) => row.is_active);
  const stats = useMemo(() => [
    { label: "Online staff", value: onlineAdmins.length },
    { label: "Permissions", value: permissions.length },
    { label: "Rank", value: admin?.roleLabel || "-" },
  ], [admin?.roleLabel, onlineAdmins.length, permissions.length]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live admin workspace overview for staff presence, permissions, audit activity, and future server sync."
        stats={stats}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Surface className="p-5">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(125,211,252,.14),transparent_38%),radial-gradient(circle_at_88%_20%,rgba(168,85,247,.12),transparent_34%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-sky-300/20 bg-sky-400/10 shadow-[0_0_22px_rgba(125,211,252,.16)]">
                  <Activity className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">Control Center</div>
                  <div className="text-sm text-zinc-300/75">Supabase foundations are ready. RAGE:MP sync stays offline until the future integration phase.</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge label="Panel online" tone="online" pulse />
                <StatusBadge label="Supabase auth" tone="info" />
                <StatusBadge label="Server sync pending" tone="pending" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-sky-300/20 bg-sky-400/10">
              <Activity className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-50">Workspace Pulse</div>
              <div className="text-sm text-zinc-300/75">Quick view of current admin state and visible tools.</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniMetric icon={<Users className="h-4 w-4" />} label="Staff Online" value={onlineAdmins.length} />
            <MiniMetric icon={<Shield className="h-4 w-4" />} label="Your Rank" value={admin?.roleLabel || "Admin"} color={admin?.roleColor} />
            <MiniMetric icon={<MessageSquare className="h-4 w-4" />} label="Staff Chat" value={permissions.includes("staff_chat.send") ? "Send enabled" : "Read only"} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <History className="h-4 w-4 text-indigo-200" />
            Recent Audit
          </div>
          <div className="mt-4 space-y-2">
            {audit.length === 0 ? (
              <EmptyState title="No audit events yet" description="Audit events will appear here after policies and app flows are enabled." />
            ) : audit.map((row) => (
              <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-zinc-100">{row.action}</div>
                  <div className="text-xs text-zinc-400">{new Date(row.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-300/75">{actorName(row)} - {row.severity}</div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface className="p-5">
          <div className="text-sm font-semibold text-zinc-100">Online Staff</div>
          <div className="mt-4 space-y-2">
            {onlineAdmins.length === 0 ? <EmptyState title="No online staff shown" description="Presence updates appear when staff open the panel." /> : onlineAdmins.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-zinc-100">{row.username}</div>
                  <div className="text-xs font-semibold" style={{ color: row.tagColor }}>{row.role}</div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.75)]" />
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="text-sm font-semibold text-zinc-100">Future Sync Status</div>
          <div className="mt-4 grid gap-2">
            {["Players", "Vehicles", "Businesses", "Factions", "Map markers", "Server logs"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
                <span className="text-zinc-200">{item}</span>
                <span className="text-xs text-amber-200">Waiting for Supabase sync</span>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function MiniMetric({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) {
  return (
    <div className="glass-soft rounded-xl p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-300/65">{icon}{label}</div>
      <div className="mt-2 truncate text-sm font-semibold text-zinc-50" style={color ? { color, textShadow: `0 0 14px ${color}70` } : undefined}>{value}</div>
    </div>
  );
}
