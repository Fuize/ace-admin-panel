"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/DataToolbar";
import { FeatureCardGrid } from "@/components/FeatureCards";
import { PageHeader } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const punishmentPlaceholders = [
  { title: "Warning History", subtitle: "Player warnings, reasons, issuer, and expiration timeline.", meta: "Future fields: player, admin, reason, points, expires_at", status: "Read-only plan", tone: "info" as const },
  { title: "Kick History", subtitle: "Short-term removals with reason and issuing staff member.", meta: "Future fields: player, admin, reason, server_id, created_at", status: "No action connected", tone: "pending" as const },
  { title: "Ban Records", subtitle: "Permanent and temporary bans with appeal status.", meta: "Future fields: duration, proof, appeal_note, lifted_by", status: "Locked", tone: "danger" as const },
  { title: "Admin Jail", subtitle: "Jail punishments, release time, and staff notes.", meta: "Future fields: minutes, cell, reason, released_at", status: "No action connected", tone: "pending" as const },
  { title: "Appeal Notes", subtitle: "Internal review notes for punishments and appeals.", meta: "Future fields: appeal_status, reviewer, decision_note", status: "Draft section", tone: "info" as const },
];

export default function PunishmentsPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return punishmentPlaceholders;
    return punishmentPlaceholders.filter((item) => [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Punishments"
        description="Prepared workspace for warnings, kicks, bans, jail history, and appeal notes. No punishment actions are connected yet."
        stats={[{ label: "Mode", value: "Planning" }, { label: "Actions", value: "Disabled" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Safe read-only placeholders" tone="pending" />} />
      <FeatureCardGrid items={items} emptyTitle="No punishment section matched" emptyDescription="Try searching warn, ban, kick, jail, or appeal." />
    </div>
  );
}
