
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyIncident } from './useEmergencyIncident';
import { useEmergencyRecording } from './useEmergencyRecording';

export const useIOSFeatures = () => {
  const { toast } = useToast();
  const { createEmergencyIncident } = useEmergencyIncident();
  const { startEmergencyRecording } = useEmergencyRecording();
  
  // Shake detection variables
  const shakeCountRef = useRef(0);
  const lastShakeTimeRef = useRef(0);
  const shakeThreshold = 15; // Acceleration threshold for shake detection
  const shakeTimeout = 2000; // Reset shake count after 2 seconds
  const requiredShakes = 3; // Number of shakes needed to trigger SOS

  useEffect(() => {
    if (Capacitor.getPlatform() === 'ios') {
      console.log('Running on iOS platform');
      
      // Request permissions for iOS
      requestIOSPermissions();
      
      // Handle iOS-specific emergency triggers
      setupIOSEmergencyHandlers();
      
      // Setup shake detection
      setupShakeDetection();
    }

    return () => {
      // Cleanup shake detection
      if (typeof DeviceMotionEvent !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, []);

  const requestIOSPermissions = async () => {
    try {
      // Request location permissions
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => console.log('Location permission granted'),
          () => console.log('Location permission denied')
        );
      }

      // Request camera and microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('Camera and microphone permissions granted');
      } catch (error) {
        console.log('Camera/microphone permissions denied');
      }

      // Request notification permissions
      if ('Notification' in window) {
        await Notification.requestPermission();
      }

      // Request device motion permissions for iOS 13+
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            console.log('Device motion permission granted');
          } else {
            console.log('Device motion permission denied');
          }
        } catch (error) {
          console.log('Device motion permission request failed:', error);
        }
      }
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
    }
  };

  const setupShakeDetection = () => {
    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion);
      console.log('Shake detection enabled for iOS');
    } else {
      console.log('Device motion not supported');
    }
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    
    // Calculate total acceleration (focusing on horizontal movement)
    const totalAcceleration = Math.sqrt(x! * x! + y! * y! + z! * z!);
    
    // Detect shake based on horizontal acceleration (x and y axis)
    const horizontalAcceleration = Math.sqrt(x! * x! + y! * y!);
    
    if (horizontalAcceleration > shakeThreshold) {
      const currentTime = Date.now();
      
      // Reset shake count if too much time has passed
      if (currentTime - lastShakeTimeRef.current > shakeTimeout) {
        shakeCountRef.current = 0;
      }
      
      // Prevent multiple detections in quick succession
      if (currentTime - lastShakeTimeRef.current > 300) {
        shakeCountRef.current++;
        lastShakeTimeRef.current = currentTime;
        
        console.log(`Shake detected! Count: ${shakeCountRef.current}/${requiredShakes}`);
        
        // Show feedback to user
        toast({
          title: `Shake ${shakeCountRef.current}/${requiredShakes}`,
          description: `${requiredShakes - shakeCountRef.current} more shakes to trigger SOS`,
        });
        
        // Trigger SOS after required number of shakes
        if (shakeCountRef.current >= requiredShakes) {
          triggerShakeSOS();
          shakeCountRef.current = 0; // Reset counter
        }
      }
    }
  };

  const triggerShakeSOS = async () => {
    console.log('iOS shake SOS triggered');
    
    toast({
      title: "🚨 Shake SOS Activated!",
      description: "Emergency alert triggered by shake gesture. Sending alerts now...",
      variant: "destructive",
    });

    try {
      const incidentId = await createEmergencyIncident();
      if (incidentId) {
        await startEmergencyRecording(incidentId);
      }
    } catch (error) {
      console.error('Error handling shake SOS:', error);
      toast({
        title: "❌ SOS Error",
        description: "Failed to process shake SOS. Please use the app button.",
        variant: "destructive",
      });
    }
  };

  const setupIOSEmergencyHandlers = () => {
    // Listen for iOS power button events (if available through plugins)
    window.addEventListener('iosEmergencyTrigger', handleIOSEmergency);
    
    // Handle iOS app state changes for emergency scenarios
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const handleIOSEmergency = async () => {
    console.log('iOS emergency trigger detected');
    
    toast({
      title: "🚨 iOS Emergency Activated!",
      description: "Emergency alert triggered. Sending alerts now...",
      variant: "destructive",
    });

    try {
      const incidentId = await createEmergencyIncident();
      if (incidentId) {
        await startEmergencyRecording(incidentId);
      }
    } catch (error) {
      console.error('Error handling iOS emergency:', error);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('App moved to background');
    } else {
      console.log('App returned to foreground');
    }
  };

  const isIOS = () => {
    return Capacitor.getPlatform() === 'ios';
  };

  return {
    isIOS,
    requestIOSPermissions
  };
};
