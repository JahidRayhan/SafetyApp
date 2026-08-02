import { asIso, asUuid } from "@/shared/types";
import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import { enqueueEvidence } from "@/core/sync/evidenceQueue";
import { detectMediaKind, toQueueFileType } from "./mappers";
import type { AdminRecordingSummary } from "../domain/types";

export interface UploadOptions {
  incidentId?: string | null;
  /** Force-queue (skip immediate upload). Useful when offline-known. */
  forceQueue?: boolean;
  /** Known media duration, when available, persisted alongside the recording row. */
  durationSeconds?: number;
}

export interface UploadOutcome {
  filePath: string;
  queued: boolean;
}

const isOnline = (): boolean =>
  typeof navigator === "undefined" ? true : navigator.onLine;

const requireUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new AppError("Not authenticated", "AUTH_REQUIRED");
  return data.user.id;
};

const isTransient = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    !isOnline() ||
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("temporarily")
  );
};

/**
 * Upload one evidence file. If the network is down or the upload fails
 * transiently, the file is enqueued for offline retry via the
 * IndexedDB-backed evidence queue (only when an incidentId is supplied —
 * the queue is incident-scoped).
 */
const uploadOne = async (
  file: File,
  options: UploadOptions = {},
): Promise<UploadOutcome> => {
  const userId = await requireUserId();
  const { incidentId, forceQueue, durationSeconds } = options;
  const bucket = incidentId ? "emergency-recordings" : "recordings";
  const ext = file.name.split(".").pop() ?? "bin";
  const fileName = `${userId}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const kind = detectMediaKind(file.type);

  const enqueueIfPossible = async (): Promise<UploadOutcome> => {
    if (!incidentId) {
      throw new AppError(
        "Cannot queue evidence without an incident",
        "EVIDENCE_NO_INCIDENT",
      );
    }
    const item = await enqueueEvidence({
      incident_id: incidentId,
      user_id: userId,
      blob: file,
      file_type: toQueueFileType(kind),
      mime_type: file.type,
    });
    return { filePath: item.file_path, queued: true };
  };

  if (forceQueue || !isOnline()) {
    return enqueueIfPossible();
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    if (incidentId) {
      const { error: dbError } = await supabase.from("recordings").insert({
        incident_id: incidentId,
        user_id: userId,
        file_path: data.path,
        file_type: kind === "document" ? "image" : kind,
        file_size: file.size,
        duration_seconds: Math.round(durationSeconds ?? 0),
      });
      if (dbError) throw dbError;
    }
    return { filePath: data.path, queued: false };
  } catch (err) {
    if (incidentId && isTransient(err)) {
      return enqueueIfPossible();
    }
    throw err instanceof AppError
      ? err
      : new AppError(
          err instanceof Error ? err.message : "Upload failed",
          "EVIDENCE_UPLOAD_FAILED",
          err,
        );
  }
};

export const evidenceService = {
  uploadOne,

  async uploadMany(
    files: File[],
    options: UploadOptions = {},
    onProgress?: (file: File, outcome: UploadOutcome) => void,
  ): Promise<UploadOutcome[]> {
    const out: UploadOutcome[] = [];
    for (const f of files) {
      const r = await uploadOne(f, options);
      onProgress?.(f, r);
      out.push(r);
    }
    return out;
  },

  /**
   * Admin/moderation view: all recordings across all users, newest first,
   * joined with a minimal user profile summary for display/search.
   */
  async listAllForAdmin(): Promise<AdminRecordingSummary[]> {
    const { data, error } = await supabase
      .from("recordings")
      .select(
        `
        id,
        file_path,
        file_type,
        file_size,
        duration_seconds,
        recorded_at,
        incident_id,
        user_id
      `,
      )
      .order("recorded_at", { ascending: false });
    if (error) throw new AppError(error.message, "RECORDINGS_LIST_FAILED", error);

    const rows = data ?? [];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number")
      .in("id", userIds);
    if (profilesError)
      throw new AppError(profilesError.message, "RECORDINGS_LIST_FAILED", profilesError);

    const profileMap = (profiles ?? []).reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, { id: string; full_name: string | null; phone_number: string | null }>,
    );

    return rows.map((recording) => {
      const profile = profileMap[recording.user_id];
      return {
        id: asUuid(recording.id),
        filePath: recording.file_path,
        fileType: recording.file_type as "audio" | "video",
        fileSize: recording.file_size ?? 0,
        durationSeconds: recording.duration_seconds ?? 0,
        recordedAt: asIso(recording.recorded_at),
        incidentId: asUuid(recording.incident_id),
        userId: asUuid(recording.user_id),
        userProfile: {
          fullName: profile?.full_name ?? "Unknown User",
          phoneNumber: profile?.phone_number ?? "Not provided",
        },
      };
    });
  },
};
