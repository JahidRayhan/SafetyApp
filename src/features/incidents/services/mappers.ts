import type { Tables, TablesInsert } from "@/core/database/schema";
import { asIso, asLat, asLng, asUuid } from "@/shared/types";
import type { IncidentRecord, IncidentSeverity, IncidentStatus } from "../domain/types";
import type { IncidentReportDraft } from "../domain/draft";

type Row = Tables<"incident_reports">;
type Insert = TablesInsert<"incident_reports">;

export const toDomain = (row: Row): IncidentRecord => ({
  id: asUuid(row.id),
  userId: row.user_id ? asUuid(row.user_id) : null,
  title: row.title,
  description: row.description ?? null,
  incidentType: row.incident_type,
  severity: (row.severity_level ?? 1) as IncidentSeverity,
  status: (row.status ?? "submitted") as IncidentStatus,
  isAnonymous: row.is_anonymous ?? false,
  location:
    row.location_lat != null && row.location_lng != null
      ? { lat: asLat(row.location_lat), lng: asLng(row.location_lng) }
      : null,
  locationDescription: row.location_description ?? null,
  tags: row.tags ?? [],
  mediaFiles: (row.media_files as unknown[]) ?? [],
  reportedAt: asIso(row.reported_at ?? new Date().toISOString()),
  reviewedAt: row.reviewed_at ? asIso(row.reviewed_at) : null,
  reviewedBy: row.reviewed_by ? asUuid(row.reviewed_by) : null,
});

export const toInsert = (
  draft: IncidentReportDraft,
  userId: string | null,
): Insert => ({
  title: draft.title,
  incident_type: draft.incidentType,
  description: draft.description,
  location_lat: draft.locationLat,
  location_lng: draft.locationLng,
  location_description: draft.locationDescription,
  is_anonymous: draft.isAnonymous,
  severity_level: draft.severityLevel,
  tags: draft.tags,
  media_files: draft.mediaFiles,
  user_id: draft.isAnonymous ? null : userId,
});
