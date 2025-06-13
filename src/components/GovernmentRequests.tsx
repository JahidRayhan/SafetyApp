
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, AlertCircle, MapPin, Database, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ZoneRequest {
  id: string;
  location: string;
  reason: string;
  zoneType: string;
  urgency: string;
  center_lat: string;
  center_lng: string;
  radius_meters: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
}

interface DataAccessRequest {
  id: string;
  title: string;
  description: string;
  urgency: string;
  dataType: string;
  timeframe: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
}

const GovernmentRequests = () => {
  const [activeTab, setActiveTab] = useState<'zone-requests' | 'data-requests'>('zone-requests');
  const [zoneRequests, setZoneRequests] = useState<ZoneRequest[]>([]);
  const [dataRequests, setDataRequests] = useState<DataAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  
  const userRole = profile?.role || 'user';

  // Mock data for demonstration - in real app this would come from database
  useEffect(() => {
    // Mock zone requests
    setZoneRequests([
      {
        id: '1',
        location: 'Downtown Safety Zone',
        reason: 'High incident reports in this area require immediate safe zone designation',
        zoneType: 'safe',
        urgency: 'high',
        center_lat: '40.7128',
        center_lng: '-74.0060',
        radius_meters: '500',
        requestedBy: 'admin@safety.org',
        requestedAt: '2025-06-01T10:30:00Z',
        status: 'pending'
      },
      {
        id: '2',
        location: 'Park Area Warning Zone',
        reason: 'Recent safety concerns reported by multiple users',
        zoneType: 'unsafe',
        urgency: 'medium',
        center_lat: '40.7589',
        center_lng: '-73.9851',
        radius_meters: '300',
        requestedBy: 'admin@safety.org',
        requestedAt: '2025-06-01T09:15:00Z',
        status: 'pending'
      }
    ]);

    // Mock data access requests
    setDataRequests([
      {
        id: '1',
        title: 'Safety Analysis for Downtown Area',
        description: 'Need access to user location data to analyze safety patterns and improve emergency response times in the downtown district.',
        urgency: 'high',
        dataType: 'user_locations',
        timeframe: '30_days',
        requestedBy: 'admin@safety.org',
        requestedAt: '2025-06-01T11:00:00Z',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Incident Pattern Research',
        description: 'Research project to identify common incident patterns for prevention strategies.',
        urgency: 'medium',
        dataType: 'incident_reports',
        timeframe: '90_days',
        requestedBy: 'admin@safety.org',
        requestedAt: '2025-06-01T08:30:00Z',
        status: 'pending'
      }
    ]);

    setLoading(false);
  }, []);

  const handleZoneRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    const request = zoneRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      if (action === 'approve') {
        // Create the safe zone
        const { error } = await supabase
          .from('safe_zones')
          .insert({
            name: request.location,
            description: request.reason,
            center_lat: parseFloat(request.center_lat),
            center_lng: parseFloat(request.center_lng),
            radius_meters: parseInt(request.radius_meters),
            zone_type: request.zoneType,
            created_by: user?.id,
            is_active: true
          });

        if (error) throw error;

        toast({
          title: "Zone Request Approved",
          description: `Safe zone "${request.location}" has been created and activated.`,
        });
      } else {
        toast({
          title: "Zone Request Rejected",
          description: `Request for "${request.location}" has been rejected.`,
          variant: "destructive",
        });
      }

      // Update local state
      setZoneRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      ));

    } catch (error) {
      console.error('Error handling zone request:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDataRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would grant/deny data access permissions
      console.log(`Data request ${requestId} ${action}ed`);
      
      toast({
        title: action === 'approve' ? "Data Access Approved" : "Data Access Denied",
        description: action === 'approve' 
          ? "Data access has been granted to the requesting administrator."
          : "Data access request has been denied.",
        variant: action === 'approve' ? "default" : "destructive",
      });

      // Update local state
      setDataRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      ));

    } catch (error) {
      console.error('Error handling data request:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (userRole !== 'govt_admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only government officials can access this review system.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Government Review Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Review and approve requests from administrators for zone modifications and data access.
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('zone-requests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'zone-requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Zone Requests ({zoneRequests.filter(r => r.status === 'pending').length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('data-requests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'data-requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Requests ({dataRequests.filter(r => r.status === 'pending').length})</span>
          </button>
        </div>

        {/* Zone Requests Tab */}
        {activeTab === 'zone-requests' && (
          <div className="space-y-4">
            {zoneRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-6 h-6 ${request.zoneType === 'safe' ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.location}</h3>
                      <p className="text-sm text-gray-500">
                        Requested by {request.requestedBy} • {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {request.urgency} priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Zone Type</label>
                    <p className="text-gray-900 capitalize">{request.zoneType} Zone</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Coordinates</label>
                    <p className="text-gray-900">{request.center_lat}, {request.center_lng}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Radius</label>
                    <p className="text-gray-900">{request.radius_meters} meters</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Justification</label>
                  <p className="text-gray-900 mt-1">{request.reason}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleZoneRequestAction(request.id, 'approve')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Create Zone</span>
                    </button>
                    
                    <button
                      onClick={() => handleZoneRequestAction(request.id, 'reject')}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {zoneRequests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Zone Requests</h3>
                <p className="text-gray-600">All zone requests have been processed.</p>
              </div>
            )}
          </div>
        )}

        {/* Data Access Requests Tab */}
        {activeTab === 'data-requests' && (
          <div className="space-y-4">
            {dataRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-500">
                        Requested by {request.requestedBy} • {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {request.urgency} priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Type</label>
                    <p className="text-gray-900 capitalize">{request.dataType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timeframe</label>
                    <p className="text-gray-900">{request.timeframe.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Purpose & Justification</label>
                  <p className="text-gray-900 mt-1">{request.description}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDataRequestAction(request.id, 'approve')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Grant Access</span>
                    </button>
                    
                    <button
                      onClick={() => handleDataRequestAction(request.id, 'reject')}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Deny Access</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {dataRequests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Requests</h3>
                <p className="text-gray-600">All data access requests have been processed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Review Guidelines</h4>
        </div>
        <p className="text-blue-800 text-sm">
          Carefully review each request considering community safety, data privacy, and resource availability. 
          Approved zone requests will immediately create active safe zones. Data access approvals grant temporary access based on the specified timeframe.
        </p>
      </div>
    </div>
  );
};

export default GovernmentRequests;
