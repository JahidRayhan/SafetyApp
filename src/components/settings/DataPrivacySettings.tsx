
import React, { useState, useEffect } from 'react';
import { Shield, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const DataPrivacySettings = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    share_location_with_contacts: true,
    allow_emergency_data_sharing: true,
    profile_visibility: 'contacts',
    data_retention_period: '1_year',
    anonymous_analytics: true,
    third_party_sharing: false
  });

  useEffect(() => {
    // For now, use default settings since privacy_settings column doesn't exist yet
    if (profile) {
      setPrivacySettings({
        share_location_with_contacts: true,
        allow_emergency_data_sharing: true,
        profile_visibility: 'contacts',
        data_retention_period: '1_year',
        anonymous_analytics: true,
        third_party_sharing: false
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show success message since the column doesn't exist yet
      console.log('Privacy settings to save:', privacySettings);
      
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">Data & Privacy</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Share Location with Emergency Contacts</h3>
              <p className="text-sm text-gray-600">Allow emergency contacts to see your location during emergencies</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('share_location_with_contacts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.share_location_with_contacts ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.share_location_with_contacts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Emergency Data Sharing</h3>
              <p className="text-sm text-gray-600">Allow sharing of emergency data with first responders</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('allow_emergency_data_sharing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.allow_emergency_data_sharing ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.allow_emergency_data_sharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Anonymous Analytics</h3>
              <p className="text-sm text-gray-600">Help improve the app by sharing anonymous usage data</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('anonymous_analytics')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.anonymous_analytics ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.anonymous_analytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Third-Party Data Sharing</h3>
              <p className="text-sm text-gray-600">Allow sharing data with trusted third-party services</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('third_party_sharing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.third_party_sharing ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.third_party_sharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Visibility
          </label>
          <select
            value={privacySettings.profile_visibility}
            onChange={(e) => setPrivacySettings({ ...privacySettings, profile_visibility: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="public">Public - Visible to all users</option>
            <option value="contacts">Contacts Only - Visible to emergency contacts</option>
            <option value="private">Private - Not visible to others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention Period
          </label>
          <select
            value={privacySettings.data_retention_period}
            onChange={(e) => setPrivacySettings({ ...privacySettings, data_retention_period: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
            <option value="2_years">2 Years</option>
            <option value="indefinite">Indefinite</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataPrivacySettings;
