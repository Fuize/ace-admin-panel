import { EmptyState, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

export type FeatureCardItem = {
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  tone?: "online" | "pending" | "info" | "danger";
};

export function FeatureCardGrid({ items, emptyTitle, emptyDescription }: { items: FeatureCardItem[]; emptyTitle: string; emptyDescription: string }) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Surface key={`${item.title}-${item.meta}`} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-50">{item.title}</div>
              <div className="mt-1 text-sm leading-5 text-zinc-300/78">{item.subtitle}</div>
            </div>
            <StatusBadge label={item.status} tone={item.tone || "info"} />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-zinc-400">{item.meta}</div>
        </Surface>
      ))}
    </div>
  );
}
