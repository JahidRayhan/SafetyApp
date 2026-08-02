import { supabase } from "@/core/database/client";
import type { Tables, TablesUpdate } from "@/core/database/schema";
import { AppError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { AccountRole, ProfileEdit, UserProfile } from "../domain/types";

type ProfileRow = Tables<"profiles">;

const toDomain = (row: ProfileRow): UserProfile => ({
  id: asUuid(row.id),
  fullName: row.full_name,
  phoneNumber: row.phone_number,
  emergencyPlan: row.emergency_plan,
  role: (row.role ?? "user") as AccountRole,
  locationPermissionsGranted: row.location_permissions_granted ?? false,
  sosGestureEnabled: row.sos_gesture_enabled ?? false,
  voiceMonitoringEnabled: row.voice_monitoring_enabled ?? false,
  createdAt: asIso(row.created_at),
  updatedAt: asIso(row.updated_at),
});

const toUpdate = (edit: ProfileEdit): TablesUpdate<"profiles"> => {
  const patch: TablesUpdate<"profiles"> = {
    updated_at: new Date().toISOString(),
  };
  if (edit.fullName !== undefined) patch.full_name = edit.fullName;
  if (edit.phoneNumber !== undefined) patch.phone_number = edit.phoneNumber;
  if (edit.emergencyPlan !== undefined) patch.emergency_plan = edit.emergencyPlan;
  if (edit.locationPermissionsGranted !== undefined)
    patch.location_permissions_granted = edit.locationPermissionsGranted;
  if (edit.sosGestureEnabled !== undefined)
    patch.sos_gesture_enabled = edit.sosGestureEnabled;
  if (edit.voiceMonitoringEnabled !== undefined)
    patch.voice_monitoring_enabled = edit.voiceMonitoringEnabled;
  return patch;
};

export const profileService = {
  toDomain,

  /** Returns null when no profile row exists yet. */
  async find(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new AppError(error.message, "PROFILE_READ_FAILED", error);
    return data ? toDomain(data) : null;
  },

  /**
   * Create the profile row for a freshly-registered user.
   * Role is always `user`; elevation happens only through the
   * server-side approval workflow.
   */
  async createDefault(input: {
    userId: string;
    fullName?: string | null;
    phoneNumber?: string | null;
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: input.userId,
        full_name: input.fullName ?? null,
        phone_number: input.phoneNumber ?? null,
        role: "user",
      })
      .select()
      .single();
    if (error) throw new AppError(error.message, "PROFILE_CREATE_FAILED", error);
    return toDomain(data);
  },

  async update(userId: string, edit: ProfileEdit): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(toUpdate(edit))
      .eq("id", userId)
      .select()
      .single();
    if (error) throw new AppError(error.message, "PROFILE_UPDATE_FAILED", error);
    return toDomain(data);
  },

  /** Read-or-create — used on first sign-in. */
  async ensure(input: {
    userId: string;
    fullName?: string | null;
    phoneNumber?: string | null;
  }): Promise<UserProfile> {
    const existing = await profileService.find(input.userId);
    return existing ?? profileService.createDefault(input);
  },

  /** Counts of the user's own records across data-bearing tables, for privacy/export UIs. */
  async getDataStats(userId: string): Promise<{
    emergencyContacts: number;
    locationRecords: number;
    recordings: number;
    activityLogs: number;
  }> {
    const [contacts, locations, recordings, activity] = await Promise.all([
      supabase
        .from("emergency_contacts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("location_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("recordings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    return {
      emergencyContacts: contacts.count ?? 0,
      locationRecords: locations.count ?? 0,
      recordings: recordings.count ?? 0,
      activityLogs: activity.count ?? 0,
    };
  },

  /**
   * Requests a full data export via the `export-user-data` edge function.
   * Returns whether the server-side export succeeded so the caller can
   * fall back to a locally-generated summary when it did not.
   */
  async requestDataExport(userId: string): Promise<{ ok: boolean }> {
    const { error } = await supabase.functions.invoke("export-user-data", {
      body: { user_id: userId },
    });
    return { ok: !error };
  },
};
