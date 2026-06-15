"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutGrid, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { panelNavItems } from "@/components/panelNavItems";
import { useUX } from "@/components/UXProvider";

export function MobileNavDrawer() {
  const path = usePathname();
  const { loading, hasPermission } = useAuth();
  const { mobileNavOpen, setMobileNavOpen } = useUX();
  const visibleItems = panelNavItems.filter((item) => !item.permission || loading || hasPermission(item.permission));

  if (!mobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-[65] md:hidden">
      <button type="button" className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
      <aside className="glass-panel-strong absolute inset-y-0 left-0 w-[min(86vw,330px)] overflow-hidden rounded-r-3xl">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.055]">
            <LayoutGrid className="h-5 w-5 text-sky-200" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-50">ACE Panel</div>
            <div className="text-xs text-zinc-400">Workspace navigation</div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto rounded-xl p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const active = item.href === "/panel" ? path === item.href : path === item.href || path.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                  active ? "border-sky-200/25 bg-sky-300/[0.09] text-white shadow-[inset_3px_0_0_rgba(125,211,252,.55)]" : "border-transparent text-zinc-300 hover:bg-white/[0.055]"
                )}
              >
                <Icon className={clsx("h-4 w-4", active ? "text-sky-200" : "text-zinc-400 group-hover:text-sky-100")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
