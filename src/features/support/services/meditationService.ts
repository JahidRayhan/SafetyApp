import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import type {
  MeditationSession,
  MeditationSessionDraft,
} from "../domain/types";

export const meditationService = {
  // ---- Read (content retrieval) ----

  /** Sessions for users, featured first then shortest duration first. */
  async listForUsers(): Promise<MeditationSession[]> {
    const { data, error } = await supabase
      .from("meditation_sessions")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("duration_minutes");
    if (error) throw new AppError(error.message, "MEDITATION_LIST_FAILED", error);
    return (data ?? []) as MeditationSession[];
  },

  // ---- Admin editing ----

  /** Sessions for admin management, newest first. */
  async listForAdmin(): Promise<MeditationSession[]> {
    const { data, error } = await supabase
      .from("meditation_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "MEDITATION_LIST_FAILED", error);
    return (data ?? []) as MeditationSession[];
  },

  async create(draft: MeditationSessionDraft): Promise<void> {
    const { error } = await supabase.from("meditation_sessions").insert(draft);
    if (error) throw new AppError(error.message, "MEDITATION_CREATE_FAILED", error);
  },

  async update(id: string, draft: MeditationSessionDraft): Promise<void> {
    const { error } = await supabase
      .from("meditation_sessions")
      .update(draft)
      .eq("id", id);
    if (error) throw new AppError(error.message, "MEDITATION_UPDATE_FAILED", error);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from("meditation_sessions")
      .delete()
      .eq("id", id);
    if (error) throw new AppError(error.message, "MEDITATION_DELETE_FAILED", error);
  },

  async setFeatured(id: string, isFeatured: boolean): Promise<void> {
    const { error } = await supabase
      .from("meditation_sessions")
      .update({ is_featured: isFeatured })
      .eq("id", id);
    if (error) throw new AppError(error.message, "MEDITATION_UPDATE_FAILED", error);
  },
};
