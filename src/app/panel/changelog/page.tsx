import { PageHeader, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

const changes = [
  { version: "Phase 8", title: "Admin workflow tabs", description: "Added safe placeholder sections for punishments, reports, staff activity, server health, announcements, changelog, vehicle catalog, and player profile view.", status: "Current" },
  { version: "Phase 7", title: "Smoothness and presence", description: "Reduced heavy glass rendering cost and improved online staff visibility.", status: "Done" },
  { version: "Phase 6", title: "Productivity foundation", description: "Added roles, audit, sessions, notification polish, and panel command/navigation improvements.", status: "Done" },
  { version: "Phase 5", title: "Staff chat", description: "Added realtime staff chat, presence heartbeat, and mobile chat drawer.", status: "Done" },
];

export default function ChangelogPage() {
  return (
    <div>
      <PageHeader
        title="Changelog"
        description="Internal update log so staff can quickly understand what changed inside the admin panel."
        stats={[{ label: "Entries", value: changes.length }, { label: "Latest", value: changes[0].version }]}
      />
      <div className="space-y-4">
        {changes.map((change) => (
          <Surface key={change.version} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-200">{change.version}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-50">{change.title}</div>
                <div className="mt-1 text-sm leading-6 text-zinc-300/78">{change.description}</div>
              </div>
              <StatusBadge label={change.status} tone={change.status === "Current" ? "online" : "info"} />
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
