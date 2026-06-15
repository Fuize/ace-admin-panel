"use client";
import { useEffect, useState } from "react";
import { EmptyState, PageHeader, TableShell, TableSkeleton, rowClass, tableHeadClass, tdClass, thClass } from "@/components/PanelPrimitives";
import { DataToolbar } from "@/components/DataToolbar";

type AdminUser = {
  id: number;
  username: string;
  adminLevel: number;
  role: string;
  tagColor: string;
  is_active: boolean;
};

export default function AdminsPage() {
  const [data, setData] = useState<AdminUser[] | { error: string }>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin-users")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const hasError = !Array.isArray(data);
  const rows = Array.isArray(data)
    ? data.filter((admin) => `${admin.id} ${admin.username} ${admin.role} ${admin.adminLevel}`.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Approved Supabase admin profiles and ranks. Management actions are prepared but stay locked until write policies are approved."
        stats={[{ label: "Loaded", value: loading || hasError ? "-" : data.length }, { label: "Visible", value: loading || hasError ? "-" : rows.length }]}
      />
      <DataToolbar
        search={search}
        onSearch={setSearch}
        right={<span className="rounded-xl border border-amber-200/15 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">Admin create/disable requires future RLS write phase</span>}
      />
      <TableShell minWidth="760px">
        <thead className={tableHeadClass}>
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Username</th>
            <th className={thClass}>Admin level</th>
            <th className={thClass}>Role</th>
            <th className={thClass}>Active</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton columns={5} />
          ) : hasError ? (
            <tr><td className="p-4" colSpan={5}><EmptyState title="Unauthorized" description="Sign in again to view admins." /></td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="p-4" colSpan={5}><EmptyState title="No admins found" description="Add approved admins in Supabase." /></td></tr>
          ) : (
            rows.map((admin) => (
              <tr key={admin.id} className={rowClass}>
                <td className={tdClass}>{admin.id}</td>
                <td className={tdClass}>{admin.username}</td>
                <td className={tdClass}>{admin.adminLevel}</td>
                <td className={tdClass}>
                  <span
                    className="inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      color: admin.tagColor,
                      borderColor: `${admin.tagColor}66`,
                      backgroundColor: `${admin.tagColor}1A`,
                    }}
                  >
                    {admin.role}
                  </span>
                </td>
                <td className={tdClass}>
                  <span className={admin.is_active ? "text-emerald-300" : "text-zinc-400"}>
                    {admin.is_active ? "Online" : "Offline"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>
    </div>
  );
}
