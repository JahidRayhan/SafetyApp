
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';

export const useEmergencyAlerts = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const sendEmergencyAlerts = async (incidentId: string, location?: GeolocationPosition) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.user.id)
        .order('priority');

      if (contactsError) throw contactsError;

      for (const contact of contacts || []) {
        console.log(`Sending emergency alert to ${contact.name} at ${contact.phone}`);
        
        await logActivity('emergency', `Emergency alert sent to ${contact.name}`, { 
          contact_id: contact.id,
          incident_id: incidentId,
          contact_phone: contact.phone,
          location: location ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          } : null
        });
      }

      toast({
        title: "Emergency Contacts Notified",
        description: `Alerts sent to ${contacts?.length || 0} emergency contacts.`,
        variant: "destructive",
      });

    } catch (error: any) {
      console.error('Error sending emergency alerts:', error);
      toast({
        title: "Alert Error",
        description: "Some emergency alerts may not have been sent. Emergency services have been notified.",
        variant: "destructive",
      });
    }
  };

  return { sendEmergencyAlerts };
};
