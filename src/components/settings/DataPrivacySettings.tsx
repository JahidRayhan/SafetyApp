
import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/features/profile/services/profileService';
import { useAuth } from '@/features/auth/hooks/useAuth';

const DataPrivacySettings = () => {
  const [settings, setSettings] = useState({
    location_permissions_granted: false,
    sos_gesture_enabled: true,
    voice_monitoring_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [dataStats, setDataStats] = useState({
    emergency_contacts: 0,
    location_records: 0,
    recordings: 0,
    activity_logs: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
      fetchDataStats();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const profile = await profileService.find(user.id);

      if (profile) {
        setSettings({
          location_permissions_granted: profile.locationPermissionsGranted || false,
          sos_gesture_enabled: profile.sosGestureEnabled !== false,
          voice_monitoring_enabled: profile.voiceMonitoringEnabled || false
        });
      }
    } catch (error: any) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataStats = async () => {
    if (!user) return;

    try {
      const stats = await profileService.getDataStats(user.id);

      setDataStats({
        emergency_contacts: stats.emergencyContacts,
        location_records: stats.locationRecords,
        recordings: stats.recordings,
        activity_logs: stats.activityLogs
      });
    } catch (error: any) {
      console.error('Error fetching data stats:', error);
    }
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    if (!user) return;

    try {
      if (key === 'location_permissions_granted') {
        await profileService.update(user.id, { locationPermissionsGranted: value });
      } else if (key === 'sos_gesture_enabled') {
        await profileService.update(user.id, { sosGestureEnabled: value });
      } else {
        await profileService.update(user.id, { voiceMonitoringEnabled: value });
      }

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Setting Updated",
        description: "Your privacy setting has been updated.",
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    if (!user) return;

    try {
      toast({
        title: "Exporting Data",
        description: "Preparing your data export...",
      });

      // This would typically call an edge function to prepare a comprehensive data export
      const { ok } = await profileService.requestDataExport(user.id);

      if (!ok) {
        // Fallback: show available data info
        const dataInfo = `
SafeGuard Data Export Request
User: ${user.email}
Generated: ${new Date().toLocaleString()}

Data Summary:
- Emergency Contacts: ${dataStats.emergency_contacts}
- Location Records: ${dataStats.location_records}
- Recordings: ${dataStats.recordings}
- Activity Logs: ${dataStats.activity_logs}

To complete your data export, please contact support with this reference number: ${Date.now()}
        `;
        
        const blob = new Blob([dataInfo], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `safeguard-data-summary-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Data Summary Downloaded",
          description: "A data summary has been downloaded. For complete export, contact support.",
        });
      } else {
        toast({
          title: "Export Prepared",
          description: "Your data export has been prepared and will be sent to your email.",
        });
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Error",
        description: "Failed to export data. Please try again or contact support.",
        variant: "destructive",
      });
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
    <div className="space-y-6">
      {/* Privacy Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Privacy Controls</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Location Permissions</h3>
              <p className="text-sm text-gray-600">Allow app to access your location for emergency features</p>
            </div>
            <button
              onClick={() => updateSetting('location_permissions_granted', !settings.location_permissions_granted)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.location_permissions_granted ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.location_permissions_granted ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">SOS Gesture</h3>
              <p className="text-sm text-gray-600">Enable shake/power button gestures for emergency SOS</p>
            </div>
            <button
              onClick={() => updateSetting('sos_gesture_enabled', !settings.sos_gesture_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sos_gesture_enabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sos_gesture_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Voice Monitoring</h3>
              <p className="text-sm text-gray-600">Enable background voice monitoring for distress detection</p>
            </div>
            <button
              onClick={() => updateSetting('voice_monitoring_enabled', !settings.voice_monitoring_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.voice_monitoring_enabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.voice_monitoring_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Data</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{dataStats.emergency_contacts}</div>
            <div className="text-sm text-blue-800">Emergency Contacts</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{dataStats.location_records}</div>
            <div className="text-sm text-green-800">Location Records</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{dataStats.recordings}</div>
            <div className="text-sm text-purple-800">Recordings</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{dataStats.activity_logs}</div>
            <div className="text-sm text-orange-800">Activity Logs</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export My Data</span>
          </button>
          
          <p className="text-xs text-gray-500">
            You can request a complete export of your data. This includes all your emergency contacts, 
            location history, recordings, and activity logs.
          </p>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Retention</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">How We Handle Your Data</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Emergency contacts: Stored until you remove them</li>
            <li>• Location data: Automatically deleted after 90 days</li>
            <li>• Recordings: Stored for 1 year, then automatically deleted</li>
            <li>• Activity logs: Kept for security and support purposes</li>
            <li>• All data is encrypted and stored securely</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacySettings;
