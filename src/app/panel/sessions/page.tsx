"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, TableShell, TableSkeleton, rowClass, tableHeadClass, tdClass, thClass } from "@/components/PanelPrimitives";

type SessionRow = {
  id: string;
  user_agent: string | null;
  started_at: string;
  ended_at: string | null;
  last_seen: string;
  revoked_at: string | null;
};

export default function SessionsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Your Supabase-backed admin session history. Revocation controls are prepared for a later safe write-policy phase."
        stats={[{ label: "Loaded", value: loading ? "-" : rows.length }, { label: "Mode", value: "Read only" }]}
      />
      <TableShell minWidth="900px">
        <thead className={tableHeadClass}>
          <tr>
            <th className={thClass}>Started</th>
            <th className={thClass}>Last seen</th>
            <th className={thClass}>Ended</th>
            <th className={thClass}>Revoked</th>
            <th className={thClass}>Device</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <TableSkeleton columns={5} /> : rows.length === 0 ? (
            <tr><td className="p-4" colSpan={5}><EmptyState title="No sessions found" description="Session history will appear after admin session logging is enabled." /></td></tr>
          ) : rows.map((row) => (
            <tr key={row.id} className={rowClass}>
              <td className={tdClass}>{new Date(row.started_at).toLocaleString()}</td>
              <td className={tdClass}>{new Date(row.last_seen).toLocaleString()}</td>
              <td className={tdClass}>{row.ended_at ? new Date(row.ended_at).toLocaleString() : "-"}</td>
              <td className={tdClass}>{row.revoked_at ? new Date(row.revoked_at).toLocaleString() : "-"}</td>
              <td className={tdClass}>{row.user_agent || "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}
