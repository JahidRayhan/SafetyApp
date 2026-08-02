import type { IsoTimestamp, Uuid } from "@/shared/types";

export type EvidenceMediaKind = "audio" | "video" | "image" | "document";
export type EvidenceUploadStatus = "queued" | "uploading" | "uploaded" | "failed";

/**
 * An evidence file captured for an incident. Discriminated on `status`
 * so consumers can narrow on the local-only `queued`/`failed` variants
 * before they have a remote `filePath`.
 */
export type EvidenceArtifact =
  | {
      status: "queued" | "uploading" | "failed";
      localId: string;
      kind: EvidenceMediaKind;
      incidentId: Uuid | null;
      sizeBytes: number;
      durationSeconds: number | null;
      capturedAt: IsoTimestamp;
      lastError?: string;
    }
  | {
      status: "uploaded";
      id: Uuid;
      incidentId: Uuid;
      userId: Uuid;
      kind: EvidenceMediaKind;
      filePath: string;
      sizeBytes: number;
      durationSeconds: number | null;
      capturedAt: IsoTimestamp;
    };

export interface AdminRecordingSummary {
  id: Uuid;
  filePath: string;
  fileType: "audio" | "video";
  fileSize: number;
  durationSeconds: number;
  recordedAt: IsoTimestamp;
  incidentId: Uuid;
  userId: Uuid;
  userProfile: {
    fullName: string;
    phoneNumber: string;
  };
}
