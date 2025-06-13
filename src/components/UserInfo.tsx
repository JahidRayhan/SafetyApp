
import React, { useState } from 'react';
import { Users, FileText, Search } from 'lucide-react';
import UserRecordingsView from '@/components/UserRecordingsView';
import UserContactsView from '@/components/UserContactsView';

const UserInfo = () => {
  const [activeTab, setActiveTab] = useState<'recordings' | 'contacts'>('recordings');

  const tabs = [
    {
      id: 'recordings' as const,
      label: 'User Media',
      icon: FileText,
      description: 'Access user recordings and media files'
    },
    {
      id: 'contacts' as const,
      label: 'Emergency Contacts',
      icon: Users,
      description: 'View user emergency contact information'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Information</h2>
            <p className="text-gray-600">Consolidated view of user data for moderation and support</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Description */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'recordings' ? <UserRecordingsView /> : <UserContactsView />}
      </div>
    </div>
  );
};

export default UserInfo;
