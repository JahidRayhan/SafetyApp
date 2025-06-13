
import React from 'react';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users,
  UserCheck,
  FileSearch,
  Shield
} from 'lucide-react';

export const getNavigationItems = (userRole: string) => {
  switch (userRole) {
    case 'user':
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'incident-report', label: 'Report', icon: FileText },
        { id: 'chatbot', label: 'Chatbot', icon: MessageSquare },
        { id: 'community', label: 'Community', icon: Users }
      ];
    case 'admin':
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'incident-report', label: 'Report', icon: FileText },
        { id: 'user-info', label: 'User Info', icon: UserCheck },
        { id: 'admin-requests', label: 'Requests', icon: FileSearch }
      ];
    case 'govt_admin':
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'incident-report', label: 'Report', icon: FileText },
        { id: 'review-requests', label: 'Review Requests', icon: FileSearch },
        { id: 'safezones', label: 'Manage Zones', icon: Shield }
      ];
    default:
      return [
        { id: 'home', label: 'Home', icon: Home }
      ];
  }
};

interface NavigationItemsProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationItems = ({ userRole, activeTab, onTabChange }: NavigationItemsProps) => {
  const navigationItems = getNavigationItems(userRole);

  return (
    <div className="hidden lg:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-emergency-100 text-emergency-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationItems;
