
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import AuthForm from '@/components/AuthForm';
import TopNavigation from '@/components/TopNavigation';
import LandingPage from '@/components/LandingPage';
import CoreFeatures from '@/components/CoreFeatures';
import AdminHome from '@/components/AdminHome';
import GovernmentAdminHome from '@/components/GovernmentAdminHome';
import Community from '@/components/Community';
import ContentRenderer from '@/components/dashboard/ContentRenderer';
import EmergencyButton from '@/components/EmergencyButton';
import ScreamDetection from '@/components/ScreamDetection';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile(user);
  const [activeTab, setActiveTab] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emergency-50 to-emergency-100 flex items-center justify-center">
        <div className="animate-pulse text-emergency-600 text-lg">Loading SafeGuard...</div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user && !showAuth) {
    return (
      <LandingPage 
        onGetStarted={() => setShowAuth(true)} 
      />
    );
  }

  // Show auth form when requested
  if (!user && showAuth) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  const userRole = profile?.role || 'user';

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            {userRole === 'admin' ? (
              <AdminHome onFeatureSelect={setActiveTab} />
            ) : userRole === 'govt_admin' ? (
              <GovernmentAdminHome onFeatureSelect={setActiveTab} />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SafeGuard</h1>
                <p className="text-gray-600 mb-8">Your personal safety dashboard</p>
                <CoreFeatures onFeatureSelect={setActiveTab} />
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'sos' && userRole === 'user') {
      return (
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center">
            <EmergencyButton />
          </div>
        </div>
      );
    }

    if (activeTab === 'community') {
      return (
        <div className="container mx-auto px-4 py-6">
          <Community />
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <ContentRenderer activeTab={activeTab} userRole={userRole} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emergency-50 to-emergency-100">
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderContent()}
      </main>
      
      {/* Background scream detection after SOS - only for users */}
      {userRole === 'user' && (
        <ScreamDetection 
          isActive={isSOSActive} 
          onDetection={() => {
            toast({
              title: "Distress Detected",
              description: "Additional alert sent based on audio detection.",
              variant: "destructive",
            });
          }} 
        />
      )}
    </div>
  );
};

export default Index;
