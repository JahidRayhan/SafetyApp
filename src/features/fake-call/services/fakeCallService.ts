import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";
import type { FakeCallScheduleDraft } from "../domain/types";

const requireUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new AppError("Not authenticated", "AUTH_REQUIRED");
  return data.user.id;
};

export const fakeCallService = {
  async schedule(draft: FakeCallScheduleDraft): Promise<void> {
    const userId = await requireUserId();
    const { error } = await supabase.from("fake_call_schedules").insert({
      user_id: userId,
      contact_name: draft.contactName,
      contact_number: draft.contactNumber,
      scheduled_time: draft.scheduledTime,
      is_instant: draft.isInstant,
    });
    if (error)
      throw new AppError(error.message, "FAKE_CALL_SCHEDULE_FAILED", error);
  },
};
