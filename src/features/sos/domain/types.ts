import type { GeoPoint, IsoTimestamp, Uuid } from "@/shared/types";

/**
 * Severity classification for SOS / threat assessment.
 * Ordered enum: higher value === higher urgency.
 */
export enum ThreatLevel {
  Calm = 0,
  Elevated = 1,
  High = 2,
  Critical = 3,
}

export type EmergencyIncidentStatus = "active" | "resolved" | "cancelled";

/**
 * Allowed status transitions for an emergency incident.
 * Used by the SOS service to reject illegal state changes
 * (e.g. cannot reopen a resolved incident).
 */
export const EMERGENCY_INCIDENT_TRANSITIONS: Record<
  EmergencyIncidentStatus,
  readonly EmergencyIncidentStatus[]
> = {
  active: ["resolved", "cancelled"],
  resolved: [],
  cancelled: [],
};

export const canTransitionIncident = (
  from: EmergencyIncidentStatus,
  to: EmergencyIncidentStatus,
): boolean => EMERGENCY_INCIDENT_TRANSITIONS[from].includes(to);

/**
 * Domain representation of an emergency alert.
 * Distinct from the raw `emergency_incidents` row — the DB layer
 * uses snake_case, optional fields and `string | number` numerics.
 * Mappers in `features/sos/services/sosService.ts` convert between them.
 */
export interface EmergencyAlert {
  id: Uuid;
  userId: Uuid;
  status: EmergencyIncidentStatus;
  threatLevel: ThreatLevel;
  triggeredAt: IsoTimestamp;
  resolvedAt: IsoTimestamp | null;
  location: GeoPoint | null;
  notes: string | null;
}
