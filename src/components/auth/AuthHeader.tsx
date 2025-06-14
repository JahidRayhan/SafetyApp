
import React from 'react';
import { Shield } from 'lucide-react';

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Shield className="w-8 h-8 text-emergency-600" />
        <h1 className="text-2xl font-bold text-gray-900">SafeGuard</h1>
      </div>
      <p className="text-gray-600">
        {isLogin ? 'Sign in to your account' : 'Create your safety account'}
      </p>
    </div>
  );
};

export default AuthHeader;
