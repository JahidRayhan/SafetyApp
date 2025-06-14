
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';
import { useWebPushNotifications } from './useWebPushNotifications';

export const useEmergencyAlerts = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { sendEmergencyNotification } = useWebPushNotifications();

  const sendEmergencyAlerts = async (incidentId: string, location?: GeolocationPosition) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user profile for notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user.id)
        .single();

      console.log('Sending emergency alerts via edge function...');

      // Call the edge function to send alerts
      const { data, error } = await supabase.functions.invoke('send-emergency-alerts', {
        body: {
          incident_id: incidentId,
          user_id: user.user.id,
          location: location ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy
          } : undefined,
          message_type: 'both'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Emergency alerts sent successfully:', data);

      // Send web push notification
      const userName = profile?.full_name || 'User';
      const locationText = location 
        ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
        : undefined;
      
      await sendEmergencyNotification(userName, locationText);

      await logActivity('emergency', 'Emergency alerts sent successfully', { 
        incident_id: incidentId,
        emails_sent: data.emails_sent,
        contacts_notified: data.contacts_notified,
        total_contacts: data.total_contacts,
        location: location ? {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        } : null
      });

      // Show success message with breakdown
      const alertMessage = data.emails_sent > 0 
        ? `${data.emails_sent} email alerts sent successfully!`
        : 'Alerts processed - check activity log for details.';

      toast({
        title: "🚨 Emergency Alerts Sent!",
        description: alertMessage,
        variant: "destructive",
      });

    } catch (error: any) {
      console.error('Error sending emergency alerts:', error);
      
      // Fallback: try to get contacts and show local notification
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('name, phone')
          .eq('user_id', userData.user.id);

        await logActivity('emergency', 'Emergency alert failed, showing local notification', { 
          incident_id: incidentId,
          error: error.message,
          contacts_count: contacts?.length || 0
        });

        // Show manual contact info
        const contactList = contacts?.map(c => `${c.name}: ${c.phone}`).join(', ') || 'No contacts found';
        
        toast({
          title: "⚠️ Alert System Error",
          description: `Unable to send alerts automatically. Please contact: ${contactList}`,
          variant: "destructive",
        });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: "⚠️ Critical Error",
          description: "Emergency alert system unavailable. Contact emergency services directly.",
          variant: "destructive",
        });
      }
    }
  };

  return { sendEmergencyAlerts };
};
