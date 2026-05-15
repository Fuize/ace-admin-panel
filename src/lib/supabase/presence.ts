export type AdminPresenceStatus = "online" | "idle" | "offline";

export type PresenceState = {
  adminId: string;
  sessionId: string;
  status: AdminPresenceStatus;
  currentPage?: string;
  lastHeartbeat: string;
};

export function isRecentlyActive(lastHeartbeat: string, now = Date.now(), timeoutMs = 90_000) {
  return now - new Date(lastHeartbeat).getTime() <= timeoutMs;
}

export function createPresencePayload(input: Omit<PresenceState, "lastHeartbeat">): PresenceState {
  return {
    ...input,
    lastHeartbeat: new Date().toISOString(),
  };
}
