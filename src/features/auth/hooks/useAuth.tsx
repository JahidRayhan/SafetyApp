import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../services/authService";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Subscribes to the auth session. All Supabase access goes through
 * `authService` so the component tree never touches the client directly.
 */
export const useAuth = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((next) => {
      setSession(next);
      setLoading(false);
    });

    authService
      .getSession()
      .then((initial) => setSession(initial))
      .catch((error) => console.error("Failed to read session:", error))
      .finally(() => setLoading(false));

    return unsubscribe;
  }, []);

  return {
    user: session?.user ?? null,
    session,
    loading,
    signOut: authService.signOut,
  };
};
