import React, { useState } from 'react';
import { Users, Heart, Headphones, BookOpen, MessageSquare } from 'lucide-react';
import EmotionalSupportManagement from './admin/EmotionalSupportManagement';
import MeditationManagement from './admin/MeditationManagement';
import StoriesModeration from './admin/StoriesModeration';

const CommunityManagement = () => {
  const [activeSection, setActiveSection] = useState('emotional-support');

  const sections = [
    {
      id: 'emotional-support',
      title: 'Emotional Support Resources',
      icon: Heart,
      description: 'Add/change emotional support resources'
    },
    {
      id: 'meditation',
      title: 'Meditation & Wellness',
      icon: Headphones,
      description: 'Manage meditation sessions and wellness content'
    },
    {
      id: 'stories',
      title: 'Stories Moderation',
      icon: MessageSquare,
      description: 'Approve/reject stories submitted by users'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'emotional-support':
        return <EmotionalSupportManagement />;
      case 'meditation':
        return <MeditationManagement />;
      case 'stories':
        return <StoriesModeration />;
      default:
        return <EmotionalSupportManagement />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Community Management</h2>
            <p className="text-gray-600">Manage emotional support resources, meditation sessions, and user stories</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Section Description */}
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <p className="text-orange-700">
            {sections.find(s => s.id === activeSection)?.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunityManagement;