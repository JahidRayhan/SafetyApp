
import React from 'react';
import { getNavigationItems } from './NavigationItems';

interface MobileMenuProps {
  userRole: string;
  activeTab: string;
  isMobileMenuOpen: boolean;
  onTabChange: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileMenu = ({ 
  userRole, 
  activeTab, 
  isMobileMenuOpen, 
  onTabChange, 
  setIsMobileMenuOpen 
}: MobileMenuProps) => {
  const navigationItems = getNavigationItems(userRole);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="lg:hidden border-t bg-white">
      <div className="grid grid-cols-2 gap-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
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
    </div>
  );
};

export default MobileMenu;
