"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { FeatureCardGrid } from "@/components/FeatureCards";
import { PageHeader } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const announcementPlaceholders = [
  { title: "Staff Notice Drafts", subtitle: "Internal messages for admins before they are published.", meta: "Future fields: title, body, audience, created_by", status: "Draft-only", tone: "pending" as const },
  { title: "Server Broadcast Drafts", subtitle: "Prepared broadcast text for later approval and sync.", meta: "Future actions require explicit permission checks", status: "No broadcast connected", tone: "danger" as const },
  { title: "Pinned Staff Notes", subtitle: "Permanent reminders for rules, events, and current priorities.", meta: "Future fields: pinned_until, priority, visibility", status: "Planned", tone: "info" as const },
  { title: "Event Messages", subtitle: "Template notes for events, restarts, and roleplay announcements.", meta: "Future templates: restart, event, update, warning", status: "Template slot", tone: "info" as const },
];

export default function AnnouncementsPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return announcementPlaceholders;
    return announcementPlaceholders.filter((item) => [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Staff-only notes and future broadcast drafts. Nothing is published or sent from this page yet."
        stats={[{ label: "Draft slots", value: announcementPlaceholders.length }, { label: "Publishing", value: "Disabled" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="No live publishing" tone="pending" />} />
      <FeatureCardGrid items={items} emptyTitle="No announcement section matched" emptyDescription="Try notice, broadcast, pinned, or event." />
    </div>
  );
}
