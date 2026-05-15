import { EmptyState, PageHeader, TableShell, tableHeadClass, thClass } from "@/components/PanelPrimitives";

export default function FractionsPage() {
  return (
    <div>
      <PageHeader
        title="Fractions"
        description="Ready for future RAGE:MP and Supabase faction sync."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />

      <TableShell minWidth="760px">
          <thead className={tableHeadClass}>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Money</th>
              <th className={thClass}>Fuel</th>
              <th className={thClass}>Location (x, y, z)</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-4" colSpan={4}>
                <EmptyState title="No Supabase data connected yet" description="This section is ready for future RAGE:MP/Supabase faction sync." />
              </td>
            </tr>
          </tbody>
      </TableShell>
    </div>
  );
}
