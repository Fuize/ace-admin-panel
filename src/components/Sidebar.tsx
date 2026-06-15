"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutGrid } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { panelNavItems } from "@/components/panelNavItems";

export function Sidebar() {
  const path = usePathname();
  const { loading, hasPermission } = useAuth();
  const visibleItems = panelNavItems.filter((item) => !item.permission || loading || hasPermission(item.permission));
  return (
    <aside className="glass-panel-strong relative hidden border-b border-white/10 md:m-3 md:block md:min-h-[calc(100vh-1.5rem)] md:w-[260px] md:shrink-0 md:overflow-hidden md:rounded-2xl">
      <div className="relative p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.055]">
            <LayoutGrid className="h-5 w-5 text-sky-200" />
          </div>
          <div>
            <div className="font-semibold leading-5 text-zinc-50">ACE Panel</div>
            <div className="text-xs text-zinc-400">Operational dashboard</div>
          </div>
        </div>
      </div>

      <nav className="ace-scrollbar relative flex gap-1 overflow-x-auto overflow-y-auto px-3 pb-3 md:block md:overflow-x-hidden md:pb-4">
        {visibleItems.map((it) => {
          const active = it.href === "/panel" ? path === it.href : path === it.href || path.startsWith(`${it.href}/`);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "group relative mb-1 flex shrink-0 items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                active
                  ? "border-sky-300/25 bg-sky-400/[0.09] text-zinc-50 shadow-[inset_3px_0_0_rgba(125,211,252,.55)]"
                  : "border-transparent text-zinc-300/85 hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-white"
              )}
            >
              <Icon className={clsx("relative h-4 w-4 transition-colors duration-150", active ? "text-sky-200" : "text-zinc-400 group-hover:text-sky-100")} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
