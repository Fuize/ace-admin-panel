"use client";

import { Search } from "lucide-react";

export function DataToolbar({ search, onSearch, right }: { search: string; onSearch: (value: string) => void; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <span className="sr-only">Search</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-400/70 focus:border-sky-200/30 focus:ring-2 focus:ring-sky-300/50"
        />
      </label>
      {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
    </div>
  );
}
