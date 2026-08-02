import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";

export interface RecordedPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

/** Position history persistence, isolated from the geolocation plumbing. */
export const locationHistoryService = {
  async append(position: RecordedPosition): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("location_history").insert({
      user_id: auth.user.id,
      lat: position.lat,
      lng: position.lng,
      accuracy: position.accuracy,
    });
    if (error) throw new AppError(error.message, "LOCATION_HISTORY_FAILED", error);
  },
};
