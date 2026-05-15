"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MessageSquare, Send, Users, X } from "lucide-react";
import { FormEvent, memo, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseConfig } from "@/lib/supabase/client";
import { isRecentlyActive } from "@/lib/supabase/presence";
import { useAuth } from "@/components/AuthProvider";

type ChatMessage = {
  id: string;
  sender_admin_id: string | null;
  body: string;
  created_at: string;
  pending?: boolean;
  sender?: {
    display_name?: string | null;
    display_lastname?: string | null;
    role?: {
      label?: string | null;
      color?: string | null;
    } | null;
  } | null;
};

type PresenceRow = {
  id: string;
  admin_id: string;
  status: "online" | "idle" | "offline";
  last_heartbeat: string;
  admin?: {
    display_name?: string | null;
    display_lastname?: string | null;
    role?: {
      label?: string | null;
      color?: string | null;
    } | null;
  } | null;
};

type AppSupabaseClient = SupabaseClient<any>;

function createAuthedSupabase(accessToken: string): AppSupabaseClient {
  const config = getSupabaseConfig();
  return createClient<any>(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function adminName(admin?: ChatMessage["sender"] | PresenceRow["admin"]) {
  return [admin?.display_name, admin?.display_lastname].filter(Boolean).join(" ") || "Unknown admin";
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
}

const senderProfileSelect = "sender:admins!staff_chat_messages_sender_admin_id_fkey(display_name,display_lastname,role:admin_roles!admins_role_id_fkey(label,color))";
const presenceProfileSelect = "admin:admins!admin_presence_admin_id_fkey(display_name,display_lastname,role:admin_roles!admins_role_id_fkey(label,color))";

export function StaffChat() {
  const { admin, hasPermission, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<PresenceRow[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<AppSupabaseClient | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const listRef = useRef<HTMLDivElement | null>(null);

  const canView = hasPermission("staff_chat.view");
  const canSend = hasPermission("staff_chat.send");
  const onlineAdmins = useMemo(() => (
    presence.filter((row) => row.status === "online" && isRecentlyActive(row.last_heartbeat))
  ), [presence]);

  useEffect(() => {
    if (loading || !canView) return;
    let alive = true;

    fetch("/api/auth/session-token")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!alive || !data?.accessToken) return;
        const client = createAuthedSupabase(data.accessToken);
        client.realtime.setAuth(data.accessToken);
        setSupabase(client);
      })
      .catch(() => {
        if (alive) setError("Unable to connect staff chat.");
      });

    return () => {
      alive = false;
    };
  }, [canView, loading]);

  useEffect(() => {
    if (!supabase || !canView) return;
    const client = supabase;

    async function loadInitialData() {
      const { data: messageRows, error: messageError } = await client
        .from("staff_chat_messages")
        .select(`id,sender_admin_id,body,created_at,${senderProfileSelect}`)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (messageError) {
        console.error("Staff chat message load failed", messageError);
        setError(messageError.message);
        return;
      }

      setError(null);
      setMessages(((messageRows || []) as ChatMessage[]).reverse());

      const { data: presenceRows, error: presenceError } = await client
        .from("admin_presence")
        .select(`id,admin_id,status,last_heartbeat,${presenceProfileSelect}`)
        .order("last_heartbeat", { ascending: false })
        .limit(30);

      if (!presenceError) {
        setPresence((presenceRows || []) as PresenceRow[]);
      } else {
        console.error("Staff presence load failed", presenceError);
      }
    }

    void loadInitialData();

    const channel = client
      .channel("ace-staff-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_chat_messages" }, () => void loadInitialData())
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_presence" }, () => void loadInitialData())
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [canView, supabase]);

  useEffect(() => {
    if (!supabase || !admin || !canView) return;
    const client = supabase;
    const adminId = admin.id;

    async function heartbeat(status: "online" | "offline" = "online") {
      await client.from("admin_presence").upsert({
        admin_id: adminId,
        session_id: sessionId,
        status,
        current_page: window.location.pathname,
        last_heartbeat: new Date().toISOString(),
      }, { onConflict: "admin_id,session_id" });
    }

    void heartbeat("online");
    const interval = window.setInterval(() => void heartbeat("online"), 30_000);

    return () => {
      window.clearInterval(interval);
      void heartbeat("offline");
    };
  }, [admin, canView, sessionId, supabase]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, open]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !admin || !canSend) return;
    const text = body.trim();
    if (!text) return;

    setBody("");
    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      sender_admin_id: admin.id,
      body: text,
      created_at: new Date().toISOString(),
      pending: true,
      sender: {
        display_name: admin.displayName,
        display_lastname: admin.displayLastname,
        role: {
          label: admin.roleLabel,
          color: admin.roleColor,
        },
      },
    };

    setMessages((current) => [...current, optimisticMessage]);

    const { data: insertedRows, error: sendError } = await supabase.from("staff_chat_messages").insert({
      sender_admin_id: admin.id,
      body: text,
    }).select(`id,sender_admin_id,body,created_at,${senderProfileSelect}`);

    if (sendError) {
      console.error("Staff chat send failed", sendError);
      setError(sendError.message);
      setBody(text);
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      return;
    }

    const inserted = Array.isArray(insertedRows) ? insertedRows[0] : null;
    if (inserted) {
      setError(null);
      setMessages((current) => current.map((message) => message.id === optimisticId ? inserted as ChatMessage : message));
    }
  }

  if (loading || !canView) return null;

  const content = (
      <aside className="glass-panel-strong flex h-full max-h-screen flex-col overflow-hidden text-zinc-100">
      <div className="shrink-0 border-b border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 px-4 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/25 bg-sky-400/12 shadow-[0_0_18px_rgba(14,165,233,.20)]">
          <MessageSquare className="h-4 w-4 text-sky-200" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-50">Staff Chat</div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-300/75">
            <Users className="h-3.5 w-3.5" />
            {onlineAdmins.length} online
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto rounded-lg p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:hidden"
          aria-label="Close staff chat"
        >
          <X className="h-4 w-4" />
        </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {onlineAdmins.slice(0, 5).map((row) => (
            <span key={row.id} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.055] px-2 py-1 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.75)]" />
              <span className="max-w-24 truncate">{adminName(row.admin)}</span>
            </span>
          ))}
          {onlineAdmins.length === 0 ? <span className="text-xs text-zinc-400">No active staff shown</span> : null}
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="glass-soft rounded-xl p-4 text-sm text-zinc-300/75">No staff messages yet.</div>
        ) : messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)}
      </div>

      {error ? <div className="mx-4 mb-3 shrink-0 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div> : null}

      <form onSubmit={sendMessage} className="shrink-0 border-t border-white/10 bg-white/[0.025] p-3 backdrop-blur-2xl">
        <label htmlFor="staff-chat-message" className="sr-only">Staff chat message</label>
        <div className="flex gap-2">
          <input
            id="staff-chat-message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={!canSend}
            maxLength={2000}
            placeholder={canSend ? "Message staff..." : "No permission to send"}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition-colors duration-200 placeholder:text-zinc-400/70 focus-visible:border-sky-200/30 focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSend || !body.trim()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-sky-300/30 bg-sky-400/18 text-sky-50 shadow-[0_0_18px_rgba(14,165,233,.22),inset_0_1px_0_rgba(255,255,255,.09)] transition-colors duration-200 hover:bg-sky-400/30 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="Send staff chat message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-sky-300/30 bg-sky-400/22 text-sky-50 shadow-[0_0_24px_rgba(14,165,233,.24)] backdrop-blur-md transition-colors hover:bg-sky-400/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:hidden"
        aria-label="Open staff chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
      <div className="fixed inset-y-0 right-0 z-30 hidden w-[360px] lg:block">{content}</div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/55" aria-label="Close staff chat" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(92vw,380px)]">{content}</div>
        </div>
      ) : null}
    </>
  );
}

const ChatMessageBubble = memo(function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const role = Array.isArray(message.sender?.role) ? message.sender?.role[0] : message.sender?.role;
  const name = adminName(message.sender);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.052] p-3 shadow-[0_12px_28px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.075)] transition-colors duration-200 hover:border-sky-200/18 hover:bg-white/[0.075]" style={{ animation: "soft-pop .22s ease-out both" }}>
      <div className="flex items-start gap-3">
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-xs font-bold text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-zinc-950 bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.75)]" />
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-zinc-50">{name}{message.pending ? " sending..." : ""}</div>
          <div className="truncate text-xs font-medium" style={{ color: role?.color || "#a1a1aa" }}>
            {role?.label || "Admin"}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-zinc-200">{message.body}</p>
        </div>
        <time className="shrink-0 text-xs text-zinc-400/80">{formatTime(message.created_at)}</time>
      </div>
    </div>
  );
});
