import { create } from "zustand";
import { ThreatLevel, type EmergencyAlert } from "@/features/sos/domain/types";

/**
 * Client-side SOS state. Server-of-record remains Supabase, fetched
 * via React Query / services. This store only tracks transient UI:
 * countdown, the locally-tracked active incident, and the assessed
 * threat level for cross-component access (banners, navigation tint).
 */
interface SosState {
  activeIncident: EmergencyAlert | null;
  threatLevel: ThreatLevel;
  countdownSeconds: number | null;

  setActiveIncident: (incident: EmergencyAlert | null) => void;
  setThreatLevel: (level: ThreatLevel) => void;
  startCountdown: (seconds: number) => void;
  tickCountdown: () => void;
  cancelCountdown: () => void;
  reset: () => void;
}

export const useSosStore = create<SosState>((set) => ({
  activeIncident: null,
  threatLevel: ThreatLevel.Calm,
  countdownSeconds: null,

  setActiveIncident: (incident) =>
    set({
      activeIncident: incident,
      threatLevel: incident ? ThreatLevel.High : ThreatLevel.Calm,
    }),
  setThreatLevel: (level) => set({ threatLevel: level }),
  startCountdown: (seconds) => set({ countdownSeconds: seconds }),
  tickCountdown: () =>
    set((s) =>
      s.countdownSeconds == null
        ? s
        : { countdownSeconds: Math.max(0, s.countdownSeconds - 1) },
    ),
  cancelCountdown: () => set({ countdownSeconds: null }),
  reset: () =>
    set({
      activeIncident: null,
      threatLevel: ThreatLevel.Calm,
      countdownSeconds: null,
    }),
}));
