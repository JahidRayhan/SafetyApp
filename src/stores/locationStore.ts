import { create } from "zustand";
import type { GeoPoint } from "@/shared/types";

/**
 * Live device-location cache, plus tracking-status flag. Read by
 * geofencing, SOS, and live-sharing flows so they share one watcher.
 */
interface LocationState {
  current: GeoPoint | null;
  isTracking: boolean;
  lastUpdatedAt: number | null;

  setPosition: (p: GeoPoint) => void;
  setTracking: (tracking: boolean) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  current: null,
  isTracking: false,
  lastUpdatedAt: null,

  setPosition: (p) => set({ current: p, lastUpdatedAt: Date.now() }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  reset: () => set({ current: null, isTracking: false, lastUpdatedAt: null }),
}));
