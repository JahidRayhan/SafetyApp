import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";

export interface AlertDispatchInput {
  incidentId: string;
  userId: string;
  location?: { lat: number; lng: number; accuracy?: number };
}

export interface AlertDispatchResult {
  emailsSent: number;
  contactsNotified: number;
  totalContacts: number;
}

/**
 * Fan-out of emergency alerts. The edge function owns delivery + logging;
 * this service only normalises the request/response shape.
 */
export const alertService = {
  async dispatch(input: AlertDispatchInput): Promise<AlertDispatchResult> {
    const { data, error } = await supabase.functions.invoke("send-emergency-alerts", {
      body: {
        incident_id: input.incidentId,
        user_id: input.userId,
        location: input.location,
        message_type: "both",
      },
    });
    if (error) throw new AppError(error.message, "ALERT_DISPATCH_FAILED", error);
    return {
      emailsSent: data?.emails_sent ?? 0,
      contactsNotified: data?.contacts_notified ?? 0,
      totalContacts: data?.total_contacts ?? 0,
    };
  },
};
