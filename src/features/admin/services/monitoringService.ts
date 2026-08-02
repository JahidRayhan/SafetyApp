import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { ActivityLogEntry } from "../domain/types";

interface ActivityLogRow {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: unknown;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

interface ProfileLite {
  id: string;
  full_name: string;
  role: string;
}

export const monitoringService = {
  async listActivityLogs(limit = 100): Promise<ActivityLogEntry[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select(
        `
        id,
        user_id,
        action_type,
        description,
        metadata,
        ip_address,
        user_agent,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new AppError(error.message, "ACTIVITY_LOGS_FETCH_FAILED", error);

    const rows = (data as ActivityLogRow[]) ?? [];
    const userIds = [...new Set(rows.map((log) => log.user_id))];

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);

    if (profilesError)
      throw new AppError(profilesError.message, "ACTIVITY_LOG_PROFILES_FETCH_FAILED", profilesError);

    const profileMap = ((profiles as ProfileLite[]) ?? []).reduce<Record<string, ProfileLite>>(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {}
    );

    return rows.map((row) => {
      const profile = profileMap[row.user_id];
      return {
        id: asUuid(row.id),
        userId: asUuid(row.user_id),
        actionType: row.action_type,
        description: row.description,
        metadata: (row.metadata as Record<string, unknown> | null) ?? null,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: asIso(row.created_at),
        userProfile: profile
          ? { fullName: profile.full_name, role: profile.role }
          : { fullName: "Unknown User", role: "unknown" },
      };
    });
  },
};
