import { ResourceReadyPage } from "@/components/ResourceReadyPage";

export default function BusinessesPage() {
  return (
    <ResourceReadyPage
      title="Businesses"
      description="Search, sort, and inspect synced businesses after RAGE:MP/Supabase sync is connected."
      columns={["ID", "Name", "Owner", "Location", "Updated"]}
      emptyDescription="This section is ready for future RAGE:MP/Supabase business sync."
    />
  );
}
