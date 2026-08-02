import type { IsoTimestamp, Uuid } from "@/shared/types";

/**
 * Coarse categories used for filtering and colour-coding the activity feed.
 * `other` is the fallback for legacy rows written before this union existed.
 */
export type ActivityKind =
  | "emergency"
  | "safety"
  | "location_sharing"
  | "recording"
  | "evidence"
  | "evidence_upload"
  | "location"
  | "notification"
  | "admin"
  | "chat"
  | "system"
  | "other";

export const ACTIVITY_KINDS: readonly ActivityKind[] = [
  "emergency",
  "safety",
  "location_sharing",
  "recording",
  "evidence",
  "evidence_upload",
  "location",
  "notification",
  "admin",
  "chat",
  "system",
] as const;

export interface ActivityEvent {
  id: Uuid;
  userId: Uuid;
  kind: ActivityKind;
  description: string;
  metadata: Record<string, unknown> | null;
  occurredAt: IsoTimestamp;
}

export interface ActivityDraft {
  kind: ActivityKind;
  description: string;
  metadata?: Record<string, unknown>;
}
