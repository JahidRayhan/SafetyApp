/**
 * Centralised React Query keys for the SOS feature.
 * One source of truth so invalidation is type-safe.
 */
export const sosQueryKeys = {
  all: ["sos"] as const,
  incident: (id: string) => [...sosQueryKeys.all, "incident", id] as const,
  activeIncident: () => [...sosQueryKeys.all, "active"] as const,
};
