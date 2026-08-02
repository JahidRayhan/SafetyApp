export interface IncidentReportDraft {
  title: string;
  incidentType: string;
  description: string;
  locationLat: number | null;
  locationLng: number | null;
  locationDescription: string;
  isAnonymous: boolean;
  severityLevel: number;
  tags: string[];
  mediaFiles: { name: string; size: number; type: string }[];
}
