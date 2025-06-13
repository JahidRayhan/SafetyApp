
import React, { useState } from 'react';
import { Heart, Phone, MessageCircle, ExternalLink } from 'lucide-react';

const EmotionalSupport = () => {
  const [selectedCategory, setSelectedCategory] = useState('crisis');

  const supportCategories = [
    {
      id: 'crisis',
      title: 'Crisis Support',
      description: 'Immediate help for crisis situations',
      resources: [
        { name: 'National Suicide Prevention Lifeline', phone: '988', available: '24/7' },
        { name: 'Crisis Text Line', phone: 'Text HOME to 741741', available: '24/7' },
        { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', available: '24/7' }
      ]
    },
    {
      id: 'counseling',
      title: 'Professional Counseling',
      description: 'Access to mental health professionals',
      resources: [
        { name: 'BetterHelp Online Therapy', phone: 'Visit betterhelp.com', available: 'Online' },
        { name: 'NAMI Helpline', phone: '1-800-950-6264', available: 'Mon-Fri 10am-10pm ET' },
        { name: 'Psychology Today Directory', phone: 'Visit psychologytoday.com', available: 'Online' }
      ]
    },
    {
      id: 'support',
      title: 'Support Groups',
      description: 'Connect with others who understand',
      resources: [
        { name: 'SMART Recovery', phone: 'Visit smartrecovery.org', available: 'Various times' },
        { name: 'Al-Anon Family Groups', phone: '1-888-425-2666', available: 'Various times' },
        { name: 'NAMI Support Groups', phone: 'Visit nami.org', available: 'Various times' }
      ]
    }
  ];

  const currentCategory = supportCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="w-6 h-6 text-pink-600" />
          <h2 className="text-xl font-bold text-gray-900">Emotional Support Resources</h2>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {supportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Current Category */}
        {currentCategory && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentCategory.title}</h3>
            <p className="text-gray-600 mb-4">{currentCategory.description}</p>

            <div className="grid gap-4">
              {currentCategory.resources.map((resource, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{resource.name}</h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{resource.phone}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Available: {resource.available}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-900">Emergency Notice</h3>
        </div>
        <p className="text-red-700 mt-2 text-sm">
          If you're experiencing a mental health emergency, please call 911 or go to your nearest emergency room immediately.
        </p>
      </div>
    </div>
  );
};

export default EmotionalSupport;
