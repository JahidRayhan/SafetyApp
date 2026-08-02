import { create } from "zustand";

/**
 * Transient client state for the evidence uploader UI.
 * Persistence and retry live in `core/sync/evidenceQueue` — this store
 * only mirrors progress for in-flight selections in the current session.
 */
export interface EvidenceUploadEntry {
  fileName: string;
  size: number;
  mime: string;
  progress: number; // 0-100
  status: "selected" | "uploading" | "queued" | "uploaded" | "failed";
  error?: string;
}

interface EvidenceState {
  uploads: Record<string, EvidenceUploadEntry>;
  upsert: (key: string, patch: Partial<EvidenceUploadEntry> & Pick<EvidenceUploadEntry, "fileName" | "size" | "mime">) => void;
  setStatus: (
    key: string,
    status: EvidenceUploadEntry["status"],
    extra?: { progress?: number; error?: string },
  ) => void;
  remove: (key: string) => void;
  reset: () => void;
}

export const useEvidenceStore = create<EvidenceState>((set) => ({
  uploads: {},
  upsert: (key, patch) =>
    set((s) => ({
      uploads: {
        ...s.uploads,
        [key]: {
          progress: 0,
          status: "selected",
          ...s.uploads[key],
          ...patch,
        } as EvidenceUploadEntry,
      },
    })),
  setStatus: (key, status, extra) =>
    set((s) => {
      const existing = s.uploads[key];
      if (!existing) return s;
      return {
        uploads: {
          ...s.uploads,
          [key]: {
            ...existing,
            status,
            progress: extra?.progress ?? existing.progress,
            error: extra?.error,
          },
        },
      };
    }),
  remove: (key) =>
    set((s) => {
      const next = { ...s.uploads };
      delete next[key];
      return { uploads: next };
    }),
  reset: () => set({ uploads: {} }),
}));
