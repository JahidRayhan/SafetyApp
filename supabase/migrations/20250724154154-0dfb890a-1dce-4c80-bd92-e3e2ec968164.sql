-- Create function to get all approved public stories
CREATE OR REPLACE FUNCTION public.get_public_stories()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  content text,
  author_name text,
  story_type text,
  is_anonymous boolean,
  likes_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  approved_by uuid,
  approved_at timestamp with time zone,
  status text,
  tags text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.user_id,
    ps.title,
    ps.content,
    ps.author_name,
    ps.story_type,
    ps.is_anonymous,
    ps.likes_count,
    ps.created_at,
    ps.updated_at,
    ps.approved_by,
    ps.approved_at,
    ps.status,
    ps.tags
  FROM public.personal_stories ps
  WHERE ps.status = 'approved'
  ORDER BY ps.created_at DESC;
END;
$$;