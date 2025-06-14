
import React, { useState, useEffect } from 'react';
import { Shield, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const EmergencyPlanSettings = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emergencyPlan, setEmergencyPlan] = useState({
    meeting_points: [''],
    important_documents: [''],
    emergency_kit_location: '',
    special_instructions: '',
    medical_information: ''
  });

  useEffect(() => {
    // Use existing emergency_plan field or default values
    if (profile?.emergency_plan) {
      try {
        const parsedPlan = typeof profile.emergency_plan === 'string' 
          ? JSON.parse(profile.emergency_plan) 
          : profile.emergency_plan;
        
        setEmergencyPlan({
          meeting_points: parsedPlan.meeting_points || [''],
          important_documents: parsedPlan.important_documents || [''],
          emergency_kit_location: parsedPlan.emergency_kit_location || '',
          special_instructions: parsedPlan.special_instructions || '',
          medical_information: parsedPlan.medical_information || ''
        });
      } catch (error) {
        console.error('Error parsing emergency plan:', error);
        // Use default values if parsing fails
      }
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await updateProfile({
        emergency_plan: JSON.stringify(emergencyPlan)
      });

      if (success) {
        toast({
          title: "Emergency Plan Updated",
          description: "Your emergency plan has been saved successfully.",
        });
      } else {
        throw new Error('Failed to update emergency plan');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update emergency plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeetingPoint = () => {
    setEmergencyPlan({
      ...emergencyPlan,
      meeting_points: [...emergencyPlan.meeting_points, '']
    });
  };

  const removeMeetingPoint = (index: number) => {
    const newPoints = emergencyPlan.meeting_points.filter((_, i) => i !== index);
    setEmergencyPlan({
      ...emergencyPlan,
      meeting_points: newPoints.length > 0 ? newPoints : ['']
    });
  };

  const updateMeetingPoint = (index: number, value: string) => {
    const newPoints = [...emergencyPlan.meeting_points];
    newPoints[index] = value;
    setEmergencyPlan({
      ...emergencyPlan,
      meeting_points: newPoints
    });
  };

  const addDocument = () => {
    setEmergencyPlan({
      ...emergencyPlan,
      important_documents: [...emergencyPlan.important_documents, '']
    });
  };

  const removeDocument = (index: number) => {
    const newDocs = emergencyPlan.important_documents.filter((_, i) => i !== index);
    setEmergencyPlan({
      ...emergencyPlan,
      important_documents: newDocs.length > 0 ? newDocs : ['']
    });
  };

  const updateDocument = (index: number, value: string) => {
    const newDocs = [...emergencyPlan.important_documents];
    newDocs[index] = value;
    setEmergencyPlan({
      ...emergencyPlan,
      important_documents: newDocs
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-emergency-600" />
        <h2 className="text-xl font-bold text-gray-900">Emergency Plan</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Meeting Points
          </label>
          {emergencyPlan.meeting_points.map((point, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={point}
                onChange={(e) => updateMeetingPoint(index, e.target.value)}
                placeholder="Enter meeting point address"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              />
              {emergencyPlan.meeting_points.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeetingPoint(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMeetingPoint}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meeting Point</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Important Documents
          </label>
          {emergencyPlan.important_documents.map((doc, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={doc}
                onChange={(e) => updateDocument(index, e.target.value)}
                placeholder="Document name and location"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              />
              {emergencyPlan.important_documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDocument}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Kit Location
          </label>
          <input
            type="text"
            value={emergencyPlan.emergency_kit_location}
            onChange={(e) => setEmergencyPlan({ ...emergencyPlan, emergency_kit_location: e.target.value })}
            placeholder="Where is your emergency kit stored?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Information
          </label>
          <textarea
            value={emergencyPlan.medical_information}
            onChange={(e) => setEmergencyPlan({ ...emergencyPlan, medical_information: e.target.value })}
            placeholder="Allergies, medications, medical conditions, etc."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <textarea
            value={emergencyPlan.special_instructions}
            onChange={(e) => setEmergencyPlan({ ...emergencyPlan, special_instructions: e.target.value })}
            placeholder="Any special instructions for emergency responders"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-emergency-600 hover:bg-emergency-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Emergency Plan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyPlanSettings;
