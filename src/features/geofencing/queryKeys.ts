/**
 * Centralised React Query keys for the geofencing feature.
 */
export const geofencingQueryKeys = {
  all: ["geofencing"] as const,
  activeZones: () => [...geofencingQueryKeys.all, "zones", "active"] as const,
  zone: (id: string) => [...geofencingQueryKeys.all, "zone", id] as const,
};
