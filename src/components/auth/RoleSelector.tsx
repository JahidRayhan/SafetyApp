
import React from 'react';
import { User, UserCheck, Crown } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'user' | 'admin' | 'govt_admin';
  setSelectedRole: (role: 'user' | 'admin' | 'govt_admin') => void;
}

const RoleSelector = ({ selectedRole, setSelectedRole }: RoleSelectorProps) => {
  const roles = [
    { value: 'user', label: 'User', icon: User, description: 'Regular safety app user' },
    { value: 'admin', label: 'Admin', icon: UserCheck, description: 'Safety administrator (requires approval)' },
    { value: 'govt_admin', label: 'Government Admin', icon: Crown, description: 'Government official (requires approval)' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Account Type
      </label>
      <div className="grid grid-cols-1 gap-2">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <label
              key={role.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                selectedRole === role.value
                  ? 'border-emergency-500 bg-emergency-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="sr-only"
              />
              <Icon className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
