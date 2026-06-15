"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { FeatureCardGrid } from "@/components/FeatureCards";
import { PageHeader } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const activityPlaceholders = [
  { title: "Online Time", subtitle: "Daily and weekly staff presence totals.", meta: "Future metric: presence sessions grouped by admin_id", status: "Planned", tone: "info" as const },
  { title: "Handled Reports", subtitle: "Report count, response time, and resolution quality.", meta: "Future metric: reports resolved per admin", status: "Planned", tone: "info" as const },
  { title: "Recent Staff Actions", subtitle: "Warnings, notes, moderation actions, and profile edits.", meta: "Future source: audit_logs + punishment tables", status: "Audit-ready", tone: "pending" as const },
  { title: "Staff Leaderboard", subtitle: "Helpful productivity overview without making it punitive.", meta: "Future metric: reports + uptime + quality signals", status: "Draft", tone: "pending" as const },
];

export default function StaffActivityPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activityPlaceholders;
    return activityPlaceholders.filter((item) => [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Staff Activity"
        description="Future staff productivity and activity overview for online time, handled reports, and recent admin work."
        stats={[{ label: "Live source", value: "Presence" }, { label: "Actions", value: "None" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Metrics placeholder" tone="pending" />} />
      <FeatureCardGrid items={items} emptyTitle="No staff activity section matched" emptyDescription="Try online time, reports, actions, or leaderboard." />
    </div>
  );
}
