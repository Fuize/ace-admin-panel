import { EmptyState, PageHeader, TableShell, tableHeadClass, thClass } from "@/components/PanelPrimitives";

type ResourceReadyPageProps = {
  title: string;
  description: string;
  columns: string[];
  emptyDescription: string;
};

export function ResourceReadyPage({ title, description, columns, emptyDescription }: ResourceReadyPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} stats={[{ label: "Source", value: "Supabase ready" }]} />
      <TableShell minWidth="760px">
        <thead className={tableHeadClass}>
          <tr>
            {columns.map((column) => <th key={column} className={thClass}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4" colSpan={columns.length}>
              <EmptyState title="No Supabase data connected yet" description={emptyDescription} />
            </td>
          </tr>
        </tbody>
      </TableShell>
    </div>
  );
}
