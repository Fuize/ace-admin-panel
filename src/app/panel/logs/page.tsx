import { ResourceReadyPage } from "@/components/ResourceReadyPage";

export default function LogsPage() {
  return (
    <ResourceReadyPage
      title="Logs"
      description="Search, sort, and inspect future server logs after RAGE:MP/Supabase sync is connected."
      columns={["Time", "Type", "Actor", "Target", "Message"]}
      emptyDescription="This section is ready for future Supabase server logs and RAGE:MP sync."
    />
  );
}
