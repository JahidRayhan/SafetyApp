import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";

export interface LivePosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface PushUpdateInput {
  location: LivePosition;
  durationMinutes: number;
  sessionId?: string;
  isFirstFix: boolean;
  incidentId?: string;
}

export interface PushUpdateResult {
  sessionId: string | null;
  expiresAt: Date | null;
}

export interface FenceBreachInput {
  zoneId: string;
  zoneName: string;
  location: LivePosition;
  sessionId: string | null;
  incidentId: string;
  distanceMeters: number;
}

export interface TrackedZone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}

export type SessionEndReason = "user" | "expired" | "incident";

export const liveLocationService = {
  /** Push a position to the edge function that fans out to contacts. */
  async pushUpdate(input: PushUpdateInput): Promise<PushUpdateResult> {
    const { data, error } = await supabase.functions.invoke("share-live-location", {
      body: {
        location: input.location,
        sharing_duration_minutes: input.durationMinutes,
        session_id: input.sessionId,
        is_update: !input.isFirstFix,
        incident_id: input.incidentId,
      },
    });
    if (error) throw new AppError(error.message, "LIVE_LOCATION_PUSH_FAILED", error);
    return {
      sessionId: data?.session_id ?? null,
      expiresAt: data?.expires_at ? new Date(data.expires_at) : null,
    };
  },

  async endSession(sessionId: string, reason: SessionEndReason): Promise<void> {
    const { error } = await supabase
      .from("live_location_sessions")
      .update({
        status: reason === "expired" ? "expired" : "stopped",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) throw new AppError(error.message, "LIVE_LOCATION_END_FAILED", error);
  },

  async notifyFenceBreach(input: FenceBreachInput): Promise<void> {
    const { error } = await supabase.functions.invoke("notify-fence-breach", {
      body: {
        zone_id: input.zoneId,
        zone_name: input.zoneName,
        zone_type: "safe",
        location: input.location,
        session_id: input.sessionId,
        incident_id: input.incidentId,
        distance_meters: input.distanceMeters,
      },
    });
    if (error) throw new AppError(error.message, "FENCE_BREACH_NOTIFY_FAILED", error);
  },

  /** Active safe zones used for on-device geofence evaluation. */
  async listTrackedSafeZones(): Promise<TrackedZone[]> {
    const { data, error } = await supabase
      .from("safe_zones")
      .select("id, name, center_lat, center_lng, radius_meters")
      .eq("is_active", true)
      .eq("zone_type", "safe");
    if (error) throw new AppError(error.message, "SAFE_ZONE_READ_FAILED", error);
    return (data ?? []).map((z) => ({
      id: z.id,
      name: z.name,
      centerLat: Number(z.center_lat),
      centerLng: Number(z.center_lng),
      radiusMeters: Number(z.radius_meters),
    }));
  },

  /** Realtime subscription to safe-zone changes. Returns an unsubscribe fn. */
  subscribeToSafeZones(onChange: () => void): () => void {
    const channel = supabase
      .channel("safe_zones-live-sharing")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "safe_zones" },
        () => onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  async appendHistory(position: LivePosition): Promise<void> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("location_history").insert({
      user_id: data.user.id,
      lat: position.lat,
      lng: position.lng,
      accuracy: position.accuracy,
    });
  },
};
