import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyRecording } from '@/hooks/useEmergencyRecording';
import { useEmergencyIncident } from '@/hooks/useEmergencyIncident';
import { useLiveLocationSharing } from '@/hooks/useLiveLocationSharing';
import { useSosStore } from '@/stores';
import EmergencyCountdown from '@/components/emergency/EmergencyCountdown';
import EmergencySOSButton from '@/components/emergency/EmergencySOSButton';
import { Shield } from 'lucide-react';

const COUNTDOWN_SECONDS = 3;

const EmergencyButton = () => {
  const { toast } = useToast();
  const { isRecording, startEmergencyRecording } = useEmergencyRecording();
  const { createEmergencyIncident, resolveActiveIncident } = useEmergencyIncident();
  const { isSharing, startSharing, stopSharing, expiresAt } = useLiveLocationSharing();

  const countdownSeconds = useSosStore((s) => s.countdownSeconds);
  const activeIncident = useSosStore((s) => s.activeIncident);
  const startCountdown = useSosStore((s) => s.startCountdown);
  const tickCountdown = useSosStore((s) => s.tickCountdown);
  const cancelCountdown = useSosStore((s) => s.cancelCountdown);

  const intervalRef = useRef<number | null>(null);
  const firingRef = useRef(false);

  // Drive the countdown timer from the store value.
  useEffect(() => {
    if (countdownSeconds === null) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      tickCountdown();
    }, 1000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [countdownSeconds, tickCountdown]);

  // When the countdown reaches 0, fire the alert exactly once.
  useEffect(() => {
    const fire = async () => {
      if (countdownSeconds !== 0 || firingRef.current) return;
      firingRef.current = true;
      cancelCountdown();
      const incidentId = await createEmergencyIncident();
      if (incidentId) {
        await startEmergencyRecording(incidentId);
        await startSharing({ incidentId, durationMinutes: 60 });
        toast({
          title: '🚨 Emergency Alert Sent!',
          description: 'Contacts notified. Live location sharing is active.',
          variant: 'destructive',
        });
      }
      firingRef.current = false;
    };
    void fire();
  }, [countdownSeconds, cancelCountdown, createEmergencyIncident, startEmergencyRecording, startSharing, toast]);

  const handleEmergencyPress = () => {
    startCountdown(COUNTDOWN_SECONDS);
  };

  const handleCancelCountdown = () => {
    cancelCountdown();
    toast({
      title: 'Emergency Alert Cancelled',
      description: 'The emergency alert has been cancelled.',
    });
  };

  const handleStopEmergency = async () => {
    await stopSharing('incident');
    await resolveActiveIncident();
    toast({
      title: 'Emergency resolved',
      description: 'Live location sharing has been stopped.',
    });
  };

  if (countdownSeconds !== null && countdownSeconds > 0) {
    return <EmergencyCountdown countdown={countdownSeconds} onCancel={handleCancelCountdown} />;
  }

  if (isSharing && activeIncident) {
    const minutesLeft = expiresAt
      ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000))
      : null;
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-48 h-48 rounded-full bg-emergency-600 flex items-center justify-center animate-pulse-emergency">
          <div className="text-center text-white px-4">
            <Shield className="w-12 h-12 mx-auto mb-2" />
            <div className="text-lg font-bold">Alert Active</div>
            <div className="text-xs opacity-90 mt-1">
              Sharing live location
              {minutesLeft !== null && <> · {minutesLeft}m left</>}
            </div>
          </div>
        </div>
        <button
          onClick={handleStopEmergency}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          Stop Emergency & Sharing
        </button>
        <p className="text-sm text-gray-600 max-w-sm text-center">
          Your contacts are receiving location updates whenever you move more than 50 m.
        </p>
      </div>
    );
  }

  return <EmergencySOSButton onPress={handleEmergencyPress} isRecording={isRecording} />;
};

export default EmergencyButton;
