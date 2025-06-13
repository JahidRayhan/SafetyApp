
import React from 'react';
import { Shield } from 'lucide-react';

interface DashboardHeaderProps {
  userRole: string;
}

const DashboardHeader = ({ userRole }: DashboardHeaderProps) => {
  const getRoleTitle = () => {
    switch (userRole) {
      case 'user':
        return 'User Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'govt_admin':
        return 'Government Admin Dashboard';
      default:
        return 'User Dashboard';
    }
  };

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <Shield className="w-12 h-12 text-emergency-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SafeGuard</h1>
          <p className="text-gray-600">{getRoleTitle()}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
