export interface SupportArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

export interface SupportArticleDraft {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  author: string;
  created_by?: string;
}

export interface SupportArticleUpdate {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  category?: string;
  is_featured?: boolean;
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  audio_url: string | null;
  category: string;
  difficulty_level: string;
  is_featured: boolean;
  created_at: string;
}

export interface MeditationSessionDraft {
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  difficulty_level: string;
  audio_url: string;
  is_featured: boolean;
}
