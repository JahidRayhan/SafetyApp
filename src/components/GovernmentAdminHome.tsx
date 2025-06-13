
import React from 'react';
import { 
  Shield, 
  FileSearch, 
  BarChart3, 
  MapPin, 
  Users, 
  Activity,
  MessageSquare,
  Bell,
  BookOpen,
  Database
} from 'lucide-react';

interface GovernmentAdminHomeProps {
  onFeatureSelect: (feature: string) => void;
}

const GovernmentAdminHome = ({ onFeatureSelect }: GovernmentAdminHomeProps) => {
  const govFeatures = [
    {
      id: 'activity-log',
      title: 'System Monitoring',
      description: 'Monitor all system activities and user interactions',
      icon: Activity,
      color: 'bg-blue-600',
      category: 'primary'
    },
    {
      id: 'govt-requests',
      title: 'Data Requests',
      description: 'Submit and track government data requests',
      icon: FileSearch,
      color: 'bg-red-600',
      category: 'primary'
    },
    {
      id: 'user-info',
      title: 'User Information',
      description: 'Access comprehensive user data and profiles',
      icon: Users,
      color: 'bg-purple-600',
      category: 'primary'
    },
    {
      id: 'chatbot',
      title: 'AI Assistant',
      description: 'Government-level AI support and assistance',
      icon: MessageSquare,
      color: 'bg-green-600',
      category: 'secondary'
    },
    {
      id: 'community',
      title: 'Community Oversight',
      description: 'Monitor community activities and content',
      icon: Users,
      color: 'bg-orange-600',
      category: 'secondary'
    },
    {
      id: 'request',
      title: 'Data Analytics',
      description: 'Generate comprehensive system reports',
      icon: BarChart3,
      color: 'bg-indigo-600',
      category: 'secondary'
    },
    {
      id: 'alerts',
      title: 'Alert Management',
      description: 'Manage system-wide alerts and notifications',
      icon: Bell,
      color: 'bg-yellow-600',
      category: 'secondary'
    },
    {
      id: 'resources',
      title: 'Resource Management',
      description: 'Manage public safety resources and content',
      icon: BookOpen,
      color: 'bg-teal-600',
      category: 'secondary'
    }
  ];

  const primaryFeatures = govFeatures.filter(f => f.category === 'primary');
  const secondaryFeatures = govFeatures.filter(f => f.category === 'secondary');

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Admin Dashboard</h1>
        <p className="text-gray-600">Comprehensive oversight and data management tools</p>
      </div>

      {/* Primary Government Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Government Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryFeatures.map((feature) => {
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
      </div>

      {/* Secondary Government Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => onFeatureSelect(feature.id)}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-left"
              >
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-md font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-xs">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Government Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Government Oversight Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">23</div>
            <div className="text-sm text-gray-600">Active Incidents</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Safe Zones</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentAdminHome;
