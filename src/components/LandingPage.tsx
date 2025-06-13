
import React from 'react';
import { Shield, Download, ArrowRight, MapPin, Users, Video, Phone, Home, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const coreFeatures = [
    {
      id: 'location',
      title: 'Location Sharing',
      description: 'Share your real-time location with emergency contacts',
      icon: MapPin,
      color: 'bg-blue-500'
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      description: 'Manage trusted contacts for emergency situations',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'recording',
      title: 'Evidence Recording',
      description: 'Record audio and video evidence securely',
      icon: Video,
      color: 'bg-purple-500'
    },
    {
      id: 'fakecall',
      title: 'Fake Call',
      description: 'Schedule fake calls to exit uncomfortable situations',
      icon: Phone,
      color: 'bg-orange-500'
    },
    {
      id: 'safezones',
      title: 'Safe Zones',
      description: 'Discover and navigate to verified safe locations',
      icon: Home,
      color: 'bg-teal-500'
    },
    {
      id: 'resources',
      title: 'Safety Resources',
      description: 'Access comprehensive safety guides and resources',
      icon: BookOpen,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emergency-50 to-emergency-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-emergency-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">SafeGuard</h1>
              <p className="text-xl text-gray-600">Your Personal Safety Companion</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Stay protected with our comprehensive safety platform. Access emergency features, 
            connect with trusted contacts, and get help when you need it most.
          </p>

          {/* Mobile App Downloads */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Download className="w-5 h-5" />
              <span>Download for iOS</span>
            </button>
            <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              <span>Download for Android</span>
            </button>
          </div>

          {/* Get Started Button */}
          <button
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2 bg-emergency-600 text-white px-8 py-4 rounded-lg hover:bg-emergency-700 transition-colors text-lg font-semibold"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Alert Interface Highlight */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emergency-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Alert System</h2>
          <p className="text-gray-700 mb-6">
            Instant emergency alerts with automatic location sharing and contact notification. 
            Your safety is our priority.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-emergency-600 text-white px-6 py-3 rounded-lg hover:bg-emergency-700 transition-colors"
          >
            Access Emergency Features
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
