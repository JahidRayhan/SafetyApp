import React, { useEffect, useState } from 'react';
import { MapPin, Share2, Shield, Navigation, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLiveLocationSharing } from '@/hooks/useLiveLocationSharing';

const LocationSharing = () => {
  const [initialLocation, setInitialLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const { toast } = useToast();
  const {
    isSharing,
    currentLocation,
    expiresAt,
    startSharing,
    stopSharing,
  } = useLiveLocationSharing();

  const location = currentLocation ?? initialLocation;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setInitialLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => console.warn('Initial location error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setInitialLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () =>
        toast({
          title: 'Location error',
          description: 'Unable to refresh your location.',
          variant: 'destructive',
        }),
    );
  };

  const openInMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
    }
  };

  const mapSrc = location
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`
    : null;

  const minutesLeft = expiresAt
    ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000))
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-emergency-600" />
          <h2 className="text-xl font-bold text-gray-900">Live Location Sharing</h2>
        </div>

        {location ? (
          <div className="space-y-4">
            {mapSrc && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  title="Location preview"
                  src={mapSrc}
                  width="100%"
                  height="240"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Current location</div>
              <div className="font-mono text-sm">
                <div>Lat: {location.lat.toFixed(6)}</div>
                <div>Lng: {location.lng.toFixed(6)}</div>
                {location.accuracy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {!isSharing ? (
                <button
                  onClick={() => startSharing()}
                  className="flex-1 bg-safe-600 hover:bg-safe-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Start Live Sharing</span>
                </button>
              ) : (
                <button
                  onClick={() => stopSharing('user')}
                  className="flex-1 bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <Shield className="w-5 h-5" />
                  <span>Stop Sharing</span>
                </button>
              )}

              <button
                onClick={refreshLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                aria-label="Refresh location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              <button
                onClick={openInMaps}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                aria-label="Open in Google Maps"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>

            {isSharing && (
              <div className="bg-safe-50 border border-safe-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-safe-500 rounded-full animate-pulse"></div>
                  <span className="text-safe-800 font-medium">Live sharing active</span>
                </div>
                <p className="text-safe-600 text-sm mt-2">
                  Updates are sent only when you move more than 50 m.{' '}
                  {minutesLeft !== null && (
                    <>Auto-stops in <strong>{minutesLeft} min</strong>.</>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Getting your location...</p>
            <button
              onClick={refreshLocation}
              className="mt-4 bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Enable Location
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">How it works</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Your emergency contacts receive an email with a map preview when sharing starts and again
            whenever you move more than 50 m. Sharing stops automatically after 60 minutes, when you
            cancel an SOS, or when you tap <strong>Stop Sharing</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSharing;
