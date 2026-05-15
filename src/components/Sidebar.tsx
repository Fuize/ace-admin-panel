"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Car, Building2, Users2, Map as MapIcon, Shield, User, ScrollText, LayoutGrid } from "lucide-react";

const items = [
  { href: "/panel/players", label: "Players", icon: User },
  { href: "/panel/vehicles", label: "Vehicles", icon: Car },
  { href: "/panel/businesses", label: "Businesses", icon: Building2 },
  { href: "/panel/fractions", label: "Fractions", icon: Users2 },
  { href: "/panel/map", label: "Map", icon: MapIcon },
  { href: "/panel/admins", label: "Admins", icon: Shield },
  { href: "/panel/logs", label: "Logs", icon: ScrollText },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="glass-panel-strong relative border-b border-white/10 md:m-3 md:min-h-[calc(100vh-1.5rem)] md:w-[260px] md:shrink-0 md:overflow-hidden md:rounded-2xl">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/40 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-12 h-44 w-44 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-300/25 bg-indigo-400/12 shadow-[0_0_32px_rgba(99,102,241,.24),inset_0_1px_0_rgba(255,255,255,.10)] backdrop-blur">
            <LayoutGrid className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold leading-5 text-zinc-50">Server Admin Panel</div>
            <div className="text-xs text-zinc-300/70">Operational dashboard</div>
          </div>
        </div>
      </div>

      <nav className="relative flex gap-1 overflow-x-auto px-3 pb-3 md:block md:overflow-visible md:pb-4">
        {items.map((it) => {
          const active = path === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "group relative mb-1 flex shrink-0 items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                active
                  ? "border-indigo-200/30 bg-indigo-300/[0.095] text-indigo-50 shadow-[0_0_20px_rgba(99,102,241,.20),inset_0_1px_0_rgba(255,255,255,.09)]"
                  : "border-transparent text-zinc-300/85 hover:border-white/12 hover:bg-white/[0.055] hover:text-white"
              )}
            >
              {active ? <span className="absolute left-0 top-1/2 h-7 w-px -translate-y-1/2 rounded-full bg-sky-200 shadow-[0_0_16px_rgba(125,211,252,.9)]" /> : null}
              {active ? <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(125,211,252,.12),transparent_44%)]" /> : null}
              <Icon className={clsx("relative h-4 w-4 transition duration-300", active ? "text-sky-200 drop-shadow-[0_0_10px_rgba(125,211,252,.75)]" : "group-hover:text-sky-100")} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
