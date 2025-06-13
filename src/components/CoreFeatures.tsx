
import React from 'react';
import { Shield, Users, MapPin, Video, Phone, FileText, MessageSquare, BookOpen, Bell, Activity } from 'lucide-react';

interface CoreFeaturesProps {
  onFeatureSelect: (feature: string) => void;
}

const CoreFeatures = ({ onFeatureSelect }: CoreFeaturesProps) => {
  const features = [
    {
      id: 'sos',
      title: 'Emergency SOS',
      description: 'Instant emergency alert with location sharing',
      icon: Shield,
      color: 'bg-red-500',
      priority: 1
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      description: 'Manage trusted contacts for emergencies',
      icon: Users,
      color: 'bg-blue-500',
      priority: 2
    },
    {
      id: 'location',
      title: 'Location Sharing',
      description: 'Share your real-time location',
      icon: MapPin,
      color: 'bg-green-500',
      priority: 3
    },
    {
      id: 'recording',
      title: 'Evidence Recording',
      description: 'Record audio and video evidence',
      icon: Video,
      color: 'bg-purple-500',
      priority: 4
    },
    {
      id: 'fakecall',
      title: 'Fake Call',
      description: 'Schedule fake calls to exit situations',
      icon: Phone,
      color: 'bg-orange-500',
      priority: 5
    },
    {
      id: 'safezones',
      title: 'Safe Zones',
      description: 'Find verified safe locations nearby',
      icon: Shield,
      color: 'bg-teal-500',
      priority: 6
    },
    {
      id: 'resources',
      title: 'Safety Resources',
      description: 'Access safety guides and resources',
      icon: BookOpen,
      color: 'bg-indigo-500',
      priority: 7
    },
    {
      id: 'alerts',
      title: 'Safety Alerts',
      description: 'Receive and manage safety notifications',
      icon: Bell,
      color: 'bg-yellow-500',
      priority: 8
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <button
            key={feature.id}
            onClick={() => onFeatureSelect(feature.id)}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default CoreFeatures;
