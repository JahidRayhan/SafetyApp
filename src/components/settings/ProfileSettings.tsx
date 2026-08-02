import React, { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { profileService } from '@/features/profile/services/profileService';
import { panelBase, panelHeader, rowStart, stackLoose } from '@/shared/ui/styles';

const ProfileSettings = () => {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    emergencyPlan: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    profileService
      .find(user.id)
      .then((profile) => {
        if (cancelled || !profile) return;
        setForm({
          fullName: profile.fullName ?? '',
          phoneNumber: profile.phoneNumber ?? '',
          emergencyPlan: profile.emergencyPlan ?? '',
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to load profile information.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, toast]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.update(user.id, {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        emergencyPlan: form.emergencyPlan,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to save profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={panelBase}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={panelBase}>
      <div className={`${rowStart} mb-6`}>
        <User className="w-6 h-6 text-blue-600" />
        <h2 className={panelHeader}>Profile Information</h2>
      </div>

      <div className={stackLoose}>
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phone-number"
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="emergency-plan-summary" className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Plan
          </label>
          <textarea
            id="emergency-plan-summary"
            rows={4}
            value={form.emergencyPlan}
            onChange={(e) => setForm({ ...form, emergencyPlan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what should happen if you trigger an alert"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
