import React, { useState, useEffect } from 'react';
import { Shield, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { profileService } from '@/features/profile/services/profileService';
import { alertCardWarning } from '@/shared/ui/styles';
import { panelBase, panelHeader, panelSubheader, rowStart, stackLoose } from '@/shared/ui/styles';

const EmergencyPlanSettings = () => {
  const [emergencyPlan, setEmergencyPlan] = useState('');
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
        if (!cancelled) setEmergencyPlan(profile?.emergencyPlan ?? '');
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to load emergency plan.',
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.update(user.id, { emergencyPlan });
      toast({
        title: 'Success',
        description: 'Emergency plan updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update emergency plan.',
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
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={panelBase}>
      <div className={`${rowStart} mb-6`}>
        <Shield className="w-6 h-6 text-emergency-600" />
        <div>
          <h3 className={panelHeader}>Emergency Plan</h3>
          <p className={panelSubheader}>Create a personalized emergency response plan</p>
        </div>
      </div>

      <div className={stackLoose}>
        <div className={alertCardWarning}>
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-medium">Emergency Plan Guidelines</h4>
          </div>
          <ul className="text-sm space-y-1">
            <li>• Include contact information for emergency services</li>
            <li>• List your emergency contacts in order of priority</li>
            <li>• Describe your safe locations and escape routes</li>
            <li>• Include any medical conditions or special needs</li>
            <li>• Keep this plan updated and share with trusted contacts</li>
          </ul>
        </div>

        <div>
          <label htmlFor="emergency-plan" className="block text-sm font-medium text-gray-700 mb-2">
            Your Emergency Plan
          </label>
          <textarea
            id="emergency-plan"
            value={emergencyPlan}
            onChange={(e) => setEmergencyPlan(e.target.value)}
            rows={10}
            placeholder="Describe your emergency plan in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Emergency Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPlanSettings;
