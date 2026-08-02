import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { profileService } from "../services/profileService";
import type { ProfileEdit, UserProfile } from "../domain/types";

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (edit: ProfileEdit) => Promise<boolean>;
}

export const useProfile = (user: User | null): ProfileState => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    profileService
      .ensure({
        userId: user.id,
        fullName: user.user_metadata?.full_name ?? null,
        phoneNumber: user.user_metadata?.phone_number ?? null,
      })
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch((error) => console.error("Failed to load profile:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateProfile = useCallback(
    async (edit: ProfileEdit) => {
      if (!user) return false;
      try {
        setProfile(await profileService.update(user.id, edit));
        return true;
      } catch (error) {
        console.error("Failed to update profile:", error);
        return false;
      }
    },
    [user],
  );

  return { profile, loading, updateProfile };
};
