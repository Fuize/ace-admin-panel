"use client";
import { useEffect, useState } from "react";
import { EmptyState, PageHeader, TableShell, TableSkeleton, rowClass, tableHeadClass, tdClass, thClass } from "@/components/PanelPrimitives";

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

  useEffect(() => {
    fetch("/api/admin-users")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const hasError = !Array.isArray(data);

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Approved Supabase admin profiles and ranks. This is a read-only view for now."
        stats={[{ label: "Loaded", value: loading || hasError ? "-" : data.length }]}
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
          ) : data.length === 0 ? (
            <tr><td className="p-4" colSpan={5}><EmptyState title="No admins found" description="Add approved admins in Supabase." /></td></tr>
          ) : (
            data.map((admin) => (
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
