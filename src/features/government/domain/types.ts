import type { IsoTimestamp, Uuid } from "@/shared/types";

export type ZoneRequestStatus = "pending" | "approved" | "rejected";

export interface ZoneRequest {
  id: string;
  location: string;
  reason: string;
  zoneType: string;
  urgency: string;
  centerLat: string;
  centerLng: string;
  radiusMeters: string;
  requestedBy: string;
  requestedAt: string;
  status: ZoneRequestStatus;
}

export interface DataAccessRequest {
  id: string;
  title: string;
  description: string;
  urgency: string;
  dataType: string;
  timeframe: string;
  requestedBy: string;
  requestedAt: string;
  status: ZoneRequestStatus;
}

export interface CreateSafeZoneInput {
  name: string;
  description: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  zoneType: string;
  createdBy: Uuid;
}
