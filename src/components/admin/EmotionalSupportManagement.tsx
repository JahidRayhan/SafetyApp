import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { articleService } from '@/features/support/services/articleService';

interface SupportResource {
  id: string;
  title: string;
  content: string;
  category: string;
  excerpt: string;
  author: string;
  tags?: string[];
}

const EmotionalSupportManagement = () => {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'counseling',
    excerpt: '',
    author: '',
    website_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await articleService.listByCategory('emotional_support');
      setResources(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load emotional support resources.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await articleService.update(editingId, {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          tags: formData.website_url ? [formData.website_url] : []
        });
        toast({ title: "Success", description: "Resource updated successfully." });
      } else {
        await articleService.create({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          category: 'emotional_support',
          tags: formData.website_url ? [formData.website_url] : [],
          is_featured: false
        });
        toast({ title: "Success", description: "Resource added successfully." });
      }

      fetchResources();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save resource.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await articleService.remove(id);

      toast({ title: "Success", description: "Resource deleted successfully." });
      fetchResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete resource.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (resource: SupportResource) => {
    setFormData({
      title: resource.title,
      content: resource.content,
      category: resource.category,
      excerpt: resource.excerpt || '',
      author: resource.author || '',
      website_url: resource.tags?.[0] || ''
    });
    setEditingId(resource.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'counseling',
      excerpt: '',
      author: '',
      website_url: ''
    });
    setEditingId(null);
    setShowAddForm(false);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-pink-600" />
            <h3 className="text-xl font-bold text-gray-900">Emotional Support Resources</h3>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Resource' : 'Add New Resource'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Resource Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="text"
                placeholder="Contact Information"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="text"
                placeholder="Availability (e.g., 24/7, Mon-Fri 9-5)"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="url"
                placeholder="Website URL (optional)"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-gray-600 mb-2">{resource.content}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                    <div><span className="font-medium">Contact:</span> {resource.excerpt}</div>
                    <div><span className="font-medium">Availability:</span> {resource.author}</div>
                    {resource.tags?.[0] && (
                      <div><span className="font-medium">Website:</span> 
                        <a href={resource.tags[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {resource.tags[0]}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(resource)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {resources.length === 0 && (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No emotional support resources found. Add one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalSupportManagement;