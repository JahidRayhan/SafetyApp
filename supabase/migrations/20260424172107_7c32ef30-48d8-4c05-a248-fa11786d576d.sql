CREATE TABLE public.sos_alert_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  user_id UUID NOT NULL,
  contact_id UUID,
  channel TEXT NOT NULL DEFAULT 'email',
  recipient_email TEXT,
  recipient_phone TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  error_message TEXT,
  resent_from_delivery_id UUID,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sos_alert_deliveries_channel_check CHECK (channel IN ('email', 'sms')),
  CONSTRAINT sos_alert_deliveries_status_check CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  CONSTRAINT sos_alert_deliveries_attempt_number_check CHECK (attempt_number >= 1)
);

ALTER TABLE public.sos_alert_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all sos alert deliveries"
ON public.sos_alert_deliveries
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::user_role, 'govt_admin'::user_role])
  )
);

CREATE POLICY "Users can view their own sos alert deliveries"
ON public.sos_alert_deliveries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert sos alert deliveries"
ON public.sos_alert_deliveries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update sos alert deliveries"
ON public.sos_alert_deliveries
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE INDEX idx_sos_alert_deliveries_attempted_at
ON public.sos_alert_deliveries (attempted_at DESC);

CREATE INDEX idx_sos_alert_deliveries_incident_id
ON public.sos_alert_deliveries (incident_id);

CREATE INDEX idx_sos_alert_deliveries_status
ON public.sos_alert_deliveries (delivery_status);

CREATE INDEX idx_sos_alert_deliveries_user_id
ON public.sos_alert_deliveries (user_id);

CREATE INDEX idx_sos_alert_deliveries_resent_from
ON public.sos_alert_deliveries (resent_from_delivery_id);

CREATE OR REPLACE FUNCTION public.update_sos_alert_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sos_alert_deliveries_updated_at
BEFORE UPDATE ON public.sos_alert_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_sos_alert_deliveries_updated_at();