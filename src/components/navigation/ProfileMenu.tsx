import React, { useState } from 'react';
import { LogOut, User, Settings, Activity } from 'lucide-react';
import { authService } from '@/features/auth/services/authService';

interface ProfileMenuProps {
  profile: { fullName: string | null } | null;
  userRole: string;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
  onTabChange: (tab: string) => void;
}

const ProfileMenu = ({
  profile,
  userRole,
  showProfileMenu,
  setShowProfileMenu,
  onTabChange
}: ProfileMenuProps) => {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <div className="w-8 h-8 bg-emergency-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-medium">
          {profile?.fullName || 'User'}
        </span>
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b">
            <p className="text-sm font-medium text-gray-900">
              {profile?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole.replace('_', ' ')}
            </p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                onTabChange('settings');
                setShowProfileMenu(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                onTabChange('activity-log');
                setShowProfileMenu(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
