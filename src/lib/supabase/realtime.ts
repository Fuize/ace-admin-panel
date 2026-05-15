import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function subscribeToTableInserts(
  supabase: SupabaseClient<Database>,
  table: string,
  onInsert: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`public:${table}:inserts`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table }, onInsert)
    .subscribe();
}

export function unsubscribe(channel: RealtimeChannel) {
  return channel.unsubscribe();
}
