import { supabase } from "@/core/database/client";
import { AppError, ValidationError } from "@/shared/errors";
import type {
  AdminContactSummary,
  ContactDirectoryDraft,
  ContactDirectoryEntry,
} from "../domain/types";
import { toDomain, toInsert } from "./mappers";

const requireUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new AppError("Not authenticated", "AUTH_REQUIRED");
  return data.user.id;
};

const validate = (draft: ContactDirectoryDraft) => {
  if (!draft.name?.trim())
    throw new ValidationError("Name is required", "name");
  if (!draft.phone?.trim())
    throw new ValidationError("Phone is required", "phone");
};

export const contactService = {
  async list(): Promise<ContactDirectoryEntry[]> {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .order("priority", { ascending: true });
    if (error) throw new AppError(error.message, "CONTACTS_LIST_FAILED", error);
    return (data ?? []).map(toDomain);
  },

  async create(draft: ContactDirectoryDraft): Promise<ContactDirectoryEntry> {
    validate(draft);
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("emergency_contacts")
      .insert(toInsert(userId, draft))
      .select()
      .single();
    if (error)
      throw new AppError(error.message, "CONTACTS_CREATE_FAILED", error);
    return toDomain(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from("emergency_contacts")
      .delete()
      .eq("id", id);
    if (error)
      throw new AppError(error.message, "CONTACTS_DELETE_FAILED", error);
  },

  /**
   * Admin/moderation view: every user's emergency contacts, newest first,
   * joined with a minimal user profile summary for display/search.
   */
  async listAllForAdmin(): Promise<AdminContactSummary[]> {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select(
        `
        id,
        name,
        phone,
        email,
        relationship,
        priority,
        user_id,
        created_at
      `,
      )
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "CONTACTS_LIST_FAILED", error);

    const rows = data ?? [];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number")
      .in("id", userIds);
    if (profilesError)
      throw new AppError(profilesError.message, "CONTACTS_LIST_FAILED", profilesError);

    const profileMap = (profiles ?? []).reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, { id: string; full_name: string | null; phone_number: string | null }>,
    );

    return rows.map((row) => {
      const profile = profileMap[row.user_id];
      const entry = toDomain(row as unknown as Parameters<typeof toDomain>[0]);
      return {
        ...entry,
        userProfile: {
          fullName: profile?.full_name ?? "Unknown User",
          phoneNumber: profile?.phone_number ?? "Not provided",
        },
      };
    });
  },
};
