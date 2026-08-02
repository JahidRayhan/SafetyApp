import { supabase } from "@/core/database/client";
import type { Tables, TablesInsert } from "@/core/database/schema";
import {
  asIso,
  asLat,
  asLng,
  asMeters,
  asUuid,
  type GeoPoint,
} from "@/shared/types";
import type {
  SafeZone,
  SafeZoneDraft,
  SafeZoneType,
  ZoneProximityEvent,
} from "../domain/types";

type SafeZoneRow = Tables<"safe_zones">;

/**
 * Map a raw `safe_zones` row to the domain `SafeZone`.
 * The DB returns numerics as strings or numbers depending on driver
 * configuration; we coerce defensively.
 */
const toDomain = (row: SafeZoneRow): SafeZone => ({
  id: asUuid(row.id),
  name: row.name,
  description: row.description,
  zoneType: (row.zone_type ?? "safe") as SafeZoneType,
  center: {
    lat: asLat(Number(row.center_lat)),
    lng: asLng(Number(row.center_lng)),
  },
  radius: asMeters(row.radius_meters),
  isActive: row.is_active ?? true,
  createdBy: row.created_by ? asUuid(row.created_by) : null,
  createdAt: asIso(row.created_at ?? new Date(0).toISOString()),
  updatedAt: asIso(row.updated_at ?? new Date(0).toISOString()),
});

const toInsert = (
  draft: SafeZoneDraft,
  createdBy: string,
): TablesInsert<"safe_zones"> => ({
  name: draft.name,
  description: draft.description,
  zone_type: draft.zoneType,
  center_lat: draft.center.lat,
  center_lng: draft.center.lng,
  radius_meters: draft.radius,
  created_by: createdBy,
});

export const safeZoneService = {
  toDomain,

  async listActive(): Promise<SafeZone[]> {
    const { data, error } = await supabase
      .from("safe_zones")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toDomain);
  },

  async create(draft: SafeZoneDraft): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("safe_zones")
      .insert(toInsert(draft, auth.user.id));
    if (error) throw error;
  },

  /** Realtime subscription to zone changes. Returns an unsubscribe fn. */
  subscribe(channelName: string, onChange: () => void): () => void {
    const channel = supabase
      .channel(channelName)
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

  /** Haversine distance in meters between two GeoPoints. */
  distance(a: GeoPoint, b: GeoPoint): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) *
        Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  },

  /**
   * Pure evaluator: given the active zone set, the user's last-known
   * occupied-zone IDs, and a new position, return the enter/exit
   * events plus the new occupied set. No I/O — store/hook owns state.
   */
  evaluatePosition(
    zones: readonly SafeZone[],
    occupied: ReadonlySet<string>,
    position: GeoPoint,
  ): { events: ZoneProximityEvent[]; nextOccupied: Set<string> } {
    const next = new Set<string>();
    const events: ZoneProximityEvent[] = [];
    for (const zone of zones) {
      const dist = safeZoneService.distance(position, zone.center);
      const inside = dist <= zone.radius;
      if (inside) next.add(zone.id);
      const wasInside = occupied.has(zone.id);
      if (inside && !wasInside) {
        events.push({ kind: "entered", zone, distance: asMeters(dist) });
      } else if (!inside && wasInside) {
        events.push({ kind: "exited", zone, distance: asMeters(dist) });
      }
    }
    return { events, nextOccupied: next };
  },
};
