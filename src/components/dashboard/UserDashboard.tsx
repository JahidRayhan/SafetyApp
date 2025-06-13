
import React from 'react';
import EmergencyButton from '@/components/EmergencyButton';
import FeatureCards from './FeatureCards';

const UserDashboard = () => {
  const handleFeatureClick = (feature: string) => {
    console.log('Feature clicked:', feature);
    // Handle feature navigation here
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Centered SOS Button */}
      <div className="flex justify-center py-8">
        <EmergencyButton />
      </div>

      {/* Feature Grid */}
      <FeatureCards userRole="user" onFeatureClick={handleFeatureClick} />
    </div>
  );
};

export default UserDashboard;
