import { supabase } from "@/core/database/client";
import { AppError, DomainError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { SosAlertDelivery, SosDeliveryStatus, SosIncidentSummary } from "../domain/types";

interface DeliveryRow {
  id: string;
  incident_id: string;
  user_id: string;
  contact_id: string | null;
  channel: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  delivery_status: SosDeliveryStatus;
  provider_message_id: string | null;
  error_message: string | null;
  resent_from_delivery_id: string | null;
  attempt_number: number;
  attempted_at: string;
}

interface IncidentRow {
  id: string;
  user_id: string;
  triggered_at: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  location_accuracy?: number | null;
}

interface ProfileLite {
  id: string;
  full_name: string;
}

const toDelivery = (row: DeliveryRow): SosAlertDelivery => ({
  id: asUuid(row.id),
  incidentId: asUuid(row.incident_id),
  userId: asUuid(row.user_id),
  contactId: row.contact_id ? asUuid(row.contact_id) : null,
  channel: row.channel,
  recipientEmail: row.recipient_email,
  recipientPhone: row.recipient_phone,
  deliveryStatus: row.delivery_status,
  providerMessageId: row.provider_message_id,
  errorMessage: row.error_message,
  resentFromDeliveryId: row.resent_from_delivery_id ? asUuid(row.resent_from_delivery_id) : null,
  attemptNumber: row.attempt_number,
  attemptedAt: asIso(row.attempted_at),
});

export const sosAlertService = {
  async listIncidentSummaries(limit = 150): Promise<SosIncidentSummary[]> {
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("sos_alert_deliveries")
      .select("*")
      .order("attempted_at", { ascending: false })
      .limit(limit);

    if (deliveriesError)
      throw new AppError(deliveriesError.message, "SOS_DELIVERIES_FETCH_FAILED", deliveriesError);

    const rows = (deliveries as DeliveryRow[]) ?? [];
    if (rows.length === 0) return [];

    const incidentIds = [...new Set(rows.map((row) => row.incident_id))];
    const userIds = [...new Set(rows.map((row) => row.user_id))];

    const [{ data: incidentRows, error: incidentError }, { data: profileRows, error: profileError }] =
      await Promise.all([
        supabase
          .from("emergency_incidents")
          .select("id, user_id, triggered_at, status, location_lat, location_lng")
          .in("id", incidentIds),
        supabase.from("profiles").select("id, full_name").in("id", userIds),
      ]);

    if (incidentError) throw new AppError(incidentError.message, "SOS_INCIDENTS_FETCH_FAILED", incidentError);
    if (profileError) throw new AppError(profileError.message, "SOS_PROFILES_FETCH_FAILED", profileError);

    const incidentMap = new Map(((incidentRows as IncidentRow[]) ?? []).map((incident) => [incident.id, incident]));
    const profileMap = new Map(((profileRows as ProfileLite[]) ?? []).map((profile) => [profile.id, profile]));

    const grouped = rows.reduce<Record<string, DeliveryRow[]>>((acc, row) => {
      acc[row.incident_id] = [...(acc[row.incident_id] || []), row];
      return acc;
    }, {});

    const summaries = Object.entries(grouped)
      .map(([incidentId, incidentDeliveries]) => {
        const incident = incidentMap.get(incidentId);
        if (!incident) return null;

        const sortedDeliveries = [...incidentDeliveries]
          .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime())
          .map(toDelivery);

        const summary: SosIncidentSummary = {
          incidentId: asUuid(incidentId),
          userId: asUuid(incident.user_id),
          triggeredAt: asIso(incident.triggered_at),
          status: incident.status,
          locationLat: incident.location_lat,
          locationLng: incident.location_lng,
          userName: profileMap.get(incident.user_id)?.full_name || "Unknown user",
          totalAttempts: sortedDeliveries.length,
          sentCount: sortedDeliveries.filter((item) => item.deliveryStatus === "sent").length,
          failedCount: sortedDeliveries.filter((item) => item.deliveryStatus === "failed").length,
          latestAttemptAt: sortedDeliveries[0]?.attemptedAt || asIso(incident.triggered_at),
          deliveries: sortedDeliveries,
        };
        return summary;
      })
      .filter((item): item is SosIncidentSummary => Boolean(item))
      .sort((a, b) => new Date(b.latestAttemptAt).getTime() - new Date(a.latestAttemptAt).getTime());

    return summaries;
  },

  async resend(delivery: SosAlertDelivery): Promise<{ message?: string }> {
    if (delivery.deliveryStatus !== "failed") {
      throw new DomainError(
        "Only failed deliveries can be resent",
        "INVALID_DELIVERY_TRANSITION"
      );
    }

    const { data: incident, error: incidentError } = await supabase
      .from("emergency_incidents")
      .select("location_lat, location_lng, location_accuracy")
      .eq("id", delivery.incidentId)
      .single();

    if (incidentError) throw new AppError(incidentError.message, "SOS_INCIDENT_FETCH_FAILED", incidentError);

    const location =
      incident.location_lat && incident.location_lng
        ? {
            lat: Number(incident.location_lat),
            lng: Number(incident.location_lng),
            accuracy: incident.location_accuracy ? Number(incident.location_accuracy) : undefined,
          }
        : undefined;

    const { data: response, error } = await supabase.functions.invoke("send-emergency-alerts", {
      body: {
        incident_id: delivery.incidentId,
        user_id: delivery.userId,
        location,
        message_type: delivery.channel,
        retry_delivery_id: delivery.id,
        target_contacts: [
          {
            id: delivery.contactId,
            name: "Emergency contact",
            email: delivery.recipientEmail,
            phone: delivery.recipientPhone,
            previous_attempt_number: delivery.attemptNumber,
          },
        ],
      },
    });

    if (error) throw new AppError(error.message, "SOS_RESEND_FAILED", error);
    return response ?? {};
  },
};
