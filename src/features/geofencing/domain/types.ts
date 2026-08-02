import type { GeoPoint, IsoTimestamp, Meters, Uuid } from "@/shared/types";

export type SafeZoneType = "safe" | "unsafe" | "under_investigation";

export const SAFE_ZONE_TYPES: readonly SafeZoneType[] = [
  "safe",
  "unsafe",
  "under_investigation",
] as const;

export interface SafeZone {
  id: Uuid;
  name: string;
  description: string | null;
  zoneType: SafeZoneType;
  center: GeoPoint;
  radius: Meters;
  isActive: boolean;
  createdBy: Uuid | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/**
 * DTO for creating a new zone — DB defaults handle the rest.
 */
export interface SafeZoneDraft {
  name: string;
  description: string | null;
  zoneType: SafeZoneType;
  center: GeoPoint;
  radius: Meters;
}

/**
 * Discriminated union for zone-proximity events the location store emits.
 */
export type ZoneProximityEvent =
  | { kind: "entered"; zone: SafeZone; distance: Meters }
  | { kind: "exited"; zone: SafeZone; distance: Meters };
