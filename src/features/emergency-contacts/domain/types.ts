import type { IsoTimestamp, Uuid } from "@/shared/types";

export type ContactRelationship =
  | "Family"
  | "Friend"
  | "Colleague"
  | "Neighbor"
  | "Emergency Service"
  | "Other";

export type ContactPriority = 1 | 2 | 3 | 4 | 5;

export interface ContactDirectoryEntry {
  id: Uuid;
  userId: Uuid;
  name: string;
  phone: string;
  email: string | null;
  relationship: ContactRelationship | null;
  priority: ContactPriority;
  createdAt: IsoTimestamp;
}

export interface ContactDirectoryDraft {
  name: string;
  phone: string;
  email: string | null;
  relationship: ContactRelationship | null;
  priority: ContactPriority;
}

export interface AdminContactSummary extends ContactDirectoryEntry {
  userProfile: {
    fullName: string;
    phoneNumber: string;
  };
}
