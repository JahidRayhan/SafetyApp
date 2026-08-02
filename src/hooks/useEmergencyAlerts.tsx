
import { useToast } from '@/hooks/use-toast';
import { alertService } from '@/features/sos/services/alertService';
import { contactService } from '@/features/emergency-contacts/services/contactService';
import { profileService } from '@/features/profile/services/profileService';
import { authService } from '@/features/auth/services/authService';
import { useActivityLogger } from '@/components/ActivityLog';
import { useWebPushNotifications } from './useWebPushNotifications';

export const useEmergencyAlerts = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { sendEmergencyNotification } = useWebPushNotifications();

  const sendEmergencyAlerts = async (incidentId: string, location?: GeolocationPosition) => {
    try {
      const session = await authService.getSession();
      const currentUser = session?.user;
      if (!currentUser) throw new Error('Not authenticated');

      const profile = await profileService.find(currentUser.id);

      const result = await alertService.dispatch({
        incidentId,
        userId: currentUser.id,
        location: location
          ? {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy,
            }
          : undefined,
      });

      // Send web push notification
      const userName = profile?.fullName || 'User';
      const locationText = location 
        ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
        : undefined;
      
      await sendEmergencyNotification(userName, locationText);

      await logActivity('emergency', 'Emergency alerts sent successfully', { 
        incident_id: incidentId,
        emails_sent: result.emailsSent,
        contacts_notified: result.contactsNotified,
        total_contacts: result.totalContacts,
        location: location ? {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        } : null
      });

      // Show success message with breakdown
      const alertMessage = result.emailsSent > 0 
        ? `${result.emailsSent} email alerts sent successfully!`
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
        const contacts = await contactService.list();

        await logActivity('emergency', 'Emergency alert failed, showing local notification', { 
          incident_id: incidentId,
          error: error.message,
          contacts_count: contacts.length
        });

        // Show manual contact info
        const contactList =
          contacts.map((c) => `${c.name}: ${c.phone}`).join(', ') || 'No contacts found';
        
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
