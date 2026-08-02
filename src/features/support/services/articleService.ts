import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import type {
  SupportArticle,
  SupportArticleDraft,
  SupportArticleUpdate,
} from "../domain/types";

export const articleService = {
  // ---- Read (content retrieval) ----

  /** All articles, featured first then newest first. */
  async list(): Promise<SupportArticle[]> {
    const { data, error } = await supabase
      .from("support_articles")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "ARTICLES_LIST_FAILED", error);
    return (data ?? []) as SupportArticle[];
  },

  /** Articles filtered by exact category, newest first (admin resource lists). */
  async listByCategory(category: string): Promise<SupportArticle[]> {
    const { data, error } = await supabase
      .from("support_articles")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "ARTICLES_LIST_FAILED", error);
    return (data ?? []) as SupportArticle[];
  },

  // ---- Admin editing ----

  async create(draft: SupportArticleDraft): Promise<void> {
    const { error } = await supabase.from("support_articles").insert({
      title: draft.title,
      content: draft.content,
      excerpt: draft.excerpt,
      category: draft.category,
      tags: draft.tags,
      is_featured: draft.is_featured,
      author: draft.author,
      created_by: draft.created_by,
    });
    if (error) throw new AppError(error.message, "ARTICLE_CREATE_FAILED", error);
  },

  async update(id: string, updates: SupportArticleUpdate): Promise<void> {
    const { error } = await supabase
      .from("support_articles")
      .update(updates)
      .eq("id", id);
    if (error) throw new AppError(error.message, "ARTICLE_UPDATE_FAILED", error);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from("support_articles")
      .delete()
      .eq("id", id);
    if (error) throw new AppError(error.message, "ARTICLE_DELETE_FAILED", error);
  },
};
