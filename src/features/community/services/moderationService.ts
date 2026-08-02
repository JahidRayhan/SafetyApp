import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import type { Story, StoryStatus } from "../domain/types";
import { toDomain } from "./mappers";

export const moderationService = {
  /** All stories (any status) with author profile info joined, for moderation review. */
  async listAll(): Promise<Story[]> {
    const { data, error } = await supabase
      .from("personal_stories")
      .select(
        `
        id,
        title,
        content,
        author_name,
        story_type,
        is_anonymous,
        status,
        likes_count,
        created_at,
        tags,
        user_id
      `,
      )
      .order("created_at", { ascending: false });

    if (error)
      throw new AppError(error.message, "STORIES_MODERATION_LIST_FAILED", error);

    const rows = data ?? [];
    const userIds = [
      ...new Set(
        rows.filter((s) => !s.is_anonymous).map((s) => s.user_id).filter(Boolean),
      ),
    ] as string[];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);

    const profileMap = (profiles ?? []).reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, { full_name: string | null; role: string | null }>,
    );

    return rows.map((row) =>
      toDomain(
        row as unknown as Parameters<typeof toDomain>[0],
        row.user_id && !row.is_anonymous ? profileMap[row.user_id] : null,
      ),
    );
  },

  async setStatus(storyId: string, action: "approve" | "reject"): Promise<void> {
    const status: StoryStatus = action === "approve" ? "approved" : "rejected";
    const { error } = await supabase
      .from("personal_stories")
      .update({
        status,
        approved_at: action === "approve" ? new Date().toISOString() : null,
      })
      .eq("id", storyId);
    if (error)
      throw new AppError(error.message, "STORY_MODERATION_FAILED", error);
  },
};
