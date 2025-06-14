
import React, { useEffect, useState } from 'react';
import { MapPin, AlertTriangle, Shield } from 'lucide-react';
import { useLocationAlerts } from '@/hooks/useLocationAlerts';

const LocationTracker = () => {
  const { currentAlerts, isTracking, startLocationTracking, clearAlerts } = useLocationAlerts();
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (trackingEnabled) {
      cleanup = startLocationTracking();
    }

    return cleanup;
  }, [trackingEnabled, startLocationTracking]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Location Tracking</h3>
        </div>
        
        <button
          onClick={() => setTrackingEnabled(!trackingEnabled)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            trackingEnabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {trackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>

      {isTracking && (
        <div className="flex items-center space-x-2 text-green-600 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Location tracking active</span>
        </div>
      )}

      {currentAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Active Zone Alerts</h4>
            <button
              onClick={clearAlerts}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          {currentAlerts.map((alert) => (
            <div
              key={alert.zone_id}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                alert.zone_type === 'danger'
                  ? 'bg-red-50 border border-red-200'
                  : alert.zone_type === 'safe'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              {alert.zone_type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{alert.zone_name}</h5>
                <p className="text-sm text-gray-600 mt-1">{alert.alert_message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Distance: {Math.round(alert.distance_meters)}m
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Location tracking helps you receive alerts when entering safe or danger zones. 
          Your location data is encrypted and only shared with your emergency contacts when needed.
        </p>
      </div>
    </div>
  );
};

export default LocationTracker;
