import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Calendar, Filter, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { activityService } from '@/features/activity/services/activityService';
import type { ActivityEvent, ActivityKind } from '@/features/activity/domain/types';
import { panelBase, panelHeader, rowStart } from '@/shared/ui/styles';
import { alertCardInfo } from '@/shared/ui/styles';

const KIND_STYLES: Record<string, string> = {
  emergency: 'bg-emergency-100 text-emergency-800',
  safety: 'bg-safe-100 text-safe-800',
  location_sharing: 'bg-blue-100 text-blue-800',
  chat: 'bg-purple-100 text-purple-800',
  evidence_upload: 'bg-orange-100 text-orange-800',
  recording: 'bg-orange-100 text-orange-800',
  system: 'bg-gray-100 text-gray-800',
};

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityKind | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    activityService
      .list({ userId: user.id, kind: filter })
      .then((events) => {
        if (!cancelled) setActivities(events);
      })
      .catch((error) => console.error('Failed to load activity:', error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, filter]);

  const filteredActivities = activities.filter(
    (activity) =>
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.kind.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const kindStyle = (kind: string) => KIND_STYLES[kind] ?? 'bg-gray-100 text-gray-800';

  if (loading) {
    return (
      <div className={panelBase}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={panelBase}>
      <div className={`${rowStart} mb-6`}>
        <Activity className="w-6 h-6 text-safe-600" />
        <h2 className={panelHeader}>My Activity History</h2>
      </div>

      <div className={`${alertCardInfo} mb-4`}>
        <p className="text-sm">
          This shows your personal activity history with SafeGuard. Track your safety activities,
          emergency alerts, location sharing, and app usage.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            aria-label="Filter activities by type"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityKind | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
          >
            <option value="all">All Activities</option>
            <option value="emergency">Emergency</option>
            <option value="location_sharing">Location Sharing</option>
            <option value="recording">Recording</option>
            <option value="chat">AI Assistant</option>
            <option value="safety">Safety</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search your activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${kindStyle(activity.kind)}`}>
                    {activity.kind.charAt(0).toUpperCase() + activity.kind.slice(1).replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.occurredAt).toLocaleString()}</span>
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
            <p className="text-sm text-gray-500 mt-2">
              Your activities will appear here as you use SafeGuard features like SOS alerts,
              location sharing, and emergency recording.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Thin adapter so any feature can append to the audit trail without
 * knowing about persistence.
 */
export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = useCallback(
    async (kind: ActivityKind, description: string, metadata?: Record<string, unknown>) => {
      if (!user) return;
      await activityService.record(user.id, { kind, description, metadata });
    },
    [user],
  );

  return { logActivity };
};

export default ActivityLog;
