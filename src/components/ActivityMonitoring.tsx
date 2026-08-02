import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, User, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { monitoringService } from '@/features/admin/services/monitoringService';
import type { ActivityLogEntry } from '@/features/admin/domain/types';

const ActivityMonitoring = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const logsWithProfiles = await monitoringService.listActivityLogs(100);
      setLogs(logsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load activity logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.actionType === filterType;
    const matchesRole = filterRole === 'all' || log.userProfile?.role === filterRole;
    
    return matchesSearch && matchesType && matchesRole;
  });

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'auth':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'safety':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'govt_admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const actionTypes = ['all', ...new Set(logs.map(log => log.actionType))];
  const roles = ['all', ...new Set(logs.map(log => log.userProfile?.role).filter(Boolean))];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Monitoring</h2>
            <p className="text-gray-600">Track actions for all users across all roles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Action Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Logs */}
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.actionType)}`}>
                      {log.actionType}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(log.userProfile?.role || 'unknown')}`}>
                      {log.userProfile?.role || 'unknown'}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 font-medium">{log.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{log.userProfile?.fullName || 'Unknown User'}</span>
                    </div>
                    {log.ipAddress && (
                      <div>
                        <span className="font-medium">IP:</span> {log.ipAddress}
                      </div>
                    )}
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterRole !== 'all' 
                  ? 'No activities match your filters.' 
                  : 'No activity logs available.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Activity Monitoring Policy</h4>
        </div>
        <p className="text-blue-800 text-sm">
          This log tracks all user activities across the platform for security and compliance purposes. 
          All data is anonymized where possible and access is restricted to authorized administrators.
        </p>
      </div>
    </div>
  );
};

export default ActivityMonitoring;
