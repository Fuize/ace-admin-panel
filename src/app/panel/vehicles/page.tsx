import { EmptyState, PageHeader } from "@/components/PanelPrimitives";

export default function VehiclesPage() {
  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Ready for future RAGE:MP and Supabase vehicle sync."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />
      <EmptyState title="No Supabase data connected yet" description="This section is ready for future RAGE:MP/Supabase vehicle sync." />
    </div>
  );
}
