
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Shield, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SafeZoneMapPicker from './SafeZoneMapPicker';
import { safeZoneService } from '@/features/geofencing/services/safeZoneService';
import { useGeofencingStore } from '@/stores';
import type { SafeZone as DomainSafeZone, SafeZoneType } from '@/features/geofencing/domain/types';
import { panelBase, panelHeader, rowBetween, stackLoose } from '@/shared/ui/styles';
import { mergeClasses } from '@/shared/lib/styles';

type SafeZone = DomainSafeZone;

const SafeZoneManager = () => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    center_lat: 0,
    center_lng: 0,
    radius_meters: 500,
    zone_type: 'safe'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSafeZones();
    return safeZoneService.subscribe('safe_zones-manager', () => {
      void fetchSafeZones();
    });
  }, []);

  const fetchSafeZones = async () => {
    try {
      const zones = await safeZoneService.listActive();
      setSafeZones(zones);
      useGeofencingStore.getState().setZones(zones);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load safe zones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewZone(prev => ({
            ...prev,
            center_lat: position.coords.latitude,
            center_lng: position.coords.longitude
          }));
          toast({
            title: "Location captured",
            description: "Your current location has been set for the safe zone.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const addSafeZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await safeZoneService.create({
        name: newZone.name,
        description: newZone.description || null,
        zoneType: newZone.zone_type as SafeZoneType,
        center: { lat: newZone.center_lat, lng: newZone.center_lng } as DomainSafeZone['center'],
        radius: newZone.radius_meters as DomainSafeZone['radius'],
      });

      toast({
        title: "Safe zone added!",
        description: "The safe zone has been created successfully.",
      });

      setShowAddForm(false);
      setNewZone({
        name: '',
        description: '',
        center_lat: 0,
        center_lng: 0,
        radius_meters: 500,
        zone_type: 'safe'
      });
      fetchSafeZones();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case 'safe':
        return <Shield className="w-5 h-5 text-safe-600" />;
      case 'unsafe':
        return <AlertTriangle className="w-5 h-5 text-emergency-600" />;
      case 'under_investigation':
        return <Search className="w-5 h-5 text-warning-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const getZoneColor = (zoneType: string) => {
    switch (zoneType) {
      case 'safe':
        return 'border-safe-200 bg-safe-50';
      case 'unsafe':
        return 'border-emergency-200 bg-emergency-50';
      case 'under_investigation':
        return 'border-warning-200 bg-warning-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={stackLoose}>
      <div className={panelBase}>
        <div className={mergeClasses(rowBetween, "mb-6")}>
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-safe-600" />
            <h2 className={panelHeader}>Safe Zones</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-safe-600 hover:bg-safe-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={addSafeZone} className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
                  placeholder="Home, Office, School..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Type
                </label>
                <select
                  value={newZone.zone_type}
                  onChange={(e) => setNewZone(prev => ({ ...prev, zone_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
                >
                  <option value="safe">Safe Zone</option>
                  <option value="unsafe">Unsafe Zone</option>
                  <option value="under_investigation">Under Investigation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newZone.description}
                onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pick center on map (click or drag the marker)
              </label>
              <SafeZoneMapPicker
                center={{ lat: newZone.center_lat, lng: newZone.center_lng }}
                radius={newZone.radius_meters}
                onChange={({ lat, lng }) =>
                  setNewZone((prev) => ({ ...prev, center_lat: lat, center_lng: lng }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={newZone.center_lat}
                  onChange={(e) => setNewZone(prev => ({ ...prev, center_lat: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={newZone.center_lng}
                  onChange={(e) => setNewZone(prev => ({ ...prev, center_lng: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius: {newZone.radius_meters} m
                </label>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={10}
                  value={newZone.radius_meters}
                  onChange={(e) => setNewZone(prev => ({ ...prev, radius_meters: parseInt(e.target.value) }))}
                  className="w-full accent-safe-600"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Use Current Location
              </button>
              <button
                type="submit"
                className="bg-safe-600 hover:bg-safe-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Create Zone
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {safeZones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No safe zones configured yet.</p>
              <p className="text-sm">Add your first safe zone to get started!</p>
            </div>
          ) : (
            safeZones.map((zone) => (
              <div
                key={zone.id}
                className={`border-2 rounded-lg p-4 ${getZoneColor(zone.zoneType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getZoneIcon(zone.zoneType)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      {zone.description && (
                        <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        <span>Radius: {zone.radius}m</span> • 
                        <span className="ml-1">
                          {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://maps.google.com/?q=${zone.center.lat},${zone.center.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View on Map
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeZoneManager;
