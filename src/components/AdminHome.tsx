
import React from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  Activity,
  Bell,
  Settings,
  UserCheck
} from 'lucide-react';

interface AdminHomeProps {
  onFeatureSelect: (feature: string) => void;
}

const AdminHome = ({ onFeatureSelect }: AdminHomeProps) => {
  const adminFeatures = [
    {
      id: 'activity-log',
      title: 'Activity Monitoring',
      description: 'Monitor system and user activities',
      icon: Activity,
      color: 'bg-blue-500',
      category: 'primary'
    },
    {
      id: 'govt-requests',
      title: 'Government Requests',
      description: 'Handle government data requests',
      icon: FileText,
      color: 'bg-red-500',
      category: 'primary'
    },
    {
      id: 'review-requests',
      title: 'Review Requests',
      description: 'Review and approve admin requests',
      icon: Shield,
      color: 'bg-purple-500',
      category: 'primary'
    },
    {
      id: 'chatbot',
      title: 'AI Assistant',
      description: 'Access administrative chatbot support',
      icon: MessageSquare,
      color: 'bg-green-500',
      category: 'secondary'
    },
    {
      id: 'community',
      title: 'Community Management',
      description: 'Moderate community content and users',
      icon: Users,
      color: 'bg-orange-500',
      category: 'secondary'
    },
    {
      id: 'resources',
      title: 'Resource Management',
      description: 'Edit and manage safety resources',
      icon: BookOpen,
      color: 'bg-teal-500',
      category: 'secondary'
    },
    {
      id: 'alerts',
      title: 'Alert System',
      description: 'Manage system-wide alerts and notifications',
      icon: Bell,
      color: 'bg-yellow-500',
      category: 'secondary'
    },
    {
      id: 'request',
      title: 'Data Analytics',
      description: 'Generate reports and analytics',
      icon: BarChart3,
      color: 'bg-indigo-500',
      category: 'secondary'
    }
  ];

  const primaryFeatures = adminFeatures.filter(f => f.category === 'primary');
  const secondaryFeatures = adminFeatures.filter(f => f.category === 'secondary');

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, content, and system operations</p>
      </div>

      {/* Primary Admin Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Secondary Admin Features */}
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

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">247</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">99.2%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
