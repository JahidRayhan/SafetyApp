
import React, { useState, useEffect } from 'react';
import { MapPin, Share2, Users, Shield, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LocationSharing = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setAccuracy(position.coords.accuracy);
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enable location services.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const saveLocationToHistory = async (lat: number, lng: number, accuracy: number) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('location_history')
        .insert({
          user_id: user.user.id,
          lat,
          lng,
          accuracy
        });
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        
        // Save to location history
        saveLocationToHistory(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
      },
      (error) => {
        toast({
          title: "Location Sharing Error",
          description: "Unable to track location continuously.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setWatchId(id);
    setIsSharing(true);
    
    toast({
      title: "Location Sharing Started",
      description: "Your location is now being shared with your emergency contacts.",
    });
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    
    toast({
      title: "Location Sharing Stopped",
      description: "Your location is no longer being shared.",
    });
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-emergency-600" />
          <h2 className="text-xl font-bold text-gray-900">Location Sharing</h2>
        </div>

        {location ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Current Location:</div>
              <div className="font-mono text-sm">
                <div>Lat: {location.lat.toFixed(6)}</div>
                <div>Lng: {location.lng.toFixed(6)}</div>
                {accuracy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Accuracy: ±{Math.round(accuracy)}m
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {!isSharing ? (
                <button
                  onClick={startSharing}
                  className="flex-1 bg-safe-600 hover:bg-safe-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Start Sharing</span>
                </button>
              ) : (
                <button
                  onClick={stopSharing}
                  className="flex-1 bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <Shield className="w-5 h-5" />
                  <span>Stop Sharing</span>
                </button>
              )}
              
              <button
                onClick={getCurrentLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
              >
                <MapPin className="w-5 h-5" />
              </button>

              <button
                onClick={openInMaps}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>

            {isSharing && (
              <div className="bg-safe-50 border border-safe-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-safe-500 rounded-full animate-pulse"></div>
                  <span className="text-safe-800 font-medium">Location sharing active</span>
                </div>
                <p className="text-safe-600 text-sm mt-2">
                  Your emergency contacts can see your real-time location.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Getting your location...</p>
            <button
              onClick={getCurrentLocation}
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
          <h3 className="text-lg font-bold text-gray-900">Location History</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Your location history is automatically saved when sharing is active. 
            This helps emergency services locate you quickly if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSharing;
