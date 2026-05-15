import { clsx } from "clsx";

type PageHeaderProps = {
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
};

export function PageHeader({ title, description, stats = [] }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" style={{ animation: "soft-pop .35s ease-out both" }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-50 drop-shadow-[0_0_20px_rgba(255,255,255,.14)]">{title}</h1>
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

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="glass-soft rounded-2xl border-dashed p-6 text-center" style={{ animation: "soft-pop .35s ease-out both" }}>
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      {description ? <div className="mt-1 text-sm text-zinc-300/75">{description}</div> : null}
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
export const thClass = "whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-300/90";
export const tdClass = "whitespace-nowrap px-4 py-3.5 text-zinc-200";
export const rowClass = "border-t border-white/8 odd:bg-white/[0.018] even:bg-white/[0.035] transition-colors duration-150 hover:bg-sky-200/[0.07] hover:shadow-[inset_3px_0_0_rgba(125,211,252,.38)]";
