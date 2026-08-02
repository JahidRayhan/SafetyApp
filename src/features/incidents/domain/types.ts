import type { GeoPoint, IsoTimestamp, Uuid } from "@/shared/types";

export type IncidentStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "resolved";

export type IncidentSeverity = 1 | 2 | 3 | 4 | 5;

export interface IncidentRecord {
  id: Uuid;
  userId: Uuid | null;
  title: string;
  description: string | null;
  incidentType: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  isAnonymous: boolean;
  location: GeoPoint | null;
  locationDescription: string | null;
  tags: string[];
  mediaFiles: unknown[];
  reportedAt: IsoTimestamp;
  reviewedAt: IsoTimestamp | null;
  reviewedBy: Uuid | null;
}
