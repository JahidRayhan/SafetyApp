import { supabase } from "@/core/database/client";
import type { Tables } from "@/core/database/schema";
import { AppError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { ActivityDraft, ActivityEvent, ActivityKind } from "../domain/types";
import { ACTIVITY_KINDS } from "../domain/types";

type ActivityRow = Tables<"activity_logs">;

const toKind = (raw: string): ActivityKind =>
  (ACTIVITY_KINDS as readonly string[]).includes(raw)
    ? (raw as ActivityKind)
    : "other";

const toDomain = (row: ActivityRow): ActivityEvent => ({
  id: asUuid(row.id),
  userId: asUuid(row.user_id),
  kind: toKind(row.action_type),
  description: row.description,
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
  occurredAt: asIso(row.created_at),
});

export interface ActivityQuery {
  userId: string;
  kind?: ActivityKind | "all";
  limit?: number;
}

export const activityService = {
  toDomain,

  async list({ userId, kind = "all", limit = 100 }: ActivityQuery): Promise<ActivityEvent[]> {
    let query = supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (kind !== "all") query = query.eq("action_type", kind);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, "ACTIVITY_READ_FAILED", error);
    return (data ?? []).map(toDomain);
  },

  /**
   * Fire-and-forget audit write. Logging must never break a user flow,
   * so failures are swallowed after being reported to the console.
   */
  async record(userId: string, draft: ActivityDraft): Promise<void> {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action_type: draft.kind,
      description: draft.description,
      metadata: (draft.metadata ?? null) as never,
    });
    if (error) console.error("Failed to record activity:", error.message);
  },
};
