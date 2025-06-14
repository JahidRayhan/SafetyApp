
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, UserCheck, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';

interface AdminApproval {
  id: string;
  user_id: string;
  requested_role: 'admin' | 'govt_admin';
  status: string;
  requested_by_email: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const AdminApprovals = () => {
  const [approvals, setApprovals] = useState<AdminApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchApprovals();
    }
  }, [user, profile]);

  const fetchApprovals = async () => {
    try {
      // Use RPC call to get admin approvals
      const { data, error } = await supabase
        .rpc('get_admin_approvals_list' as any);

      if (error) {
        console.error('Error fetching approvals:', error);
        setApprovals([]);
      } else {
        setApprovals(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching approvals:', error);
      setApprovals([]);
      toast({
        title: "Error",
        description: "Failed to load approval requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      // Use RPC for updating approvals
      const { error } = await supabase.rpc('handle_admin_approval' as any, {
        approval_id: approvalId,
        action: action,
        approved_by_id: user?.id,
        rejection_reason: rejectionReason || null
      });

      if (error) {
        console.error('Error handling approval:', error);
        throw error;
      }

      await logActivity('admin', `${action === 'approve' ? 'Approved' : 'Rejected'} ${approval.requested_role} request for ${approval.requested_by_email}`, {
        approval_id: approvalId,
        requested_role: approval.requested_role,
        action: action
      });

      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The ${approval.requested_role} request has been ${action}d successfully.`,
      });

      fetchApprovals();
    } catch (error: any) {
      console.error('Error handling approval:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return UserCheck;
      case 'govt_admin':
        return Crown;
      default:
        return User;
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

  if (profile?.role !== 'admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only admins can manage approval requests.</p>
      </div>
    );
  }

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <UserCheck className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Admin Approval Requests</h2>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => {
          const Icon = getRoleIcon(approval.requested_role);
          return (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">{approval.requested_by_email}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Requested Role: <span className="font-medium">{approval.requested_role.replace('_', ' ').toUpperCase()}</span></p>
                    <p>Requested: {new Date(approval.created_at).toLocaleString()}</p>
                    {approval.approved_at && (
                      <p>Processed: {new Date(approval.approved_at).toLocaleString()}</p>
                    )}
                    {approval.rejection_reason && (
                      <p className="text-red-600">Reason: {approval.rejection_reason}</p>
                    )}
                  </div>
                </div>
              </div>

              {approval.status === 'pending' && (
                <div className="flex space-x-2 pt-3 border-t">
                  <button
                    onClick={() => handleApproval(approval.id, 'approve')}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason (optional):');
                      handleApproval(approval.id, 'reject', reason || undefined);
                    }}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {approvals.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No approval requests to review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;
