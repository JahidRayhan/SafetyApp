
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
      id: 'activity-monitoring',
      title: 'Activity Monitoring',
      description: 'A log to keep track of actions for all users across all roles',
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      id: 'alerts',
      title: 'SOS Alerts',
      description: 'Review recent SOS alerts, check delivery status, and resend failed notifications',
      icon: Bell,
      color: 'bg-red-500'
    },
    {
      id: 'review-requests',
      title: 'Review Requests',
      description: 'Accept admin/govt admin signup requests and review user info requests',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      id: 'community-management',
      title: 'Community Management',
      description: 'Manage emotional support resources, meditation sessions, and approve stories',
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      id: 'safety-resources',
      title: 'Safety Resources',
      description: 'View safety resources directory',
      icon: BookOpen,
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, content, and system operations</p>
      </div>

      {/* Admin Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Administration Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminFeatures.map((feature) => {
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
