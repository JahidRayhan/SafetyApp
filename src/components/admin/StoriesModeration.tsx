import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { moderationService, type Story as DomainStory } from '@/features/community';

interface Story {
  id: string;
  title: string;
  content: string;
  author_name: string;
  story_type: string;
  is_anonymous: boolean;
  status: string;
  likes_count: number;
  created_at: string;
  tags: string[];
  user_profile?: {
    full_name: string;
    role: string;
  };
}

const toViewModel = (story: DomainStory): Story => ({
  id: story.id,
  title: story.title,
  content: story.content,
  author_name: story.authorName ?? '',
  story_type: story.storyType,
  is_anonymous: story.isAnonymous,
  status: story.status,
  likes_count: story.likesCount,
  created_at: story.createdAt,
  tags: story.tags,
  user_profile: story.userProfile
    ? {
        full_name: story.userProfile.fullName ?? '',
        role: story.userProfile.role ?? '',
      }
    : undefined,
});

const StoriesModeration = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const data = await moderationService.listAll();
      setStories(data.map(toViewModel));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load stories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoryAction = async (storyId: string, action: 'approve' | 'reject') => {
    try {
      await moderationService.setStatus(storyId, action);

      toast({
        title: "Success",
        description: `Story ${action}d successfully.`,
      });

      fetchStories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} story.`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoryTypeColor = (type: string) => {
    switch (type) {
      case 'survival':
        return 'bg-blue-100 text-blue-800';
      case 'recovery':
        return 'bg-green-100 text-green-800';
      case 'support':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStories = stories.filter(story => {
    if (filterStatus === 'all') return true;
    return story.status === filterStatus;
  });

  const statusCounts = {
    pending: stories.filter(s => s.status === 'pending').length,
    approved: stories.filter(s => s.status === 'approved').length,
    rejected: stories.filter(s => s.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Stories Moderation</h3>
            <p className="text-gray-600">Review and approve/reject user stories</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stories ({stories.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Approved ({statusCounts.approved})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Rejected ({statusCounts.rejected})
          </button>
        </div>

        {/* Stories List */}
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <div key={story.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{story.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                      {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoryTypeColor(story.story_type)}`}>
                      {story.story_type.charAt(0).toUpperCase() + story.story_type.slice(1)}
                    </span>
                    {story.is_anonymous && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Anonymous
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-3">{story.content}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Author:</span> {
                        story.is_anonymous 
                          ? 'Anonymous' 
                          : (story.author_name || story.user_profile?.full_name || 'Unknown')
                      }
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {story.story_type}
                    </div>
                    <div>
                      <span className="font-medium">Likes:</span> {story.likes_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {story.tags && story.tags.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Tags: </span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {story.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!story.is_anonymous && story.user_profile && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">User Role:</span> {story.user_profile.role}
                    </div>
                  )}
                </div>
              </div>

              {story.status === 'pending' && (
                <div className="flex space-x-2 pt-3 border-t">
                  <button
                    onClick={() => handleStoryAction(story.id, 'approve')}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleStoryAction(story.id, 'reject')}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredStories.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {filterStatus === 'all' 
                  ? 'No stories found.' 
                  : `No ${filterStatus} stories found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoriesModeration;
