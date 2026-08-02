import type { IsoTimestamp, Uuid } from "@/shared/types";

export type StoryStatus = "pending" | "approved" | "rejected";

export interface Story {
  id: Uuid;
  userId: Uuid | null;
  title: string;
  content: string;
  authorName: string | null;
  storyType: string;
  tags: string[];
  likesCount: number;
  isAnonymous: boolean;
  status: StoryStatus;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp | null;
  approvedAt: IsoTimestamp | null;
  approvedBy: Uuid | null;
  userProfile?: {
    fullName: string | null;
    role: string | null;
  } | null;
}

export interface StoryDraft {
  title: string;
  content: string;
  storyType: string;
  authorName: string | null;
  isAnonymous: boolean;
  tags?: string[];
}

export interface StoryLike {
  id: Uuid;
  storyId: Uuid;
  userId: Uuid;
  createdAt: IsoTimestamp | null;
}
