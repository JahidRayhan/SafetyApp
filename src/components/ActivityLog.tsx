
import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Filter, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface ActivityEntry {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  metadata?: any;
  user_id: string;
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile(user);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, filter]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // If user is not admin/govt_admin, only show their own activities
      if (profile?.role === 'user') {
        query = query.eq('user_id', user?.id);
      }

      if (filter !== 'all') {
        query = query.eq('action_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (actionType: string, description: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: actionType,
        description: description,
        metadata: metadata
      });
    } catch (error: any) {
      console.error('Error logging activity:', error);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'emergency':
        return 'bg-emergency-100 text-emergency-800';
      case 'safety':
        return 'bg-safe-100 text-safe-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-safe-600" />
        <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
          >
            <option value="all">All Activities</option>
            <option value="emergency">Emergency</option>
            <option value="safety">Safety</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
          />
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(activity.action_type)}`}>
                    {activity.action_type.charAt(0).toUpperCase() + activity.action_type.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-900 font-medium">{activity.description}</p>
                {activity.metadata && (
                  <div className="mt-2 text-sm text-gray-600">
                    <details className="cursor-pointer">
                      <summary>View details</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchTerm ? 'No activities found matching your search.' : 'No activity logged yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the logActivity function for use in other components
export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = async (actionType: string, description: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: actionType,
        description: description,
        metadata: metadata
      });
    } catch (error: any) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};

export default ActivityLog;
