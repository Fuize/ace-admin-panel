import type { AuditLogAction, Json } from "./types";

export type AuditLogDraft = {
  action: AuditLogAction;
  targetType?: string;
  targetId?: string;
  severity?: "debug" | "info" | "warning" | "danger";
  metadata?: Json;
};

export function createAuditLogDraft(input: AuditLogDraft): Required<AuditLogDraft> {
  return {
    action: input.action,
    targetType: input.targetType || "",
    targetId: input.targetId || "",
    severity: input.severity || "info",
    metadata: input.metadata ?? {},
  };
}
