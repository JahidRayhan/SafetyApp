import type { GeoPoint, IsoTimestamp, Uuid } from "@/shared/types";

export type TrackingSessionStatus = "active" | "paused" | "ended" | "expired";

/**
 * A live-location sharing session. Maps to `live_location_sessions`.
 */
export interface TrackingSession {
  id: Uuid;
  userId: Uuid;
  incidentId: Uuid | null;
  status: TrackingSessionStatus;
  startedAt: IsoTimestamp;
  expiresAt: IsoTimestamp;
  endedAt: IsoTimestamp | null;
  lastPosition: GeoPoint | null;
  lastUpdatedAt: IsoTimestamp | null;
  updatesSent: number;
  contactsNotified: number;
}

export const isSessionLive = (s: TrackingSession): boolean =>
  s.status === "active" &&
  new Date(s.expiresAt).getTime() > Date.now();
