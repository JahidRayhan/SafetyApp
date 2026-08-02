import type { IsoTimestamp, Uuid } from "@/shared/types";

export type AccountRole = "user" | "admin" | "govt_admin";

export interface UserProfile {
  id: Uuid;
  fullName: string | null;
  phoneNumber: string | null;
  emergencyPlan: string | null;
  role: AccountRole;
  locationPermissionsGranted: boolean;
  sosGestureEnabled: boolean;
  voiceMonitoringEnabled: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/** Fields a user is allowed to change about themselves. Role is deliberately absent. */
export interface ProfileEdit {
  fullName?: string | null;
  phoneNumber?: string | null;
  emergencyPlan?: string | null;
  locationPermissionsGranted?: boolean;
  sosGestureEnabled?: boolean;
  voiceMonitoringEnabled?: boolean;
}

export const isElevated = (role: AccountRole): boolean => role !== "user";
