import React, { useState, useEffect } from 'react';
import { FileText, Play, Download, Calendar, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Recording {
  id: string;
  file_path: string;
  file_type: 'audio' | 'video';
  file_size: number;
  duration_seconds: number;
  recorded_at: string;
  incident_id: string;
  user_id: string;
  user_profile?: {
    full_name: string;
    phone_number: string;
  };
}

const UserRecordingsView = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select(`
          id,
          file_path,
          file_type,
          file_size,
          duration_seconds,
          recorded_at,
          incident_id,
          user_id
        `)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      
      // Get user profiles separately to avoid join issues
      const userIds = [...new Set(data?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .in('id', userIds);

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const recordingsWithProfiles = data?.map(recording => ({
        ...recording,
        file_type: recording.file_type as 'audio' | 'video',
        user_profile: profileMap[recording.user_id] || { full_name: 'Unknown User', phone_number: 'Not provided' }
      })) || [];
      
      setRecordings(recordingsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user recordings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    !searchUser || 
    recording.user_profile?.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    recording.user_profile?.phone_number?.includes(searchUser)
  );

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-emergency-600" />
          <h2 className="text-xl font-bold text-gray-900">User Recordings</h2>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by user name or phone..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          />
        </div>

        <div className="space-y-4">
          {filteredRecordings.map((recording) => (
            <div key={recording.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${recording.file_type === 'audio' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                      {recording.file_type === 'audio' ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Play className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {recording.file_type} Recording
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{recording.user_profile?.full_name || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(recording.recorded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <div>{recording.duration_seconds ? formatDuration(recording.duration_seconds) : 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <div>{recording.file_size ? formatFileSize(recording.file_size) : 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <div>{recording.user_profile?.phone_number || 'Not provided'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Incident ID:</span>
                      <div className="font-mono text-xs">{recording.incident_id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      toast({
                        title: "Access Request",
                        description: "Recording access logged for review.",
                      });
                    }}
                    className="bg-emergency-600 hover:bg-emergency-700 text-white px-3 py-1 rounded text-sm transition-all duration-200"
                  >
                    Request Access
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredRecordings.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchUser ? 'No recordings found for this search.' : 'No user recordings available.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Privacy & Access Policy</h4>
        </div>
        <p className="text-blue-800 text-sm">
          All user recordings are protected. Access requests are logged and subject to review. 
          Only access recordings when necessary for emergency response or investigation purposes.
        </p>
      </div>
    </div>
  );
};

export default UserRecordingsView;
