
import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Book, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  encrypted: boolean;
}

const AnonymousJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>({
    id: '',
    title: '',
    content: '',
    mood: 'neutral',
    date: new Date().toISOString().split('T')[0],
    encrypted: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const moods = [
    { value: 'happy', label: '😊 Happy', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sad', label: '😢 Sad', color: 'bg-blue-100 text-blue-800' },
    { value: 'anxious', label: '😰 Anxious', color: 'bg-red-100 text-red-800' },
    { value: 'calm', label: '😌 Calm', color: 'bg-green-100 text-green-800' },
    { value: 'angry', label: '😠 Angry', color: 'bg-orange-100 text-orange-800' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const saved = localStorage.getItem('anonymous_journal_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  };

  const saveEntries = (newEntries: JournalEntry[]) => {
    localStorage.setItem('anonymous_journal_entries', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const saveEntry = () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast({
        title: "Incomplete Entry",
        description: "Please add both a title and content to your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const entryToSave = {
      ...currentEntry,
      id: currentEntry.id || Date.now().toString(),
      date: currentEntry.date || new Date().toISOString().split('T')[0]
    };

    let updatedEntries;
    if (isEditing) {
      updatedEntries = entries.map(entry => 
        entry.id === entryToSave.id ? entryToSave : entry
      );
    } else {
      updatedEntries = [entryToSave, ...entries];
    }

    saveEntries(updatedEntries);
    resetForm();
    
    toast({
      title: "Entry Saved",
      description: "Your journal entry has been saved securely and anonymously.",
    });
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
    
    toast({
      title: "Entry Deleted",
      description: "Journal entry has been permanently deleted.",
    });
  };

  const editEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentEntry({
      id: '',
      title: '',
      content: '',
      mood: 'neutral',
      date: new Date().toISOString().split('T')[0],
      encrypted: true
    });
    setIsEditing(false);
  };

  const getMoodColor = (mood: string) => {
    return moods.find(m => m.value === mood)?.color || 'bg-gray-100 text-gray-800';
  };

  const getMoodLabel = (mood: string) => {
    return moods.find(m => m.value === mood)?.label || '😐 Neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Book className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Anonymous Journal</h2>
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
        <p className="text-gray-600 text-sm">
          Express your thoughts and feelings safely. All entries are stored locally and anonymously.
        </p>
      </div>

      {/* Entry Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Entry' : 'New Entry'}
            </h3>
            {isEditing && (
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={currentEntry.title}
                onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                placeholder="What's on your mind?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How are you feeling?
              </label>
              <select
                value={currentEntry.mood}
                onChange={(e) => setCurrentEntry({...currentEntry, mood: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {moods.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your thoughts
            </label>
            <textarea
              value={currentEntry.content}
              onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
              placeholder="Write about your day, feelings, or anything you want to express..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={saveEntry}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update' : 'Save'} Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Entries</h3>
        
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600">Start writing to create your first journal entry.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{entry.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500">{entry.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                        {getMoodLabel(entry.mood)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editEntry(entry)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousJournal;
