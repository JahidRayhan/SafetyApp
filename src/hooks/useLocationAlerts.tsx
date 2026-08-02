import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { locationHistoryService } from '@/features/location/services/locationHistoryService';
import { useActivityLogger } from '@/components/ActivityLog';
import { useGeofencingStore } from '@/stores';
import { safeZoneService } from '@/features/geofencing/services/safeZoneService';
import { asLat, asLng } from '@/shared/types';

/**
 * Backwards-compatible shape used by `LocationTracker`.
 * The store holds the canonical state; this is a view adapter.
 */
interface LocationAlert {
  zone_id: string;
  zone_name: string;
  zone_type: string;
  distance_meters: number;
  alert_message: string;
}

/**
 * Thin orchestration around the geofencing store.
 *
 * - Zone evaluation lives in `safeZoneService.evaluatePosition`
 * - Occupied zones, active alerts, and last position live in `useGeofencingStore`
 * - This hook just owns the geolocation watcher + toasts/logging
 */
export const useLocationAlerts = () => {
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const storeAlerts = useGeofencingStore((s) => s.activeAlerts);
  const storeZones = useGeofencingStore((s) => s.zones);

  const [isTracking, setIsTracking] = useState(false);

  // Hydrate the zone cache once so evaluation has something to match against.
  useEffect(() => {
    if (storeZones.length === 0) {
      safeZoneService
        .listActive()
        .then((zones) => useGeofencingStore.getState().setZones(zones))
        .catch((e) => console.warn('Failed to hydrate safe zones', e));
    }
  }, [storeZones.length]);

  const checkLocationAlerts = useCallback(
    async (lat: number, lng: number) => {
      const events = useGeofencingStore.getState().evaluate({
        lat: asLat(lat),
        lng: asLng(lng),
      });

      for (const ev of events) {
        if (ev.kind !== 'entered') continue;
        const isDanger = ev.zone.zoneType === 'unsafe';
        toast({
          title: isDanger ? '⚠️ Danger Zone Alert' : '📍 Zone Alert',
          description:
            isDanger
              ? 'Warning: You are entering a high-risk area. Please stay alert.'
              : ev.zone.zoneType === 'safe'
                ? 'You have entered a designated safe zone.'
                : `Location alert for: ${ev.zone.name}`,
          variant: isDanger ? 'destructive' : 'default',
        });
        logActivity('location', `Entered ${ev.zone.zoneType} zone: ${ev.zone.name}`, {
          zone_id: ev.zone.id,
          zone_type: ev.zone.zoneType,
          distance_meters: Math.round(ev.distance),
          location: { lat, lng },
        });
      }

      // Best-effort location history write — non-blocking for alerting.
      try {
        await locationHistoryService.append({ lat, lng, accuracy: 10 });
      } catch (err) {
        console.warn('Failed to persist location history', err);
      }

    },
    [toast, logActivity],
  );

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location Not Supported',
        description: "Your browser doesn't support location tracking.",
        variant: 'destructive',
      });
      return;
    }

    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void checkLocationAlerts(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        console.error('Location tracking error:', error);
        toast({
          title: 'Location Error',
          description: 'Unable to track your location for zone alerts.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [checkLocationAlerts, toast]);

  const clearAlerts = useCallback(() => {
    useGeofencingStore.getState().clearAlerts();
  }, []);

  // Adapt store-shaped alerts to the legacy `LocationAlert` payload used by UI.
  const currentAlerts: LocationAlert[] = storeAlerts.map((a) => ({
    zone_id: a.zoneId,
    zone_name: a.zoneName,
    zone_type: a.zoneType === 'unsafe' ? 'danger' : a.zoneType,
    distance_meters: a.distanceMeters,
    alert_message: a.message,
  }));

  return {
    currentAlerts,
    isTracking,
    startLocationTracking,
    clearAlerts,
    checkLocationAlerts,
  };
};
