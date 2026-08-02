import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/components/ActivityLog';
import { useEmergencyAlerts } from './useEmergencyAlerts';
import { sosService } from '@/features/sos/services/sosService';
import { useSosStore } from '@/stores';
import { ThreatLevel } from '@/features/sos/domain/types';

/**
 * Thin orchestration hook for the SOS lifecycle.
 *
 * - Lifecycle DB calls live in `sosService`
 * - Active incident, threat level, and countdown live in `useSosStore`
 * - This hook only sequences side effects (geolocation, alerts, activity log)
 */
export const useEmergencyIncident = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { sendEmergencyAlerts } = useEmergencyAlerts();

  const createEmergencyIncident = async (): Promise<string | null> => {
    try {
      const incident = await sosService.createIncident();
      useSosStore.getState().setActiveIncident(incident);
      useSosStore.getState().setThreatLevel(ThreatLevel.High);

      await logActivity('emergency', 'Emergency incident created', {
        incident_id: incident.id,
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await sosService.updateIncidentLocation(incident.id, {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
              await logActivity('emergency', 'Emergency location updated', {
                incident_id: incident.id,
                location: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                },
              });
            } catch (e) {
              console.warn('Failed to persist incident location', e);
            }
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
        title: 'Error',
        description: error?.message ?? 'Failed to create emergency incident',
        variant: 'destructive',
      });
      return null;
    }
  };

  const resolveActiveIncident = async (): Promise<void> => {
    const active = useSosStore.getState().activeIncident;
    if (!active) return;
    try {
      const updated = await sosService.resolve(active);
      useSosStore.getState().setActiveIncident(null);
      await logActivity('emergency', 'Emergency incident resolved', {
        incident_id: updated.id,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message ?? 'Failed to resolve incident',
        variant: 'destructive',
      });
    }
  };

  return { createEmergencyIncident, resolveActiveIncident };
};
