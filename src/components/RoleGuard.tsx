
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: ('user' | 'admin' | 'govt_admin')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Shield className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const userRole = profile?.role || 'user';
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback || (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You don't have permission to access this feature.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
