import { clsx } from "clsx";

type PageHeaderProps = {
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
};

export function PageHeader({ title, description, stats = [] }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" style={{ animation: "soft-pop .22s ease-out both" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-50">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-300/90">{description}</p>
      </div>
      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-soft rounded-xl px-3.5 py-2.5 transition-colors duration-200 hover:border-sky-200/20 hover:bg-white/[0.06]">
              <div className="text-xs text-zinc-300/75">{stat.label}</div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-100">{stat.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("glass-panel overflow-hidden rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function TableShell({ children, minWidth = "760px" }: { children: React.ReactNode; minWidth?: string }) {
  return (
    <Surface className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </Surface>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="glass-soft relative overflow-hidden rounded-2xl border-dashed p-6 text-center" style={{ animation: "soft-pop .22s ease-out both" }}>
      <div className="relative mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        {icon ?? <div className="h-2 w-2 rounded-full bg-sky-300/60" />}
      </div>
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      {description ? <div className="mt-1 text-sm text-zinc-300/75">{description}</div> : null}
    </div>
  );
}

export function AceLoader({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-2xl p-4 text-sm text-zinc-200">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-sky-300/20 bg-sky-400/10">
        <span className="h-3 w-3 animate-ping rounded-full bg-sky-200/70" />
        <span className="absolute h-2 w-2 rounded-full bg-sky-200 shadow-[0_0_14px_rgba(125,211,252,.75)]" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-t border-white/8">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3.5">
              <div className="skeleton-shine h-3 rounded-full" style={{ width: `${columnIndex === 0 ? 42 : 76 - (columnIndex % 3) * 10}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export const tableHeadClass = "sticky top-0 z-10 bg-white/[0.055] text-zinc-100 backdrop-blur-2xl shadow-[inset_0_-1px_0_rgba(255,255,255,.10)]";
export const thClass = "density-head whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold tracking-[0.05em] text-zinc-400";
export const tdClass = "density-cell whitespace-nowrap px-4 py-3.5 text-zinc-200";
export const rowClass = "border-t border-white/8 odd:bg-white/[0.018] even:bg-white/[0.035] transition-colors duration-150 hover:bg-sky-200/[0.07] hover:shadow-[inset_3px_0_0_rgba(125,211,252,.38)]";
