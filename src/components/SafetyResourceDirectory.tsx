
import React, { useState } from 'react';
import { Phone, MapPin, Globe, Mail, Search, Shield, Users, Heart } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  category: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  description: string;
  availability: string;
}

const SafetyResourceDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Resources', icon: Shield },
    { id: 'emergency', label: 'Emergency Services', icon: Phone },
    { id: 'legal', label: 'Legal Help', icon: Users },
    { id: 'medical', label: 'Medical Support', icon: Heart },
    { id: 'counseling', label: 'Counseling', icon: Heart },
    { id: 'shelter', label: 'Safe Shelters', icon: Shield }
  ];

  const resources: Resource[] = [
    {
      id: '1',
      name: 'Emergency Services',
      category: 'emergency',
      phone: '911',
      description: 'Immediate emergency response for police, fire, and medical emergencies',
      availability: '24/7'
    },
    {
      id: '2',
      name: 'National Suicide Prevention Lifeline',
      category: 'counseling',
      phone: '988',
      website: 'https://suicidepreventionlifeline.org',
      description: 'Free and confidential emotional support for people in suicidal crisis',
      availability: '24/7'
    },
    {
      id: '3',
      name: 'National Domestic Violence Hotline',
      category: 'counseling',
      phone: '1-800-799-7233',
      website: 'https://www.thehotline.org',
      description: 'Confidential support for domestic violence survivors',
      availability: '24/7'
    },
    {
      id: '4',
      name: 'RAINN National Sexual Assault Hotline',
      category: 'counseling',
      phone: '1-800-656-4673',
      website: 'https://www.rainn.org',
      description: 'Support for survivors of sexual violence',
      availability: '24/7'
    },
    {
      id: '5',
      name: 'Legal Aid Society',
      category: 'legal',
      phone: '1-212-577-3300',
      website: 'https://www.legalaidnyc.org',
      email: 'info@legal-aid.org',
      description: 'Free legal services for low-income individuals',
      availability: 'Mon-Fri 9AM-5PM'
    },
    {
      id: '6',
      name: 'Crisis Text Line',
      category: 'counseling',
      phone: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org',
      description: 'Free, 24/7 support via text message',
      availability: '24/7'
    },
    {
      id: '7',
      name: 'National Safe Place',
      category: 'shelter',
      phone: '1-888-290-7233',
      website: 'https://www.nationalsafeplace.org',
      description: 'Immediate help and safety for youth in crisis',
      availability: '24/7'
    },
    {
      id: '8',
      name: 'Poison Control',
      category: 'medical',
      phone: '1-800-222-1222',
      website: 'https://www.poison.org',
      description: 'Emergency poison information and treatment advice',
      availability: '24/7'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Shield;
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.includes('Text')) return phone;
    if (phone === '911' || phone === '988') return phone;
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-safe-600" />
          <h2 className="text-xl font-bold text-gray-900">Safety Resource Directory</h2>
        </div>
        <p className="text-gray-600">
          Quick access to emergency services, legal help, counseling, and support resources.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-safe-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredResources.map((resource) => {
            const CategoryIcon = getCategoryIcon(resource.category);
            return (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-safe-100 p-3 rounded-lg flex-shrink-0">
                    <CategoryIcon className="w-6 h-6 text-safe-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {resource.availability}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    
                    <div className="space-y-2">
                      {/* Phone */}
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a
                          href={`tel:${resource.phone}`}
                          className="text-safe-600 hover:text-safe-700 font-medium"
                        >
                          {formatPhoneNumber(resource.phone)}
                        </a>
                      </div>
                      
                      {/* Email */}
                      {resource.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <a
                            href={`mailto:${resource.email}`}
                            className="text-safe-600 hover:text-safe-700"
                          >
                            {resource.email}
                          </a>
                        </div>
                      )}
                      
                      {/* Website */}
                      {resource.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-safe-600 hover:text-safe-700"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      
                      {/* Address */}
                      {resource.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{resource.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Emergency Notice */}
      <div className="bg-emergency-50 border border-emergency-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Phone className="w-5 h-5 text-emergency-600" />
          <h4 className="font-medium text-emergency-900">Emergency Reminder</h4>
        </div>
        <p className="text-emergency-700 text-sm">
          In case of immediate life-threatening emergency, call 911 or your local emergency number directly.
        </p>
      </div>
    </div>
  );
};

export default SafetyResourceDirectory;
