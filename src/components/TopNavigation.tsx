
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Shield, Menu, X } from 'lucide-react';
import NavigationItems from '@/components/navigation/NavigationItems';
import ProfileMenu from '@/components/navigation/ProfileMenu';
import MobileMenu from '@/components/navigation/MobileMenu';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userRole = profile?.role || 'user';

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-emergency-600" />
            <span className="text-xl font-bold text-gray-900">SafeGuard</span>
          </div>

          {/* Desktop Navigation */}
          <NavigationItems 
            userRole={userRole}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Profile menu */}
            <ProfileMenu
              profile={profile}
              userRole={userRole}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onTabChange={onTabChange}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <MobileMenu
          userRole={userRole}
          activeTab={activeTab}
          isMobileMenuOpen={isMobileMenuOpen}
          onTabChange={onTabChange}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      {/* Overlay for profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
};

export default TopNavigation;
