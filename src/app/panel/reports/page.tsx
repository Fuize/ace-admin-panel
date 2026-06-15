"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { FeatureCardGrid } from "@/components/FeatureCards";
import { PageHeader } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const reportPlaceholders = [
  { title: "High Priority Queue", subtitle: "Urgent player tickets that need fast staff review.", meta: "Future filters: priority, category, assigned_admin, age", status: "Queue slot", tone: "danger" as const },
  { title: "Assigned To Me", subtitle: "Reports assigned to the current logged-in admin.", meta: "Future filters: my_admin_id, open, waiting_reply", status: "Ready layout", tone: "info" as const },
  { title: "Unassigned Reports", subtitle: "Open tickets waiting for an admin to take ownership.", meta: "Future fields: player, title, category, created_at", status: "No live data", tone: "pending" as const },
  { title: "Resolved Reports", subtitle: "Closed tickets with resolution notes and handled-by data.", meta: "Future fields: closed_by, result, duration, rating", status: "Archive plan", tone: "info" as const },
  { title: "Report Categories", subtitle: "DM, cheating, bug abuse, support, refund, and staff help.", meta: "Future config: category, SLA, priority default", status: "Draft taxonomy", tone: "pending" as const },
];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reportPlaceholders;
    return reportPlaceholders.filter((item) => [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Player ticket workspace for priority queues, assignments, and resolution history once server sync is connected."
        stats={[{ label: "Queues", value: reportPlaceholders.length }, { label: "Live tickets", value: 0 }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Ticket actions disabled" tone="pending" />} />
      <FeatureCardGrid items={items} emptyTitle="No report queue matched" emptyDescription="Try priority, assigned, unassigned, resolved, or categories." />
    </div>
  );
}
