"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { panelNavItems } from "@/components/panelNavItems";
import { useUX } from "@/components/UXProvider";

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { commandOpen, closeCommand } = useUX();
  const { hasPermission, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return panelNavItems
      .filter((item) => !item.permission || loading || hasPermission(item.permission))
      .filter((item) => {
        if (!normalized) return true;
        return [item.label, item.description, ...item.keywords].some((part) => part.toLowerCase().includes(normalized));
      });
  }, [hasPermission, loading, query]);

  useEffect(() => {
    if (!commandOpen) return;
    setQuery("");
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [commandOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!commandOpen) return null;

  function goTo(index: number) {
    const item = items[index];
    if (!item) return;
    closeCommand();
    router.push(item.href);
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-start bg-zinc-950/55 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close command palette" onClick={closeCommand} />
      <div className="glass-panel-strong relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/50 to-transparent" />
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-sky-200" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, 0));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                goTo(activeIndex);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-400"
            placeholder="Search pages, tools, and workspace actions..."
          />
          <kbd className="hidden rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-zinc-300 sm:block">Esc</kbd>
        </div>
        <div className="ace-scrollbar max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-indigo-200" />
              <div className="mt-2 text-sm font-medium text-zinc-100">No matching command</div>
              <div className="mt-1 text-xs text-zinc-400">Try searching for a page name or admin tool.</div>
            </div>
          ) : items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.href}
                onClick={() => goTo(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                  index === activeIndex ? "border-sky-200/25 bg-sky-300/[0.09] text-white shadow-[inset_3px_0_0_rgba(125,211,252,.55)]" : "border-transparent text-zinc-300 hover:bg-white/[0.055]"
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.055]">
                  <Icon className="h-4 w-4 text-sky-100" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-zinc-400">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
