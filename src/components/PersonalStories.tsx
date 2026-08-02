
import React, { useState, useEffect } from 'react';
import { Heart, Share2, User, Plus, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { storyService, type Story as DomainStory } from '@/features/community';

interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  story_type: string;
  tags: string[];
  likes_count: number;
  created_at: string;
  is_anonymous: boolean;
  status: string;
  user_id: string;
}

const toViewModel = (story: DomainStory): Story => ({
  id: story.id,
  title: story.title,
  content: story.content,
  author_name: story.authorName ?? '',
  story_type: story.storyType,
  tags: story.tags,
  likes_count: story.likesCount,
  created_at: story.createdAt,
  is_anonymous: story.isAnonymous,
  status: story.status,
  user_id: story.userId ?? '',
});

const PersonalStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    story_type: 'survival',
    author_name: '',
    is_anonymous: false,
    tags: [] as string[]
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllStories();
    if (user) {
      fetchMyStories();
    }
  }, [user]);

  const fetchAllStories = async () => {
    try {
      console.log('Fetching all approved stories...');

      const data = await storyService.listPublic();

      console.log('Fetched stories:', data);
      setStories(data.map(toViewModel));
    } catch (error: any) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories.",
        variant: "destructive",
      });
    }
  };

  const fetchMyStories = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching user stories...');

      const data = await storyService.listMine(user.id);

      console.log('Fetched user stories:', data);
      setMyStories(data.map(toViewModel));
    } catch (error: any) {
      console.error('Error loading my stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStory = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share your story.",
        variant: "destructive",
      });
      return;
    }

    if (!newStory.title || !newStory.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding new story:', newStory);

      await storyService.create(user.id, {
        title: newStory.title,
        content: newStory.content,
        storyType: newStory.story_type,
        authorName: newStory.is_anonymous ? 'Anonymous' : (newStory.author_name || 'SafeGuard User'),
        isAnonymous: newStory.is_anonymous,
        tags: newStory.tags,
      });

      setNewStory({
        title: '',
        content: '',
        story_type: 'survival',
        author_name: '',
        is_anonymous: false,
        tags: []
      });
      setShowAddForm(false);
      fetchMyStories(); // Refresh my stories
      
      toast({
        title: "Story Submitted",
        description: "Your story has been submitted for review and will be visible once approved.",
      });
    } catch (error: any) {
      console.error('Error submitting story:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const likeStory = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like stories.",
        variant: "destructive",
      });
      return;
    }

    try {
      const nowLiked = await storyService.toggleLike(user.id, storyId);

      if (!nowLiked) {
        toast({
          title: "Like Removed",
          description: "You've removed your like from this story.",
        });
      } else {
        toast({
          title: "Story Liked",
          description: "Thank you for supporting this story!",
        });
      }

      // Refresh stories
      fetchAllStories();
      fetchMyStories();
    } catch (error: any) {
      console.error('Error liking story:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayStories = activeTab === 'all' ? stories : myStories;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Personal Stories</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stories ({stories.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Stories ({myStories.length})
            </button>
          )}
        </div>

        {/* Add Story Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <h3 className="font-medium text-gray-900">Share Your Story</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Story Title"
                value={newStory.title}
                onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              
              <textarea
                placeholder="Share your story..."
                value={newStory.content}
                onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newStory.story_type}
                  onChange={(e) => setNewStory({...newStory, story_type: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="survival">Survival Story</option>
                  <option value="recovery">Recovery Journey</option>
                  <option value="empowerment">Empowerment</option>
                  <option value="support">Support & Help</option>
                  <option value="awareness">Awareness</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Your Name (optional if anonymous)"
                  value={newStory.author_name}
                  onChange={(e) => setNewStory({...newStory, author_name: e.target.value})}
                  disabled={newStory.is_anonymous}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newStory.is_anonymous}
                  onChange={(e) => setNewStory({...newStory, is_anonymous: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Post anonymously
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={addStory}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Share Story
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stories List */}
        <div className="space-y-4">
          {displayStories.map((story) => (
            <div key={story.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{story.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{story.author_name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                      {story.status}
                    </span>
                    <span className="text-gray-500">
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {activeTab === 'all' && (
                  <button
                    onClick={() => likeStory(story.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{story.likes_count}</span>
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3">{story.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {story.story_type}
                  </span>
                  {story.tags?.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {displayStories.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? 'No approved stories yet. Be the first to share your experience!' 
                  : 'You haven\'t shared any stories yet. Click the + button to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalStories;
