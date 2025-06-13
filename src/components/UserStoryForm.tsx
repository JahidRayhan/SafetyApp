
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, CheckCircle, XCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const UserStoryForm = ({ onStorySubmitted }: { onStorySubmitted?: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    story_type: 'healing',
    is_anonymous: false,
    author_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const storyTypes = ['survival', 'healing', 'empowerment', 'warning', 'hope'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const storyData = {
        title: formData.title,
        content: formData.content,
        story_type: formData.story_type,
        is_anonymous: formData.is_anonymous,
        author_name: formData.is_anonymous ? formData.author_name : null,
        user_id: user.id,
        status: 'pending' // Will be reviewed before publishing
      };

      const { error } = await supabase
        .from('personal_stories')
        .insert(storyData);

      if (error) throw error;

      toast({
        title: "Story Submitted!",
        description: "Your story has been submitted for review. Thank you for sharing your experience!",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        story_type: 'healing',
        is_anonymous: false,
        author_name: ''
      });

      if (onStorySubmitted) {
        onStorySubmitted();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 rounded-lg p-2">
          <Plus className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Share Your Story</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Give your story a meaningful title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Story Type</label>
          <select
            value={formData.story_type}
            onChange={(e) => setFormData({ ...formData, story_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {storyTypes.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
            Share anonymously
          </label>
        </div>

        {formData.is_anonymous && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anonymous Name (optional)
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., 'A Survivor', 'Someone Strong'"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Story</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Share your experience, your journey, what you've learned..."
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!formData.title.trim() || !formData.content.trim() || isSubmitting}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Story'}</span>
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Before you share:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your story will be reviewed before being published</li>
          <li>• Only share what you're comfortable with</li>
          <li>• Your story can help and inspire others</li>
          <li>• You can choose to remain anonymous</li>
        </ul>
      </div>
    </div>
  );
};

export default UserStoryForm;
