import { create } from "zustand";
import type {
  SafeZone,
  ZoneProximityEvent,
} from "@/features/geofencing/domain/types";
import { safeZoneService } from "@/features/geofencing/services/safeZoneService";
import type { GeoPoint, Uuid } from "@/shared/types";

export interface ActiveZoneAlert {
  zoneId: Uuid;
  zoneName: string;
  zoneType: string;
  distanceMeters: number;
  message: string;
  enteredAt: number;
}

/**
 * Geofencing client state.
 *
 * Server-of-record stays in Supabase; React Query owns fetching. This store
 * caches the active zone set, tracks which zones the user currently occupies,
 * and exposes the latest evaluation events so React just renders.
 */
interface GeofencingState {
  zones: SafeZone[];
  occupiedZoneIds: Set<Uuid>;
  lastEvaluatedAt: number | null;
  lastPosition: GeoPoint | null;
  activeAlerts: ActiveZoneAlert[];
  lastEvents: ZoneProximityEvent[];

  setZones: (zones: SafeZone[]) => void;
  /**
   * Run a pure evaluation against the cached zones. Returns the events
   * fired so the caller can toast / log without re-deriving them.
   */
  evaluate: (position: GeoPoint) => ZoneProximityEvent[];
  clearAlerts: () => void;
  reset: () => void;
}

const buildAlert = (
  ev: Extract<ZoneProximityEvent, { kind: "entered" }>,
): ActiveZoneAlert => ({
  zoneId: ev.zone.id,
  zoneName: ev.zone.name,
  zoneType: ev.zone.zoneType,
  distanceMeters: Math.round(ev.distance),
  message:
    ev.zone.zoneType === "unsafe"
      ? "Warning: You are entering a high-risk area. Please stay alert."
      : ev.zone.zoneType === "safe"
        ? "You have entered a designated safe zone."
        : `Location alert for: ${ev.zone.name}`,
  enteredAt: Date.now(),
});

export const useGeofencingStore = create<GeofencingState>((set, get) => ({
  zones: [],
  occupiedZoneIds: new Set(),
  lastEvaluatedAt: null,
  lastPosition: null,
  activeAlerts: [],
  lastEvents: [],

  setZones: (zones) => set({ zones }),

  evaluate: (position) => {
    const { zones, occupiedZoneIds, activeAlerts } = get();
    const { events, nextOccupied } = safeZoneService.evaluatePosition(
      zones,
      occupiedZoneIds,
      position,
    );

    let alerts = activeAlerts;
    if (events.length > 0) {
      const exited = new Set(
        events.filter((e) => e.kind === "exited").map((e) => e.zone.id),
      );
      const entered = events.filter((e) => e.kind === "entered");
      alerts = [
        ...activeAlerts.filter((a) => !exited.has(a.zoneId)),
        ...entered.map((e) =>
          buildAlert(e as Extract<ZoneProximityEvent, { kind: "entered" }>),
        ),
      ];
    }

    set({
      occupiedZoneIds: nextOccupied as Set<Uuid>,
      lastEvaluatedAt: Date.now(),
      lastPosition: position,
      lastEvents: events,
      activeAlerts: alerts,
    });
    return events;
  },

  clearAlerts: () => set({ activeAlerts: [] }),

  reset: () =>
    set({
      zones: [],
      occupiedZoneIds: new Set(),
      lastEvaluatedAt: null,
      lastPosition: null,
      activeAlerts: [],
      lastEvents: [],
    }),
}));
