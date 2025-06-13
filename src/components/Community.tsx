
import React, { useState } from 'react';
import { Heart, Users, BookOpen, MessageCircle } from 'lucide-react';
import EmotionalSupport from './EmotionalSupport';
import MeditationSessions from './MeditationSessions';
import PersonalStories from './PersonalStories';

const Community = () => {
  const [activeSection, setActiveSection] = useState('support');

  const sections = [
    {
      id: 'support',
      title: 'Emotional Support',
      icon: Heart,
      description: 'Get emotional support and counseling resources'
    },
    {
      id: 'meditation',
      title: 'Meditation & Wellness',
      icon: Users,
      description: 'Access guided meditation and wellness sessions'
    },
    {
      id: 'stories',
      title: 'Share Your Story',
      icon: MessageCircle,
      description: 'Share experiences and connect with others'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'support':
        return <EmotionalSupport />;
      case 'meditation':
        return <MeditationSessions />;
      case 'stories':
        return <PersonalStories />;
      default:
        return <EmotionalSupport />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Community Support</h2>
            <p className="text-gray-600">Connect, heal, and grow with our supportive community</p>
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
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
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
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-700">
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

export default Community;
