
import { useEffect } from 'react';
import { useEmergencyIncident } from './useEmergencyIncident';
import { useEmergencyRecording } from './useEmergencyRecording';
import { useToast } from '@/hooks/use-toast';

export const usePowerButtonSOS = () => {
  const { createEmergencyIncident } = useEmergencyIncident();
  const { startEmergencyRecording } = useEmergencyRecording();
  const { toast } = useToast();

  useEffect(() => {
    const handlePowerButtonSOS = async (event: any) => {
      console.log('Power button SOS triggered:', event.detail);
      
      toast({
        title: "🚨 Power Button SOS Activated!",
        description: "Emergency alert triggered by power button. Sending alerts now...",
        variant: "destructive",
      });

      try {
        const incidentId = await createEmergencyIncident();
        if (incidentId) {
          await startEmergencyRecording(incidentId);
        }
      } catch (error) {
        console.error('Error handling power button SOS:', error);
        toast({
          title: "❌ SOS Error",
          description: "Failed to process power button SOS. Please use the app button.",
          variant: "destructive",
        });
      }
    };

    // Listen for the custom event from native Android
    window.addEventListener('powerButtonSOS', handlePowerButtonSOS);

    return () => {
      window.removeEventListener('powerButtonSOS', handlePowerButtonSOS);
    };
  }, [createEmergencyIncident, startEmergencyRecording, toast]);
};
