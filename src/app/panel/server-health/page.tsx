"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { FeatureCardGrid } from "@/components/FeatureCards";
import { PageHeader } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const healthPlaceholders = [
  { title: "Panel Runtime", subtitle: "Cloudflare/OpenNext deployment health and build version.", meta: "Current: Next.js app routes and middleware enabled", status: "Online", tone: "online" as const },
  { title: "Supabase API", subtitle: "Auth, Postgres, and realtime connection state.", meta: "Future check: anon client ping + realtime heartbeat", status: "Connected by env", tone: "info" as const },
  { title: "RAGE:MP Sync", subtitle: "Server bridge status once the game server integration exists.", meta: "Current: not connected by design", status: "Pending", tone: "pending" as const },
  { title: "Player Count", subtitle: "Live player count and queue once RAGE:MP bridge is ready.", meta: "Future source: server heartbeat table", status: "No source", tone: "pending" as const },
  { title: "DB/API Errors", subtitle: "Failed sync jobs, auth failures, and API route errors.", meta: "Future source: audit_logs + server_health_events", status: "Planned", tone: "info" as const },
];

export default function ServerHealthPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return healthPlaceholders;
    return healthPlaceholders.filter((item) => [item.title, item.subtitle, item.meta, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Server Health"
        description="Operational status overview for panel runtime, Supabase, future RAGE:MP sync, and health alerts."
        stats={[{ label: "Panel", value: "Online" }, { label: "RAGE:MP", value: "Not connected" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Monitoring scaffold" tone="info" />} />
      <FeatureCardGrid items={items} emptyTitle="No health section matched" emptyDescription="Try Supabase, runtime, sync, player count, or errors." />
    </div>
  );
}
