import React from 'react';
import { 
  Shield, 
  MessageCircle, 
  Users, 
  BookOpen, 
  Phone, 
  MapPin, 
  Heart, 
  Map,
  FileText,
  Search,
  UserCheck,
  Settings
} from 'lucide-react';

interface FeatureCardsProps {
  userRole: 'user' | 'admin' | 'govt_admin';
  onFeatureClick: (feature: string) => void;
}

const FeatureCards = ({ userRole, onFeatureClick }: FeatureCardsProps) => {
  const getUserFeatures = () => [
    { id: 'safe-zones', icon: Shield, label: 'Safe Zones', color: 'bg-safe-50 text-safe-700' },
    { id: 'alerts', icon: MapPin, label: 'Alerts', color: 'bg-yellow-50 text-yellow-700' },
    { id: 'chatbot', icon: MessageCircle, label: 'AI Assistant', color: 'bg-blue-50 text-blue-700' },
    { id: 'community', icon: Users, label: 'Community', color: 'bg-purple-50 text-purple-700' },
    { id: 'resources', icon: BookOpen, label: 'Resources', color: 'bg-green-50 text-green-700' },
    { id: 'emergency-contacts', icon: Phone, label: 'Emergency Contacts', color: 'bg-red-50 text-red-700' },
    { id: 'location-sharing', icon: Map, label: 'Location Sharing', color: 'bg-indigo-50 text-indigo-700' },
    { id: 'emotional-support', icon: Heart, label: 'Emotional Support', color: 'bg-pink-50 text-pink-700' },
    { id: 'incident-reporting', icon: FileText, label: 'Report Incident', color: 'bg-orange-50 text-orange-700' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'bg-gray-50 text-gray-700' }
  ];

  const getAdminFeatures = () => [
    { id: 'chatbot', icon: MessageCircle, label: 'AI Assistant', color: 'bg-blue-50 text-blue-700' },
    { id: 'community', icon: Users, label: 'Community', color: 'bg-purple-50 text-purple-700' },
    { id: 'resources', icon: BookOpen, label: 'Resources', color: 'bg-green-50 text-green-700' },
    { id: 'review-requests', icon: UserCheck, label: 'Review Requests', color: 'bg-orange-50 text-orange-700' }
  ];

  const getGovtAdminFeatures = () => [
    { id: 'chatbot', icon: MessageCircle, label: 'AI Assistant', color: 'bg-blue-50 text-blue-700' },
    { id: 'community', icon: Users, label: 'Community', color: 'bg-purple-50 text-purple-700' },
    { id: 'resources', icon: BookOpen, label: 'Resources', color: 'bg-green-50 text-green-700' },
    { id: 'data-request', icon: Search, label: 'Data Requests', color: 'bg-red-50 text-red-700' }
  ];

  let features;
  switch (userRole) {
    case 'admin':
      features = getAdminFeatures();
      break;
    case 'govt_admin':
      features = getGovtAdminFeatures();
      break;
    default:
      features = getUserFeatures();
  }

  // For user role, we need special layout handling
  if (userRole === 'user') {
    // Safe Zones and Alerts should be center-aligned under the SOS button
    const safeZones = features.find(f => f.id === 'safe-zones');
    const alerts = features.find(f => f.id === 'alerts');
    const otherFeatures = features.filter(f => f.id !== 'safe-zones' && f.id !== 'alerts');

    return (
      <div className="space-y-6">
        {/* Safe Zones and Alerts - centered under SOS */}
        <div className="flex justify-center gap-4">
          {safeZones && (
            <div
              onClick={() => onFeatureClick(safeZones.id)}
              className={`${safeZones.color} p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-40 text-center`}
            >
              <safeZones.icon className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold">{safeZones.label}</h3>
            </div>
          )}
          {alerts && (
            <div
              onClick={() => onFeatureClick(alerts.id)}
              className={`${alerts.color} p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-40 text-center`}
            >
              <alerts.icon className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold">{alerts.label}</h3>
            </div>
          )}
        </div>

        {/* Other features in grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => onFeatureClick(feature.id)}
                className={`${feature.color} p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-sm">{feature.label}</h3>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For admin and govt_admin - simple 2x2 grid
  return (
    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.id}
            onClick={() => onFeatureClick(feature.id)}
            className={`${feature.color} p-8 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center`}
          >
            <Icon className="w-10 h-10 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">{feature.label}</h3>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCards;
