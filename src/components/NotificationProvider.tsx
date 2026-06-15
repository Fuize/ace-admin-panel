"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  title: string;
  body?: string;
};

type NotificationContextValue = {
  notify: (toast: Omit<Toast, "id">) => void;
};

const NotificationContext = createContext<NotificationContextValue>({ notify: () => undefined });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(toast.title, { body: toast.body });
    }
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[60] grid gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="glass-panel relative max-w-xs overflow-hidden rounded-2xl p-3 pl-4" style={{ animation: "soft-pop .22s ease-out both" }}>
            <div className="absolute inset-y-3 left-2 w-px rounded-full bg-sky-200 shadow-[0_0_12px_rgba(125,211,252,.8)]" />
            <div className="text-sm font-semibold text-zinc-50">{toast.title}</div>
            {toast.body ? <div className="mt-1 text-xs leading-5 text-zinc-300/80">{toast.body}</div> : null}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifier() {
  return useContext(NotificationContext);
}
