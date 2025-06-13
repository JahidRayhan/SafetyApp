import React, { useState, useEffect } from 'react';
import { Shield, MapPin, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SafeZone {
  id: string;
  name: string;
  description: string;
  zone_type: 'safe' | 'unsafe';
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  is_active: boolean;
  created_at: string;
}

const SafeZonesViewOnly = () => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSafeZones();
  }, []);

  const fetchSafeZones = async () => {
    try {
      const { data, error } = await supabase
        .from('safe_zones')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure zone_type is properly typed
      const typedData = data?.map(zone => ({
        ...zone,
        zone_type: zone.zone_type as 'safe' | 'unsafe'
      })) || [];
      
      setSafeZones(typedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load safe zones.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getZoneIcon = (zoneType: string) => {
    return zoneType === 'safe' ? Shield : AlertTriangle;
  };

  const getZoneColor = (zoneType: string) => {
    return zoneType === 'safe' ? 'text-safe-600' : 'text-emergency-600';
  };

  const getZoneBgColor = (zoneType: string) => {
    return zoneType === 'safe' ? 'bg-safe-50 border-safe-200' : 'bg-emergency-50 border-emergency-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-safe-600" />
          <h2 className="text-xl font-bold text-gray-900">Safe & Unsafe Zones</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-safe-50 border border-safe-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-safe-600" />
              <h3 className="font-medium text-safe-900">Safe Zones</h3>
            </div>
            <p className="text-safe-700 text-sm">
              Areas designated as safe with security presence or emergency services nearby.
            </p>
          </div>
          
          <div className="bg-emergency-50 border border-emergency-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-emergency-600" />
              <h3 className="font-medium text-emergency-900">Unsafe Zones</h3>
            </div>
            <p className="text-emergency-700 text-sm">
              Areas with reported incidents or safety concerns. Exercise caution when nearby.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {safeZones.map((zone) => {
            const Icon = getZoneIcon(zone.zone_type);
            return (
              <div key={zone.id} className={`border rounded-lg p-4 ${getZoneBgColor(zone.zone_type)}`}>
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 ${getZoneColor(zone.zone_type)} mt-1`} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{zone.name}</h3>
                    {zone.description && (
                      <p className="text-gray-700 text-sm mb-3">{zone.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Location:</span>
                        <div>{zone.center_lat.toFixed(4)}, {zone.center_lng.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Radius:</span>
                        <div>{zone.radius_meters}m</div>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <div className="capitalize">{zone.zone_type} Zone</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${zone.center_lat},${zone.center_lng}`;
                      window.open(url, '_blank');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-200"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {safeZones.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No safe zones have been created in your area yet.</p>
              <p className="text-sm text-gray-500 mt-1">Government administrators manage zone creation and updates.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Zone Information</h4>
        </div>
        <p className="text-blue-800 text-sm">
          Safe and unsafe zones are maintained by government administrators based on current safety data, 
          incident reports, and field assessments. Zones are regularly updated to ensure accuracy.
        </p>
      </div>
    </div>
  );
};

export default SafeZonesViewOnly;
