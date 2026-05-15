"use client";
import { EmptyState, PageHeader } from "@/components/PanelPrimitives";

export default function MapPage() {
  return (
    <div>
      <PageHeader
        title="Map"
        description="Ready for future Supabase map markers from RAGE:MP sync."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />
      <EmptyState title="No Supabase data connected yet" description="Map markers will appear here after the future RAGE:MP/Supabase sync is connected." />
    </div>
  );
}
