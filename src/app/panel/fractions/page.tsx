import { ResourceReadyPage } from "@/components/ResourceReadyPage";

export default function FractionsPage() {
  return (
    <ResourceReadyPage
      title="Fractions"
      description="Search, sort, and inspect synced factions after RAGE:MP/Supabase sync is connected."
      columns={["ID", "Name", "Members", "Status", "Updated"]}
      emptyDescription="This section is ready for future RAGE:MP/Supabase faction sync."
    />
  );
}
