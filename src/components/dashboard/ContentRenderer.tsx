
import React from 'react';
import LocationSharing from '@/components/LocationSharing';
import EmergencyContacts from '@/components/EmergencyContacts';
import Settings from '@/components/Settings';
import RecordingPanel from '@/components/RecordingPanel';
import IncidentReporting from '@/components/IncidentReporting';
import FakeCallScheduler from '@/components/FakeCallScheduler';
import SafeZoneManager from '@/components/SafeZoneManager';
import SafeZonesViewOnly from '@/components/SafeZonesViewOnly';
import UserInfo from '@/components/UserInfo';
import AdminRequests from '@/components/AdminRequests';
import GovernmentRequests from '@/components/GovernmentRequests';
import ChatbotSupport from '@/components/ChatbotSupport';
import SafetyResourceDirectory from '@/components/SafetyResourceDirectory';
import ActivityHistory from '@/components/ActivityHistory';
import ActivityLog from '@/components/ActivityLog';
import AlertSystem from '@/components/AlertSystem';
import ReviewRequests from '@/components/ReviewRequests';
import DataRequest from '@/components/DataRequest';
import ActivityMonitoring from '@/components/ActivityMonitoring';
import CommunityManagement from '@/components/CommunityManagement';
import SOSAlertsPanel from '@/components/admin/SOSAlertsPanel';

interface ContentRendererProps {
  activeTab: string;
  userRole: string;
}

const ContentRenderer = ({ activeTab, userRole }: ContentRendererProps) => {
  switch (activeTab) {
    case 'location':
      return <LocationSharing />;
    case 'contacts':
      return <EmergencyContacts />;
    case 'recording':
      return <RecordingPanel />;
    case 'incident-report':
      return <IncidentReporting />;
    case 'fakecall':
      return <FakeCallScheduler />;
    case 'safezones':
      return userRole === 'govt_admin' ? <SafeZoneManager /> : <SafeZonesViewOnly />;
    case 'chatbot':
      return <ChatbotSupport />;
    case 'settings':
      return <Settings />;
    case 'user-info':
      return <UserInfo />;
    case 'admin-requests':
      return <AdminRequests />;
    case 'govt-requests':
      return <GovernmentRequests />;
    case 'resources':
    case 'safety-resources':
      return <SafetyResourceDirectory />;
    case 'activity-monitoring':
      return <ActivityMonitoring />;
    case 'community-management':
      return <CommunityManagement />;
    case 'activity':
      return <ActivityHistory />;
    case 'activity-log':
      return <ActivityLog />;
    case 'alerts':
      return userRole === 'admin' ? <SOSAlertsPanel /> : <AlertSystem />;
    case 'review-requests':
      return <ReviewRequests />;
    case 'request':
      return <DataRequest />;
    default:
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Feature Coming Soon</h2>
          <p className="text-gray-600 mt-2">This feature is under development.</p>
        </div>
      );
  }
};

export default ContentRenderer;
