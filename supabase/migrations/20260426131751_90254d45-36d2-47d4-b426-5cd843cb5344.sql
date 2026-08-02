-- Create table for tracking live location sharing sessions
CREATE TABLE public.live_location_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  incident_id UUID REFERENCES public.emergency_incidents(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  last_lat NUMERIC,
  last_lng NUMERIC,
  last_accuracy NUMERIC,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  contacts_notified INTEGER NOT NULL DEFAULT 0,
  updates_sent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_location_sessions_user_active
  ON public.live_location_sessions (user_id, status);

CREATE INDEX idx_live_location_sessions_incident
  ON public.live_location_sessions (incident_id);

ALTER TABLE public.live_location_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own live sessions"
  ON public.live_location_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all live sessions"
  ON public.live_location_sessions
  FOR SELECT
  USING (public.can_view_all_profiles(auth.uid()));

CREATE POLICY "Users can create their own live sessions"
  ON public.live_location_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live sessions"
  ON public.live_location_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reuse existing timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_live_location_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_live_location_sessions_updated_at
  BEFORE UPDATE ON public.live_location_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_live_location_sessions_updated_at();