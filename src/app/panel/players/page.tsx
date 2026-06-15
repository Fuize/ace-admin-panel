"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, UserRound } from "lucide-react";
import { DataToolbar } from "@/components/DataToolbar";
import { PageHeader, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const playerPlaceholders = [
  { id: "sample-001", name: "Player Placeholder 01", status: "Offline", faction: "None", money: "$0", notes: "Profile layout preview" },
  { id: "sample-002", name: "Player Placeholder 02", status: "Offline", faction: "Police", money: "$0", notes: "Vehicles and punishments slots" },
  { id: "sample-003", name: "Player Placeholder 03", status: "Offline", faction: "EMS", money: "$0", notes: "Future Supabase sync target" },
];

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const players = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return playerPlaceholders;
    return playerPlaceholders.filter((player) => [player.name, player.status, player.faction, player.notes].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Players"
        description="Player profile directory placeholder. Profiles are ready for future RAGE:MP/Supabase player sync."
        stats={[{ label: "Sample profiles", value: playerPlaceholders.length }, { label: "Live source", value: "Not connected" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Profile view ready" tone="info" />} />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <Surface key={player.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055]">
                <UserRound className="h-5 w-5 text-sky-100" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-50">{player.name}</div>
                <div className="mt-1 text-xs text-zinc-400">{player.faction} • {player.money}</div>
                <div className="mt-3 text-sm text-zinc-300/78">{player.notes}</div>
              </div>
              <StatusBadge label={player.status} tone="pending" />
            </div>
            <Link href={`/panel/players/${player.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              <Eye className="h-4 w-4 text-sky-200" />
              View profile
            </Link>
          </Surface>
        ))}
      </div>
    </div>
  );
}
