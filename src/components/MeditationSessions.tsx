
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  audio_url: string | null;
  category: string;
  difficulty_level: string;
  is_featured: boolean;
}

const MeditationSessions = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingSession, setPlayingSession] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const categories = ['all', 'breathing', 'mindfulness', 'sleep', 'anxiety'];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(timeRemaining => {
          if (timeRemaining && timeRemaining <= 1) {
            setIsActive(false);
            setPlayingSession(null);
            toast({
              title: "Session Complete",
              description: "Your meditation session has finished. Well done!",
            });
            return null;
          }
          return timeRemaining ? timeRemaining - 1 : null;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, toast]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('duration_minutes');

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load meditation sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = (session: MeditationSession) => {
    setPlayingSession(session.id);
    setTimeRemaining(session.duration_minutes * 60);
    setIsActive(true);
    
    toast({
      title: "Session Started",
      description: `Starting ${session.title} - ${session.duration_minutes} minutes`,
    });
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setPlayingSession(null);
    setTimeRemaining(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSessions = selectedCategory === 'all' 
    ? sessions 
    : sessions.filter(session => session.category === selectedCategory);

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

  return (
    <div className="space-y-6">
      {/* Active Session Timer */}
      {playingSession && timeRemaining && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {sessions.find(s => s.id === playingSession)?.title}
            </h3>
            <div className="text-4xl font-mono font-bold mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="flex justify-center space-x-4">
              {isActive ? (
                <button
                  onClick={pauseSession}
                  className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={resetSession}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {session.is_featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {session.category}
                </span>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                {session.difficulty_level}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {session.title}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {session.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{session.duration_minutes} minutes</span>
              </div>
              
              <button
                onClick={() => startSession(session)}
                disabled={playingSession === session.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  playingSession === session.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>{playingSession === session.id ? 'Playing' : 'Start'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4">🧘‍♀️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-600">
            {selectedCategory === 'all' 
              ? 'No meditation sessions are available at the moment.' 
              : `No sessions found in the ${selectedCategory} category.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MeditationSessions;
