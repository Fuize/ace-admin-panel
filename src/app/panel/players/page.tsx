import { EmptyState, PageHeader, TableShell, tableHeadClass, thClass } from "@/components/PanelPrimitives";

export default function PlayersPage() {
  return (
    <div>
      <PageHeader
        title="Players"
        description="Ready for future RAGE:MP and Supabase player sync."
        stats={[{ label: "Source", value: "Supabase ready" }]}
      />

      <TableShell minWidth="860px">
          <thead className={tableHeadClass}>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Fraction</th>
              <th className={thClass}>Cash</th>
              <th className={thClass}>Bank</th>
              <th className={thClass}>Admin level</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-4" colSpan={6}>
                <EmptyState title="No Supabase data connected yet" description="This section is ready for future RAGE:MP/Supabase player sync." />
              </td>
            </tr>
          </tbody>
      </TableShell>
    </div>
  );
}
