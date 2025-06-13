import React, { useState, useEffect } from 'react';
import { FileSearch, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';
import AdminApprovals from '@/components/AdminApprovals';

interface AdminRequest {
  id: string;
  admin_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  request_data: any;
  created_at: string;
  updated_at: string;
  admin_profile?: {
    full_name: string;
  };
}

interface GovernmentRequest {
  id: string;
  government_admin_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  request_data: any;
  created_at: string;
  target_user_id?: string;
  target_user_profile?: {
    full_name: string;
  };
}

const ReviewRequests = () => {
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [governmentRequests, setGovernmentRequests] = useState<GovernmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin_approvals' | 'admin_requests' | 'govt_requests'>('admin_approvals');
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    if (user && profile) {
      fetchRequests();
    }
  }, [user, profile]);

  const fetchRequests = async () => {
    try {
      if (profile?.role === 'govt_admin') {
        // Government admins see admin requests
        const { data: adminReqs, error: adminError } = await supabase
          .from('admin_requests')
          .select(`
            *,
            profiles!admin_id (
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (adminError) throw adminError;
        
        const formattedAdminReqs = adminReqs?.map(req => ({
          ...req,
          admin_profile: req.profiles as any
        })) || [];

        setAdminRequests(formattedAdminReqs);
      }

      if (profile?.role === 'admin') {
        // Admins see government requests
        const { data: govReqs, error: govError } = await supabase
          .from('government_requests')
          .select(`
            *,
            profiles!target_user_id (
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (govError) throw govError;
        
        const formattedGovReqs = govReqs?.map(req => ({
          ...req,
          target_user_profile: req.profiles as any
        })) || [];

        setGovernmentRequests(formattedGovReqs);
      }

    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('admin_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      await logActivity('admin', `Admin request ${action}d`, { 
        request_id: requestId,
        action: action 
      });

      toast({
        title: "Request Updated",
        description: `Request has been ${action}d successfully.`,
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    }
  };

  const handleGovernmentRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('government_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          handled_by: user?.id,
          handled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      await logActivity('admin', `Government request ${action}d`, { 
        request_id: requestId,
        action: action 
      });

      toast({
        title: "Request Updated",
        description: `Request has been ${action}d successfully.`,
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'zone_modification':
        return '🗺️';
      case 'data_access':
        return '📊';
      case 'user_data_request':
        return '👤';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (profile?.role === 'user') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only administrators can review requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileSearch className="w-6 h-6 text-safe-600" />
          <h2 className="text-xl font-bold text-gray-900">Review Requests</h2>
        </div>

        {/* Tab Navigation */}
        {profile?.role === 'admin' && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('admin_approvals')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'admin_approvals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin Approvals
            </button>
            
            <button
              onClick={() => setActiveTab('govt_requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'govt_requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Government Requests ({governmentRequests.filter(r => r.status === 'pending').length})
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'admin_approvals' && profile?.role === 'admin' && (
          <AdminApprovals />
        )}

        {/* Admin Requests (for Government Admins) */}
        {activeTab === 'admin_requests' && profile?.role === 'govt_admin' && (
          <div className="space-y-4">
            {adminRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getRequestTypeIcon(request.request_type)}</span>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Requested by: {request.admin_profile?.full_name || 'Unknown Admin'}</p>
                      <p>Date: {new Date(request.created_at).toLocaleDateString()}</p>
                      <p>Type: {request.request_type.replace('_', ' ').toUpperCase()}</p>
                    </div>

                    {request.request_data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Request Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(request.request_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2 pt-3 border-t">
                    <button
                      onClick={() => handleAdminRequestAction(request.id, 'approve')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleAdminRequestAction(request.id, 'reject')}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {adminRequests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No admin requests to review.</p>
              </div>
            )}
          </div>
        )}

        {/* Government Requests (for Admins) */}
        {activeTab === 'govt_requests' && profile?.role === 'admin' && (
          <div className="space-y-4">
            {governmentRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getRequestTypeIcon(request.request_type)}</span>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Requested by: Government Administration</p>
                      <p>Target User: {request.target_user_profile?.full_name || 'System Wide'}</p>
                      <p>Date: {new Date(request.created_at).toLocaleDateString()}</p>
                      <p>Type: {request.request_type.replace('_', ' ').toUpperCase()}</p>
                    </div>

                    {request.request_data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Request Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(request.request_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2 pt-3 border-t">
                    <button
                      onClick={() => handleGovernmentRequestAction(request.id, 'approve')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleGovernmentRequestAction(request.id, 'reject')}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {governmentRequests.length === 0 && (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No government requests to review.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewRequests;
