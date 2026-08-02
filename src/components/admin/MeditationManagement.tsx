import React, { useState, useEffect } from 'react';
import { Headphones, Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { meditationService } from '@/features/support/services/meditationService';
import type { MeditationSession } from '@/features/support/domain/types';

const MeditationManagement = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'relaxation',
    duration_minutes: 10,
    difficulty_level: 'beginner',
    audio_url: '',
    is_featured: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await meditationService.listForAdmin();
      setSessions(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load meditation sessions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await meditationService.update(editingId, formData);
        toast({ title: "Success", description: "Session updated successfully." });
      } else {
        await meditationService.create(formData);
        toast({ title: "Success", description: "Session added successfully." });
      }

      fetchSessions();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save session.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await meditationService.remove(id);

      toast({ title: "Success", description: "Session deleted successfully." });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete session.",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await meditationService.setFeatured(id, !currentFeatured);

      toast({ 
        title: "Success", 
        description: `Session ${!currentFeatured ? 'featured' : 'unfeatured'} successfully.` 
      });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update session.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (session: MeditationSession) => {
    setFormData({
      title: session.title,
      description: session.description || '',
      category: session.category,
      duration_minutes: session.duration_minutes,
      difficulty_level: session.difficulty_level || 'beginner',
      audio_url: session.audio_url || '',
      is_featured: session.is_featured
    });
    setEditingId(session.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'relaxation',
      duration_minutes: 10,
      difficulty_level: 'beginner',
      audio_url: '',
      is_featured: false
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const categories = ['relaxation', 'mindfulness', 'sleep', 'anxiety', 'stress_relief', 'focus'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

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
            <Headphones className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Meditation & Wellness Sessions</h3>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Session' : 'Add New Session'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Session Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Audio URL (optional)"
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 col-span-full"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">Featured session</label>
            </div>
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

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{session.title}</h4>
                    {session.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{session.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-500">
                    <div><span className="font-medium">Category:</span> {session.category.replace('_', ' ')}</div>
                    <div><span className="font-medium">Duration:</span> {session.duration_minutes} min</div>
                    <div><span className="font-medium">Level:</span> {session.difficulty_level}</div>
                    <div><span className="font-medium">Created:</span> {new Date(session.created_at).toLocaleDateString()}</div>
                  </div>
                  {session.audio_url && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Audio:</span> 
                      <a href={session.audio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        Listen
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleFeatured(session.id, session.is_featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      session.is_featured 
                        ? 'text-yellow-600 hover:bg-yellow-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEdit(session)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No meditation sessions found. Add one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationManagement;