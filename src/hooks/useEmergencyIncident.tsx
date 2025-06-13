
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';
import { useEmergencyAlerts } from './useEmergencyAlerts';

export const useEmergencyIncident = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { sendEmergencyAlerts } = useEmergencyAlerts();

  const createEmergencyIncident = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: incident, error: incidentError } = await supabase
        .from('emergency_incidents')
        .insert({
          user_id: user.user.id,
          status: 'active'
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      await logActivity('emergency', 'Emergency incident created', { 
        incident_id: incident.id 
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await supabase
              .from('emergency_incidents')
              .update({
                location_lat: position.coords.latitude,
                location_lng: position.coords.longitude,
                location_accuracy: position.coords.accuracy
              })
              .eq('id', incident.id);

            await logActivity('emergency', 'Emergency location updated', { 
              incident_id: incident.id,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            });

            await sendEmergencyAlerts(incident.id, position);
          },
          async (error) => {
            console.warn('Could not get location:', error);
            await sendEmergencyAlerts(incident.id);
          },
          { timeout: 5000 }
        );
      } else {
        await sendEmergencyAlerts(incident.id);
      }

      return incident.id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return { createEmergencyIncident };
};
