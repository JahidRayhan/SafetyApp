
-- Create functions for story likes management
CREATE OR REPLACE FUNCTION public.increment_story_likes(story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.personal_stories
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = story_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_story_likes(story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.personal_stories
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = story_id;
END;
$$;
