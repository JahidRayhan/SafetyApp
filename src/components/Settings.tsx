
import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, User, Bell, Mic, Save, Check } from 'lucide-react';
import VoiceCommands from '@/components/VoiceCommands';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { toast } = useToast();
  const userRole = profile?.role || 'user';

  const [settings, setSettings] = useState({
    autoEmergencyDetection: true,
    locationServices: true,
    audioRecording: false,
    videoRecording: false,
    pushNotifications: true,
    emergencyAlerts: true,
    locationWarnings: true,
    contactNotifications: true,
    locationHistory: true,
    anonymousReporting: false,
    dataSharing: false,
    voiceMonitoring: profile?.voice_monitoring_enabled || false,
    sosGesture: profile?.sos_gesture_enabled || true
  });

  const updateSetting = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Update specific profile settings in database
    if (key === 'voiceMonitoring' || key === 'sosGesture') {
      setIsUpdating(true);
      try {
        const updateData = key === 'voiceMonitoring' 
          ? { voice_monitoring_enabled: value }
          : { sos_gesture_enabled: value };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user?.id);

        if (error) throw error;

        toast({
          title: "Settings Updated",
          description: `${key === 'voiceMonitoring' ? 'Voice monitoring' : 'SOS gesture'} has been ${value ? 'enabled' : 'disabled'}.`,
        });
      } catch (error: any) {
        console.error('Error updating setting:', error);
        toast({
          title: "Update Failed",
          description: "Unable to update setting. Please try again.",
          variant: "destructive",
        });
        // Revert the setting
        setSettings(prev => ({ ...prev, [key]: !value }));
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Show feedback for other settings
      toast({
        title: "Setting Updated",
        description: "Your preference has been saved.",
      });
    }
  };

  const settingsGroups = [
    {
      title: 'Safety & Security',
      icon: Shield,
      settings: [
        { 
          key: 'autoEmergencyDetection', 
          name: 'Auto Emergency Detection', 
          description: 'Automatically detect emergencies using AI',
          value: settings.autoEmergencyDetection
        },
        { 
          key: 'locationServices', 
          name: 'Location Services', 
          description: 'Share location during emergencies',
          value: settings.locationServices
        },
        { 
          key: 'audioRecording', 
          name: 'Audio Recording', 
          description: 'Record audio during SOS activation',
          value: settings.audioRecording
        },
        { 
          key: 'videoRecording', 
          name: 'Video Recording', 
          description: 'Record video during SOS activation',
          value: settings.videoRecording
        },
        { 
          key: 'voiceMonitoring', 
          name: 'Voice Monitoring', 
          description: 'Enable background voice monitoring for distress',
          value: settings.voiceMonitoring
        },
        { 
          key: 'sosGesture', 
          name: 'SOS Gesture', 
          description: 'Enable gesture-based SOS activation',
          value: settings.sosGesture
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { 
          key: 'pushNotifications', 
          name: 'Push Notifications', 
          description: 'Receive safety alerts and updates',
          value: settings.pushNotifications
        },
        { 
          key: 'emergencyAlerts', 
          name: 'Emergency Alerts', 
          description: 'High priority emergency notifications',
          value: settings.emergencyAlerts
        },
        { 
          key: 'locationWarnings', 
          name: 'Location Warnings', 
          description: 'Alerts when entering unsafe areas',
          value: settings.locationWarnings
        },
        { 
          key: 'contactNotifications', 
          name: 'Contact Notifications', 
          description: 'Notify when contacts trigger SOS',
          value: settings.contactNotifications
        }
      ]
    },
    {
      title: 'Privacy',
      icon: User,
      settings: [
        { 
          key: 'locationHistory', 
          name: 'Location History', 
          description: 'Store location history for safety analysis',
          value: settings.locationHistory
        },
        { 
          key: 'anonymousReporting', 
          name: 'Anonymous Reporting', 
          description: 'Report incidents anonymously',
          value: settings.anonymousReporting
        },
        { 
          key: 'dataSharing', 
          name: 'Data Sharing', 
          description: 'Share safety data for community insights',
          value: settings.dataSharing
        }
      ]
    }
  ];

  // Filter sections based on user role - remove voice commands for admin roles
  const getSectionsForRole = (role: string) => {
    if (role === 'admin' || role === 'govt_admin') {
      return [{ id: 'general', label: 'General Settings' }];
    }
    return [
      { id: 'general', label: 'General Settings' },
      { id: 'voice', label: 'Voice Commands' }
    ];
  };

  const sections = getSectionsForRole(userRole);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-emergency-600" />
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          {isUpdating && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon;
            return (
              <div key={groupIndex} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-center space-x-2 mb-4">
                  <GroupIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {group.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{setting.name}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                      
                      <button
                        onClick={() => updateSetting(setting.key, !setting.value)}
                        disabled={isUpdating}
                        className={`w-12 h-6 rounded-full relative transition-all duration-200 ${
                          setting.value ? 'bg-safe-500' : 'bg-gray-300'
                        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-200 ${
                          setting.value ? 'right-0.5' : 'left-0.5'
                        }`}>
                          {setting.value && (
                            <Check className="w-3 h-3 text-safe-500 absolute top-1 left-1" />
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
        
        <div className="space-y-4">
          <button 
            onClick={() => toast({ title: "Profile", description: "Profile editing will be available soon." })}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Profile Information</div>
                <div className="text-sm text-gray-600">Update your personal details</div>
              </div>
              <div className="text-gray-400">›</div>
            </div>
          </button>
          
          {userRole === 'user' && (
            <button 
              onClick={() => toast({ title: "Emergency Plan", description: "Emergency plan setup will be available soon." })}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Emergency Plan</div>
                  <div className="text-sm text-gray-600">Set up your emergency response plan</div>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </button>
          )}
          
          <button 
            onClick={() => toast({ title: "Privacy", description: "Advanced privacy settings will be available soon." })}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Data & Privacy</div>
                <div className="text-sm text-gray-600">Manage your data and privacy settings</div>
              </div>
              <div className="text-gray-400">›</div>
            </div>
          </button>
        </div>
      </div>

      {/* Support */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
        
        <div className="space-y-3">
          <button 
            onClick={() => toast({ title: "Help Center", description: "Redirecting to help center..." })}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <div className="font-medium text-gray-900">Help Center</div>
          </button>
          <button 
            onClick={() => toast({ title: "Support", description: "Contact support feature coming soon." })}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <div className="font-medium text-gray-900">Contact Support</div>
          </button>
          <button 
            onClick={() => toast({ title: "Bug Report", description: "Bug reporting feature coming soon." })}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <div className="font-medium text-gray-900">Report a Bug</div>
          </button>
          {userRole === 'user' && (
            <button 
              onClick={() => toast({ title: "Emergency Hotlines", description: "Emergency: 911\nCrisis Text Line: 741741\nNational Suicide Prevention: 988" })}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <div className="font-medium text-emergency-600">Emergency Hotlines</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Tabs - Only show if user has multiple sections */}
      {sections.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex space-x-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-emergency-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.id === 'voice' && <Mic className="w-4 h-4" />}
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {activeSection === 'general' ? renderGeneralSettings() : <VoiceCommands />}
    </div>
  );
};

export default Settings;
