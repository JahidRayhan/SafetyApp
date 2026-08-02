import type { EvidenceMediaKind } from "../domain/types";

export const detectMediaKind = (mime: string): EvidenceMediaKind => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
};

/** Map a generic media kind to one supported by the evidence queue. */
export const toQueueFileType = (
  kind: EvidenceMediaKind,
): "audio" | "video" | "image" => {
  if (kind === "document") return "image"; // queue has no doc type; persist as image bucket entry
  return kind;
};
