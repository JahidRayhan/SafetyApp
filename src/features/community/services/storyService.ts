import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import type { Story, StoryDraft } from "../domain/types";
import { toDomain, toInsert, type PublicStoryRow } from "./mappers";

export const storyService = {
  /** Publicly visible (approved) stories, via the get_public_stories RPC. */
  async listPublic(): Promise<Story[]> {
    const { data, error } = await supabase.rpc("get_public_stories");
    if (error) throw new AppError(error.message, "STORIES_LIST_FAILED", error);
    const rows = (data ?? []) as PublicStoryRow[];
    return rows
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      )
      .map((row) => toDomain(row));
  },

  /** All stories authored by the given user, regardless of status. */
  async listMine(userId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from("personal_stories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "STORIES_LIST_FAILED", error);
    return (data ?? []).map((row) => toDomain(row));
  },

  async create(userId: string, draft: StoryDraft): Promise<void> {
    const { error } = await supabase
      .from("personal_stories")
      .insert(toInsert(userId, draft));
    if (error) throw new AppError(error.message, "STORY_CREATE_FAILED", error);
  },

  async isLikedByUser(userId: string, storyId: string): Promise<boolean> {
    const { data } = await supabase
      .from("story_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("story_id", storyId)
      .single();
    return !!data;
  },

  async like(userId: string, storyId: string): Promise<void> {
    const { error: insertError } = await supabase
      .from("story_likes")
      .insert({ user_id: userId, story_id: storyId });
    if (insertError)
      throw new AppError(insertError.message, "STORY_LIKE_FAILED", insertError);

    const { error: rpcError } = await supabase.rpc("increment_story_likes", {
      story_id: storyId,
    });
    if (rpcError)
      throw new AppError(rpcError.message, "STORY_LIKE_FAILED", rpcError);
  },

  async unlike(userId: string, storyId: string): Promise<void> {
    const { error: deleteError } = await supabase
      .from("story_likes")
      .delete()
      .eq("user_id", userId)
      .eq("story_id", storyId);
    if (deleteError)
      throw new AppError(
        deleteError.message,
        "STORY_UNLIKE_FAILED",
        deleteError,
      );

    const { error: rpcError } = await supabase.rpc("decrement_story_likes", {
      story_id: storyId,
    });
    if (rpcError)
      throw new AppError(rpcError.message, "STORY_UNLIKE_FAILED", rpcError);
  },

  /** Toggles like state for a story; returns whether it is now liked. */
  async toggleLike(userId: string, storyId: string): Promise<boolean> {
    const alreadyLiked = await storyService.isLikedByUser(userId, storyId);
    if (alreadyLiked) {
      await storyService.unlike(userId, storyId);
      return false;
    }
    await storyService.like(userId, storyId);
    return true;
  },
};
