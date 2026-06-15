"use client";

import { useMemo, useState } from "react";
import { Car, Gauge, ImageIcon, ShieldCheck } from "lucide-react";
import { DataToolbar } from "@/components/DataToolbar";
import { EmptyState, PageHeader, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

type VehiclePlaceholder = {
  id: string;
  name: string;
  category: string;
  imageSlot: string;
  status: "Placeholder" | "Ready Slot";
};

const vehiclePlaceholders: VehiclePlaceholder[] = [
  { id: "veh-001", name: "Sport Placeholder", category: "Sports", imageSlot: "sports-car.png", status: "Placeholder" },
  { id: "veh-002", name: "Super Placeholder", category: "Super", imageSlot: "super-car.png", status: "Placeholder" },
  { id: "veh-003", name: "Sedan Placeholder", category: "Sedan", imageSlot: "sedan.png", status: "Placeholder" },
  { id: "veh-004", name: "SUV Placeholder", category: "SUV", imageSlot: "suv.png", status: "Placeholder" },
  { id: "veh-005", name: "Motorcycle Placeholder", category: "Motorcycle", imageSlot: "motorcycle.png", status: "Placeholder" },
  { id: "veh-006", name: "Police Placeholder", category: "Emergency", imageSlot: "police.png", status: "Ready Slot" },
  { id: "veh-007", name: "EMS Placeholder", category: "Emergency", imageSlot: "ems.png", status: "Ready Slot" },
  { id: "veh-008", name: "Truck Placeholder", category: "Utility", imageSlot: "truck.png", status: "Placeholder" },
  { id: "veh-009", name: "Offroad Placeholder", category: "Offroad", imageSlot: "offroad.png", status: "Placeholder" },
  { id: "veh-010", name: "Luxury Placeholder", category: "Luxury", imageSlot: "luxury.png", status: "Placeholder" },
  { id: "veh-011", name: "Classic Placeholder", category: "Classic", imageSlot: "classic.png", status: "Placeholder" },
  { id: "veh-012", name: "Van Placeholder", category: "Commercial", imageSlot: "van.png", status: "Placeholder" },
];

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehiclePlaceholders;
    return vehiclePlaceholders.filter((vehicle) => [vehicle.name, vehicle.category, vehicle.imageSlot].some((value) => value.toLowerCase().includes(query)));
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Placeholder vehicle catalog prepared for future ACE car images, names, and Supabase/RAGE:MP sync."
        stats={[
          { label: "Placeholders", value: vehiclePlaceholders.length },
          { label: "Source", value: "Local slots" },
        ]}
      />

      <DataToolbar
        search={search}
        onSearch={setSearch}
        right={<StatusBadge label="No live vehicle DB yet" tone="pending" />}
      />

      {filteredVehicles.length === 0 ? (
        <EmptyState title="No vehicle placeholder matched" description="Try another name, category, or future image slot." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredVehicles.map((vehicle, index) => (
            <Surface key={vehicle.id} className="group overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_28%_16%,rgba(125,211,252,.20),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025))]">
                <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] shadow-[0_14px_30px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.08)]">
                    <Car className="h-8 w-8 text-sky-100" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-zinc-950/35 px-2 py-1 text-xs text-zinc-200">
                  #{String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-50">{vehicle.name}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-300/75">
                      <Gauge className="h-3.5 w-3.5" />
                      {vehicle.category}
                    </div>
                  </div>
                  <StatusBadge label={vehicle.status} tone={vehicle.status === "Ready Slot" ? "info" : "pending"} />
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Future image file
                  </div>
                  <div className="mt-1 truncate text-sm text-zinc-200">{vehicle.imageSlot}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                  Safe placeholder only. No vehicle action is connected.
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
