import { supabase } from "@/core/database/client";
import type { IncidentReportDraft } from "../domain/draft";
import type { IncidentRecord } from "../domain/types";
import { IncidentServiceError } from "./errors";
import { toDomain, toInsert } from "./mappers";

export const incidentService = {
  async list(filter?: string): Promise<IncidentRecord[]> {
    let query = supabase
      .from("incident_reports")
      .select("*")
      .order("reported_at", { ascending: false });

    if (filter && filter !== "all") {
      query = query.eq("incident_type", filter);
    }

    const { data, error } = await query;
    if (error)
      throw new IncidentServiceError(error.message, "INCIDENTS_LIST_FAILED", error);
    return (data ?? []).map(toDomain);
  },

  async create(draft: IncidentReportDraft): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id ?? null;

    const { error } = await supabase
      .from("incident_reports")
      .insert(toInsert(draft, userId));

    if (error)
      throw new IncidentServiceError(
        error.message,
        "INCIDENTS_CREATE_FAILED",
        error,
      );
  },
};
