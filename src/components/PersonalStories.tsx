
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Heart, Edit3, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import UserStoryForm from './UserStoryForm';

interface PersonalStory {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  author_name: string | null;
  story_type: string;
  status: string;
  tags: string[];
  likes_count: number;
  created_at: string;
  user_id: string | null;
}

interface StoryLike {
  story_id: string;
}

const PersonalStories = () => {
  const [stories, setStories] = useState<PersonalStory[]>([]);
  const [userLikes, setUserLikes] = useState<StoryLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<PersonalStory | null>(null);
  const [activeTab, setActiveTab] = useState<'read' | 'write' | 'admin-create'>('read');
  const [adminFormData, setAdminFormData] = useState({
    title: '',
    content: '',
    story_type: 'healing',
    tags: [] as string[]
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const userRole = profile?.role || 'user';

  const storyTypes = ['survival', 'healing', 'empowerment', 'warning', 'hope'];

  useEffect(() => {
    fetchStories();
    fetchUserLikes();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('personal_stories')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserLikes(data || []);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const submitAdminStory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const storyData = {
        title: adminFormData.title,
        content: adminFormData.content,
        story_type: adminFormData.story_type,
        is_anonymous: false,
        author_name: null,
        tags: adminFormData.tags,
        user_id: user.id,
        status: 'approved' // Auto-approve for admins
      };

      const { error } = await supabase
        .from('personal_stories')
        .insert(storyData);

      if (error) throw error;

      toast({
        title: "Story Published",
        description: "Your story has been published successfully!",
      });

      setAdminFormData({
        title: '',
        content: '',
        story_type: 'healing',
        tags: []
      });
      setActiveTab('read');
      fetchStories();
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Error",
        description: "Failed to submit story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isLiked = userLikes.some(like => like.story_id === storyId);

      if (isLiked) {
        const { error } = await supabase
          .from('story_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId);

        if (error) throw error;
        setUserLikes(userLikes.filter(like => like.story_id !== storyId));
      } else {
        const { error } = await supabase
          .from('story_likes')
          .insert({ user_id: user.id, story_id: storyId });

        if (error) throw error;
        setUserLikes([...userLikes, { story_id: storyId }]);
      }

      setStories(stories.map(story => 
        story.id === storyId 
          ? { ...story, likes_count: story.likes_count + (isLiked ? -1 : 1) }
          : story
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading && activeTab === 'read') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Admin create form
  if (activeTab === 'admin-create' && (userRole === 'admin' || userRole === 'govt_admin')) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Support Story</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={adminFormData.title}
              onChange={(e) => setAdminFormData({ ...adminFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Give your story a meaningful title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Story Type</label>
            <select
              value={adminFormData.story_type}
              onChange={(e) => setAdminFormData({ ...adminFormData, story_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {storyTypes.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Story</label>
            <textarea
              value={adminFormData.content}
              onChange={(e) => setAdminFormData({ ...adminFormData, content: e.target.value })}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Create supportive content to help and inspire users..."
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={submitAdminStory}
              disabled={!adminFormData.title.trim() || !adminFormData.content.trim()}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publish Story</span>
            </button>
            
            <button
              onClick={() => setActiveTab('read')}
              className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User write form
  if (activeTab === 'write' && userRole === 'user') {
    return <UserStoryForm onStorySubmitted={() => setActiveTab('read')} />;
  }

  if (selectedStory) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setSelectedStory(null)}
          className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
        >
          ← Back to Stories
        </button>
        
        <article className="prose max-w-none">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
              {selectedStory.story_type}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedStory.title}
          </h1>
          
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>
              By {selectedStory.is_anonymous 
                ? (selectedStory.author_name || 'Anonymous') 
                : 'Community Member'}
            </span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(selectedStory.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
            {selectedStory.content}
          </div>
          
          <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => toggleLike(selectedStory.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                userLikes.some(like => like.story_id === selectedStory.id)
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${
                userLikes.some(like => like.story_id === selectedStory.id) ? 'fill-current' : ''
              }`} />
              <span>{selectedStory.likes_count} likes</span>
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'read'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Read Stories
          </button>
          
          {userRole === 'user' && (
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'write'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Share Story
            </button>
          )}

          {(userRole === 'admin' || userRole === 'govt_admin') && (
            <button
              onClick={() => setActiveTab('admin-create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'admin-create'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Story
            </button>
          )}
        </div>
        
        <p className="text-gray-600">
          {activeTab === 'read' 
            ? 'Read inspiring stories from our community members who have overcome challenges.'
            : userRole === 'user'
              ? 'Share your experience to inspire and help others in their journey.'
              : 'Create supportive content to help users in their emotional journey.'}
        </p>
      </div>

      {/* Content */}
      {activeTab === 'read' && (
        <div className="space-y-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setSelectedStory(story)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                  {story.story_type}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {story.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {story.content.length > 200 
                  ? `${story.content.substring(0, 200)}...` 
                  : story.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  By {story.is_anonymous 
                    ? (story.author_name || 'Anonymous') 
                    : 'Community Member'}
                </span>
                
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Heart className="w-4 h-4" />
                  <span>{story.likes_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stories.length === 0 && activeTab === 'read' && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 mb-4">
            {userRole === 'user' 
              ? 'Be the first to share your story and inspire others in our community.'
              : 'Create the first supportive story for your community.'}
          </p>
          {userRole === 'user' ? (
            <button
              onClick={() => setActiveTab('write')}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Share Your Story</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('admin-create')}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Story</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalStories;
