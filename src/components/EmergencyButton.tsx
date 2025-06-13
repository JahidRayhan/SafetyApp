
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyRecording } from '@/hooks/useEmergencyRecording';
import { useEmergencyIncident } from '@/hooks/useEmergencyIncident';
import EmergencyCountdown from '@/components/emergency/EmergencyCountdown';
import EmergencySOSButton from '@/components/emergency/EmergencySOSButton';

const EmergencyButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState<number | null>(null);
  const { toast } = useToast();
  const { isRecording, startEmergencyRecording } = useEmergencyRecording();
  const { createEmergencyIncident } = useEmergencyIncident();

  const handleEmergencyTrigger = async (incidentId: string) => {
    console.log('Emergency triggered with incident ID:', incidentId);
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "Your emergency contacts have been notified and recording has started.",
      variant: "destructive",
    });
  };

  const handleEmergencyPress = () => {
    setIsPressed(true);
    let count = 3;
    setCountdown(count);

    const timer = window.setInterval(async () => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(timer);
        
        const incidentId = await createEmergencyIncident();
        if (incidentId) {
          await startEmergencyRecording(incidentId);
          await handleEmergencyTrigger(incidentId);
        }
        
        setIsPressed(false);
        toast({
          title: "🚨 Emergency Alert Sent!",
          description: "Your emergency contacts have been notified and recording has started.",
          variant: "destructive",
        });
      }
    }, 1000);
    
    setCountdownInterval(timer as unknown as number);
  };

  const handleCancel = () => {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval);
    }
    setIsPressed(false);
    setCountdown(0);
    toast({
      title: "Emergency Alert Cancelled",
      description: "The emergency alert has been cancelled.",
    });
  };

  if (isPressed) {
    return <EmergencyCountdown countdown={countdown} onCancel={handleCancel} />;
  }

  return <EmergencySOSButton onPress={handleEmergencyPress} isRecording={isRecording} />;
};

export default EmergencyButton;
