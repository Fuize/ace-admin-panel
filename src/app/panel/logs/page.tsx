import { EmptyState, PageHeader } from "@/components/PanelPrimitives";

export default function LogsPage() {
  return (
    <div>
      <PageHeader
        title="Logs"
        description="Ready for future Supabase audit logs and RAGE:MP server events."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />
      <EmptyState title="No Supabase data connected yet" description="This section is ready for future Supabase audit logs and RAGE:MP sync." />
    </div>
  );
}
