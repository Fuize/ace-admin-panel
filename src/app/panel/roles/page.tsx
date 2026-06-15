"use client";

import { useEffect, useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { EmptyState, PageHeader, Surface } from "@/components/PanelPrimitives";

type RoleRow = {
  id: string;
  name: string;
  label: string;
  rank_level: number;
  color: string;
  is_active: boolean;
  permissions?: Array<{ permission?: { key: string; label: string; category: string; is_dangerous: boolean; is_active: boolean } | null }>;
};

export default function RolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((role) => `${role.name} ${role.label} ${role.rank_level}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  return (
    <div>
      <PageHeader
        title="Roles"
        description="ACE rank and permission matrix. Editing stays locked until role-management write policies are approved."
        stats={[{ label: "Roles", value: loading ? "-" : rows.length }, { label: "Mode", value: "Read only" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<span className="rounded-xl border border-amber-200/15 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">Role editing requires future RLS write phase</span>} />
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Surface key={index} className="h-36 p-4"><div className="skeleton-shine h-4 w-2/3 rounded-full" /></Surface>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No roles found" description="Seed ACE roles in Supabase first." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((role) => {
            const permissions = (role.permissions || []).map((item) => item.permission).filter(Boolean);
            return (
              <Surface key={role.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: role.color, textShadow: `0 0 14px ${role.color}66` }}>{role.label}</div>
                    <div className="mt-1 text-xs text-zinc-400">Rank {role.rank_level} - {role.name}</div>
                  </div>
                  <span className={role.is_active ? "text-xs text-emerald-300" : "text-xs text-zinc-500"}>{role.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {permissions.slice(0, 8).map((permission) => (
                    <span key={permission!.key} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300">
                      {permission!.key}
                    </span>
                  ))}
                  {permissions.length > 8 ? <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400">+{permissions.length - 8}</span> : null}
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
