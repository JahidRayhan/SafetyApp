import type { Tables, TablesInsert } from "@/core/database/schema";
import { asIso, asUuid } from "@/shared/types";
import type { Story, StoryDraft, StoryStatus } from "../domain/types";

type Row = Tables<"personal_stories">;
type Insert = TablesInsert<"personal_stories">;

// Shape returned by the get_public_stories RPC (same columns as Row minus
// nothing extra — kept as a separate alias for clarity at call sites).
export type PublicStoryRow = {
  approved_at: string | null;
  approved_by: string | null;
  author_name: string | null;
  content: string;
  created_at: string | null;
  id: string;
  is_anonymous: boolean | null;
  likes_count: number | null;
  status: string | null;
  story_type: string;
  tags: string[] | null;
  title: string;
  updated_at: string | null;
  user_id: string | null;
};

type ProfileLite = { full_name: string | null; role: string | null } | null;

export const toDomain = (
  row: Row | PublicStoryRow,
  userProfile?: ProfileLite,
): Story => ({
  id: asUuid(row.id),
  userId: row.user_id ? asUuid(row.user_id) : null,
  title: row.title,
  content: row.content,
  authorName: row.author_name ?? null,
  storyType: row.story_type,
  tags: row.tags ?? [],
  likesCount: row.likes_count ?? 0,
  isAnonymous: row.is_anonymous ?? false,
  status: (row.status ?? "pending") as StoryStatus,
  createdAt: asIso(row.created_at ?? new Date().toISOString()),
  updatedAt: row.updated_at ? asIso(row.updated_at) : null,
  approvedAt: row.approved_at ? asIso(row.approved_at) : null,
  approvedBy: row.approved_by ? asUuid(row.approved_by) : null,
  userProfile: userProfile
    ? { fullName: userProfile.full_name, role: userProfile.role }
    : null,
});

export const toInsert = (userId: string, draft: StoryDraft): Insert => ({
  user_id: userId,
  title: draft.title,
  content: draft.content,
  story_type: draft.storyType,
  author_name: draft.authorName,
  is_anonymous: draft.isAnonymous,
  tags: draft.tags ?? [],
  status: "pending",
});
