import { supabase } from "@/core/database/client";
import { AppError } from "@/shared/errors";

export interface AssistantReply {
  text: string;
}

/**
 * Support assistant transport. The edge function derives the user from the
 * verified JWT, so no identity is passed from the client.
 */
export const assistantService = {
  async ask(message: string): Promise<AssistantReply> {
    const { data, error } = await supabase.functions.invoke("chatbot-support", {
      body: { message },
    });
    if (error) throw new AppError(error.message, "ASSISTANT_FAILED", error);
    return { text: data?.response ?? "" };
  },
};
