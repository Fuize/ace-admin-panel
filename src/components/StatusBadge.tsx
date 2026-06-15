import { clsx } from "clsx";

type StatusBadgeTone = "online" | "pending" | "info" | "danger";

const toneClass: Record<StatusBadgeTone, string> = {
  online: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  pending: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  info: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  danger: "border-red-300/25 bg-red-400/10 text-red-100",
};

export function StatusBadge({ label, tone = "info", pulse = false }: { label: string; tone?: StatusBadgeTone; pulse?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,.08)]", toneClass[tone])}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", tone === "online" ? "bg-emerald-300" : tone === "pending" ? "bg-amber-300" : tone === "danger" ? "bg-red-300" : "bg-sky-300", pulse && "animate-pulse")} />
      {label}
    </span>
  );
}
