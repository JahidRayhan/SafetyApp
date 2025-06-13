
import React, { useState } from 'react';
import { Send, AlertCircle, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const DataRequest = () => {
  const [dataRequest, setDataRequest] = useState({
    caseId: '',
    userId: '',
    userName: '',
    dataType: 'user_media',
    urgency: 'medium',
    description: '',
    legalBasis: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  
  const userRole = profile?.role || 'user';

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Data Request:', {
      ...dataRequest,
      requestedBy: user?.id,
      requestedAt: new Date().toISOString()
    });
    
    toast({
      title: "Data Request Submitted",
      description: "Your request has been sent to the Administrator for processing.",
    });
    
    setDataRequest({
      caseId: '',
      userId: '',
      userName: '',
      dataType: 'user_media',
      urgency: 'medium',
      description: '',
      legalBasis: ''
    });
  };

  if (userRole !== 'govt_admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only government officials can access data request features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Request User Data</h2>
        <p className="text-gray-600 mb-6">
          Submit official requests to Administrators for user data required for investigations.
        </p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">Submit Data Access Request</h3>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case ID</label>
                <input
                  type="text"
                  value={dataRequest.caseId}
                  onChange={(e) => setDataRequest({...dataRequest, caseId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., CASE-2025-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={dataRequest.userId}
                  onChange={(e) => setDataRequest({...dataRequest, userId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Target user ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
              <input
                type="text"
                value={dataRequest.userName}
                onChange={(e) => setDataRequest({...dataRequest, userName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Target user full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type Requested</label>
                <select
                  value={dataRequest.dataType}
                  onChange={(e) => setDataRequest({...dataRequest, dataType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="user_media">Audio/Video Recordings</option>
                  <option value="emergency_contacts">Emergency Contact Information</option>
                  <option value="location_data">Location History</option>
                  <option value="incident_reports">Incident Reports</option>
                  <option value="full_profile">Complete User Profile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select
                  value={dataRequest.urgency}
                  onChange={(e) => setDataRequest({...dataRequest, urgency: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low - Routine Investigation</option>
                  <option value="medium">Medium - Active Case</option>
                  <option value="high">High - Urgent Investigation</option>
                  <option value="urgent">Urgent - Immediate Action Required</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Basis</label>
              <input
                type="text"
                value={dataRequest.legalBasis}
                onChange={(e) => setDataRequest({...dataRequest, legalBasis: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Court Order #12345, Warrant #67890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Details</label>
              <textarea
                value={dataRequest.description}
                onChange={(e) => setDataRequest({...dataRequest, description: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Provide detailed explanation of why this data is needed for the investigation..."
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Submit Data Request</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-medium text-red-900">Legal Compliance Notice</h4>
        </div>
        <p className="text-red-800 text-sm">
          All data requests must be supported by valid legal authorization (court orders, warrants, etc.). 
          Requests without proper legal basis will be rejected. All requests are logged and audited for compliance.
        </p>
      </div>
    </div>
  );
};

export default DataRequest;
