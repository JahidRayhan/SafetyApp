import { supabase } from "@/core/database/client";
import type { Tables } from "@/core/database/schema";
import { DomainError } from "@/shared/errors";
import {
  asIso,
  asLat,
  asLng,
  asMeters,
  asUuid,
} from "@/shared/types";
import {
  ThreatLevel,
  canTransitionIncident,
  type EmergencyAlert,
  type EmergencyIncidentStatus,
} from "../domain/types";

type IncidentRow = Tables<"emergency_incidents">;

const toDomain = (row: IncidentRow): EmergencyAlert => ({
  id: asUuid(row.id),
  userId: asUuid(row.user_id),
  status: row.status as EmergencyIncidentStatus,
  // Threat level is not yet persisted; default to High for active incidents.
  threatLevel:
    row.status === "active" ? ThreatLevel.High : ThreatLevel.Calm,
  triggeredAt: asIso(row.triggered_at),
  resolvedAt: row.resolved_at ? asIso(row.resolved_at) : null,
  location:
    row.location_lat != null && row.location_lng != null
      ? {
          lat: asLat(Number(row.location_lat)),
          lng: asLng(Number(row.location_lng)),
          accuracy:
            row.location_accuracy != null
              ? asMeters(Number(row.location_accuracy))
              : undefined,
        }
      : null,
  notes: row.notes,
});

export const sosService = {
  toDomain,

  async createIncident(): Promise<EmergencyAlert> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("emergency_incidents")
      .insert({ user_id: auth.user.id, status: "active" })
      .select()
      .single();
    if (error) throw error;
    return toDomain(data);
  },

  async updateIncidentLocation(
    id: string,
    coords: { lat: number; lng: number; accuracy?: number },
  ): Promise<void> {
    const { error } = await supabase
      .from("emergency_incidents")
      .update({
        location_lat: coords.lat,
        location_lng: coords.lng,
        location_accuracy: coords.accuracy ?? null,
      })
      .eq("id", id);
    if (error) throw error;
  },

  async transition(
    incident: EmergencyAlert,
    next: EmergencyIncidentStatus,
  ): Promise<EmergencyAlert> {
    if (!canTransitionIncident(incident.status, next)) {
      throw new DomainError(
        `Illegal incident transition: ${incident.status} → ${next}`,
        "SOS_ILLEGAL_TRANSITION",
      );
    }
    const resolvedAt = next === "resolved" ? new Date().toISOString() : null;
    const { data, error } = await supabase
      .from("emergency_incidents")
      .update({ status: next, resolved_at: resolvedAt })
      .eq("id", incident.id)
      .select()
      .single();
    if (error) throw error;
    return toDomain(data);
  },

  async resolve(incident: EmergencyAlert): Promise<EmergencyAlert> {
    return sosService.transition(incident, "resolved");
  },
};
