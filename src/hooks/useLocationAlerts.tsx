
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';

interface LocationAlert {
  zone_id: string;
  zone_name: string;
  zone_type: string;
  distance_meters: number;
  alert_message: string;
}

export const useLocationAlerts = () => {
  const [currentAlerts, setCurrentAlerts] = useState<LocationAlert[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const checkLocationAlerts = useCallback(async (lat: number, lng: number) => {
    try {
      // Use direct SQL query since the RPC function might not be in types yet
      const { data: alerts, error } = await supabase
        .from('safe_zones')
        .select('id, name, zone_type, center_lat, center_lng, radius_meters')
        .eq('is_active', true);

      if (error) {
        console.error('Error checking location alerts:', error);
        return;
      }

      if (alerts && alerts.length > 0) {
        // Calculate distance and check if user is within any zones
        const activeAlerts: LocationAlert[] = [];
        
        alerts.forEach((zone) => {
          const distance = calculateDistance(lat, lng, zone.center_lat, zone.center_lng);
          
          if (distance <= zone.radius_meters) {
            const alert: LocationAlert = {
              zone_id: zone.id,
              zone_name: zone.name,
              zone_type: zone.zone_type,
              distance_meters: Math.round(distance),
              alert_message: zone.zone_type === 'danger' 
                ? 'Warning: You are entering a high-risk area. Please stay alert.'
                : zone.zone_type === 'safe'
                ? 'You have entered a designated safe zone.'
                : `Location alert for: ${zone.name}`
            };
            
            activeAlerts.push(alert);
          }
        });

        // Filter out alerts that are already shown
        const newAlerts = activeAlerts.filter((alert) => 
          !currentAlerts.some(existing => existing.zone_id === alert.zone_id)
        );

        if (newAlerts.length > 0) {
          setCurrentAlerts(prev => [...prev, ...newAlerts]);
          
          // Show toast for each new alert
          newAlerts.forEach((alert) => {
            toast({
              title: alert.zone_type === 'danger' ? "⚠️ Danger Zone Alert" : "📍 Zone Alert",
              description: alert.alert_message,
              variant: alert.zone_type === 'danger' ? "destructive" : "default",
            });

            logActivity('location', `Entered ${alert.zone_type} zone: ${alert.zone_name}`, {
              zone_id: alert.zone_id,
              zone_type: alert.zone_type,
              distance_meters: alert.distance_meters,
              location: { lat, lng }
            });
          });
        }
      }

      // Record location in history
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('location_history').insert({
          user_id: user.user.id,
          lat,
          lng,
          accuracy: 10
        });
      }
    } catch (error: any) {
      console.error('Error in location alerts:', error);
    }
  }, [currentAlerts, toast, logActivity]);

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI/180);
  };

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        checkLocationAlerts(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error('Location tracking error:', error);
        toast({
          title: "Location Error",
          description: "Unable to track your location for zone alerts.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [checkLocationAlerts, toast]);

  const clearAlerts = useCallback(() => {
    setCurrentAlerts([]);
  }, []);

  return {
    currentAlerts,
    isTracking,
    startLocationTracking,
    clearAlerts,
    checkLocationAlerts
  };
};
