"use client";

import { useEffect, useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { EmptyState, PageHeader, TableShell, TableSkeleton, rowClass, tableHeadClass, tdClass, thClass } from "@/components/PanelPrimitives";

type AuditRow = {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  severity: string;
  created_at: string;
  actor?: { display_name?: string | null; display_lastname?: string | null; username?: string | null } | null;
};

function actorName(row: AuditRow) {
  return [row.actor?.display_name, row.actor?.display_lastname].filter(Boolean).join(" ") || row.actor?.username || "System";
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs?limit=100")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((row) => `${row.action} ${row.severity} ${row.target_type || ""} ${actorName(row)}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Security and admin activity history from Supabase audit logs."
        stats={[{ label: "Loaded", value: loading ? "-" : rows.length }, { label: "Visible", value: loading ? "-" : filtered.length }]}
      />
      <DataToolbar search={search} onSearch={setSearch} />
      <TableShell minWidth="920px">
        <thead className={tableHeadClass}>
          <tr>
            <th className={thClass}>Time</th>
            <th className={thClass}>Actor</th>
            <th className={thClass}>Action</th>
            <th className={thClass}>Target</th>
            <th className={thClass}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <TableSkeleton columns={5} /> : filtered.length === 0 ? (
            <tr><td className="p-4" colSpan={5}><EmptyState title="No audit logs found" description="Audit events will appear once policies and app flows are enabled." /></td></tr>
          ) : filtered.map((row) => (
            <tr key={row.id} className={rowClass}>
              <td className={tdClass}>{new Date(row.created_at).toLocaleString()}</td>
              <td className={tdClass}>{actorName(row)}</td>
              <td className={tdClass}>{row.action}</td>
              <td className={tdClass}>{row.target_type || "-"} {row.target_id ? `#${row.target_id}` : ""}</td>
              <td className={tdClass}>{row.severity}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}
