import type { Tables, TablesInsert } from "@/core/database/schema";
import { asIso, asUuid } from "@/shared/types";
import type {
  ContactDirectoryDraft,
  ContactDirectoryEntry,
  ContactPriority,
  ContactRelationship,
} from "../domain/types";

type Row = Tables<"emergency_contacts">;
type Insert = TablesInsert<"emergency_contacts">;

const clampPriority = (n: number | null | undefined): ContactPriority => {
  const v = Math.min(5, Math.max(1, Math.round(n ?? 1)));
  return v as ContactPriority;
};

export const toDomain = (row: Row): ContactDirectoryEntry => ({
  id: asUuid(row.id),
  userId: asUuid(row.user_id),
  name: row.name,
  phone: row.phone,
  email: row.email ?? null,
  relationship: (row.relationship as ContactRelationship | null) ?? null,
  priority: clampPriority(row.priority),
  createdAt: asIso(row.created_at),
});

export const toInsert = (
  userId: string,
  draft: ContactDirectoryDraft,
): Insert => ({
  user_id: userId,
  name: draft.name.trim(),
  phone: draft.phone.trim(),
  email: draft.email?.trim() || null,
  relationship: draft.relationship,
  priority: draft.priority,
});
