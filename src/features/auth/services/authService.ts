import { supabase } from "@/core/database/client";
import { AppError, ValidationError } from "@/shared/errors";
import type { Session, User } from "@supabase/supabase-js";

export type AccountRole = "user" | "admin" | "govt_admin";

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: AccountRole;
}

export interface SignInInput {
  email: string;
  password: string;
}

export class AuthError extends AppError {
  constructor(message: string, code = "AUTH_ERROR", cause?: unknown) {
    super(message, code, cause);
    this.name = "AuthError";
  }
}

const normalizeAuthError = (raw: unknown): AuthError => {
  const msg =
    raw instanceof Error ? raw.message : "Unexpected authentication error";
  // Map a few well-known supabase messages to stable codes.
  if (/invalid login credentials/i.test(msg))
    return new AuthError("Incorrect email or password.", "AUTH_INVALID_CREDENTIALS", raw);
  if (/email not confirmed/i.test(msg))
    return new AuthError("Please confirm your email first.", "AUTH_EMAIL_UNCONFIRMED", raw);
  if (/user already registered/i.test(msg))
    return new AuthError("An account with this email already exists.", "AUTH_USER_EXISTS", raw);
  if (/password.*(short|6)/i.test(msg))
    return new AuthError("Password must be at least 6 characters.", "AUTH_WEAK_PASSWORD", raw);
  return new AuthError(msg, "AUTH_ERROR", raw);
};

const validateCredentials = ({ email, password }: SignInInput) => {
  if (!email?.trim()) throw new ValidationError("Email is required", "email");
  if (!password) throw new ValidationError("Password is required", "password");
};

export interface SignUpResult {
  user: User | null;
  pendingApproval: boolean;
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw normalizeAuthError(error);
    return data.session;
  },

  onAuthStateChange(
    cb: (session: Session | null) => void,
  ): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(session);
    });
    return () => data.subscription.unsubscribe();
  },

  async signIn(input: SignInInput): Promise<Session> {
    validateCredentials(input);
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw normalizeAuthError(error);
    if (!data.session) throw new AuthError("No session returned");
    return data.session;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw normalizeAuthError(error);
  },

  async signUp(input: SignUpInput): Promise<SignUpResult> {
    validateCredentials({ email: input.email, password: input.password });
    if (!input.fullName?.trim())
      throw new ValidationError("Full name is required", "fullName");

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: input.fullName,
          phone_number: input.phoneNumber,
          requested_role: input.role,
        },
      },
    });
    if (error) throw normalizeAuthError(error);
    const user = data.user;
    if (!user) return { user: null, pendingApproval: input.role !== "user" };

    const elevated = input.role !== "user";
    if (elevated) {
      const { error: approvalError } = await supabase
        .from("admin_approvals")
        .insert({
          user_id: user.id,
          requested_role: input.role,
          requested_by_email: input.email,
        });
      if (approvalError) {
        console.error("Failed to create approval request:", approvalError);
      }
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      role: "user",
    });
    if (profileError) {
      console.error("Failed to create profile:", profileError);
    }

    if (elevated) {
      // Pending approval flow: keep the user signed out.
      await supabase.auth.signOut();
    }
    return { user, pendingApproval: elevated };
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (!email?.trim()) throw new ValidationError("Email is required", "email");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw normalizeAuthError(error);
  },
};
