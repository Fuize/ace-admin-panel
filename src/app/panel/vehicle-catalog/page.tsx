"use client";

import { useMemo, useState } from "react";
import { Car, ImageIcon, PencilRuler } from "lucide-react";
import { DataToolbar } from "@/components/DataToolbar";
import { PageHeader, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const catalogSlots = [
  { slot: "sports-car.png", name: "Sport Placeholder", category: "Sports", size: "16:9 card" },
  { slot: "super-car.png", name: "Super Placeholder", category: "Super", size: "16:9 card" },
  { slot: "sedan.png", name: "Sedan Placeholder", category: "Sedan", size: "16:9 card" },
  { slot: "suv.png", name: "SUV Placeholder", category: "SUV", size: "16:9 card" },
  { slot: "police.png", name: "Police Placeholder", category: "Emergency", size: "16:9 card" },
  { slot: "ems.png", name: "EMS Placeholder", category: "Emergency", size: "16:9 card" },
];

export default function VehicleCatalogPage() {
  const [search, setSearch] = useState("");
  const slots = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalogSlots;
    return catalogSlots.filter((slot) => [slot.slot, slot.name, slot.category].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Vehicle Catalog Manager"
        description="Safe visual manager for future vehicle images, display names, and categories. Editing is intentionally disabled until backend permissions exist."
        stats={[{ label: "Image slots", value: catalogSlots.length }, { label: "Editing", value: "Disabled" }]}
      />
      <DataToolbar search={search} onSearch={setSearch} right={<StatusBadge label="Future editor scaffold" tone="pending" />} />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <Surface key={slot.slot} className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055]">
                <Car className="h-6 w-6 text-sky-100" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-50">{slot.name}</div>
                <div className="mt-1 text-xs text-zinc-400">{slot.category} • {slot.size}</div>
              </div>
              <StatusBadge label="Locked" tone="pending" />
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-200">
                <ImageIcon className="h-4 w-4 text-indigo-200" />
                {slot.slot}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300">
                <PencilRuler className="h-4 w-4 text-amber-200" />
                Future edit form will live here.
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
