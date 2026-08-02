import { useCallback, useEffect, useRef, useState } from 'react';
import { liveLocationService } from '@/features/live-location/services/liveLocationService';
import { useToast } from '@/hooks/use-toast';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Lazily-typed handle for the community background-geolocation plugin.
// We only call it on native platforms, so the web bundle stays safe.
interface BgWatcherLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
interface BgGeoPlugin {
  addWatcher(
    options: {
      backgroundMessage?: string;
      backgroundTitle?: string;
      requestPermissions?: boolean;
      stale?: boolean;
      distanceFilter?: number;
    },
    callback: (
      location: BgWatcherLocation | null,
      error?: { code: string; message: string },
    ) => void,
  ): Promise<string>;
  removeWatcher(options: { id: string }): Promise<void>;
}
const BackgroundGeolocation = registerPlugin<BgGeoPlugin>('BackgroundGeolocation');

const MIN_DISTANCE_METERS = 50;
const MAX_DURATION_MINUTES = 60;

export interface LiveLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

function haversineMeters(a: LiveLocation, b: LiveLocation) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface StartOptions {
  incidentId?: string;
  durationMinutes?: number;
}

export const useLiveLocationSharing = () => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LiveLocation | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const nativeWatcherIdRef = useRef<string | null>(null);
  const lastSentRef = useRef<LiveLocation | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const expiryTimerRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const incidentIdRef = useRef<string | null>(null);
  const safeZonesRef = useRef<Array<{ id: string; name: string; center_lat: number; center_lng: number; radius_meters: number }>>([]);
  const unsubscribeZonesRef = useRef<(() => void) | null>(null);
  // Track per-zone inside/outside state. true = currently inside.
  const zoneInsideRef = useRef<Map<string, boolean>>(new Map());
  const breachedRef = useRef<Set<string>>(new Set());

  const loadSafeZones = useCallback(async () => {
    const zones = await liveLocationService.listTrackedSafeZones();
    safeZonesRef.current = zones.map((z) => ({
      id: z.id,
      name: z.name,
      center_lat: z.centerLat,
      center_lng: z.centerLng,
      radius_meters: z.radiusMeters,
    }));
    // Reconcile inside-state map with new zone set
    const validIds = new Set(safeZonesRef.current.map((z) => z.id));
    for (const id of Array.from(zoneInsideRef.current.keys())) {
      if (!validIds.has(id)) zoneInsideRef.current.delete(id);
    }
  }, []);

  const checkGeofence = useCallback(async (loc: LiveLocation) => {
    if (!incidentIdRef.current) return;
    for (const z of safeZonesRef.current) {
      const dist = haversineMeters(loc, { lat: z.center_lat, lng: z.center_lng });
      const inside = dist <= z.radius_meters;
      const wasInside = zoneInsideRef.current.get(z.id);
      zoneInsideRef.current.set(z.id, inside);
      // Fire on inside -> outside transition, once per session per zone
      if (wasInside === true && !inside && !breachedRef.current.has(z.id)) {
        breachedRef.current.add(z.id);
        try {
          await liveLocationService.notifyFenceBreach({
            zoneId: z.id,
            zoneName: z.name,
            location: loc,
            sessionId: sessionIdRef.current,
            incidentId: incidentIdRef.current,
            distanceMeters: dist,
          });
          toast({
            title: '🚨 Safe zone breach',
            description: `You left "${z.name}". Contacts have been alerted.`,
            variant: 'destructive',
          });
        } catch (e) {
          console.error('Failed to notify fence breach:', e);
        }
      }
    }
  }, [toast]);

  const sendUpdate = useCallback(
    async (loc: LiveLocation, isFirst: boolean, opts?: StartOptions) => {
      if (sendingRef.current) return;
      sendingRef.current = true;
      try {
        const result = await liveLocationService.pushUpdate({
          location: loc,
          durationMinutes: opts?.durationMinutes ?? MAX_DURATION_MINUTES,
          sessionId: sessionIdRef.current ?? undefined,
          isFirstFix: isFirst,
          incidentId: opts?.incidentId,
        });
        if (result.sessionId) {
          sessionIdRef.current = result.sessionId;
          setSessionId(result.sessionId);
        }
        if (result.expiresAt) {
          setExpiresAt(result.expiresAt);
        }
        lastSentRef.current = loc;
      } catch (e) {
        console.error('Failed to push live location:', e);
      } finally {
        sendingRef.current = false;
      }
    },
    [],
  );

  const stopSharing = useCallback(
    async (reason: 'user' | 'expired' | 'incident' = 'user') => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (nativeWatcherIdRef.current) {
        try {
          await BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current });
        } catch (e) {
          console.warn('Failed to remove native watcher:', e);
        }
        nativeWatcherIdRef.current = null;
      }
      if (expiryTimerRef.current !== null) {
        window.clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
      unsubscribeZonesRef.current?.();
      unsubscribeZonesRef.current = null;
      safeZonesRef.current = [];
      const sid = sessionIdRef.current;
      if (sid) {
        await liveLocationService.endSession(sid, reason);
      }
      sessionIdRef.current = null;
      setSessionId(null);
      setIsSharing(false);
      setExpiresAt(null);
      lastSentRef.current = null;
      if (reason === 'user') {
        toast({
          title: 'Live sharing stopped',
          description: 'Your contacts will no longer receive location updates.',
        });
      } else if (reason === 'expired') {
        toast({
          title: 'Live sharing expired',
          description: 'The 60-minute sharing window ended automatically.',
        });
      }
    },
    [toast],
  );

  const startSharing = useCallback(
    async (opts: StartOptions = {}) => {
      if (isSharing) return;
      if (!navigator.geolocation) {
        toast({
          title: 'Location not supported',
          description: 'Your browser does not support geolocation.',
          variant: 'destructive',
        });
        return;
      }
      setIsSharing(true);
      incidentIdRef.current = opts.incidentId ?? null;
      breachedRef.current = new Set();
      zoneInsideRef.current = new Map();

      // Load active safe zones for geofencing (only if there's an incident)
      if (opts.incidentId) {
        await loadSafeZones();
        // Subscribe to realtime changes so new/edited zones take effect immediately
        unsubscribeZonesRef.current = liveLocationService.subscribeToSafeZones(() => {
          void loadSafeZones();
        });
      } else {
        safeZonesRef.current = [];
      }

      const duration = opts.durationMinutes ?? MAX_DURATION_MINUTES;
      // Schedule auto-stop
      expiryTimerRef.current = window.setTimeout(() => {
        stopSharing('expired');
      }, duration * 60_000);

      // Get first fix and notify
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc: LiveLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCurrentLocation(loc);
          await sendUpdate(loc, true, opts);

          // Initialize zone state without firing alerts on first fix
          for (const z of safeZonesRef.current) {
            const dist = haversineMeters(loc, { lat: z.center_lat, lng: z.center_lng });
            zoneInsideRef.current.set(z.id, dist <= z.radius_meters);
          }

          await liveLocationService.appendHistory(loc);

          toast({
            title: '📍 Live sharing started',
            description: 'Updates will be sent when you move more than 50 m.',
          });
        },
        (err) => {
          console.error('Initial position error:', err);
          toast({
            title: 'Location error',
            description: 'Unable to get your location.',
            variant: 'destructive',
          });
          setIsSharing(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );

      // Watch for movement — prefer native background watcher when running on iOS/Android.
      const handleMovement = async (loc: LiveLocation) => {
        setCurrentLocation(loc);
        // Geofence check on every position update (cheap, local)
        await checkGeofence(loc);
        if (
          !lastSentRef.current ||
          haversineMeters(lastSentRef.current, loc) >= MIN_DISTANCE_METERS
        ) {
          await sendUpdate(loc, false, opts);
          await liveLocationService.appendHistory(loc);
        }
      };

      if (Capacitor.isNativePlatform()) {
        try {
          const id = await BackgroundGeolocation.addWatcher(
            {
              backgroundMessage: 'SafeGuard is sharing your live location.',
              backgroundTitle: 'Live location sharing active',
              requestPermissions: true,
              stale: false,
              distanceFilter: MIN_DISTANCE_METERS,
            },
            (location, error) => {
              if (error) {
                console.warn('Native geolocation error:', error);
                return;
              }
              if (!location) return;
              void handleMovement({
                lat: location.latitude,
                lng: location.longitude,
                accuracy: location.accuracy,
              });
            },
          );
          nativeWatcherIdRef.current = id;
        } catch (e) {
          console.warn('Background geolocation unavailable, falling back to web watch:', e);
        }
      }

      if (!nativeWatcherIdRef.current) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) =>
            void handleMovement({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            }),
          (err) => console.warn('watchPosition error:', err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
        );
      }
    },
    [isSharing, sendUpdate, stopSharing, toast, checkGeofence, loadSafeZones],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (nativeWatcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current }).catch(() => {});
      }
      if (expiryTimerRef.current !== null) {
        window.clearTimeout(expiryTimerRef.current);
      }
      unsubscribeZonesRef.current?.();
      unsubscribeZonesRef.current = null;
    };
  }, []);

  return {
    isSharing,
    sessionId,
    currentLocation,
    expiresAt,
    startSharing,
    stopSharing,
  };
};
