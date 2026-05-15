import { EmptyState, PageHeader, TableShell, tableHeadClass, thClass } from "@/components/PanelPrimitives";

export default function BusinessesPage() {
  return (
    <div>
      <PageHeader
        title="Businesses"
        description="Ready for future RAGE:MP and Supabase business sync."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />

      <TableShell minWidth="760px">
          <thead className={tableHeadClass}>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Location (x, y, z)</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-4" colSpan={3}>
                <EmptyState title="No Supabase data connected yet" description="This section is ready for future RAGE:MP/Supabase business sync." />
              </td>
            </tr>
          </tbody>
      </TableShell>
    </div>
  );
}
