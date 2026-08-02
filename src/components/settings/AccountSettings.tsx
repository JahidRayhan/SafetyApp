
import React, { useState } from 'react';
import { Settings, User, Shield, FileText } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import DataPrivacySettings from './DataPrivacySettings';
import EmergencyPlanSettings from './EmergencyPlanSettings';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'emergency'>('profile');

  const tabs = [
    {
      id: 'profile',
      title: 'Profile Info',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'emergency',
      title: 'Emergency Plan',
      icon: FileText,
      description: 'Create and manage your emergency response plan'
    },
    {
      id: 'privacy',
      title: 'Data & Privacy',
      icon: Shield,
      description: 'Control your data and privacy settings'  
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
        </div>
        <p className="text-gray-600">
          Manage your profile information and privacy preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'privacy' | 'emergency')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'emergency' && <EmergencyPlanSettings />}
        {activeTab === 'privacy' && <DataPrivacySettings />}
      </div>
    </div>
  );
};

export default AccountSettings;
