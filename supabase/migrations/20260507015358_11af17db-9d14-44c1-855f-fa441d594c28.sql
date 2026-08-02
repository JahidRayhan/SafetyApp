ALTER TABLE public.safe_zones REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safe_zones;