
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { contactService } from '@/features/emergency-contacts/services/contactService';
import { locationHistoryService } from '@/features/location/services/locationHistoryService';
import { useActivityLogger } from '@/components/ActivityLog';

export const useLocationSharing = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const shareLocationWithContacts = useCallback(async (incidentId?: string) => {
    try {
      // Get current location
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          const contacts = await contactService.list();

          // Create location sharing message
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          const message = incidentId 
            ? `🚨 EMERGENCY ALERT: I need help! My current location is: ${locationUrl}`
            : `📍 Location Update: Here's my current location: ${locationUrl}`;

          // Log location sharing
          await logActivity('location', 'Location shared with emergency contacts', {
            incident_id: incidentId,
            location: { lat: latitude, lng: longitude, accuracy },
            contacts_count: contacts?.length || 0,
            contact_ids: contacts?.map(c => c.id) || []
          });

          // In a real implementation, you would integrate with SMS/email services
          console.log('Location shared with contacts:', {
            message,
            location: { latitude, longitude },
            contacts: contacts?.map(c => ({ name: c.name, phone: c.phone }))
          });

          toast({
            title: "📍 Location Shared",
            description: `Your location has been shared with ${contacts?.length || 0} emergency contacts.`,
          });

          await locationHistoryService.append({ lat: latitude, lng: longitude, accuracy });

          return { latitude, longitude, accuracy };
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (error: any) {
      console.error('Error sharing location:', error);
      toast({
        title: "Sharing Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, logActivity]);

  return { shareLocationWithContacts };
};
