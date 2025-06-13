
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Star, Tag, Clock, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

const SupportArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'motivation',
    tags: '',
    is_featured: false
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user);

  const userRole = profile?.role || 'user';
  const canCreateContent = userRole === 'admin' || userRole === 'govt_admin';

  const categories = ['all', 'motivation', 'healing', 'empowerment', 'coping'];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('support_articles')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagsArray = newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('support_articles')
        .insert({
          title: newArticle.title,
          content: newArticle.content,
          excerpt: newArticle.excerpt,
          category: newArticle.category,
          tags: tagsArray,
          is_featured: newArticle.is_featured,
          author: profile?.full_name || 'Anonymous',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article created successfully!",
      });

      setNewArticle({
        title: '',
        content: '',
        excerpt: '',
        category: 'motivation',
        tags: '',
        is_featured: false
      });
      setShowCreateForm(false);
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  if (loading) {
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

  if (showCreateForm && canCreateContent) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Support Article</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newArticle.title}
              onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <input
              type="text"
              value={newArticle.excerpt}
              onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newArticle.category}
              onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {categories.filter(cat => cat !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={newArticle.tags}
              onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="healing, support, wellness"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={newArticle.content}
              onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={newArticle.is_featured}
              onChange={(e) => setNewArticle({...newArticle, is_featured: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">Featured Article</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Article
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-pink-600 hover:text-pink-700 mb-4 flex items-center"
        >
          ← Back to Articles
        </button>
        
        <article className="prose max-w-none">
          <div className="flex items-center space-x-2 mb-4">
            {selectedArticle.is_featured && (
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            )}
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
              {selectedArticle.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedArticle.title}
          </h1>
          
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>By {selectedArticle.author}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {selectedArticle.content}
          </div>
          
          {selectedArticle.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      {canCreateContent && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Support Content Management</h2>
              <p className="text-gray-600">Create and manage support articles for users</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {article.is_featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  {article.category}
                </span>
              </div>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {article.title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>By {article.author}</span>
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Found</h3>
          <p className="text-gray-600">
            {selectedCategory === 'all' 
              ? 'No articles are available at the moment.' 
              : `No articles found in the ${selectedCategory} category.`}
          </p>
          {canCreateContent && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create First Article
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportArticles;
