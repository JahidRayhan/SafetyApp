
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, FileText, AlertTriangle, Filter, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ActivityLog {
  id: string;
  type: 'sos' | 'location' | 'call' | 'report' | 'alert' | 'recording';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  status: 'completed' | 'pending' | 'failed';
}

const ActivityHistory = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const { user } = useAuth();

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: Clock },
    { value: 'sos', label: 'SOS Alerts', icon: AlertTriangle },
    { value: 'location', label: 'Location Sharing', icon: MapPin },
    { value: 'call', label: 'Fake Calls', icon: Phone },
    { value: 'report', label: 'Reports', icon: FileText },
    { value: 'recording', label: 'Recordings', icon: FileText }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    loadActivityHistory();
  }, [user]);

  useEffect(() => {
    filterActivities();
  }, [activities, selectedType, dateRange]);

  const loadActivityHistory = () => {
    // Mock data - in real app, this would come from API
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        type: 'sos',
        title: 'Emergency Alert Triggered',
        description: 'SOS alert sent to 3 emergency contacts',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: 'Downtown Park, Main St',
        status: 'completed'
      },
      {
        id: '2',
        type: 'location',
        title: 'Location Shared',
        description: 'Real-time location shared with emergency contacts',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        location: 'Home',
        status: 'completed'
      },
      {
        id: '3',
        type: 'call',
        title: 'Fake Call Scheduled',
        description: 'Emergency exit call scheduled for safety',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: '4',
        type: 'report',
        title: 'Incident Report Submitted',
        description: 'Safety incident reported to authorities',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        location: 'University Campus',
        status: 'pending'
      },
      {
        id: '5',
        type: 'recording',
        title: 'Evidence Recording',
        description: 'Audio evidence recorded and saved',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];

    setActivities(mockActivities);
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    // Filter by date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp) >= startOfDay
        );
        break;
      case 'week':
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp) >= startOfWeek
        );
        break;
      case 'month':
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp) >= startOfMonth
        );
        break;
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
        </div>
        <p className="text-gray-600">
          Track all your safety activities and system interactions.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">
              {selectedType === 'all' 
                ? 'No activities recorded for the selected time period.' 
                : `No ${activityTypes.find(t => t.value === selectedType)?.label.toLowerCase()} found for the selected time period.`}
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <ActivityIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-gray-600">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {formatTime(activity.timestamp)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {activity.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
